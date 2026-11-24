# Save plan API — contract, version 1

CSC13114 · AI Travel Planner · PA#2 · frozen 24 Nov 2026

This file is the specification for `POST /v1/plans/{planId}/save`, the step
that turns a member's draft schedule into the schedule the whole group sees.
The contract tests in `tests/` check an implementation against it. If the code
and this file disagree, the code is wrong. If this file is wrong, change it in a
separate commit that says why — never quietly.

## 1. Conventions

- Every endpoint in this contract lives under `/v1`.
- Requests and responses are JSON, UTF-8.
- **Money is an integer number of dong**: `priceVnd`, `totalVnd`. Money is
  always calculated by the server, never sent by the client.
- Ids are positive integers. Timestamps are ISO 8601 strings in UTC with
  milliseconds, e.g. `2026-11-28T02:00:00.000Z` (09:00 in Ho Chi Minh City).
- **Who is calling.** Every request carries `Authorization: Bearer <token>`.
  The token is opaque: the client gets it from sign-in, sends it back unchanged
  and never reads or builds one. The server maps the token to exactly one user,
  the *caller*. A missing, malformed or unknown token is `401 unauthenticated`,
  and that response carries `WWW-Authenticate: Bearer`.
- **The PA#2 build's tokens are fake.** It accepts only the fixed tokens in
  *Test data* and has no sign-in endpoint, so anyone who knows the list can act
  as any user. Swapping them for real signed tokens changes how the server
  checks a token, not this contract.
- Clients ignore response fields they do not know. The server ignores request
  fields it does not know.

## 2. Errors

Every `/v1` response with a 4xx or 5xx status — including a request for a `/v1`
path that does not exist — is a **problem details** object (RFC 9457) with
`Content-Type: application/problem+json`:

```http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{
  "type": "https://travel-planner.example/problems/plan-rejected",
  "title": "Plan rejected by the validator",
  "status": 422,
  "detail": "The plan breaks 1 rule",
  "errors": [
    { "code": "unknown-place", "pointer": "/stops/1/placeId", "detail": "place 999 does not exist" }
  ]
}
```

| Member | Rule |
|---|---|
| `type` | `https://travel-planner.example/problems/` followed by a slug from the table below. No other values |
| `title` | the title from the table below |
| `status` | a number, equal to the HTTP status of the response |
| `detail` | one sentence about **this** occurrence. Never a stack trace, a storage message or a file path |
| `errors` | only on `validation` and `plan-rejected`: one entry **per problem found** (not just the first). Each has `detail` and `pointer`, a JSON Pointer into the body such as `/stops/0/items/1/qty`, `""` for the whole body. On `plan-rejected` each entry also has `code`, from the list in 4.1 |

| Slug | Status | Title | When |
|---|---|---|---|
| `invalid-json` | 400 | Malformed JSON | the body is not valid JSON |
| `validation` | 400 | Invalid request | a body field breaks a rule in this contract |
| `idempotency-key-missing` | 400 | Idempotency-Key required | no `Idempotency-Key` header, or one that is empty or longer than 255 characters |
| `unauthenticated` | 401 | Not signed in | no `Authorization` header, not of the form `Bearer <token>`, or a token the server does not know |
| `forbidden` | 403 | Not allowed | the caller can see the plan but does not own it (see *Who may call it*) |
| `not-found` | 404 | Not found | no plan with that id that the caller can see (see *Who may call it*), the id is not a positive integer, or no such `/v1` path |
| `idempotency-key-reused` | 422 | Idempotency-Key reused | the caller already used this key for a different request |
| `plan-rejected` | 422 | Plan rejected by the validator | the schedule breaks one or more validator rules |
| `internal` | 500 | Internal error | anything else. `detail` is a fixed, generic sentence |

Clients decide what to do from `type`, never from `title` or `detail`.

## 3. Resources

**Plan**

```json
{
  "id": 1,
  "tripId": 1,
  "ownerId": 1,
  "status": "saved",
  "revision": 1,
  "stops": [
    {
      "placeId": 1,
      "startsAt": "2026-11-28T02:00:00.000Z",
      "endsAt": "2026-11-28T03:30:00.000Z",
      "items": [ { "itemId": 11, "qty": 4, "priceVnd": 45000 } ]
    }
  ],
  "totalVnd": 180000,
  "savedAt": "2026-11-23T10:15:00.000Z"
}
```

| Field | Meaning |
|---|---|
| `id` | the plan's id, the `{planId}` in the path |
| `tripId` | the trip the plan belongs to. The trip belongs to one group |
| `ownerId` | the user who created the plan. Only this user may save it |
| `status` | `"draft"` until the first successful save, then `"saved"` for good |
| `revision` | `0` while a draft; goes up by exactly 1 on every successful save, never on a replay |
| `stops` | the schedule, in the order the client sent it |
| `stops[i].items[j].priceVnd` | the item's price **when the plan was saved**; a later price change does not alter a saved plan |
| `totalVnd` | the sum of `priceVnd × qty` over every item of every stop, computed by the server |
| `savedAt` | when the latest revision was saved; `null` while a draft |

## 4. Endpoints

### 4.1 `POST /v1/plans/{planId}/save` — save and share a plan

**Who may call it.** Only the plan's **owner** (`ownerId` equals the caller)
may save it. What everyone else gets depends on whether they can **see** the
plan:

| Caller | Draft plan | Saved plan |
|---|---|---|
| the owner | saves it | saves it |
| another member of the trip's group | `404 not-found` | `403 forbidden` |
| anyone else | `404 not-found` | `404 not-found` |

- A draft is private to its owner, and a saved plan is visible to the trip's
  group. A caller who cannot see the plan gets **exactly the response a plan id
  that was never created gets** — same status, `type`, `title` and `detail` —
  so probing plan ids reveals nothing. This is the use of `404` that RFC 9110
  §15.5.4 allows for hiding a resource.
- A group member can already see a saved plan, so hiding it would be a
  contradiction: they get an honest `403`.
- Saving is how an edit is committed, so whoever may edit a plan may save it.
  Until editing together without overwriting each other exists (a later
  feature), only the owner edits, so only the owner saves — even a plan that is
  already saved. Opening saving to group members then is a loosened rule, an
  additive change within `/v1`.

Request headers: `Content-Type: application/json`, `Authorization: Bearer <token>`, and
**`Idempotency-Key`**, a string of 1 to 255 characters chosen by the client, one
per save the user intends (a UUID is a good choice).

Request body — the schedule exactly as the user reviewed it:

```json
{
  "stops": [
    {
      "placeId": 1,
      "startsAt": "2026-11-28T02:00:00.000Z",
      "endsAt": "2026-11-28T03:30:00.000Z",
      "items": [ { "itemId": 11, "qty": 4 } ]
    },
    {
      "placeId": 2,
      "startsAt": "2026-11-28T04:00:00.000Z",
      "endsAt": "2026-11-28T05:00:00.000Z",
      "items": []
    }
  ]
}
```

| Field | Rule |
|---|---|
| `stops` | array of 1 to 20 stops |
| `stops[i].placeId` | positive integer |
| `stops[i].startsAt` | timestamp as in *Conventions* |
| `stops[i].endsAt` | timestamp, later than `startsAt` of the same stop |
| `stops[i]` order | each stop's `startsAt` is not earlier than the previous stop's `endsAt` |
| `stops[i].items` | array of 0 to 8 items. Required; send `[]` for a stop with nothing to buy |
| `stops[i].items[j].itemId` | positive integer |
| `stops[i].items[j].qty` | integer from 1 to 20 |

A body that is valid JSON but not an object is a `validation` error with
pointer `""`. Prices and totals are never accepted from the client; a
`priceVnd` or `totalVnd` in the body is ignored like any unknown field.

The server checks, **in this order**, and stops at the first step that fails:

1. The bearer token is known, else `401 unauthenticated`.
2. `Idempotency-Key` present, 1 to 255 characters, else `400 idempotency-key-missing`.
3. The body is valid JSON, else `400 invalid-json`.
4. The plan exists and the caller can see it, else `404 not-found`.
5. The caller owns the plan, else `403 forbidden`.
6. **The caller has used this key before** (see *Idempotency* below): replay,
   or `422 idempotency-key-reused`.
7. Every field follows the table above, else `400 validation` listing **every**
   broken field.
8. The validator accepts the schedule, else `422 plan-rejected` listing
   **every** violation it found.
9. The plan is saved: **`200`**, the Plan as the body.

**Validator rules.** The validator is code, not a model, and it runs on every
save even if the client already ran it. Each violation's `code`:

| `code` | Pointer | Broken rule |
|---|---|---|
| `unknown-place` | `/stops/{i}/placeId` | the place does not exist |
| `unknown-item` | `/stops/{i}/items/{j}/itemId` | the item does not exist, or is not sold at that stop's place |
| `closed` | `/stops/{i}` | the stop is not inside the place's opening hours |
| `travel-time` | `/stops/{i}` | the motorbike time from the previous stop is longer than the gap between them |
| `over-member-cap` | `""` | one member's share of `totalVnd` is above their own spending cap |
| `over-group-total` | `""` | `totalVnd` is above the group total |
| `rain` | `/stops/{i}` | an outdoor stop at a time with more than 60% chance of rain, within the 7-day forecast |

A client must handle every code in this table. A rejected save changes nothing:
the plan keeps its status, revision and stops.

**Idempotency.** A client that does not get an answer — a timeout, a dropped
mobile connection — sends the same request again with the same key. That retry
must not save or share the plan a second time.

- Keys are scoped **per caller**: two users may happen to pick the same key
  without affecting each other.
- The *request* is the `planId` together with the body. Two bodies are *the
  same* when they are equal as JSON values: key order and whitespace do not
  matter, any other difference does.
- When step 9 succeeds, the server stores the key, the request fingerprint and
  the response, **in the same transaction as the save**.
- Same key, same request → the **stored** response: status `200`, the identical
  body (same `revision`, same `savedAt`), plus the header
  **`Idempotent-Replayed: true`**. The plan is not saved again and the group is
  not notified again. The first, original response does not carry that header.
- Same key, different request (another body or another `planId`) → `422
  idempotency-key-reused`. Nothing is saved. This is `422`, not `409`, on
  purpose, as in the IETF `Idempotency-Key` header draft: retrying the same
  request can never succeed, so the client must change the key or the body.
  `409` is kept for a conflict that waiting resolves — a request with the same
  key still being processed. That cannot happen in the PA#2 build, which
  handles one save at a time, so `/v1` does not list it; if it is added later,
  it is a new problem type, `idempotency-key-in-flight`, an additive change.
- **Only a `200` is stored.** A request that ends in any 4xx stores nothing, so
  the client may fix the schedule and send it again with the same key.
- A stored key is kept for at least 24 hours.

**What happens when it saves.**

- The first save moves the plan from `draft` to `saved`. A later save with a
  new key replaces the stops, recomputes `totalVnd`, sets a new `savedAt` and
  raises `revision` by 1. A saved plan never goes back to `draft`.
- From the first save on, every member of the trip's group can read the plan;
  only the owner can save it again.
- Each new revision notifies the group **once**. A replay notifies nobody.
  (Reading plans and delivering notifications are outside this contract.)

#### Examples

Plan 1 is a draft owned by user 1. All requests below are
`POST /v1/plans/1/save` with `Content-Type: application/json` unless noted.

**Saved** — `Authorization: Bearer user-1`, `Idempotency-Key: 6f1c…a1`, the body above:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{ "id": 1, "tripId": 1, "ownerId": 1, "status": "saved", "revision": 1,
  "stops": [ … as sent, each item with its priceVnd … ],
  "totalVnd": 180000, "savedAt": "2026-11-23T10:15:00.000Z" }
```

**Replayed** — the same request again, same key:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Idempotent-Replayed: true

{ … identical to the response above, "revision": 1 … }
```

**Key reused** — same key, but `qty` changed from 4 to 3:

```http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json

{ "type": "https://travel-planner.example/problems/idempotency-key-reused",
  "title": "Idempotency-Key reused", "status": 422,
  "detail": "This Idempotency-Key was already used for a different request" }
```

**Not signed in** — no `Authorization` header:

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/problem+json
WWW-Authenticate: Bearer

{ "type": "https://travel-planner.example/problems/unauthenticated",
  "title": "Not signed in", "status": 401,
  "detail": "Send Authorization: Bearer <token>" }
```

**Cannot see the plan** — `Bearer user-2` saves plan 1, a draft owned by
user 1. The response is identical to the one for plan 999, which does not exist
(with `999` in `detail`):

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{ "type": "https://travel-planner.example/problems/not-found",
  "title": "Not found", "status": 404,
  "detail": "No plan 1" }
```

**Not the owner** — `Bearer user-2` saves plan 3, a saved plan owned by user 1
in user 2's group:

```http
HTTP/1.1 403 Forbidden
Content-Type: application/problem+json

{ "type": "https://travel-planner.example/problems/forbidden",
  "title": "Not allowed", "status": 403,
  "detail": "Only the plan's owner can save it" }
```

**No key** — `Idempotency-Key` header missing:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{ "type": "https://travel-planner.example/problems/idempotency-key-missing",
  "title": "Idempotency-Key required", "status": 400,
  "detail": "Send an Idempotency-Key header of 1 to 255 characters" }
```

**Malformed JSON** — body `{"stops": [`:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{ "type": "https://travel-planner.example/problems/invalid-json",
  "title": "Malformed JSON", "status": 400,
  "detail": "The request body is not valid JSON" }
```

**Invalid fields** — the first stop has `endsAt` before `startsAt` and an item with `qty: 0`:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{ "type": "https://travel-planner.example/problems/validation",
  "title": "Invalid request", "status": 400,
  "detail": "2 fields are invalid",
  "errors": [
    { "pointer": "/stops/0/endsAt", "detail": "must be later than startsAt" },
    { "pointer": "/stops/0/items/0/qty", "detail": "must be an integer from 1 to 20" }
  ] }
```

**Rejected by the validator** — the second stop names place 999: see the
example in section 2. The plan stays a draft with `revision` 0.

## 5. Versions

- **Within `/v1`, only additive changes**: a new optional request field, a new
  response field, a new problem type, a new validator `code`. Anything else —
  renaming or removing a field, changing a type or a unit, tightening a rule,
  changing which status an error uses — is a new version, `/v2`, and `/v1` keeps
  running until its `Sunset` date.
- When `/v1` is retired, its responses carry `Deprecation` (RFC 9745) and
  `Sunset` (RFC 8594) headers for at least 30 days before removal.
- Replacing the fake tokens with real signed ones is **not** a breaking change:
  clients send the same header, and only the server's check changes.

## 6. Test data (PA#2 build)

The PA#2 build keeps everything in memory and starts with this data, so tests
can be written from this file alone:

| Data | Values |
|---|---|
| Users | 1, 2, 3, with tokens `user-1`, `user-2`, `user-3`. Users 1 and 2 are in group 1; user 3 is in no group |
| Trip | trip 1, owned by group 1 |
| Plans | plan 1: draft, owner user 1, trip 1. Plan 2: draft, owner user 2, trip 1. Plan 3: saved, revision 1, owner user 1, trip 1, one stop at place 1 with item 11 × 1 (`totalVnd` 45000) |
| Places | place 1 sells items 11 (45,000 VND) and 12 (30,000 VND). Place 2 sells item 21 (60,000 VND) |

In the PA#2 build the validator checks only `unknown-place` and `unknown-item`;
the other codes are listed so clients already handle them. State resets when the
process restarts.
