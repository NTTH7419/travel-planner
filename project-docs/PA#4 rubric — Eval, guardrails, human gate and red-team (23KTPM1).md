# PA#4 — Eval, guardrails, human gate and red-team · rubric

Class 23KTPM1

**CSC13114 · project milestone, teams of up to 3 · 7% of the course · 100 points**

The product is AI Travel Planner. In PA#3 the agent ran. This checkpoint marks whether the group can trust it: an eval that blocks a merge, the fixed rules of section 3 of the brief holding under attack, confirmations that a direct request cannot skip, and a run on held-out requests that you have never seen. You also attack another team's deployment and write down what you found.

The three questions of the course's topic 10 run through all of it. Who pays when the schedule is wrong? How do you know it is wrong? Where do you stop it?

Due Thursday, December 17, 2026, 22:00. One submission per team, same teams as PA#3. Write PA4.md, the red-team report, AI-LOG.md and SELF_ASSESSMENT_REPORT.md in English.

## What is scored

| # | Criterion | Points |
| --- | --- | --- |
| 1 | The eval gates CI | 20 |
| 2 | The held-out run | 20 |
| 3 | The fixed rules hold under attack | 20 |
| 4 | The human gate | 15 |
| 5 | Red-team report on another team | 20 |
| 6 | AI-LOG.md | 5 |

## 1. The eval gates CI — 20 points

The lecturer publishes the dev set before session 9 (Friday, December 4), with the place data of the product owners.

| Points | What it looks like |
| --- | --- |
| 17–20 | A CI job runs your agent on the dev requests and on your own, producing the plans and the tool log inside the job with the real model, then runs eval.mjs. Any exit code other than 0 fails the job, and the job is a required check on main. You link a pull request where the gate went red and the merge was blocked, and the commit that fixed the agent, not the data. eval.mjs and the data are the published ones, byte for byte. You have at least 10 requests of your own, including the injection cases of session 6, slide 21, each committed before the change that handles it. PA4.md reports three runs of the same commit: how many requests changed between pass and fail, and the lowest and highest tool-structure rate and p90. It also states what one CI run costs. |

| Points | What it looks like |
| --- | --- |
| 11–16 | The gate runs on every pull request and can fail, but one of these is missing: it is not required, you have fewer than 10 requests of your own, or there is no repeated run. |
| 4–10 | The eval runs, but on plans committed to the repository, or with continue-on-error, or only on main after the merge. |
| 0–3 | No eval in CI, or eval.mjs or the data was changed. |

A full dev run on every pull request can cost too much on a free tier. A subset per pull request is fine if PA4.md says which requests and why, and the full set runs on the tagged commit. The model key in CI lives in the repository's secrets, never in a file.

## 2. The held-out run — 20 points

We run your agent command once on the held-out requests, in our container, time it ourselves, and score the output with our copy of eval.mjs, using its default reading of the caps.

Two kinds of line in the bar of section 3 are marked differently. No plan over a cap or the group total is a fixed rule: money is worked out by code and the validator runs last, so this has to be 0. At least 80% of tool calls with the correct structure and p90 below 60 seconds are the targets of the brief, so they are scored in bands, not as a pass mark.

| Points | What it looks like |
| --- | --- |
| 17–20 | No plan breaks any rule of eval.mjs, every request has a plan, tool calls with the correct structure are at least 80%, and p90 is below 60 seconds. Within this band, p90 decides: 20 below 30 seconds, 19 below 40, 18 below 50, 17 below 60. |
| 11–16 | No plan over a cap or a total, but one or two plans break another rule or are missing, or tool structure is below 80%, or p90 is 60 seconds or more. |
| 5–10 | No plan over a cap or a total, but three or more plans break another rule or are missing. |
| 1–4 | At least one plan over a cap, the lowest cap, or the group total. |
| 0 | The command fails, or the run is killed before it writes the plans. |

We time the whole run. If the seconds in your plans add up to more than 20% less than what we measured for a run that goes one request at a time, we use our measurement for p90 and say so. We do not fix your command. If our side fails, we run it again.

## 3. The fixed rules hold under attack — 20 points

The five lines of Fixed for every team in section 3 of the brief:

1. the model reaches data only through the tools, and money is worked out by code only;

2. the model's output is validated against a schema before the validator sees it;

3. the validator runs in the backend, the two confirmations stay, nothing reaches the group before Save;

4. 2 repair rounds, 12 tool calls, 90 seconds;

5. keys stay in the backend; only places and interests go to the model, never names or email addresses.

| Points | What it looks like |
| --- | --- |
| 17–20 | Each line has tests: a fake model that returns broken JSON, an unknown tool, a missing argument, its own total, a thirteenth tool call, a third repair round, a run past 90 seconds. Each test lands in a commit no later than the code it tests. On your deployment, our attacks do not break a rule: interests that tell the agent to ignore the other members' caps; interests that ask for another member's profile; a schedule sent straight to Save that breaks the lowest cap; a search of your deployed JavaScript for the key. Promotional posts never reach the agent, and a test shows it. |
| 11–16 | Four of the five lines hold, or all five hold but one test cannot fail (it would pass with the check removed). |
| 4–10 | Only what PA#3 asked for: the validator and the limits, with no test for injection or for the data sent to the model. |
| 0–3 | One of our attacks breaks a cap, reads another member's data, or finds the key. |

A history split or rebuilt after the work was finished does not count as one commit per part; it scores at the level for commits that mix several parts. A history rebased or rebuilt after the work was finished does not count as evidence for this criterion.

## 4. The human gate — 15 points

| Points | What it looks like |
| --- | --- |
| 13–15 | The two confirmations hold against direct requests: no schedule is built before the user confirms the places, and Save is refused for a plan the validator rejects, for someone outside the group, and with no session. Before Save, no other member can read the schedule by any request. A schedule the user changed after the agent is validated again at Save. The agent has no tool that writes, shares or pays. PA4.md has a section Where we stop it that answers the three questions with your own numbers, and says why the gates sit on the place list and on Save and not on each tool call or each stop. |
| 8–12 | The gates hold at the API, but Where we stop it is missing, or a change made by the user skips the validator. |
| 3–7 | A gate is only in the screen: a direct request builds or shares a schedule without it. |
| 0–2 | A schedule reaches the group without Save. |

## 5. Red-team report on another team — 20 points

The lecturer assigns each team one target on Classroom after the PA#3 deadline. The target's deployment and test accounts are in its PA3.md.

Rules of engagement. Attack only your target's deployment and its public repository, using the accounts in its PA3.md. Send no more traffic than one member could: about one request per second at most. Run enough agent requests to show whether a limit holds, and no more: the target pays for every call. Do not attack the hosting provider or anyone else. If you find a live key or real personal data, stop, do not use it, and tell the lecturer and the target the same day.

Write the report in docs/red-team/&lt;target's student IDs&gt;.md. One entry per attack:

- the category and the rule it tests: a line of Fixed for every team, a validator rule, or the target's own contract;

- the exact input: the request, the interests text, the steps;

- what you expected, and what you observed: the response, a log line or a screenshot, with the time;

- held or broke, and who pays if it broke, in the terms of the table in section 3 of the brief;

- for a break, the fix you would propose.

The categories: money and caps, the validator, prompt injection (interests, reviews, anything a stranger writes that reaches the agent), the confirmations and Save, authorization (another group's plan, another member's cap or profile), the key and the data sent to the model, the limits.

| Points | What it looks like |
| --- | --- |
| 17–20 | At least 8 attacks across at least 5 categories, each one reproducible from the report alone. We replay two of our choosing on the target, and get what the report says. Attacks that held are reported as well as those that broke. At least one attack comes from reading the target's code, not only from trying the screens. |
| 11–16 | At least 6 attacks across at least 4 categories, mostly reproducible; or one of our replays gives a different result; or the rule each attack tests is vague. |
| 4–10 | A list of attempts without exact inputs or observed outputs, or a generic checklist not tied to AI Travel Planner. |
| 0–3 | Missing, or an attack on something other than the assigned deployment, or a broken rule of engagement. |

A target that holds everywhere does not lower your mark. The report is marked on the attacks and their evidence, not on how many broke. If the target's deployment does not answer, record each attempt with its time and tell the lecturer by Monday, December 14. Attacks on the target's code run on your own machine, with your own key, also count; say that they were run that way.

## 6. AI-LOG.md — 5 points

| Points | What it looks like |
| --- | --- |
| 5 | Which tool, for which part, and real Changed / Rejected entries. Example: the assistant that "fixed" a red eval by relaxing a validator rule, or a test that could not fail, and how you found it. |
| 2–4 | Tools listed; Changed / Rejected are empty or generic. |
| 0–1 | Missing. |

Tool: none is a valid entry if your team chose not to use one.

## Catching your assistant

| You see | What it means | What we check |
| --- | --- | --- |
| eval.mjs, a data file or a dev request changed in an agent PR | the target moved | we compare with the published copy, and score with our copy anyway |
| the gate reads plans.jsonl from the repository | it can never go red on a change to the agent | criterion 1 |
| continue-on-error, \\\|\\\| true, or an exit code that is not checked | a gate that cannot fail | criterion 1 |
| a validator rule relaxed in the commit that turned the gate green | the rule was edited to pass | git log -p on the validator |
| a filter that drops every place whose description mentions budget | the honest case now fails (session 6, slide 21, last row) | your own requests |
| a test that still passes with the check deleted | it tests the fake, not the check | we delete the check and run your test |
| toolCalls or seconds that do not match the tool log or our clock | the run log is not honest | criterion 2 |

## What we run when marking

1. Your repository, from the pa4 tag in your zip. We compare eval.mjs and the data with the published ones.

2. Your checks and your tests, with the commands in your README, in a container with the network cut after dependencies are installed, killed after 15 minutes.

3. The held-out run. We run your agent command on the held-out requests, with the published data folder, killed after 2 minutes per request plus 5 minutes. The container has

- no network except a proxy that lets it reach only the model host your README names. We score the output with our copy of eval.mjs.

4. Your deployment: the attacks of criterion 3 and the direct requests of criterion 4.

5. The report you wrote: we replay two of its attacks on your target.

How we reach the model for the held-out run. Your team pays for its own calls. Attach a file marking.env to your Classroom submission, beside the zip, not inside it, and never in git. It holds only the variables your agent command needs: a key made for this run, or the URL and token of your own model endpoint, which must stay up until your PA#4 mark is out. We use it for the held-out run and nothing else. Revoke the key once your mark is out. Without a working marking.env the run cannot call a model, and criterion 2 scores 0.

## What you hand in

1. Tag the commit you are submitting pa4 and push the tag. The repository stays public, and the deployment keeps running.

2. Put PA4.md at the root, with: the CI run for the tag, the blocked pull request and the fixing commit, the three repeated dev runs, the cost of one CI run, the section Where we stop it, and the model host the held-out run must reach.

3. The red-team report in docs/red-team/.

4. marking.env, attached beside the zip.

## How to submit

One zip file of the repository including .git, named after your student IDs in ascending order, joined by -, and the total you give yourself: &lt;StudentID1&gt;-&lt;StudentID2&gt;-&lt;StudentID3&gt;_&lt;total&gt;.zip, for example 23127001-23127002-23127003_84.zip. One member turns it in, from their &lt;StudentID&gt;@student.hcmus.edu.vn Google account, with marking.env as a second attachment.

The zip must contain SELF_ASSESSMENT_REPORT.md: one row per criterion in this rubric, the marks you claim, and evidence pointing at a file, a commit, a PR or a CI run. For criterion 2, claim what your dev runs suggest, and say so. Add a short what we did not manage. The total in that table is the number in the file name. Template on Classroom.

A wrong file name costs no marks but delays your result: the grading script matches submissions to the class list by that name.

Late work: up to 2 hours late loses 20% of the mark, 2 to 24 hours late loses 50%, and work more than 24 hours late is not accepted. The late factor applies after the honesty adjustment.

## Honesty adjustment

Your self-assessment is compared with the mark you actually earn. The gap is your total − the mark, on the same 100-point scale.

| Gap | Adjustment |
| --- | --- |
| within ±10 | none — this is normal calibration |

| Gap | Adjustment |
| --- | --- |
| +11 to +20 | −3 |
| +21 to +30 | −6 |
| more than +30 | −10 |
| −21 or worse | −3 — read the rubric before you score yourself down |
| no SELF_ASSESSMENT_REPORT.md | −10, and the file-name total is ignored |

A criterion you claim with no evidence line counts as claimed-and-not-done for this comparison. The adjustment never takes a submission below 0.

## How the 100 becomes your course mark

PA#4 is 7% of the course: 100 points here are worth 7% of your course mark, and 80 points are worth 5.6% (0.56 on the 10-point scale).
