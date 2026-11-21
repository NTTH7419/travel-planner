# PA#6 — Final demo and individual oral · rubric

Class 23KTPM1

**CSC13114 · project milestone · teams of up to 3 · one mark for each member · 15%** of the course · 100 points

When: in the exam period, December 21, 2026 – January 2, 2027; the date, the room, the order of teams and the slot times are posted on Classroom by Saturday, December 26, 2026. In your slot, the team runs the final AI Travel Planner build through its main flow, then the examiners question each member on the team's own code and decisions.

The examiners are this class's teaching assistant and lab instructors, one table each, working in parallel. The slot list says which table your team goes to.

**Each member receives one mark out of 100, in two parts:**

- The final build — 40 points, the same for every member of the team. The examiners check the build you demo against a fixed list (The final build, below): the eleven features of AI Travel Planner (The features you must implement), the build you handed in with real data, failure cases, roles, and what you built beyond the brief.

- Your explanation — 60 points, for each member. There is no fixed number of questions or points per question; the examiners decide what to ask, and of whom. Members of the same team can get different marks.

The build is the one you handed in with PA#5; there is nothing new to build for this milestone. PA#3, PA#4 and PA#5 scored its parts one at a time. Here we score the whole product working together, and the questions find out what each of you can explain about it: your code, your commits, your decisions, your eval and guardrails, your incident, including the parts your assistant wrote and the reasons you kept them. Nothing here asks you to write code, on paper or anywhere else, or to recall it from memory.

## Language of the oral

The oral is conducted in Vietnamese. Technical terms may stay in English, and your repository and documents stay in English as handed in.

## Before your slot

Commit OWNERS.md to your repository and post the link to that commit on this assignment by Sunday, December 27, 2026, 22:00. It has two tables, in English:

| Part of AI Travel Planner | Who built it | Main commits or pull requests |
| --- | --- | --- |
| e.g. the validator and compute_cost | e.g. 23127002, with 23127003 on caps | links |

| Beyond the brief | Where to see it | The test that checks it |
| --- | --- | --- |
| e.g. an export of the saved schedule to a calendar file | the schedule page | link |

The first table is not scored; it helps us choose questions about the parts you built. Without it, we choose from git log alone. The second is what we check for B5; leave it empty if there is nothing.

Keep your deployment running the commit tagged pa5 until your slot, as the PA#5 marking window already asks. Your PA#5 walkthrough recording is the fallback if it does not answer (see When the build cannot run).

## What to bring

- One laptop per team, charged, with its charger and an adapter for an HDMI projector, with your repository cloned, the tag pa5 checked out, and your tests, the eval and the agent's command line (brief section 6) ready to run. A second member's laptop, signed in the same way, is the first fallback.

- The deployment already open before you walk up: one browser window per account, signed in — two members of one group with different caps, a member outside that group, a business account and an admin — and your observability tools one click away.

- A phone hotspot. Do not count on the room's network.

- Your student ID card.

You may start from seed data: the accounts, the shared place data, posts and other groups. The group of the demo, its schedule, and everything that happens to them are created in front of us.

## How the slot runs

| Part | Time | Who |
| --- | --- | --- |
| Check the build | 1 min | We open the version endpoint or page footer of your deployment, and run git log -1 --format=%H on the laptop |
| Main flow and the other features | 8 min | The team, every role; we ask for the features the flow did not show, and for the reloads |
| Build checks | 2 min | We name two rules to try as failure cases, and one role or ownership check |
| Questions | about 4 min per member | The examiners, one member at a time |

A team of three takes about 23 minutes; a team of two, about 19. Be at the room from the start of your session: when a slot ends early, the next one starts. The examiners may ask questions during the demo too. Your teammates stay in the room and stay quiet while a member answers.

## The features you must implement

These are the features of AI Travel Planner that your build must have. They come from sections 3 and 4 of the brief and from the criteria of PA#3, PA#4 and PA#5 named after each one; the last column names the rules that apply to it. In the slot, the main flow below shows most of them; we then ask for any feature the flow did not show.

| # | Feature | Who | What must work | Rules |
| --- | --- | --- | --- | --- |
| F1 | Places: search and detail (brief 4.1; PA#3 1; PA#5 2) | Member | Search over the shared data by type, district, open at a time we choose (by weekday, with every opening period) and price level; a detail page with description, photos, map and a menu with prices. OpenStreetMap, Wikimedia and Open-Meteo are credited. | P4 |
| F2 | Accounts, profile and your places (brief 4.2–4.3; PA#5 2) | Member | Sign-in and a profile of interests; a want- to-go list, check-in, a map of the places visited; 1–5 star reviews only after a check-in. | P2 |
| F3 | Groups and caps (brief 4.4; PA#3 1) | Member | Invite by link, which works for a second account; a group total; a spending cap that each member sets for themselves only. | P1 |
| F4 | The agent, through the seven tools (brief 3, 4.5–4.6; PA#3 2) | Member | A real model reaches data only through the seven tools, with weather and public holidays as input; money comes only from compute_cost; the tools take the user and the group from the session. At most 2 repair rounds, 12 tool calls and 90 seconds, then the best draft with a red warning. | R1, R2, R4, R5 |
| F5 | The two confirmations and Save (brief 3; PA#3 3; PA#4 4) | Member, then the group | The agent proposes 8–12 places; the user removes or pins places and confirms. The user reviews the schedule and the spending per person, may edit it, and presses Save. Before Save the other members see nothing; Save twice shares one schedule. | R3, H1, H2 |
| F6 | The validator in the backend (brief 3; PA#3 4) | Backend | The five checks run in the backend at Save, also on a schedule the user changed after the agent; a refused schedule gets a response that names the rule. | V1–V5, H3 |

| # | Feature | Who | What must work | Rules |
| --- | --- | --- | --- | --- |
| F7 | Manual mode (brief 3, 4.6; PA#5 2, 4) | Member | Choose places yourself, drag and drop, choose items, with the same data and the same validator as the agent. | V1–V5 |
| F8 | Editing a schedule together (brief 4.7; PA#5 2) | Two members | Two accounts edit the same schedule at once; neither loses the other's change without a warning. | H3 |
| F9 | Problem reports, run logs and traces (brief 4.8; PA#3 2; PA#5 2–3) | Member, the team | A stop reported as closed, wrongly priced, too far or not a good fit shows in the report list, linked to the log of that run. For a plan made in front of us: every log line by one id; its trace with each tool call, repair round and the final validator run; the dashboard; the SLO and its alert. | R5 |
| F10 | Posts and travel companions (brief 4.9–4.10; PA#5 2) | Member, business account, admin | Moment posts; promotional posts from a business account, shown only after an admin approves them; likes and comments. Companions: only people who opted in, an AI match score, block and report. | P3 |
| F11 | The agent command and the eval gate (brief 6; PA#3 5; PA#4 1) | The team | One command takes a data folder and a requests file and writes plans.jsonl and tool-log.jsonl. A CI job runs the agent on the dev requests and your own, then eval.mjs, and is a required check on main. | — |

The rules, by label. For B3 we name two of the rules that can be tried on the running build.

| Label | Rule | From | Tried on the running build |
| --- | --- | --- | --- |
| V1– V5 | The validator: V1 every place and item exists; V2 every stop is within opening hours; V3 the motorbike time fits each gap; V4 spending within each amount, the lowest cap in the group and the group total; V5 no outdoor stop above 60% chance of rain within the 7-day forecast | PA#3 criterion 4 | a schedule sent straight to Save; V5 only when some hour in the next 7 days is above 60% |

| Label | Rule | From | Tried on the running build |
| --- | --- | --- | --- |
| R1– R5 | The fixed rules of brief section 3: R1 data only through the tools, money only by code; R2 the model's output checked against a schema before the validator; R3 the validator in the backend, both confirmations, nothing reaches the group before Save; R4 2 repair rounds, 12 tool calls, 90 seconds; R5 keys in the backend, only places and interests sent to a model | PA#4 criterion 3 | R1 with interests that tell the agent to ignore the other members' caps; R3 with a second member's account; R5 by searching the deployed JavaScript and reading a prompt in the run log; R2 and R4 only by their tests, so they are not named for B3 |
| H1– H3 | The human gate: H1 no schedule is built before the user confirms the places; H2 Save is refused for a plan the validator rejects, for someone outside the group, and with no session; H3 a schedule the user changed is validated again at Save | PA#4 criterion 4 | direct requests |
| P1 | Changing another member's cap is refused by the API | PA#3 criterion 1 | a direct request |
| P2 | A review without a check-in is refused | PA#5 criterion 2 | on the running build |
| P3 | A promotional post appears only after an admin approves it, and never reaches the agent | PA#4 criterion 3; PA#5 criterion 2 | on the running build |
| P4 | A place with no hours, no ticket price or no menu is never offered to the agent | PA#3 criterion 1 | a search, then the run log |

A part your product owners cut, in a decision posted under AI Travel Planner — questions for the product owners and listed in your PA5.md, is not checked: a feature cut whole scores its 2 points, and a feature cut in part is checked on what remains. A part your team left out without such a decision counts as missing.

## The final build — 40 points, for the team

The demo is scored against the list at the end of this section. Every member of the team gets the same build points. The demo is also where the questions start.

The main flow, on your deployment. One group plan from the request to a shared schedule: as member 1, search the places and open a detail page → set up a group (an invite by link that member 2 opens, a group total, each member's own cap, different from each other) → start the agent for the group on a date, with a starting point and hours → at the first confirmation, remove one place and pin one, then confirm → review the schedule and the spending per person, change one stop yourself → before Save, show that member 2 sees nothing → press Save; member 2 now sees the schedule → member 1 and member 2 edit it at the same time → report a problem on one stop → open the logs and the trace of that agent run. Then we ask for the features the flow did not show (usually manual mode, your places and reviews, posts and companions, the eval gate). We may give you one more request to run, for example with interests that try to change the other members' caps. A scope decision your product owners posted replaces the step it changes; name it.

Each account works in its own signed-in window, on the real deployment: when we ask you to reload, the data is still there, and the Network tab shows the requests to your API. Layout, content, colours and architecture are your team's choice: we look at whether each feature works, not at how it looks.

Failure cases. We name two rules from the table above, for example: a schedule sent straight to Save with a closed place or a member over the lowest cap (V2, V4); a direct request for the draft by member 2 before Save (R3); interests that tell the agent to ignore the caps (R1); member 2 changing member 1's cap (P1); a review without a check-in (P2). The server should refuse with a message that names what went wrong, and after a reload the data should be unchanged — refused by the server, not only by a hidden button.

The build you handed in. Your deployment runs the commit tagged pa5, and its version endpoint or page footer shows that hash. Tell us before you start about any small change (a configuration value, a seed). A bug fixed after the PA#5 deadline is not part of the demo: if the deployment runs a later commit, deploy pa5 again before your slot, or run pa5 on the laptop; you may tell us about the fix when you are questioned. If your PA#5 was not accepted (more than 24 hours late), you demo the latest commit, and we note that it is not a build you handed in.

| # | We check | Points |
| --- | --- | --- |
| B1 | The eleven features F1–F11 (table above), each shown on the running build, in the account's own signed-in window. 2 for a feature that works; 1 for one that works only in part, only after a restart or a second try, or only in the recording; 0 for one that is missing or faked (a state set in the front end, a stub instead of the real model, a row edited by hand in the database, a schedule typed in) | 22 |
| B2 | The build you handed in, with real data: the version endpoint or footer shows the commit of pa5; when we ask, a reload at two points keeps the data, and the Network tab shows the requests to your API | 4 |
| B3 | Two rules from the last column of the table, which we name and you try as a failure case: refused by the server the way the rule says, with a response that names it, and the data unchanged after a reload. 3 each; 1 when only the screen stops it, or when only a test shows it | 6 |
| B4 | Roles and ownership: we try one screen or endpoint of another member, another group or another role (another group's schedule, another member's cap or profile, the admin's approval of a promotional post), by its URL or with curl; the API refuses it | 4 |
| B5 | Beyond the brief: what your team built that the brief does not ask for, listed in OWNERS.md. 4 for one that works on the running build and has a test that checks it; 2 if it works but nothing checks it; 0 if there is none | 4 |

| # | We check | Points |
| --- | --- | --- |
|  | Total | 40 |

A product owners' scope decision is not "beyond the brief": it replaces the step it changes in B1. The build points are the same for every member of the team, including a member whose part is not the one that failed.

## What you may be asked about

Anything in your team's repository and your team's decisions — not lecture theory; that is what the exam is for. The examiners choose the questions, how many, and which part of the system each member is asked about. They prepare from your repository at pa5, its git log, AI-LOG.md, the post-mortem, docs/manual-vs-agent.md and OWNERS.md, and they may ask follow-ups on anything you say or anything the demo showed. Each member gets different questions.

| Area | What the questions are about |
| --- | --- |
| A | Read your code |
| B | Why your team decided it |
| C | How you know it works |
| D | The LLM feature on a given input |

The examples under each area show the kind of question; they are not a fixed list, and a member is not necessarily asked about every area.

## A. Read your code

We point at a commit, a diff or a few lines you built, or a line the demo just ran, and ask what they do.

- What does this line do, and what breaks if we delete it?

- This commit changed how the lowest cap in a group is found. What did it do before?

- Walk one agent run from the request to Save: which file handles each step?

A strong answer says what the code does, not what it was meant to do, and what would break without it.

## B. Why your team decided it

A decision your repository shows, and the alternative you did not take.

- How much does the model decide in your agent, and why not more or less? (Brief section 5: the fixed-order fallback.)

- How do two people editing the same schedule avoid overwriting each other? What else did you consider?

- Your endpoint contract returns this status for this error. Why this one, and what does a client do with it?

- Which product owners' decision did you rely on here, and what would you have built without it?

A strong answer names the alternative you actually considered, gives a reason with a fact from your own system (a number, a limit, an incident), and says what the choice costs or what would make you change it. "It is popular" or "it is faster", with nothing measured, is weaker. "The assistant chose it" is weaker still.

## C. How you know it works

On a part you built, on a step of the demo, or on the incident in your post-mortem.

- Which test, check, eval case, CI run or log line shows that this works? Show it.

- What did your assistant get wrong in this part, and what caught it? (Your AI-LOG.md and commits are the starting point.)

- In your incident, which signal came first, and which log line or trace led you to the cause?

A strong answer points at the exact check and shows it running or its CI run, says what mistake it would catch, and retraces the incident from detection to cause with the actual logs or traces. "We tried it and it worked" or "CI is green", without saying what CI checks for this part, is a weak answer.

## D. The LLM feature on a given input

The examiners may give you a request file: dates, hours, a starting point and a group with caps, chosen so that something in it should stop the plan. You may read your code first. Then:

1. Say what your system will do with it: which tools are called, what the model decides and what code decides, which validator rule fires, how many repair rounds, what the user confirms at each of the two confirmations, and what reaches the group before Save.

2. Run it through your agent's command line.

3. Explain any difference between what you said and what happened.

Follow-ups: Why are the confirmations at the shortlist and at Save, and not after every tool call? Who pays if this plan is wrong on the day, and how much?

A strong answer matches the run, or explains the difference from the code; says why each confirmation sits where it does and not elsewhere; and says who pays when this plan is wrong. "The user checks everything" is not a reason for where a confirmation sits.

If the examiners give you an input, the run uses your model key, once.

## Your explanation — 60 points, for each member

The examiners give each member the points in the band that best describes that member's whole turn. How they get there — how many questions, which areas, how much a follow-up weighs — is theirs to decide.

| Points | What it looks like |
| --- | --- |
| 51–60 | Correct and specific across what you are asked. You find the place on screen without help and point at the file, line, commit, log or trace you are talking about. You handle follow-ups, including on the LLM feature, the guardrails and the human gate. |
| 39–50 | Mostly correct, but you need hints to find the place, stay general, or answer the follow-ups only in part. Or you explain correctly why a step of the demo failed. |
| 24–38 | Partly correct: you read code aloud without explaining it, or describe what it should do and get what it actually does wrong. |
| 9–23 | Mostly wrong, or "the assistant wrote it" with no explanation. |
| 0–8 | You cannot explain the parts you built, or you are absent without a documented reason. |

A step of the demo that failed is counted in the build points, not here; here we score the explanation, including your explanation of why it failed.

## How you answer

- You may open any file, search, run git log, git blame and git diff, run the tests, the eval and the agent, and open your deployment and dashboards.

- The assistant stays closed during your turn: what we mark is your own explanation of the system, which is the one thing the syllabus keeps supervised. Everything else on the laptop stays open.

- Ask us to repeat or rephrase a question at any time.

- "I don't know, but this is where I would look", followed by looking and finding it, is a real answer and earns marks. A confident guess does not.

- Nobody asks you to write code, from memory or on paper. If a question asks what you would change, say it and point at the line.

- Teammates do not answer for you. An answer from a teammate counts for nothing, and you get a different question instead.

## What we write down

For every team the examiner records the build checks and the reason for every build point lost; for every member, what was asked (the file, line, commit or log entry), the explanation points, and the reason for them. That sheet is the record of your oral. Your result email gives your mark and those reasons.

Questions about your mark: reply to the result email within 7 days. We answer from the sheet.

## Absence, lateness, and when the build cannot run

- A team that is not ready when its slot is called moves to the end of that session's list, once.

- A member not present for the team's slot scores 0, unless they send a documented reason (a medical certificate, or a clash on the official exam timetable) before the slot or within 2

- working days after it. They then get one new slot, keep the team's build points, and are questioned in that slot.

When the build cannot run:

1. If the laptop fails, switch to the second laptop, signed in the same way.

2. If the deployment does not answer within 3 minutes (a cold start counts), the questions go ahead on time (we read the code on the laptop), and the team gets one retry at the end of the same session, on the deployment or on pa5 running on the laptop.

3. If the retry fails too, we play your PA#5 walkthrough recording, and for a failure case you show us the line in the code where the rule is enforced and its test. A feature that the recording shows but the build could not run earns 1 of its 2 points; a rule shown this way earns 1 of its 3; a check the recording cannot show (B2, B4) earns none.

## What the oral does not change

The syllabus says that any part of the project that a student cannot explain earns no marks, even if it works. In this course that rule works through this mark: what you cannot explain counts against your explanation points. Your team's PA#2–PA#5 marks and the build points do not change because of the questions.

The product owners are examined the same way, on the same scale, as every other team.

## Nothing to self-assess

There is no zip, no total in a file name and no SELF_ASSESSMENT_REPORT.md for PA#6, so there is no honesty adjustment: nothing in it is self-scored. The only thing you post on this assignment is the link to OWNERS.md. The product owners' bonus (brief, top) is added separately and is not part of this rubric.

## How the 100 becomes your course mark

Each member's mark is build points + explanation points, out of 100. PA#6 is 15% of the course: mark / 100 × 15. A member whose team scores 34 for the build and who scores 48 for the explanation has 82, and earns 12.3 of the 15 percentage points (1.23 on the 10-point scale). Members of one team share the build points and can receive different marks.

## Notes

- Same team as PA#5.

- Prepare by reading your own repository: your commits, the AI-LOG.md entries for your part, the post-mortem, and the code of the main flow, your teammates' parts too. Rehearse the demo once from a cold start, on the deployment and the laptop you will bring.

- Commit under your own name during the semester. Questions about your commits start from git log --author, and commits under a teammate's name are their questions, not yours.

- A question on a line your assistant wrote is a normal question: the code in your repository is your team's code.
