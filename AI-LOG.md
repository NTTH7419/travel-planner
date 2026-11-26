# AI-LOG.md

## 2026-11-21 — PA#2 harness and CI

- **Tool:** OpenAI Codex.
- **Asked for:** begin Role A step by step and use the PA#2 rubric when it differs from the task split.
- **Kept:** the `.gitignore`-only first commit, four documented check commands, and four separately named CI jobs in `.github/workflows/ci.yml`.
- **Changed:** the first `eslint src tests` command failed because `tests/` had no TypeScript files yet. I changed it to lint `src/**/*.ts` and `tests/**/*.ts` with `--no-error-on-unmatched-pattern`; `npm run lint` then passed. Each check also returned a nonzero exit code when I introduced a temporary error.
- **Rejected:** a green working tree as proof that a fresh clone would pass. A fresh Windows clone failed `npm run format:check` after Git converted files to CRLF. I added `.gitattributes` in commit `2f42cf9` and repeated the fresh-clone test; `npm ci` and all four checks passed.

> The model provider, model, spending cap, and cost per plan are pending the team's provider choice; no model call is part of this harness.

## 2026-11-21 — PA#2 branch protection and PR evidence

- **Tool:** OpenAI Codex.
- **Asked for:** protect `main` and demonstrate a PR blocked by a real CI failure, then fixed on the same PR.
- **Kept:** `main` requires a PR, one approval and all four CI jobs, applies to admins, and disallows force pushes; [the settings screenshot](docs/evidence/branch-protection.jpeg) records the configuration.
- **Changed:** the GitHub connector returned 403 when creating PR #1. I used the repository owner's existing Git credential with the GitHub API, then verified the [red Lint run](https://github.com/NTTH7419/travel-planner/actions/runs/44913877745) and the [green run after the source fix](https://github.com/NTTH7419/travel-planner/actions/runs/44913976220). No tests were edited to make the PR pass.
- **Rejected:** the first [PR #1](https://github.com/NTTH7419/travel-planner/pull/1) description still said the fix would happen later after it had already landed. I updated the description with the actual failing commit, fixing commit, and CI links.

> The product's model provider, model, spending cap, and cost per plan are not selected yet. This harness made no model calls; add those details when the team chooses the provider.

## 2026-11-23 — PA#2 contract and endpoint

- **Tool:** Claude Code (Claude Opus 5.5).
- **Asked for:** a contract for `POST /v1/plans/{planId}/save` in the same sections as my IA#3 `CONTRACT.md`, then a minimal in-memory endpoint that follows it.
- **Kept:** the IA#3 layout; the nine-step check order; `422` for a reused Idempotency-Key with a different body, keeping `409` for a request still in flight (as in the IETF Idempotency-Key draft); raw-body parsing in Fastify so the token and the key are checked before the JSON.
- **Changed:**
  - the first draft identified callers with `X-User-Id` and only called it a stand-in. I pointed out that any client can claim any id on an internet-facing API. The contract now uses `Authorization: Bearer <token>` with fake PA#2 tokens, so real sign-in later changes the server's check, not the contract.
  - the draft made a saved plan visible to the group, yet answered a group member's save with `404` — a plan they can see "does not exist." I caught the contradiction. The rule is now `404` when the caller cannot see the plan and `403` when they can see it but do not own it.
  - the `404` for another user's plan said "No plan 1 for this user", which differs from the `404` for a missing plan and so reveals that the plan exists. Both now say "No plan {id}", and the contract requires the two responses to be identical.
  - the first implementation was one long handler, and the model function `applySave` read prices from the place store. I asked for a domain-driven layout (routes → controller → service → store) and questioned why the model depended on a store; the price lookup moved to the service and the model is now pure. A throwaway 16-case smoke test gave identical output after every restructure.
- **Rejected:** the assistant kept `src/index.ts` as a re-export "entry point" and wrote the handlers as factory functions. Nothing imports this app as a package, so I removed `index.ts`; the handlers became a `PlanController` class so it takes its dependencies the same way as `PlanService`.

> The endpoint makes no model call. The model provider, model, spending cap and cost per plan are still pending the team's provider choice.

## 2026-11-24 — PA#2 contract tests

- **Tool:** Claude Code (Claude Opus 5.5).
- **Asked for:** contract tests for `POST /v1/plans/{planId}/save` written from `docs/contract/save-plan.md` alone, without reading `src/`, and checked against criterion 6 of the PA#2 rubric.
- **Kept:** one `expectProblem` helper that checks the status, `Content-Type: application/problem+json`, `type` and `title` of every error, so no test checks the status code alone; a fresh `createApp()` per test with the seed data of contract section 6; tests that reach the server only through HTTP (`app.inject`), never its stores.
- **Changed:**
  - the first draft asserted the exact `detail` text of the 403 and 404 responses. The contract says clients decide from `type`, never from `detail`, so those assertions over-specified the contract and were removed; the 404 tests compare a hidden plan with a missing one instead, which is what the contract requires. A test that only repeated the `type` check already inside `expectProblem` was removed too.
  - where the contract does not name a pointer, the tests assume one and say so: `/stops` or `/stops/{i}/items` for an array of the wrong length, and any pointer under `/stops/{i}` for a stop that starts before the previous one ends.
- **Rejected:**
  - a green run as proof that the tests bite. I deleted the visibility check (`canSee`, step 4) in `plan.service.ts` by hand: 6 tests went red with `expected 403 to be 404`, the leak the contract forbids. Six other one-line breaks (ownership check, key-reused check, `Idempotent-Replayed` header, validator, problem media type, `WWW-Authenticate`) each turned at least two tests red. The code was restored before committing; no file in `src/` is part of this change.
  - deleting the `canSee` line as the deliberate break for PA2.md. It also leaves `canSee` and `inTripGroup` unused, so `npm run lint` fails with two errors and the red CI would not show that the contract tests caught it. The break PR must change only `src/` and keep lint green.

> The tests make no model calls. The model provider, model, spending cap and cost per plan are still pending the team's provider choice.

## 2026-11-25 — PA#2 deliberate break, rules file, permissions and secrets

- **Tool:** Claude Code (Claude Opus 5.5).
- **Asked for:** a deliberate contract break that only the contract tests catch; a short rules file with the four sections the rubric names; the assistant's permissions in three tiers, `.env.example`, and a scan of the history for secrets.
- **Kept:**
  - the break in [PR #5](https://github.com/NTTH7419/travel-planner/pull/5): one line in `canSee` lets a group member see a draft. Before pushing I ran the checks locally: lint, format and type check passed, 3 of 74 tests failed. CI showed the same: only the required `Tests` job went red ([run](https://github.com/NTTH7419/travel-planner/actions/runs/45540633293)). The PR was closed without merging.
  - `AGENTS.md` as the one rules file, with `CLAUDE.md` importing it, because the team uses both Codex and Claude Code. Four of its lines trace to something that went wrong: the `X-User-Id` header, the 404 that leaked a plan, the tests that asserted `detail`, and the CRLF clone.
  - the gitleaks scan (v8.30.1, in Docker, repository mounted read-only): no leaks in the 20 non-merge commits of every branch nor in the 54 files of the working tree.
- **Changed:**
  - the assistant drafted `AGENTS.md` (commit `09ac75c`). Its contract rule only said to change the contract in its own commit. I rewrote it (commit `e8a3806`): the contract is not changed unless the task explicitly requires it, and a contract change stays apart from implementation changes, with the reason written down.
  - the assistant first suggested breaking the code by deleting the ownership check. That leaves a function unused and would turn the `Lint` job red as well, so the break changes what `canSee` returns instead.
  - the assistant added a README line on how to run the server with `npx tsx src/server.ts`. `tsx` is not installed and the server does not read `.env`, so the line was removed before committing.
- **Rejected:** Codex rules (`.codex/rules/`, `.codex/config.toml`) that the assistant wrote and checked only with a simulation, because Codex is not installed on this machine. Role A uses Codex and can test them with `codex execpolicy check`, so I left them to Role A. `docs/permissions.md` says Codex users approve every "ask first" step themselves.

> No model call was made. The model spending cap is still not set because the team has not chosen a provider; the README says so.

## 2026-11-26 — PA#2 strict test gate and Codex command rules

- **Tool:** ChatGPT (Dot) for the patch and local verification; Codex for `execpolicy check` and PR handoff.
- **Asked for:** remove `--passWithNoTests`, document the Codex setup in `README.md`, and add executable rules under `.codex/rules/`.
- **Kept:** the existing CI workflow, contract, test files, and lockfile. Lint, format, and type checks passed locally, and `npm test` passed all 74 existing tests.
- **Changed:** replaced `vitest run --passWithNoTests` with `vitest run`. The GitHub connector returned 403 on write, so the assistant exported the verified commit `dc61e84` as a Git bundle. The same commit was pushed from a session with GitHub access and merged in [PR #8](https://github.com/NTTH7419/travel-planner/pull/8).
- **Rejected:** treating a green run on the populated suite as proof that the empty-suite gate works. A separate run with no matching tests returned exit code 1. We also checked the rules with `codex execpolicy check`: dependency changes, commits, and ordinary branch pushes prompted for approval; the tested direct-to-`main` and force-push commands were forbidden. The README and permissions doc distinguish these command rules from sandbox restrictions and GitHub branch protection.

> No model call was made by the app for this work. The provider and spending cap are still unset.