# Self-assessment — PA#2

Submitted by:

- 23127303 - Hồ Tấn Quốc
- 23127499 - Lê Huy Toàn
- 23127510 - Phùng Ngọc Tuấn

**Proposed total for team review: 93 / 100.** This is not the final submission
score until the team approves it and the evidence for the `pa2` tag exists.

| #   | Rubric criterion            | Max | Proposed | Evidence and reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | --------------------------- | --: | -------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Rules file                  |  15 |       15 | [AGENTS.md](AGENTS.md) has the four required sections and links four rules to real failures in [AI-LOG.md](AI-LOG.md). A team member revised the assistant's draft in [commit `e8a3806`](https://github.com/NTTH7419/travel-planner/commit/e8a3806).                                                                                                                                                                                                                                              |
| 2   | Permissions and secrets     |  10 |        8 | [docs/permissions.md](docs/permissions.md) defines allowed, ask-first and never tiers; [.env.example](.env.example) lists the only variable read by the app; the [history scan](docs/permissions.md#secrets) reports no leaks. [README.md](README.md#model-spending-cap) says no provider or spending cap has been set, so no cap credit is claimed.                                                                                                                                              |
| 3   | One command for every check |  10 |        9 | [README.md](README.md#development), [package.json](package.json) and [CI](.github/workflows/ci.yml) use the same four commands. [AI-LOG.md](AI-LOG.md#2026-11-21--pa2-harness-and-ci) records a successful fresh-clone check. The current `main` test script still has `--passWithNoTests`; the stricter change is on a separate branch.                                                                                                                                                          |
| 4   | CI that blocks a merge      |  20 |       20 | [Branch-protection screenshot](docs/evidence/branch-protection.jpeg) and [quality-gate record](docs/evidence/quality-gate.md); [PR #1](https://github.com/NTTH7419/travel-planner/pull/1) went [red](https://github.com/NTTH7419/travel-planner/actions/runs/44913877745) on required Lint, then [green](https://github.com/NTTH7419/travel-planner/actions/runs/44913976220) after the [source fix](https://github.com/NTTH7419/travel-planner/commit/a6f9b1f764f436884caf7d5eb7dd7a9d5ef86932). |
| 5   | Contract of one endpoint    |  25 |       24 | [Save Plan contract](docs/contract/save-plan.md) specifies bearer-token ownership, request and response fields, all problem types, idempotency, save effects, versions and examples. The in-memory PA#2 limits are stated in its test-data section.                                                                                                                                                                                                                                               |
| 6   | Contract tests that bite    |  15 |       12 | [Contract tests](tests/) cover success, ownership, idempotency and eight of the nine listed problem types through HTTP; [PR #5](https://github.com/NTTH7419/travel-planner/pull/5) made only the required [Tests job fail](https://github.com/NTTH7419/travel-planner/actions/runs/45540633293) without changing tests. No test triggers `500 internal`; listing it in [the helper](tests/helpers.ts) is not coverage.                                                                            |
| 7   | AI-LOG.md                   |   5 |        5 | [AI-LOG.md](AI-LOG.md) names tools and roles and records concrete Changed and Rejected decisions, including the CRLF fresh-clone failure and an over-specified contract test.                                                                                                                                                                                                                                                                                                                     |

## What we did not manage

- We have not selected a model provider or model, created a model API key, or
  set a provider spending cap. PA#2 makes no model call.
- We have no test that forces the contract's `500 internal` response. The other
  eight problem types are exercised, and the deliberate contract break is
  evidenced by PR #5.
- The stricter `npm test` script and Codex command rules are on a separate branch
  and are not part of this `main`-based draft. The current script can pass when
  Vitest discovers no tests.
- We have not created the `pa2` tag or its CI run. After the final submission
  commit is merged, add the run link to `PA2.md` and make the zip filename's
  total match the approved score.
