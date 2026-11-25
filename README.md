# AI Travel Planner

The PA#2 harness for the AI Travel Planner project. The endpoint contract and
contract tests will be added by Roles B and C.

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
[the contract](docs/contract/save-plan.md).

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
- Environment variables: [.env.example](.env.example) lists every one, without
  values. `.env` is ignored by git.

## Model spending cap

Not set yet: the team has not chosen a model provider, and PA#2 makes no model
call, so no model API key exists. When the key is created, record here the
provider, the model, and the spending cap set in the provider's dashboard.
