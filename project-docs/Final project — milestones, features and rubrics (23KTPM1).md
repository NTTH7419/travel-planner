# Final project — milestones and rubrics

Class 23KTPM1

**CSC13114 · 23KTPM1 · AI Travel Planner · 6 milestones · 40% of the course**

Your team builds AI Travel Planner in the milestones PA#2 to PA#6; PA#1 was your own proposal. Each milestone is handed in on its own Classroom assignment, due at 22:00, with its full rubric attached to that assignment. This page puts them together so you can plan the rest of the semester: what each milestone asks, when it is due, and what its rubric scores. When this page and a rubric disagree, the rubric is right.

## The six milestones

|  | Milestone | Weight | Due | Status on November 17 |
| --- | --- | --- | --- | --- |
| PA#1 | Proposal and planning | 4% | Thursday, October 22 | marked and returned |
| PA#2 | Harness and quality gate | 4% | Thursday, November 26 | open now |
| PA#3 | Prototype with the LLM feature running | 7% | Thursday, December 10 | assignment posted later on Classroom |
| PA#4 | Eval, guardrails, human gate and red-team | 7% | Thursday, December 17 | assignment posted later on Classroom, after the dev set is published |
| PA#5 | Final build, running and observed | 3% | Thursday, December 24 | assignment posted later on Classroom; marking window December 25–31 |
| PA#6 | Final demo and individual oral | 15% | in the exam period; the date is announced on Classroom | OWNERS.md due Sunday, December 27 |

SEMINAR (7%) is done by the same team but is not part of the project: it counts with the assignments and has its own assignment and rubric. The study is due Sunday, November 29; the teams chosen by the class vote present live in sessions 9–11 (December 4, 11 and 18).

Plan around the data and the exams. The product owners publish the shared place data by Friday, November 27, and the lecturer publishes the dev set before session 9 (Friday, December 4): PA#3 is due six days later. PA#5 and PA#6 fall in the exam period (December 21 to January 2). Your PA#4 red team attacks the deployment you hand in with PA#3, so keep it running from December 10.

The milestones build on one another: PA#3 makes the agent run for real on a public deployment, with both confirmations and the backend validator; PA#4 makes it trustworthy under attack and runs it on held-out requests; PA#5 finishes the rest of the scope, runs it where strangers can reach it, watches it, and compares it with manual mode; PA#6 scores that final build as a whole and asks each of you about it.

## The features of AI Travel Planner you must implement

Every team builds these eleven features. They come from sections 3 and 4 of the brief and from the criteria of PA#3, PA#4 and PA#5 named after each one; the last column names the rules that apply to it (the labels are explained in the next table). PA#6 checks all eleven in the final build. Layout, content, colours, stack and architecture are your team's choice. A part of the scope that your product owners cut, in a decision posted under AI Travel Planner — questions for the product owners and listed in your PA5.md, is not required.

| # | Feature | Who | What must work | Rules |
| --- | --- | --- | --- | --- |
| F1 | Places: search and detail (brief 4.1; PA#3 1; PA#5 2) | Member | Search over the shared data by type, district, open at a time we choose (by weekday, with every opening period) and price level; a detail page with description, photos, map and a menu with prices. OpenStreetMap, Wikimedia and Open-Meteo are credited. | P4 |
| F2 | Accounts, profile and your places (brief 4.2–4.3; PA#5 2) | Member | Sign-in and a profile of interests; a want- to-go list, check-in, a map of the places visited; 1–5 star reviews only after a check-in. | P2 |
| F3 | Groups and caps (brief 4.4; PA#3 1) | Member | Invite by link, which works for a second account; a group total; a spending cap that each member sets for themselves only. | P1 |
| F4 | The agent, through the seven tools (brief 3, 4.5–4.6; PA#3 2) | Member | A real model reaches data only through the seven tools, with weather and public holidays as input; money comes only from compute_cost; the tools take the user and the group from the session. At most 2 repair rounds, 12 tool calls and 90 seconds, then the best draft with a red warning. | R1, R2, R4, R5 |
| F5 | The two confirmations and Save (brief 3; PA#3 3; PA#4 4) | Member, then the group | The agent proposes 8–12 places; the user removes or pins places and confirms. The user reviews the schedule and the spending per person, may edit it, and presses Save. Before Save the other members see nothing; Save twice shares one schedule. | R3, H1, H2 |

| # | Feature | Who | What must work | Rules |
| --- | --- | --- | --- | --- |
| F6 | The validator in the backend (brief 3; PA#3 4) | Backend | The five checks run in the backend at Save, also on a schedule the user changed after the agent; a refused schedule gets a response that names the rule. | V1–V5, H3 |
| F7 | Manual mode (brief 3, 4.6; PA#5 2, 4) | Member | Choose places yourself, drag and drop, choose items, with the same data and the same validator as the agent. | V1–V5 |
| F8 | Editing a schedule together (brief 4.7; PA#5 2) | Two members | Two accounts edit the same schedule at once; neither loses the other's change without a warning. | H3 |
| F9 | Problem reports, run logs and traces (brief 4.8; PA#3 2; PA#5 2–3) | Member, the team | A stop reported as closed, wrongly priced, too far or not a good fit shows in the report list, linked to the log of that run. For a plan made in front of us: every log line by one id; its trace with each tool call, repair round and the final validator run; the dashboard; the SLO and its alert. | R5 |
| F10 | Posts and travel companions (brief 4.9–4.10; PA#5 2) | Member, business account, admin | Moment posts; promotional posts from a business account, shown only after an admin approves them; likes and comments. Companions: only people who opted in, an AI match score, block and report. | P3 |
| F11 | The agent command and the eval gate (brief 6; PA#3 5; PA#4 1) | The team | One command takes a data folder and a requests file and writes plans.jsonl and tool-log.jsonl. A CI job runs the agent on the dev requests and your own, then eval.mjs, and is a required check on main. | — |

The rules, by label. In PA#6 the examiners name two of them for you to try as failure cases (B3), from those that can be tried on the running build.

| Label | Rule | From | Tried on the running build |
| --- | --- | --- | --- |
| V1– V5 | The validator: V1 every place and item exists; V2 every stop is within opening hours; V3 the motorbike time fits each gap; V4 spending within each amount, the lowest cap in the group and the group total; V5 no outdoor stop above 60% chance of rain within the 7-day forecast | PA#3 criterion 4 | a schedule sent straight to Save; V5 only when some hour in the next 7 days is above 60% |
| R1– R5 | The fixed rules of brief section 3: R1 data only through the tools, money only by code; R2 the model's output checked against a schema before the validator; R3 the validator in the backend, both confirmations, nothing reaches the group before Save; R4 2 repair rounds, 12 tool calls, 90 seconds; R5 keys in the backend, only places and interests sent to a model | PA#4 criterion 3 | R1 with interests that tell the agent to ignore the other members' caps; R3 with a second member's account; R5 by searching the deployed JavaScript and reading a prompt in the run log; R2 and R4 only by their tests, so they are not named for B3 |
| H1– H3 | The human gate: H1 no schedule is built before the user confirms the places; H2 Save is refused for a plan the validator rejects, for someone outside the group, and with no session; H3 a schedule the user changed is validated again at Save | PA#4 criterion 4 | direct requests |
| P1 | Changing another member's cap is refused by the API | PA#3 criterion 1 | a direct request |
| P2 | A review without a check-in is refused | PA#5 criterion 2 | on the running build |
| P3 | A promotional post appears only after an admin approves it, and never reaches the agent | PA#4 criterion 3; PA#5 criterion 2 | on the running build |
| P4 | A place with no hours, no ticket price or no menu is never offered to the agent | PA#3 criterion 1 | a search, then the run log |

## Where your features are scored

- PA#3 scores the first real run of the agent on your deployment: search and groups (F1, F3), the agent through the seven tools (F4), the two confirmations (F5), the validator (F6) and the agent command (F11), plus our own direct requests.

- PA#4 scores whether the group can trust it: the eval gate (F11), the held-out run, the fixed rules under attack (F4–F6), the human gate (F5), and your red-team report on another team.

- PA#5 scores the finished product running in public: the rest of the scope (F1, F2, F7–F10), logs, metrics and traces (F9), the agent against manual mode on 10 requests, and one incident post-mortem.

- PA#6 scores the whole final build working together (40 of the 100 points): each of the eleven features F1–F11, two rules, roles, and what your team built beyond the brief (B5).

## For every milestone

- Teams of up to 3, the same team all semester. One member submits for the team.

- One zip of your team repository including .git, with the tag of the milestone (pa2, pa3, pa4, pa5) on the commit you submit, pushed. The repository stays public. Name the zip after the student IDs, in ascending order, and the total you give yourselves: &lt;StudentID1&gt;-&lt;StudentID2&gt;-&lt;StudentID3&gt;_&lt;total&gt;.zip, for example 23127001-23127002-23127003_84.zip. PA#6 has no zip (see below).

- SELF_ASSESSMENT_REPORT.md inside: one row per criterion of the rubric, the marks you claim and the evidence — a file, a commit, a pull request or a CI run — adding up to the number in the file name, and a short what we did not manage.

- PA2.md … PA5.md at the root, with the links each rubric asks for.

- AI-LOG.md: one file for the whole project, with real Changed and Rejected entries for each milestone's parts. Tool: none is a valid entry.

- Commit history counts where a rubric scores it: one commit per part, tests no later than the code they test. A history split or rebuilt after the work was finished does not count as one commit per part; it scores at the level for commits that mix several parts.

- Late work (PA#3–PA#5): up to 2 hours late loses 20% of the mark, 2 to 24 hours late loses 50%, and work more than 24 hours late is not accepted. The late factor applies after the honesty adjustment.

- Write the documents in English: PAn.md, AI-LOG.md, SELF_ASSESSMENT_REPORT.md, the red-team report and the post-mortem.

- Turn in from your &lt;StudentID&gt;@student.hcmus.edu.vn account.

## Honesty adjustment (PA#1–PA#5)

Your self-assessment is compared with the mark you actually earn, on the same 100-point scale.

| Gap: your total − the mark | Adjustment |
| --- | --- |
| within ±10 | none |
| +11 to +20 | −3 |
| +21 to +30 | −6 |
| more than +30 | −10 |
| −21 or worse | −3 |
| no SELF_ASSESSMENT_REPORT.md | −10, and the file-name total is ignored |

A criterion you claim with no evidence line counts as claimed and not done. The adjustment never takes a mark below 0.

## PA#3 — Prototype with the LLM feature running · 7% · due Thursday, December 10

- Search and groups over the shared place data, on your deployment: search by type, district, opening time and price level; a group with a total and a cap per member

- The agent, for real, through the seven tools, with the limits enforced in code (2 repair rounds, 12 tool calls, 90 seconds), each with a test that uses a fake model

- Both confirmations and the validator in the backend: nothing reaches the group before Save, checked with a second member's account through direct requests

- The agent command on a file of requests, and one committed run with its eval.mjs report

- A public deployment from here on: keep it running until the PA#4 marks are out, because another team attacks it in PA#4. PA3.md holds the URL, four test accounts of one group, the data version and a recording of up to 5 minutes

- The syllabus rule: if a schedule reaches the group without the user's Save, or the agent runs with none of the limits, criteria 2, 3 and 4 score 0

| # | Criterion | Points |
| --- | --- | --- |
| 1 | Search and groups, on your deployment | 20 |
| 2 | The agent, through the seven tools | 25 |
| 3 | The two confirmations | 15 |
| 4 | The validator in the backend | 20 |
| 5 | The agent command and a first eval | 10 |
| 6 | Tests first, one part per commit | 5 |
| 7 | AI-LOG.md | 5 |

## PA#4 — Eval, guardrails, human gate and red-team · 7% · due Thursday, December 17

- The eval gates CI: a required check on main that runs your agent on the dev requests and at least 10 of your own with the real model, then eval.mjs; a pull request it blocked; three repeated runs of one commit

- The held-out run: we run your agent command once on the held-out requests and time it; no plan over a cap or the group total is a fixed rule, and the band is set by the other rules, the tool-structure rate and p90

- The five fixed rules of section 3 hold under our attacks, each with tests, and the human gate holds against direct requests

- A red-team report on the deployment of the team the lecturer assigns you, at least 8 attacks across at least 5 categories

- Hand in also PA4.md (with the section Where we stop it) and marking.env, attached beside the zip, never in git

| # | Criterion | Points |
| --- | --- | --- |
| 1 | The eval gates CI | 20 |
| 2 | The held-out run | 20 |
| 3 | The fixed rules hold under attack | 20 |
| 4 | The human gate | 15 |
| 5 | Red-team report on another team | 20 |
| 6 | AI-LOG.md | 5 |

## PA#5 — Final build, running and observed · 3% · due Thursday, December 24

- The final build, tagged pa5, on a public deployment over HTTPS that shows its commit, up through the marking window (Friday, December 25 to Thursday, December 31) and until your PA#6 slot

- The rest of the scope of section 4, which we try on your deployment; logs, metrics and traces with one SLO and an alert that has fired

- The agent against manual mode on 10 requests, timed from your own logs, in docs/manual-vs-agent.md; one incident post-mortem of a real event

- Hand in also PA5.md (with each part your product owners cut and the link to their decision), a walkthrough recording of at most 12 minutes (it is also the fallback for PA#6), and ACCESS.md in the zip but never committed

| # | Criterion | Points |
| --- | --- | --- |
| 1 | A public deployment of pa5 | 10 |
| 2 | The rest of the scope | 25 |
| 3 | Logs, metrics and traces | 20 |
| 4 | Agent against manual mode, on 10 requests | 15 |
| 5 | One incident post-mortem | 20 |
| 6 | AI-LOG.md | 10 |

## PA#6 — Final demo and individual oral · 15% · date announced on Classroom

- Before your slot, by Sunday, December 27, 22:00: commit OWNERS.md (who built which part, and what your team built beyond the brief) and post the link to that commit on the PA#6 assignment. Keep the deployment running pa5 until your slot

- In your slot, the team runs the final build through its main flow, then the examiners question each member on the team's own code and decisions. The examiners are this class's teaching assistant and lab instructors

- Each member gets one mark out of 100, in two parts: the final build, 40 points, the same for the whole team (table below), and your explanation, 60 points, for each member. The assistant stays closed while you answer; the repository, terminal, tests and dashboards stay open. Nobody asks you to write code, from memory or on paper. The oral is in Vietnamese; technical terms may stay in English

- There is no SELF_ASSESSMENT_REPORT.md and no honesty adjustment in PA#6

| # | The final build — 40, for the team | Points |
| --- | --- | --- |
| B1 | The eleven features F1–F11, each on the running build: 2 if it works, 1 if only in part, after a retry or only in the recording, 0 if missing or faked | 22 |
| B2 | The deployment runs pa5; a reload at two points keeps the data; the Network tab shows the requests | 4 |
| B3 | Two rules we name from the feature table, tried as failure cases and stopped by the server (1 instead of 3 if only the screen stops it, or only a test shows it) | 6 |
| B4 | One screen or endpoint of another member, another group or another role, refused by the API | 4 |
| B5 | What your team built beyond the brief, listed in OWNERS.md: 4 if it works and a test checks it, 2 if it works but nothing checks it | 4 |

| Points | Your explanation — 60, for each member |
| --- | --- |
| 51–60 | Correct and specific across what you are asked: you find the place on screen without help, point at the file, line, commit, log or trace, and handle follow-ups, including on the LLM feature, the guardrails and the human gate. |
| 39–50 | Mostly correct, but you need hints to find the place, stay general, or answer the follow-ups only in part. |
| 24–38 | Partly correct: you read code aloud without explaining it, or describe what it should do and get what it actually does wrong. |
| 9–23 | Mostly wrong, or "the assistant wrote it" with no explanation. |
| 0–8 | You cannot explain the parts you built, or you are absent without a documented reason. |

Code you cannot explain counts against your explanation points, even if it runs, whoever or whatever wrote it. It does not change your team's marks for PA#2 to PA#5, nor the build points.
