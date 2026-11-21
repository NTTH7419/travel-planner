# AI Travel Planner

The PA#2 harness for the AI Travel Planner project. The endpoint contract and
contract tests will be added by Roles B and C.

## Development

Install Node.js 24 or newer. From a fresh clone, run:

```sh
npm ci
npm run lint
npm run format:check
npm run typecheck
npm test
```

The four checks run unchanged in CI. `npm test` is ready for the contract tests;
the empty test suite is temporary until Role C adds them.

## CI and branch protection

The workflow runs the four checks on every pull request, pushes to `main`, and
the submission tag `pa2`. Require all four named CI jobs on `main` and require
a pull request before merging. Keep direct pushes and force pushes blocked.

## Model spending cap

Role C will record the provider, model, and spending cap after the team's model
API key is configured. No model API key is needed for PA#2 checks.
