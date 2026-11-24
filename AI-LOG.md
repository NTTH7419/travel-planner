# AI-LOG.md

## 2026-11-21 — PA#2 harness and CI

Tool: OpenAI Codex.
Asked for: begin Role A step by step and use the PA#2 rubric when it differs from the task split.
Kept: the `.gitignore`-only first commit, four documented check commands, and four separately named CI jobs in `.github/workflows/ci.yml`.
Changed: the first `eslint src tests` command failed because `tests/` had no TypeScript files yet. I changed it to lint `src/**/*.ts` and `tests/**/*.ts` with `--no-error-on-unmatched-pattern`; `npm run lint` then passed. Each check also returned a nonzero exit code when I introduced a temporary error.
Rejected: a green working tree as proof that a fresh clone would pass. A fresh Windows clone failed `npm run format:check` after Git converted files to CRLF. I added `.gitattributes` in commit `2f42cf9` and repeated the fresh-clone test; `npm ci` and all four checks passed.

## 2026-11-21 — branch protection and PR evidence

Tool: OpenAI Codex.
Asked for: protect `main` and demonstrate a PR blocked by a real CI failure, then fixed on the same PR.
Kept: `main` requires a PR, one approval and all four CI jobs, applies to admins, and disallows force pushes; [the settings screenshot](docs/evidence/branch-protection.jpeg) records the configuration.
Changed: the GitHub connector returned 403 when creating PR #1. I used the repository owner's existing Git credential with the GitHub API, then verified the [red Lint run](https://github.com/NTTH7419/travel-planner/actions/runs/44913877745) and the [green run after the source fix](https://github.com/NTTH7419/travel-planner/actions/runs/44913976220). No tests were edited to make the PR pass.
Rejected: the first [PR #1](https://github.com/NTTH7419/travel-planner/pull/1) description still said the fix would happen later after it had already landed. I updated the description with the actual failing commit, fixing commit, and CI links.

The product's model provider, model, spending cap, and cost per plan are not selected yet. This harness made no model calls; add those details when the team chooses the provider.
