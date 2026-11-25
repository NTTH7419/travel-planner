# AGENTS.md

Rules for any AI assistant working in this repository. Claude Code reads them
through `CLAUDE.md`.

## Stack

- TypeScript (strict, ES modules) on Node.js 24.
- Fastify 5 for HTTP. PA#2 keeps all data in memory.
- Vitest for tests, ESLint with typescript-eslint, Prettier, `tsc --noEmit`.

## Commands

Install with `npm ci`. Run all four before saying a change is done; CI runs
the same four as required checks.

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
```

## Conventions

- Layout: `src/<domain>/` with `*.routes.ts` → `*.controller.ts` →
  `*.service.ts` → `*.store.ts`. Models stay pure and never import a store.
- Every 4xx and 5xx is RFC 9457 problem details sent through `sendProblem` in
  `src/shared/problems.ts`, with a `type` the contract lists.
- `docs/contract/` is the specification. If the code and the contract
  disagree, the code is wrong. Do not change the contract unless the task explicitly requires it. Any contract change must be isolated from implementation changes and include a clear explanation of why.
- Identify the caller from `Authorization: Bearer <token>`, never from a header
  the client fills in such as `X-User-Id`. The first contract draft did; see
  [AI-LOG, Role B](AI-LOG.md#2026-11-23--pa2-contract-and-endpoint-role-b).
- A resource the caller cannot see answers exactly like one that does not
  exist: same status, `type`, `title` and `detail`. "No plan 1 for this user"
  once leaked that a plan existed; see
  [AI-LOG, Role B](AI-LOG.md#2026-11-23--pa2-contract-and-endpoint-role-b).
- Contract tests come from the contract, not from `src/`. They call the app
  only through `createApp()` and `app.inject`, and check `type` and
  `Content-Type`, never the status alone or the `detail` text; see
  [AI-LOG, Role C](AI-LOG.md#2026-11-24--pa2-contract-tests-role-c).
- Text files stay LF through `.gitattributes`. A fresh Windows clone turned
  them into CRLF and failed `format:check` (commit `2f42cf9`).

## Never

- Never put a model API key in the browser bundle or in any tracked file.
- Never call a real model in unit or contract tests.
- Never edit a test, the eval data or a validator rule to make a check pass.
  Fix the code, or change the contract first in its own commit.
- Never make CI pass by skipping it: no `continue-on-error`, no `|| true`, no
  `.skip` on a failing test.
- Never push to `main`, force-push, or rebase a branch that has a pull request.
- Never read or write `.env`.
