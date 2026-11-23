# AI-LOG.md

## 2026-11-21 — PA#2 harness and CI

Tool: OpenAI Codex.
Asked for: start Role A step by step, using the PA#2 rubric as the authority when the task split differs.
Kept: a first commit containing only `.gitignore`, the four documented checks, and four named CI jobs.
Changed: ESLint rejected the empty `tests/` directory during the first check. I changed the lint command to match TypeScript files and allow an empty test glob until Role C adds contract tests; a second run passed.
Changed: a fresh Windows clone converted text files to CRLF and failed Prettier. I added `.gitattributes` to keep source and configuration files at LF, then repeated the fresh-clone check.
Rejected: the task split's instruction that CI call the four check commands "and nothing else." CI needs checkout, Node setup, and `npm ci`; the rubric requires the same four check commands as the README. The workflow also runs on the `pa2` tag so its CI link can be submitted.

The model provider, model, spending cap, and cost per plan are pending the team's provider choice; no model call is part of this harness.

## 2026-11-23 — PA#2 contract and endpoint (Role B)

Tool: Claude Code (Claude Opus 5.5).
Asked for: a contract for `POST /v1/plans/{planId}/save` in the same sections as my IA#3 `CONTRACT.md`, then a minimal in-memory endpoint that follows it.
Kept: the IA#3 layout; the nine-step check order; `422` for a reused Idempotency-Key with a different body, keeping `409` for a request still in flight (as in the IETF Idempotency-Key draft); raw-body parsing in Fastify so the token and the key are checked before the JSON.
Changed: the first draft identified callers with `X-User-Id` and only called it a stand-in. I pointed out that any client can claim any id on an internet-facing API. The contract now uses `Authorization: Bearer <token>` with fake PA#2 tokens, so real sign-in later changes the server's check, not the contract.
Changed: the draft made a saved plan visible to the group, yet answered a group member's save with `404` — a plan they can see "does not exist." I caught the contradiction. The rule is now `404` when the caller cannot see the plan and `403` when they can see it but do not own it.
Changed: the `404` for another user's plan said "No plan 1 for this user", which differs from the `404` for a missing plan and so reveals that the plan exists. Both now say "No plan {id}", and the contract requires the two responses to be identical.
Changed: the first implementation was one long handler, and the model function `applySave` read prices from the place store. I asked for a domain-driven layout (routes → controller → service → store) and questioned why the model depended on a store; the price lookup moved to the service and the model is now pure. A throwaway 16-case smoke test gave identical output after every restructure.
Rejected: the assistant kept `src/index.ts` as a re-export "entry point" and wrote the handlers as factory functions. Nothing imports this app as a package, so I removed `index.ts`; the handlers became a `PlanController` class so it takes its dependencies the same way as `PlanService`.

The endpoint makes no model call. The model provider, model, spending cap and cost per plan are still pending the team's provider choice.
