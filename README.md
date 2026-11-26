# AI Travel Planner

The PA#2 harness, Save Plan endpoint, and contract tests for the AI Travel
Planner project.

## Group member

- 23127303 - Hồ Tấn Quốc
- 23127499 - Lê Huy Toàn
- 23127510 - Phùng Ngọc Tuấn

## Development

Install Node.js 24 or newer. From a fresh clone, run:

```sh
npm ci
npm run lint
npm run format:check
npm run typecheck
npm test
```

The four checks run unchanged in CI. `npm test` runs the contract tests for
`POST /v1/plans/{planId}/save` in `tests/`, written from
[the contract](docs/contract/save-plan.md). If Vitest discovers no tests,
the command fails in both local development and CI.

## CI and branch protection

The workflow runs the four checks on every pull request, pushes to `main`, and
the submission tag `pa2`. Require all four named CI jobs on `main` and require
a pull request before merging. Keep direct pushes and force pushes blocked.

## Assistant rules, permissions and secrets

- Rules for AI assistants: [AGENTS.md](AGENTS.md) (Claude Code reads it through
  [CLAUDE.md](CLAUDE.md)).
- What an assistant may do, in three tiers, and the secret scan:
  [docs/permissions.md](docs/permissions.md). Claude Code enforces the tiers
  through [.claude/settings.json](.claude/settings.json).
- Codex: review the project configuration, mark the repository trusted if you
  trust it, and restart Codex to load
  [`.codex/rules/pa2.rules`](.codex/rules/pa2.rules). For commands evaluated by
  Codex execpolicy, it requests approval for common dependency changes, commits
  and branch pushes, and denies common direct pushes to `main` and force-push
  forms. Routine checks use normal sandbox permissions; the rules do not grant
  outside-sandbox access.
- Environment variables: [.env.example](.env.example) lists every one, without
  values. `.env` is ignored by git.

To inspect the Codex command rules from the repository root (these commands do
not run the commands being checked):

```sh
codex execpolicy check --rules .codex/rules/pa2.rules -- git push origin pa2/example
codex execpolicy check --rules .codex/rules/pa2.rules -- git push origin main
```

The expected decisions are `prompt` and `forbidden`, respectively. These rules
match command prefixes, not file reads or edits. Follow
[the permission tiers](docs/permissions.md) for file operations, including
never reading or writing `.env`. GitHub branch protection remains the server-side
guard for `main`.

## Model spending cap

Not set yet: the team has not chosen a model provider, and PA#2 makes no model
call, so no model API key exists. When the key is created, record here the
provider, the model, and the spending cap set in the provider's dashboard.
