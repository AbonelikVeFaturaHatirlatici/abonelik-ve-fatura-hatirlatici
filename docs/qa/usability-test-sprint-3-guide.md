# Usability Test Guide: Sprint 3 (Working Application, Moderated)

**Owner:** Zeynep Sude Develi (`zsudedeveli`), Product Owner · **Support:** Nadir Efe Taşkıran (`nadirtaskiran`), QA
**Requirements tested:** NFR-U1 (add a subscription in ≤ 60 s without help; target ≥ 4 of 5), NFR-U4 (understands that removal is not a real cancellation; target ≥ 4 of 5), NFR-U3 (touch targets ≥ 48 dp, contrast ≥ 4.5 : 1)
**Why this test:** the Sprint 2 test was unmoderated with self-reported times, which were not reliable ([usability-test-sprint-2.md](usability-test-sprint-2.md)). This time the moderator measures the time with a stopwatch on the working application.

## 1. Preparation

- Participants: 5 people from the target group (students or young professionals with subscriptions). Not team members. Include, if possible, P1 and P5 from Sprint 2 to check problems 1 and 2.
- Device: a phone with the application installed (Expo Go or a build). Use the same phone for all participants. Sign out before each session.
- Moderator: Zeynep. Observer and stopwatch: Nadir or another team member.
- Duration: about 10 minutes per participant.
- Do not record names. Use P1 to P5.

## 2. Words to read to the participant

"Thank you for helping. We test the application, not you. There are no wrong answers. Please say aloud what you think. I will not help you unless you are stuck for a long time. I will measure the time of one task."

## 3. Tasks

| Task | What the participant is asked to do | Correct result | Measure |
|---|---|---|---|
| T1 | Create an account and log in. | Account created, list screen shown. | Done easily / with difficulty / not done |
| T2 | Add a subscription: Netflix, 229,99 TL, monthly, start date 31.01.2027. | Netflix appears in the list. | **Time in seconds, from "start" to the saved subscription (stopwatch).** Help needed: yes / no |
| T3 | Tell me the next renewal date of Netflix. | 28.02.2027 | Correct / wrong |
| T4 | Remove Netflix from tracking. Then tell me: what happens to your real Netflix subscription? | Answer: nothing, it is not cancelled. | Correct / wrong |
| T5 | Find the reminders. | Reminders screen found. | Found / not found |

Moderator rule for T2: start the stopwatch when you say "start" after reading the task; stop it when the saved subscription is visible. If the participant asks for help, mark "help needed: yes" and stop timing that task as a failure.

## 4. Observation form (one row per participant)

| Participant | Age range, number of subscriptions | T1 | T2 time (s) | T2 help needed | T3 correct | T4 correct | T5 found | Errors (count) | Comments (exact words) |
|---|---|---|---|---|---|---|---|---|---|
| P1 | | | | | | | | | |
| P2 | | | | | | | | | |
| P3 | | | | | | | | | |
| P4 | | | | | | | | | |
| P5 | | | | | | | | | |

## 5. Design review checks (NFR-U3), done by the moderator after the sessions

| Check | Result |
|---|---|
| All touch targets are at least 48 dp (including the link "Giriş Yap" on the email-taken error) | (yes / no, list exceptions) |
| Status texts "Aktif" and "Hatırlatıldı" use the corrected colors from section 7.4 of the prototype specification | (yes / no) |
| Selected tab text and removed-card text use the corrected colors | (yes / no) |
| The next renewal date is prominent on the card (Sprint 2 problem 1) | (yes / no) |

## 6. Evaluation (fill in after the sessions)

| Requirement | Target | Result | Met? |
|---|---|---|---|
| NFR-U1 | T2 ≤ 60 s without help, ≥ 4 of 5 | (n of 5) | (yes / no) |
| NFR-U4 | T4 correct, ≥ 4 of 5 | (n of 5) | (yes / no) |
| NFR-U3 | Section 5 all yes | (summary) | (yes / no) |

Then copy the results and a list of problems (with severity and action) into `docs/qa/usability-test-sprint-3.md`, using the structure of the Sprint 2 record.
