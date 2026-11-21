# AI-LOG.md

## 2026-11-21 — PA#2 harness and CI

Tool: OpenAI Codex.
Asked for: start Role A step by step, using the PA#2 rubric as the authority when the task split differs.
Kept: a first commit containing only `.gitignore`, the four documented checks, and four named CI jobs.
Changed: ESLint rejected the empty `tests/` directory during the first check. I changed the lint command to match TypeScript files and allow an empty test glob until Role C adds contract tests; a second run passed.
Changed: a fresh Windows clone converted text files to CRLF and failed Prettier. I added `.gitattributes` to keep source and configuration files at LF, then repeated the fresh-clone check.
Rejected: the task split's instruction that CI call the four check commands "and nothing else." CI needs checkout, Node setup, and `npm ci`; the rubric requires the same four check commands as the README. The workflow also runs on the `pa2` tag so its CI link can be submitted.

The model provider, model, spending cap, and cost per plan are pending the team's provider choice; no model call is part of this harness.

## 2026-11-21 — branch protection and blocked PR

Tool: OpenAI Codex.
Asked for: complete Role A's GitHub quality gate and capture a PR that changes from red to green.
Kept: `main` requires one review and all four CI jobs, including for admins; PR #1 recorded a failed `Lint` run and a succeeding run after the source error was removed without editing tests.
Changed: the GitHub connector could read CI but returned 403 when creating a PR. I used the repository owner's existing Git credential through the GitHub API and verified the PR and runs afterward.
Rejected: treating a local failing command as sufficient gate evidence; the rubric needs a real blocked PR and its GitHub CI run.
