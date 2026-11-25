# Assistant permissions and secrets

What an AI assistant may do in this repository. The rules in `AGENTS.md` say
how to work; this file says what the assistant may touch.

## Three tiers

| Tier          | The assistant may                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Allowed**   | Read the code and docs. Run `npm ci` and the four checks (`npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`). Edit files under `src/`. Read-only git commands (`git status`, `git diff`, `git log`). |
| **Ask first** | Install or remove a package (changes `package.json` and the lockfile). Change CI (`.github/`). Change the contract (`docs/contract/`). Edit a test under `tests/`. Commit or push a branch.                                |
| **Never**     | Read or write `.env`. Push to `main`. Force-push. Edit a test, the eval data or a validator rule to make a check pass. Put a model API key in code, in the browser bundle or in any tracked file.                          |

Editing a test is "ask first", not "never": writing contract tests is real work.
Editing one **to make a failing check pass** is always "never".

### Where the tiers are enforced

- **Claude Code:** `.claude/settings.json` sets the same tiers as `allow`,
  `ask` and `deny` rules, so the tool itself asks or refuses. Personal
  overrides go in `.claude/settings.local.json`, which git ignores.
- **Codex** and any other tool: the tiers above and `AGENTS.md` are the rules;
  the person running the tool approves every step in the "ask first" tier.
- **GitHub:** `main` is protected, so a push to `main` or a force-push is
  refused for everyone, assistant or not
  ([settings](evidence/branch-protection.jpeg)).

## Secrets

- `.env` and `.env.*` are ignored by git; only `.env.example` is tracked. It
  lists every variable the code reads, without values.
- No model API key exists yet: PA#2 makes no model call. When the team picks a
  provider, its key goes in `.env`, its variable name in `.env.example`, and the
  provider, model and spending cap in the README.
- **History scan, 2026-11-25:** gitleaks v8.30.1 found no leaks in the 20
  non-merge commits of every branch (`--log-opts="--all"`) nor in the 54 files
  of the working tree. Command, from the repository root:

  ```sh
  docker run --rm -v "$PWD:/repo:ro" \
    -e GIT_CONFIG_COUNT=1 -e GIT_CONFIG_KEY_0=safe.directory -e GIT_CONFIG_VALUE_0='*' \
    zricethezav/gitleaks:latest git /repo --log-opts="--all" --redact -v
  ```

- If a secret ever reaches the history: rotate it first, then record it in
  `AI-LOG.md`. Rewriting history does not un-leak it.
