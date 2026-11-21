# PA#3 — Prototype with the LLM feature running · rubric

Class 23KTPM1

**CSC13114 · project milestone, teams of up to 3 · 7% of the course · 100 points**

The product is AI Travel Planner: read the class brief again before you start, sections 3 to 7. This checkpoint marks the first time the agent runs for real: search over the shared place data, a group with spending caps, and the agent building a schedule through the seven tools. Both confirmations and the backend validator work, and nothing reaches the group before Save.

Use your assistant for all of it. What we mark is what we can see: on your deployment, in your repository, and in the runs we repeat ourselves. Section What we run when marking says exactly which.

Due Thursday, December 10, 2026, 22:00. One submission per team, same teams as PA#2. Write PA3.md, AI-LOG.md and SELF_ASSESSMENT_REPORT.md in English.

## What is scored

| # | Criterion | Points |
| --- | --- | --- |
| 1 | Search and groups, on your deployment | 20 |
| 2 | The agent, through the seven tools | 25 |
| 3 | The two confirmations | 15 |
| 4 | The validator in the backend | 20 |
| 5 | The agent command and a first eval | 10 |
| 6 | Tests first, one part per commit | 5 |
| 7 | AI-LOG.md | 5 |

The syllabus rule. A feature that calls a model and displays the result directly, with no eval, no limits and no human confirmation, does not count as completing PA#3, however well the demo runs. Here that means: if a schedule reaches the group without the user's Save, or the agent runs with none of the limits of section 3 (2 repair rounds, 12 tool calls, 90 seconds), criteria 2, 3 and 4 score 0.

## The shared data

The product owners publish the 150 checked places by Friday, November 27, in the format of travel-eval/README.md. Use that set and name its version (dataset.json) in your README. If it is late, use your own data in the same format, say so in PA3.md, and you lose nothing: we mark against the data your PA3.md names.

## 1. Search and groups, on your deployment — 20 points

| Points | What it looks like |
| --- | --- |
| 17–20 | On the deployment, with the accounts in PA3.md: search by type, district, open at a time we choose (by weekday, with every opening period) and price level; a detail page with the menu. A place with no hours, no ticket price or no menu is never offered to the agent as a candidate. A group: invite by link, a group total, and a cap that each member sets for themselves only. Changing another member's cap is refused by the API (the status your contract names). OpenStreetMap, Wikimedia and Open-Meteo are credited in the product. |
| 11–16 | It works, but one part is missing or wrong (for example, "open now" ignores a midday break), or it works only locally and in the recording. |
| 4–10 | Search over your own sample data although the shared set was published; or groups with no caps. |
| 0–3 | Neither search nor groups. |

If the deployment does not answer when we mark, we try again on another day. If it still does not answer, we mark from the recording, and the criterion cannot go above 12.

## 2. The agent, through the seven tools — 25 points

The fallback of section 5 of the brief (code calls the tools in a fixed order, the model scores places and proposes the frame of the day) can reach full marks here.

| Points | What it looks like |
| --- | --- |
| 22–25 | The backend calls a real model. The model reaches data only through the seven tools, and money is worked out only by compute_cost. The backend checks every tool's arguments. Every tool takes the user and the group from the session, never from the model's arguments (session 6, slide 20). The prompts in your run log contain places and interests, never names or email addresses. The key is never in the browser: we search your deployed JavaScript for it. The limits are enforced in code: at most 2 repair rounds, 12 tool calls, 90 seconds. When one is reached, the user gets the best draft with a red warning. Each limit has a test that uses a fake model and no network. README and AI-LOG.md name the model and what one plan costs, with the arithmetic. |
| 14–21 | The agent runs, but one of these is missing: a limit not enforced or not tested, a tool that takes the user from the model's arguments, or no run log. |
| 6–13 | The model works out money, reads the database directly, or gets the whole place list pasted into its prompt instead of through the tools. |
| 0–5 | No real model call, or the key reaches the browser. |

## 3. The two confirmations — 15 points

| Points | What it looks like |
| --- | --- |
| 13–15 | After the agent proposes 8–12 places, nothing goes further until the user removes or pins places and confirms. A pinned place is in the schedule, a removed one is not: we try both. The user then reviews the schedule and the spending per person, can change it themselves, and presses Save. Before Save, the other members see nothing: we check with a second member's account, through direct requests, not only in the screens. Pressing Save twice shares one schedule. |
| 8–12 | Both confirmations exist in the screens, but a direct request shows the draft to another member before Save, or a pin or a removal is ignored. |
| 3–7 | Only one of the two confirmations. |
| 0–2 | Neither. |

## 4. The validator in the backend — 20 points

The five checks of section 3. Spending follows the reading of eval.mjs (each member within the lowest cap in the group, and the group within its total; see Spending in travel-eval/README.md).

| Points | What it looks like |
| --- | --- |
| 17–20 | All five checks: every place and item exists; every stop is within opening hours; the motorbike time fits each gap; spending within the amount, the lowest cap and the total; no outdoor stop above 60% chance of rain within the 7-day forecast. The model's output is validated against a schema before the validator sees it. The validator runs in the backend when the user presses Save, including on a schedule the user changed after the agent. We send schedules straight to the requests your screens use: a closed place, a member over the lowest cap, a gap shorter than the travel time, an invented place, an invented item. Each one is refused, and the response names the rule. Each rule has a test, committed no later than the code. |
| 11–16 | Four of the five checks, or the validator runs on the agent's draft but not on a schedule the user changed. |
| 4–10 | The validator checks only the total, or Save accepts one of our schedules. |
| 0–3 | No validator, or only in the browser. |

The rain check depends on the live forecast, so on the deployment we test it only if some hour in the next 7 days is above 60%. Your tests, with a fixed weather file, prove it either way.

## 5. The agent command and a first eval — 10 points

Section 6 of the brief: your agent runs from the command line on a file of requests. The lecturer runs the held-out set through that command in PA#4, so it has to work here first. The formats are in travel-eval/README.md.

| Points | What it looks like |
| --- | --- |
| 9–10 | The README gives one command that takes a data folder and a requests file, and writes plans.jsonl and tool-log.jsonl, with the tool calls logged as the model made them. It reads weather from the data folder, not from the live forecast. One real run is committed with its eval.mjs report: on the dev set if the lecturer has published it, otherwise on at least 5 requests of your own over the shared data, including a group with different caps, a closed weekday and an outdoor place. Re- scored with our copy of eval.mjs, it gives the result you report. eval.mjs and the data in your repository are the published ones, byte for byte. |
| 5–8 | The command works, but the re-scored result differs from yours, or every request is an individual budget. |
| 1–4 | The plans or the tool log were not produced by the agent command. |
| 0 | No command, or eval.mjs or the data was edited. |

PA#3 has no pass mark on the eval. Report what it says. The bar of section 3 starts to count in PA#4.

## 6. Tests first, one part per commit — 5 points

| Points | What it looks like |
| --- | --- |
| 5 | The tests for the validator rules and for the three limits land in a commit before the code they test, or in the same commit. Each commit covers one part: search, groups, a tool, the agent loop, a confirmation, the validator. No test is loosened in the commit that made it pass. |
| 2–4 | Tests come after the code, or commits mix several parts. |
| 0–1 | One commit with everything, or a test loosened in the commit that turned it green. |

A history split or rebuilt after the work was finished does not count as one commit per part; it scores at the level for commits that mix several parts. A history rebased or rebuilt after the work was finished does not count as evidence for criterion 4 either. We check it with the commit times and with what AI-LOG.md says.

## 7. AI-LOG.md — 5 points

| Points | What it looks like |
| --- | --- |
| 5 | Which tool, for which part, and real Changed / Rejected entries. Example: the assistant that let the model add up the bill, or a tool that read the member id from the model's arguments, and how you found it. |
| 2–4 | Tools listed; Changed / Rejected are empty or generic. |
| 0–1 | Missing. |

Tool: none is a valid entry if your team chose not to use one.

## Catching your assistant

These are the mistakes assistants make most often on this checkpoint. We look for each one, so look first.

| You see | What it means | What we check |
| --- | --- | --- |
| eval.mjs or a data file changed | the target moved | we compare with the published copy, and score with our copy anyway |
| a validator rule loosened in the commit that made a test green | the rule was edited to pass | git log -p on the validator and its tests |
| a total or a per-person cost in the model's output that your code uses | the model is doing the money | criterion 2 |
| get_profile or search_places reading a member id from the model's arguments | an injection can read someone else | criterion 2 |
| the model key in a NEXT_PUBLIC_ or VITE_ variable | the key is in the browser | we search your deployed JavaScript |
| a red warning, but the draft is shared anyway | the limit is only a message | criterion 3 |
| toolCalls and seconds in plans.jsonl that do not match the tool log | the run log is not honest | eval.mjs reports TOOL_COUNT_MISMATCH |

Put these in the never list of your rules file.

## What we run when marking

1. Your repository, from the pa3 tag in your zip. We compare eval.mjs and the data with the published ones.

2. Your checks, with the commands in your README, in a container. Dependencies are installed first; then the network is cut, and the container is killed after 15 minutes. Your unit tests should not need the network: no real model call in unit tests (your PA#2 rules file).

3. Your committed run, re-scored with our copy of eval.mjs.

4. Your deployment, with the accounts in PA3.md: the steps of criteria 1, 3 and 4, and a search of the JavaScript it sends to the browser.

How we reach the model. In PA#3 we never need your API key. The real model is called only by your own deployment, where the key stays in the backend, and in the run you commit. Everything we run on our machine runs with the network cut.

## What you hand in

1. Tag the commit you are submitting pa3 and push the tag. The repository stays public.

2. Keep the deployment running from the deadline until the PA#4 marks are out. Your red team in PA#4 attacks it.

3. Put PA3.md at the root, with:

4. the deployment's URL, and test accounts for four members of one group. They hold no real data. Anyone who reads your public repository can use them, so set the spending cap with that in mind;

5. the version of the place data you use;

6. the agent command, and the folder of your committed run with its eval.mjs result;

7. a link to a screen recording of up to 5 minutes, showing one group plan from the request to Save on the deployment. We watch it only if the deployment does not answer.

## How to submit

One zip file of the repository including .git, named after your student IDs in ascending order, joined by -, and the total you give yourself: &lt;StudentID1&gt;-&lt;StudentID2&gt;-&lt;StudentID3&gt;_&lt;total&gt;.zip, for example 23127001-23127002-23127003_84.zip. One member turns it in, from their &lt;StudentID&gt;@student.hcmus.edu.vn Google account.

The zip must contain SELF_ASSESSMENT_REPORT.md: one row per criterion in this rubric, the marks you claim, and evidence pointing at a file, a commit, a PR or a CI run. Add a short what we did not manage. The total in that table is the number in the file name. Template on Classroom.

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

PA#3 is 7% of the course: 100 points here are worth 7% of your course mark, and 80 points are worth 5.6% (0.56 on the 10-point scale).
