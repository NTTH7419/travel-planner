# PA#2 quality-gate evidence

- Pull request: https://github.com/NTTH7419/travel-planner/pull/1
- Deliberately failing commit: `1505ae02c12b50129c52d3cecf20cc3e8b6d7624`
- Red CI run: https://github.com/NTTH7419/travel-planner/actions/runs/44913877745
- Failure: the required `Lint` job rejected an unused variable; the other three jobs passed.
- Fixing commit: https://github.com/NTTH7419/travel-planner/commit/a6f9b1f764f436884caf7d5eb7dd7a9d5ef86932
- Green CI run: https://github.com/NTTH7419/travel-planner/actions/runs/44913976220
- Branch protection: [screenshot](branch-protection.jpeg)

The `main` branch requires a pull request, one approving review, and the `Lint`,
`Format check`, `Type check`, and `Tests` jobs. Admins are subject to the rules;
force pushes are disabled.
