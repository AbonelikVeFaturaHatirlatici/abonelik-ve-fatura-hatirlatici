# Usability Test Record: Figma Prototype (Sprint 2)

**Owner:** Zeynep Sude Develi (`zsudedeveli`), Product Owner · **Support:** Nadir Efe Taşkıran (`nadirtaskiran`), QA
**Date of the sessions:** 18 November 2026 (answers recorded between 15:06 and 23:04)
**Prototype link:** [Figma clickable prototype](https://www.figma.com/proto/zLadyqszvs7lVNyQWzMO9A/Untitled?node-id=1-215&p=f&t=BNO0PVdAVM6gcWR1-0&scaling=min-zoom&content-scaling=fixed&page-id=1%3A3&starting-point-node-id=1%3A215)
**Protocol:** [07-nonfunctional-requirements.md](../product/07-nonfunctional-requirements.md) section 6.2 · **Requirements tested:** NFR-U1, NFR-U3, NFR-U4

## 1. Setup

| Item | Value |
|---|---|
| Participants | 5 people from the target group (students or young professionals with subscriptions); none is a team member. No names are recorded. |
| Device | The participants' own phones, opened through the prototype link. |
| Method | Remote test without a moderator. Each participant read the tasks in an online form, used the prototype and answered after each task. Times were measured by the participants with the stopwatch of their phone and typed in the form (self-reported). The prototype does not accept typed text; participants tapped through the fields. |
| Moderator / observer | None during the sessions. The form and the invitation were prepared by the Product Owner. |
| Duration per session | About 10 minutes |

Tasks: **T1** register and log in · **T2** add "Netflix, 229,99 TL, monthly, start date 31.01.2026" · **T3** find the next renewal date of Netflix (correct answer: 28.02.2026) · **T4** remove Netflix from tracking and say what happens to the real subscription (correct answer: nothing, the real subscription is not cancelled) · **T5** find the reminders.

## 2. Results

| Participant | Group (age range, number of subscriptions) | T1 ok | T2 time (s, self-reported) | T3 ok | T4 correct answer | T5 ok | Errors | Help needed (T2) | Comment |
|---|---|---|---|---|---|---|---|---|---|
| P1 | 18–22, 5 or more | yes, easily | 2 | **no** (answered "12.12.26") | yes | yes | not collected | no | No problem reported. |
| P2 | 18–22, 2 | yes, easily | 30 | yes | yes | yes | not collected | no | No problem reported; "well done". |
| P3 | 18–22, 5 or more | yes, easily | 10 | yes | yes | yes | not collected | no | No comment. |
| P4 | 18–22, 2 | yes, easily | 5 | yes | yes | yes | not collected | no | No comment. |
| P5 | 18–22, 5 or more | yes, but with difficulty | 1 | yes | yes | yes | not collected | **yes** | "Some things could not be done" (probably the fields that do not accept typing; to be confirmed with the participant). |

Summary: T1 5 of 5 completed (4 easily, 1 with difficulty) · T2 4 of 5 without help · T3 4 of 5 correct · T4 5 of 5 correct · T5 5 of 5 found the reminders.

## 3. Evaluation against the targets

| Requirement | Target | Result | Met? |
|---|---|---|---|
| NFR-U1 Add a subscription in ≤ 60 s without help | ≥ 4 of 5 participants | 4 of 5 (P1 to P4; P5 needed help) | Yes, with low confidence: the self-reported times of 1 to 10 s (P1, P3, P4, P5) are too short to be real and only P2 (30 s) is plausible. The result must be confirmed with a stopwatch, with a moderator, on the working application in Sprint 3. |
| NFR-U4 Understands that the real subscription is not cancelled | ≥ 4 of 5 participants | 5 of 5 | Yes |
| NFR-U3 Touch targets ≥ 48 dp, contrast ≥ 4.5 : 1 (design review) | All screens | Touch targets: all met except one link (see problem 5). Contrast: calculated for every color pair of the screens; 4 pairs below 4.5 : 1 (see problem 4). | Partly. Corrections are defined in section 7.4 of the prototype specification and are applied in the application in Sprint 3. |

Limits of this test: five participants, all aged 18 to 22; three of them have five or more subscriptions; no moderator; self-reported times. It shows that the structure of the five screens and the removal dialog are understood, not a precise measurement of speed.

## 4. Problems found and actions

| # | Problem | Severity (high / medium / low) | Action (issue link) |
|---|---|---|---|
| 1 | P1 gave a wrong next renewal date (T3): 1 of 5. | medium | Make the next renewal date more prominent on the card (larger or bold) and ask P1 what was unclear. Re-test in Sprint 3. (issue: *to be opened, label `usability`*) |
| 2 | P5 completed T1 with difficulty, needed help at T2 and said that some things could not be done. | medium | Ask P5 which step was hard. If it was the missing typing, record it as a limit of the prototype; if it was the registration, check the screen S1 again. (issue: *to be opened, label `usability`*) |
| 3 | The self-reported times are not reliable (1 to 10 s). | medium | Repeat the time measurement with a moderator and a stopwatch on the application in Sprint 3 (QA). (issue: *to be opened, label `usability`*) |
| 4 | Contrast below 4.5 : 1 in four color pairs: status text "Aktif" and "Hatırlatıldı" (`color/success` on white 4.37, on its chip 4.07), selected tab text (`color/primary` on `#DBE4FF` 4.47), text of removed cards (`color/muted` 3.32). | low | Use the corrected values in section 7.4 of the prototype specification in the application. (issue: *to be opened, label `usability`*) |
| 5 | The link "Giriş Yap" in the frame `S1-Kayit-EmailTaken` has a touch area of 44 dp (target 48 dp). | low | Enlarge the touch area to 48 dp in the application. |

## 5. Conclusion

The five-screen structure works: every participant could sign in, add a subscription, find the reminders and all five understood that removing a subscription from tracking does not cancel the real subscription (NFR-U4 met). One of five misread the renewal date and one needed help, so the date presentation is improved and the speed target (NFR-U1) is confirmed with a moderated test on the working application in Sprint 3. Contrast corrections are listed in the prototype specification.
