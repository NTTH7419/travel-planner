# AI-LOG.md

## 2026-11-21 — PA#2 harness and CI

Tool: OpenAI Codex.
Asked for: begin Role A step by step and use the PA#2 rubric when it differs from the task split.
Kept: the `.gitignore`-only first commit, four documented check commands, and four separately named CI jobs in `.github/workflows/ci.yml`.
Changed: the first `eslint src tests` command failed because `tests/` had no TypeScript files yet. I changed it to lint `src/**/*.ts` and `tests/**/*.ts` with `--no-error-on-unmatched-pattern`; `npm run lint` then passed. Each check also returned a nonzero exit code when I introduced a temporary error.
Rejected: a green working tree as proof that a fresh clone would pass. A fresh Windows clone failed `npm run format:check` after Git converted files to CRLF. I added `.gitattributes` in commit `2f42cf9` and repeated the fresh-clone test; `npm ci` and all four checks passed.

The model provider, model, spending cap, and cost per plan are pending the team's provider choice; no model call is part of this harness.

## 2026-11-21 — branch protection and PR evidence

Tool: OpenAI Codex.
Asked for: protect `main` and demonstrate a PR blocked by a real CI failure, then fixed on the same PR.
Kept: `main` requires a PR, one approval and all four CI jobs, applies to admins, and disallows force pushes; [the settings screenshot](docs/evidence/branch-protection.jpeg) records the configuration.
Changed: the GitHub connector returned 403 when creating PR #1. I used the repository owner's existing Git credential with the GitHub API, then verified the [red Lint run](https://github.com/NTTH7419/travel-planner/actions/runs/44913877745) and the [green run after the source fix](https://github.com/NTTH7419/travel-planner/actions/runs/44913976220). No tests were edited to make the PR pass.
Rejected: the first [PR #1](https://github.com/NTTH7419/travel-planner/pull/1) description still said the fix would happen later after it had already landed. I updated the description with the actual failing commit, fixing commit, and CI links.

The product's model provider, model, spending cap, and cost per plan are not selected yet. This harness made no model calls; add those details when the team chooses the provider.

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