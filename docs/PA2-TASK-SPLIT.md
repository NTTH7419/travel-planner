# PA#2 — Task split

Harness and quality gate for AI Travel Planner. Due **Thu Nov 26, 2026, 22:00**. 100 points, 4% of the course.

Three roles, each owning whole rubric criteria. Names are not assigned yet. Examples use Node/TypeScript; swap in whatever stack we pick.

| Role | Owns | Criteria | Points |
|---|---|---|---|
| **A — Harness & CI** | Repo skeleton, check commands, README, CI, branch protection, blocked-PR evidence, tag and zip | 3, 4 | 30 |
| **B — Contract & endpoint** | Pick the endpoint, write the contract, implement a minimal endpoint | 5 | 25 |
| **C — Contract tests & safety** | Contract tests, the deliberate break, rules file, permissions and secrets | 6, 1, 2 | 40 |
| **Everyone** | AI-LOG, self-assessment, cross-review | 7 | 5 |

---

## Role A — Harness & CI (criteria 3 + 4, 30 pts)

### 1. Repo skeleton
- Create a **public** GitHub repo and invite the other two members.
- The first commit contains only `.gitignore`, which already ignores `.env`, `node_modules` and build output. That way no secret can reach the history from the start.
- Basic layout: `src/`, `tests/`, `docs/contract/`.

### 2. One command per check
| Check | Example command |
|---|---|
| Lint | `npm run lint` |
| Format check | `npm run format:check` (check only, never auto-fix) |
| Type check | `npm run typecheck` |
| Tests | `npm test` |

- Configure the tools: e.g. ESLint, Prettier, `tsc --noEmit`, Vitest/Jest.
- **Every command must be able to fail.** Break each one on purpose and confirm it exits non-zero.

### 3. README "Development" section
- The steps from clone to green: install, then exactly the four commands above.
- Test it yourself: fresh clone into an empty folder, follow the README, and everything must pass.

### 4. CI workflow (`.github/workflows/ci.yml`)
- Runs on **every pull request** and on pushes to `main`.
- Calls **exactly the four README commands** and nothing else. The rubric takes points off if CI runs something different from the README.
- Give each check its own clearly named job or step, so it can be selected as a required check.
- Make sure CI can go red: no `continue-on-error`, no `|| true`. Assistants often write these. If ours does, log it in AI-LOG.

### 5. Protect `main`
- Settings → Branches (or Rulesets): require a PR, require the checks from step 4 to pass, block force-pushes. Requiring 1 approval is recommended.
- Take a screenshot of the settings page.
- **Once protection is on, nobody pushes straight to `main`.** Tell the team.

### 6. Evidence: a blocked PR
- Open a PR with a real failure (lint error or failing test). CI goes red and Merge is blocked.
- Push the fix to the same PR. CI goes green, then merge.
- Save the PR link, the link to the fixing commit, and the CI run links.

### 7. Submission (A collects)
- Tag the submitted commit `pa2`, push the tag, and save the link to the tag's CI run.
- Write `PA2.md` at the root with all six links: repository, protected-branch screenshot, blocked PR, PR that turned green, CI run for the tag, deliberate contract break (from C).
- Zip the repo **including `.git`**: `23127303-23127499-23127510_<total>.zip`.

**Done when:** a fresh clone that follows the README is green, a red PR cannot be merged, and every evidence link exists.

---

## Role B — Contract & endpoint (criterion 5, 25 pts)

### 1. Pick the endpoint
- Proposed: `POST /plans/{planId}/save`. It has ownership, idempotency and a validator-rejected error, which gives the tests plenty to check. The other options are listed in the rubric.
- Agree on it with the team before writing anything, because C's tests depend on it.

### 2. Write `docs/contract/<endpoint>.md`
Use the same sections as `CONTRACT.md` in IA#3; check IA#3 for the exact section names. It must cover:

| Section | Must state |
|---|---|
| **Who may call it** | The role (e.g. a member of the group that owns the trip) and the **ownership rule** (who may save which plan). The status returned for another user's data: pick 403 or 404 and say why |
| **Request** | Headers (auth, `Idempotency-Key`), body, and the type and rules of every field: required or optional, format, limits |
| **Response** | Success shape (200/201) and the meaning of each field |
| **Errors (RFC 9457)** | A table of **every** problem `type` URI with its `status` and `title`. E.g. not signed in 401, not the owner 403/404, plan not found 404, rejected by the validator 422, idempotency-key conflict 409, malformed body 400 |
| **Idempotency** | Same key again returns the original result and does not share twice. What error a reused key with a different body gives. How long keys are kept |
| **What happens when it changes** | Plan state after save, what the group sees, how the contract is versioned if it changes |
| **Examples** | A request/response pair for each case |

**The bar:** a stranger can write a client from this file alone, without asking anything.

### 3. Implement a minimal endpoint
- Follow the contract exactly. In-memory or fake storage is fine, and the validator can be a stub that accepts or rejects.
- Auth can be faked (e.g. an `X-User-Id` header), as long as it tells users apart so ownership can be checked.
- Errors are sent with `Content-Type: application/problem+json`.
- **No LLM calls.** That is PA#3.

### 4. Working with C
- Put the contract up in its own PR and have C review it before writing code.
- During the deliberate break, B fixes the **code** and never touches the tests.

**Done when:** C can write every test from the contract file alone, without asking B.

---

## Role C — Contract tests & safety (criteria 6 + 1 + 2, 40 pts)

### 1. Contract tests
- Write them **from the contract file**, not from B's code.
- Required coverage:
  - at least one test per error `type` in the contract, checking status, `type` **and** `Content-Type`, not the status code alone;
  - ownership: user X saving user Y's plan gets exactly the status the contract names;
  - idempotency: two calls with the same key give the same result and share only once; the same key with a different body gives the error the contract names;
  - success path: the response shape matches the contract.
- Tests run through A's `npm test`, so they are part of the required CI.
- **No real model calls** in tests.

### 2. The deliberate break
- Open a PR that changes the **code** so it violates the contract, e.g. return 200 instead of 422 when the validator rejects, or drop the ownership check.
- CI goes red. Save the PR and CI run links, then close the PR or fix the code.
- **Never edit the tests in the same commit.** The rubric gives 0–2 points for that.

### 3. Rules file (`CLAUDE.md` / `AGENTS.md`, whichever our tools read)
- **Short**, with exactly four sections:
  - **Stack:** language, framework, test tools (from A);
  - **Commands:** the four check commands (from A);
  - **Conventions:** naming, folder layout, errors as RFC 9457;
  - **Never:** no model key in the browser bundle; no real model call in unit tests; never edit a test, the eval data or a validator rule to make a check pass; never push straight to `main`.
- **At least two lines with a story.** Each one links to something that really went wrong, through a commit or an AI-LOG entry. Collect these from the assistant's mistakes while the team works.
- A person on the team must edit this file. The rubric marks down a file the assistant wrote and nobody edited.

### 4. Permissions & secrets
- Write the assistant's permissions in three tiers, in the rules file or `docs/permissions.md`, and set them in the tool's settings too if possible:
  - **Allowed:** read code, run the four check commands, edit files under `src/`;
  - **Ask first:** install packages, change CI, change the contract;
  - **Never:** read or write `.env`, push to `main`, force-push, edit tests to make them pass.
- `.env.example` lists **every** environment variable, with no values.
- Set a **spending cap** on the model API key in the provider dashboard, and state it in the README: provider, model, cap amount.
- Scan the history for secrets (e.g. with `gitleaks`). If one ever leaked: rotate the key and record it in AI-LOG.

**Done when:** CI goes red when the code breaks the contract and the link is saved, the rules file has two traceable lines, and the history is clean.

---

## Shared by everyone

### AI-LOG.md (5 pts)
- Each member logs their own part: which **tool**, for which **part**, and real **Changed / Rejected** entries, meaning where the assistant was wrong and how we found out.
- Worth logging, for example: a CI step that could never fail, tests that only checked status codes, a `.gitignore` missing `.env`.
- State the model used and what one call costs. The brief requires this.

### SELF_ASSESSMENT_REPORT.md
- One row per criterion: the marks we claim and the evidence (a file, commit, PR or CI run).
- A short "What we did not manage" section.
- Score honestly: a gap of more than ±10 points from the actual mark costs points.

### Cross-review
- Every PR gets reviewed by one other member. Besides catching mistakes, it is how each of us learns the others' parts before the PA#6 individual oral.

### Ground rules
- **No rebasing or force-pushing** once protection is on. A history rewritten after the work was done does not count as evidence for criteria 4 and 6.
- **No real keys in the repo**, not even on a side branch.
- Everything submitted (`PA2.md`, `AI-LOG.md`, `SELF_ASSESSMENT_REPORT.md`) is written in English.

---

## Dependency order

1. **A:** repo skeleton → check commands → CI → branch protection.
2. **B:** contract (PR, reviewed by C) → **C:** contract tests; **B:** endpoint implementation in parallel.
3. Evidence: A's blocked PR, C's deliberate break.
4. `AI-LOG.md`, `SELF_ASSESSMENT_REPORT.md`, `PA2.md` → tag `pa2` → zip.

C writes the rules file and the permissions alongside all of the above.
