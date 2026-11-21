# PA#5 — Final build, running and observed · rubric

Class 23KTPM1

**CSC13114 · project milestone, teams of up to 3 · 3% of the course · 100 points**

The product is AI Travel Planner: read the class brief again before you start. This checkpoint marks the product finished and running where strangers can reach it, whether your team can see what the agent is doing on every run, how it compares with a person planning in manual mode, and what you learned when something broke.

Use your assistant for all of it. What we mark is what we can see ourselves: the public URL, a walkthrough we do on it, the trace of a plan we start, a request we plan ourselves in both modes, and a post-mortem we can check against your logs and commits.

The agent's tools, the two confirmations, the validator and the rule that nothing reaches the group before Save were marked in PA#3 and PA#4. Here they only have to keep working.

Due Thursday, December 24, 2026, 22:00. One submission per team. Write PA5.md, the post-mortem, docs/manual-vs-agent.md, AI-LOG.md and SELF_ASSESSMENT_REPORT.md in English.

**Marking window: Friday, December 25 to Thursday, December 31, 2026, 22:00. Keep** the deployment up, and running the commit tagged pa5, until the window closes.

## What is scored

| # | Criterion | Points |
| --- | --- | --- |
| 1 | A public deployment of pa5 | 10 |
| 2 | The rest of the scope | 25 |
| 3 | Logs, metrics and traces | 20 |
| 4 | Agent against manual mode, on 10 requests | 15 |
| 5 | One incident post-mortem | 20 |
| 6 | AI-LOG.md | 10 |

## 1. A public deployment of pa5 — 10 points

Any host is fine, free tiers included. We need a URL that answers over HTTPS during the marking window, and the accounts in ACCESS.md (see What you hand in). The model key stays in the backend, as section 3 of the brief fixes.

| Points | What it looks like |
| --- | --- |
| 9–10 | Up on both our attempts. A version endpoint or page footer shows the commit hash of pa5. The accounts in ACCESS.md work for every role (member, business account, admin). PA5.md says how the deployment is made (one command or the host's documented steps), where each environment's configuration lives, and how to go back to the previous release. |

| Points | What it looks like |
| --- | --- |
| 5–8 | Up on both attempts, but the version is not shown or is not pa5, or an account is missing, or there is no documented way back. |
| 1–4 | Up on only one of our two attempts, or served over plain HTTP. |
| 0 | Down on both attempts (see If your deployment is down). |

A tunnel to a team member's machine counts if it is up when we try. It usually is not.

## 2. The rest of the scope — 25 points

Section 4 of the brief lists ten parts. Search, a group with caps and the agent were due in PA#3. This criterion covers the others:

| Part (brief section 4) | What we try on your deployment |
| --- | --- |
| 1. Places | open a detail page: description, photos, map, menu with prices |
| 2. Accounts | sign in, set a profile of interests |
| 3. Your places | add a want-to-go place, check in, see it on the map of visits; review a place without a check-in (refused) and with one |
| 4. Groups | invite a second account by link, set a group total and a cap per member |
| 5. Weather and holidays | a request on a rainy afternoon or a public holiday, and the plan takes it into account |
| 6. Both modes | build a schedule in manual mode, with the same data and the same validator |
| 7. Editing together | two accounts edit the same schedule at once; neither overwrites the other without warning |
| 8. Report a problem | report a stop as closed or wrongly priced; see it in the report list, linked to the log of that run (the run log itself was marked in PA#3) |
| 9. Posts | a moment post; a promotional post from a business account, approved by an admin; likes and comments |
| 10. Travel companions | opt in, see an AI match score, block and report |

A part that your product owners cut in a decision posted under AI Travel Planner — questions for the product owners is not required, and costs nothing. List each cut in PA5.md with the link to the post. A part your team left out without such a decision counts as missing.

| Points | What it looks like |
| --- | --- |
| 22–25 | Every part that was not cut works on the deployment as the brief and the product owners describe. Reviews need a check-in. The invite link works for a second account. Two people editing the same schedule never lose each other's change silently. A reported stop shows up in the run's log. |
| 15–21 | One or two parts missing with no cut decision, or one or two parts that work only partly (for example, editing together keeps the last save and drops the other one). |
| 7–14 | Three or four parts missing or broken. |
| 0–6 | More than four parts missing or broken. |

## 3. Logs, metrics and traces — 20 points

Any tools are fine: a hosted free tier, a self-hosted stack, or pages you built. Give us read-only access in ACCESS.md. During the walkthrough we start a plan for a group, note the id and the time, then:

- find every log line for that run by one id;

- open its trace, which should show each tool call as its own step (name, duration, whether its structure was correct), each model call, each repair round, and the final validator run in the backend;

- open the dashboard: plans per hour, plan time (p50 and p90) in production, the share of tool calls with the correct structure, repair rounds, violations the validator blocked, runs stopped by the 12-call or 90-second limit, model errors and timeouts, and model spend against your cap;

- read the service level objective (SLO) written in PA5.md, and the alert that watches it.

| Points | What it looks like |
| --- | --- |
| 18–20 | All of the above. Log lines are structured (level, time, service, id). The trace shows every tool call and repair round of the run, with durations, and the model calls show the model and their tokens or cost. One SLO, for example 90% of plans returned within 60 seconds, with an alert on it that has fired at least once: a notification or alert history whose time matches your logs. |
| 12–17 | Logs and dashboard as above, but the trace shows the run as one block with no tool calls inside it, or there is no SLO or no alert, or the alert never fired, or model spend is missing. |
| 5–11 | Searchable logs and some metrics, no traces. |
| 0–4 | Console output only, or we cannot get in with the access you gave. |

The model API key, or a member's name or email address inside a logged prompt, in any log line we can read: this criterion scores at most 4. Section 3 of the brief allows only places and interests to reach a model.

## 4. Agent against manual mode, on 10 requests — 15 points

The fourth target in section 3 of the brief is that the agent gets to a saved schedule with no violations in at most half the time a person takes in manual mode. The eval in PA#4 does not measure it; this criterion does. Write it up in docs/manual-vs-agent.md:

- Ten requests, each listed with its id: dates, hours, starting point, budget and group. Take them from the dev set or write your own, and say which.

- Both modes for every request, on your deployment, by a person you name. Say whether that person had seen the request before. Alternate which mode goes first, so that the second run does not always benefit from the first.

- Times from your own system, not a stopwatch: from the moment the request is opened to Save, read from the events in your logs or metrics from criterion 3. Include the raw event lines for each run.

- Per request: both times, the violations the validator blocked on the way, and the number of edits the user made in the agent's schedule before Save.

- The result: the median of agent time ÷ manual time, and whether it meets at most half. A miss reported honestly scores as well as a pass.

- Where the agent lost: at least one request where it was slower or needed more edits, and why.

We repeat one of the ten ourselves, in both modes, on your deployment, and look for our two runs in your logs.

| Points | What it looks like |
| --- | --- |
| 13–15 | All of the above. Our two runs appear in your logs with times your method would have recorded. The verdict against at most half follows from the table. |
| 9–12 | Ten requests in both modes, but the times come from a stopwatch or the person's own report, or the modes were not alternated, or no request where the agent lost is explained. |
| 4–8 | Fewer than ten requests, or only the agent was timed. |
| 0–3 | Missing, or our runs leave no trace in your logs. |

## 5. One incident post-mortem — 20 points

Something has gone wrong in your system this semester: a deployment that broke, a model quota that ran out, an agent run that kept repairing until the limit, a schedule saved over a member's cap, a price in the shared data that was wrong. Pick one and write it up in docs/postmortem/&lt;YYYY-MM-DD&gt;-&lt;slug&gt;.md, with these sections:

1. Summary: two or three sentences.

2. Impact: who was affected, how many, for how long, and whether a group ever saw a wrong schedule.

3. Timeline: times with time zone, from the first sign to resolved. Each entry points at its evidence: a log line, an alert, a commit, a CI run, a message, a problem report.

4. Detection: how you found out, how long after it started, and whether your alert from criterion 3 would catch it today.

5. Root cause: the mechanism, with evidence. "Human error" or "the model made a mistake" is where the analysis starts, not where it ends.

6. Fix: the commit or pull request, and how you checked that it worked.

7. Follow-up: actions, each with an owner and a status.

It must be a real event in your system, in any environment: production, staging, CI or a test run. A fault you injected on purpose to rehearse counts if the first line of the post-mortem says so. Commits rewritten after the event do not count as timeline evidence.

| Points | What it looks like |
| --- | --- |
| 18–20 | All seven sections. Every timeline entry points at evidence, and the times match your git history and logs. The root cause is a mechanism we can follow in the evidence. The fix links a commit and a check that shows it worked. At least one follow-up is done and linked, and one changes how you would detect it (an alert, a metric, a test, a validator rule). |
| 12–17 | A real incident, all sections present, but fewer than half the timeline entries have evidence, the root cause stops at the first "why", or the follow-ups have no owner or status. |
| 5–11 | What happened and the fix, but impact or detection is missing, or we cannot match the evidence to your logs or commits. |
| 0–4 | Missing, a template still holding placeholder text, or an event we cannot find anywhere in your logs or commits. |

An incident that did not happen scores 0 here, and counts as a claim with no evidence for the honesty adjustment.

## 6. AI-LOG.md — 10 points

| Points | What it looks like |
| --- | --- |
| 9–10 | Entries for this checkpoint's parts: the remaining scope, deployment, dashboards and alerts, the manual-mode comparison, the post-mortem. Real Changed / Rejected lines, including at least one thing your assistant got wrong and the check or log line that caught it. Examples: a merge for editing together that kept only the last save, an alert that could never fire, a drafted timeline that did not match the logs. The model you run in production, and what one plan actually cost, read from your metrics. |
| 5–8 | Tools listed per part; Changed / Rejected are generic, or the cost is an estimate rather than a measurement. |
| 1–4 | Copied from PA#4 with no new entry. |
| 0 | Missing. |

Tool: none is a valid entry if your team chose not to use one.

## If your deployment is down when we mark

- We try twice, on different days of the marking window, at least 6 hours apart. Each attempt waits up to 60 seconds for a cold start. We note the time and the error we got.

- Down on one attempt: criterion 1 scores at most 4. Everything else is marked from the attempt that worked.

- Down on both: criterion 1 scores 0. Criteria 2 and 3 are marked from your walkthrough recording, and criterion 4 from docs/manual-vs-agent.md alone; each of the three scores at most its second band (21, 17 and 12).

- We do not mark a copy running on our machines or yours.

- A fix deployed after the deadline does not count. If the version you show is not pa5, criteria 2 and 3 are marked from the recording.

The recording costs you nothing if your deployment stays up, and it is the only fallback if it does not.

## What you hand in

1. Tag the commit you are submitting pa5 and push the tag. The repository stays public.

2. Put PA5.md at the root, with: the public URL and the version endpoint; how to deploy and how to go back to the previous release; each part the product owners cut, with the link to their decision; the link to your observability tools; the SLO and its alert; a link to docs/manual-vs-agent.md; a link to the post-mortem.

3. The walkthrough recording: one continuous screen recording, at most 12 minutes, of the parts in the table of criterion 2 on the public URL, plus one agent run for a group, made after you tagged pa5. Put the link (an unlisted video is fine) in PA5.md. It is not scored by itself.

4. ACCESS.md, in the zip but never committed (list it in .gitignore): the accounts for each role, a second member account for the group and editing together, and read-only access to your observability tools. Use accounts made for marking, never a real password of yours.

## How to submit

One zip file of the repository including .git, named after your student IDs in ascending order, joined by -, and the total you give yourself: &lt;StudentID1&gt;-&lt;StudentID2&gt;-&lt;StudentID3&gt;_&lt;total&gt;.zip, for example 23127001-23127002-23127003_84.zip. One member turns it in, from their &lt;StudentID&gt;@student.hcmus.edu.vn Google account.

The zip must contain SELF_ASSESSMENT_REPORT.md: one row per criterion in this rubric, the marks you claim, and evidence pointing at a file, a commit, a PR, a CI run, a dashboard or a line range of a log. Add a short what we did not manage. The total in that table is the number in the file name. Template on Classroom.

A wrong file name costs no marks but delays your result: the grading script matches submissions to the class list by that name.

Late work: up to 2 hours late loses 20% of the mark, 2 to 24 hours late loses 50%, and work more than 24 hours late is not accepted. The late factor applies after the honesty adjustment.

## Honesty adjustment

Your self-assessment is compared with the mark you actually earn. The gap is your total − the mark, on the same 100-point scale.

| Gap | Adjustment |
| --- | --- |
| within ±10 | none — this is normal calibration |
| +11 to +20 | −3 |
| +21 to +30 | −6 |
| more than +30 | −10 |
| −21 or worse | −3 — read the rubric before you score yourself down |
| no SELF_ASSESSMENT_REPORT.md | −10, and the file-name total is ignored |

A criterion you claim with no evidence line counts as claimed-and-not-done for this comparison. The adjustment never takes a submission below 0.

## How the 100 becomes your course mark

PA#5 is 3% of the course: 100 points here are worth 3% of your course mark, and 80 points are worth 2.4% (0.24 on the 10-point scale).
