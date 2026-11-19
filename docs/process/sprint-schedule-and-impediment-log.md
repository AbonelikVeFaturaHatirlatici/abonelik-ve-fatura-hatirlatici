# Sprint 1 and Sprint 2: Agile Process, Schedule and Impediment Log

| Field | Value |
|---|---|
| Project | Subscription Reminder (`abonelik-ve-fatura-hatirlatici`) |
| Course | SENG 321 Software Engineering · Team 11 |
| Milestone | [Sprint-1](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-1) (15% of the course grade) · [Sprint-2](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-2) (20%) |
| Task reference | T-06, [Issue #24](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/24) (issue title: "Scrum Master: sprint takvimi ve toplantı düzeni", in English: sprint calendar and meeting routine) · Sprint 2: T-12, [Issue #62](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/62) |
| Scrum Master | Yeter Nesibe Sakar (`@ynessakar`) |
| Last updated | 19 November 2026 |

---

## 1. Sprint 1 goal, scope and dates

**Sprint goal.** Lay the project foundation: define the problem and the system boundary, agree the API contract before implementation, set up the protected Git-Flow repository, assign roles, and prepare a prioritized backlog with acceptance criteria.

Decision `D-22` records that invoices and bills are out of scope for the first release, so the product focuses on subscription reminders only.

| Sprint | Start | Due | Status |
|---|---|---|---|
| Sprint 1 | Thu, 22 Oct 2026 | Thu, 5 Nov 2026 | Done: submitted on 2 Nov 2026 ([release `sprint1`](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/releases/tag/sprint1)) |

### 1.1 Deliverables

| # | Deliverable | Location | Accountable |
|---|---|---|---|
| 1 | Project Proposal and open-source license (MIT) | `docs/product/01-project-proposal.md`, `LICENSE` | Product Owner |
| 2 | System Vision and Boundary | `docs/product/02-system-vision-and-boundary.md` | Product Owner |
| 3 | OpenAPI draft | `api/openapi.yaml` | Lead Architect |
| 4 | Team Roles and RACI Matrix | `docs/process/04-team-roles-and-raci.md` | Scrum Master |
| 5 | GitHub repository and Git-Flow workflow (protected `main` and `develop`, required checks `backend-test` and `openapi-lint`) | `docs/process/05-git-flow-and-repository-workflow.md` | Lead Architect |
| 6 | Initial Product Backlog (US-01 to US-10, issues #9 to #18) | `docs/product/06-product-backlog.md` | Product Owner |
| – | Sprint 1 setup tasks T-01 to T-06 (issues #19 to #24); T-05 stays open until Sprint 2 (section 1.2) | GitHub milestone `Sprint-1` | see backlog section 5 |

### 1.2 Note on T-05

[Issue #23](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/23) (T-05, Android application skeleton) belongs to the `Sprint-1` milestone together with T-01 to T-06, matching `docs/SPRINT-1-SUBMISSION.md`. No application code is part of Sprint 1. What Sprint 1 delivers for T-05 is the sketch of the three screens and their mapping to the API operations ([PR #34](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/34)). The React Native with Expo skeleton (`mobile/`) is planned for Sprint 2, and the issue stays open until then.

---

## 2. Sprint 2 goal, scope and dates

**Sprint goal.** Specify and design the first release before the MVP is built: a detailed SRS and refined backlog, measurable quality requirements, a Figma prototype with user flows tested on five users, C4 and UML architecture documentation, and the Android application skeleton.

| Sprint | Start | Due | Status |
|---|---|---|---|
| Sprint 2 | Fri, 6 Nov 2026 | Tue, 24 Nov 2026 (set by the instructor) | Active |

Sprint 2 planning was held on Saturday, 14 November 2026, later than the routine in section 4.2 (Thursday before the sprint starts). The tasks and their owners follow version 2.0 of the [product backlog](../product/06-product-backlog.md) (section 6.2).

### 2.1 Deliverables and tasks

| Task | Issue | Deliverable | Location | Accountable | Points |
|---|---|---|---|---|---:|
| T-07 | [#57](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/57) | Software Requirements Specification and refined backlog | `docs/product/03-requirements.md`, `docs/product/06-product-backlog.md` | Product Owner | 5 |
| T-08 | [#58](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/58) | Non-functional requirements and quality measures | `docs/product/07-nonfunctional-requirements.md` | Product Owner | 3 |
| T-09 | [#59](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/59) | Figma UI/UX prototype and user-flow diagrams | Figma file, `docs/product/08-user-flows-and-prototype-spec.md` | Product Owner (Implementation reviews feasibility) | 5 |
| T-10 | [#60](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/60) | C4 model (levels 1 to 3) and UML diagrams, including the deployment diagram | `docs/architecture/` | Lead Architect (deployment diagram: DevOps) | 8 |
| T-11 | [#61](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/61) | Usability test of the prototype with 5 users | `docs/qa/usability-test-sprint-2.md` | Product Owner with QA | 2 |
| T-12 | [#62](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/62) | Sprint 2 submission file, evidence and release `sprint2` | `docs/SPRINT-2-SUBMISSION.md` | Scrum Master, DevOps | 1 |
| T-13 | [#63](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/63) | Repository hygiene: `develop` merged into `main` without rewriting history; Sprint 1 tag link corrected | `main`, tags `sprint1` and `sprint2` | DevOps, Architect | 2 |
| T-05 | [#23](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/23) | Android application skeleton (React Native with Expo), five screens (D-23) | `mobile/` | Implementation (Expo project setup: DevOps) | 5 |

### 2.2 Sprint 2 calendar

The Sprint 2 review is moved from Wednesday to Monday because the deadline is Tuesday.

| Date (TRT, UTC+3) | Event | Expected result |
|---|---|---|
| Sat, 14 Nov 2026 | Sprint 2 Planning | Scope, owners and points agreed |
| Wed, 18 Nov 2026 | Issues #57 to #63 created; pull requests #54, #55, #56 opened | Work visible in GitHub |
| Thu, 19 Nov 2026 | Repository updates | Expo project setup merged into `develop` ([PR #64](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/64), IMP-06 resolved). Issues #57 to #63 linked to milestone `Sprint-2`; US-01 to US-09 moved to `Sprint-3`; US-10 left without a milestone (out of scope, D-10); `Sprint-1` milestone complete. Issue #23 retitled to five screens (D-23). Backend API pull request [#65](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/65) opened (Sprint 3 scope). |
| Thu, 19 Nov 2026, 21:00 | Stand-up | T-05 Android skeleton started on top of PR #64; reviews of #54, #55, #56 given |
| Fri, 20 Nov 2026 | Review deadline | #54, #55, #56 merged after one non-author approval each |
| Sat, 21 Nov 2026, 21:00 | Stand-up | Deployment diagram added; usability sessions under way |
| Sun, 22 Nov 2026 | Content freeze | All Sprint 2 documents in `develop`; only fixes after this date |
| Mon, 23 Nov 2026, 21:00 | Sprint 2 Review (45 min) | Deliverables checked against the course rubric; usability results recorded; T-05 skeleton shown on the emulator |
| Mon, 23 Nov 2026, 21:45 | Sprint 2 Retrospective (30 min) | Actions for Sprint 3 |
| Mon, 23 Nov 2026, after the review | Release | `develop` merged into `main` by pull request, release `sprint2` created (T-13) |
| Tue, 24 Nov 2026 | Submission | `docs/SPRINT-2-SUBMISSION.md` complete with evidence links |

---

## 3. Course milestones

| Milestone | Start | Due | Course week | Weight | Focus |
|---|---|---|---|---|---|
| Sprint 1 | Thu, 22 Oct 2026 | Thu, 5 Nov 2026 | Week 2 | 15% | Project foundation and contract first (section 1.1). |
| Sprint 2 | Fri, 6 Nov 2026 | **Tue, 24 Nov 2026** | Week 5 | 20% | Detailed requirements (SRS), non-functional requirements, Figma prototypes and user flows, C4 model and UML architecture, and the Android application skeleton (T-05, issue #23). |
| Sprint 3 | Fri, 27 Nov 2026 | Thu, 17 Dec 2026 | Week 8 | 25% | First working MVP (stories US-01 to US-09) and a GitHub Actions pipeline with at least 50% unit-test coverage. |
| Final submission | Fri, 18 Dec 2026 | Thu, 31 Dec 2026 | Week 10 | 40% | Live product started with one `docker-compose` command, integration and end-to-end test report, SonarQube report, live demonstration and architectural defense. |

Week numbers and weights are taken from the course project specification. The calendar dates are computed from the Sprint 1 due date (5 Nov 2026, end of Week 2), so that each sprint ends on a Thursday of the week named in the specification. Exception: the instructor set the Sprint 2 submission deadline to Tuesday, 24 November 2026; the earlier computed date (26 November) is no longer valid (IMP-07).

---

## 4. Ceremonies and meeting routine

All six team members attend every ceremony. Synchronous meetings run on Google Meet. Asynchronous updates go to the team WhatsApp group and to comments on the GitHub issues.

### 4.1 Sprint 1 calendar

The dates below are the planned schedule.

| Ceremony | Date and time (TRT, UTC+3) | Duration | Purpose and output |
|---|---|---|---|
| Sprint 1 Planning | Thu, 22 Oct 2026, 20:00 | 60 min | Define the sprint scope, break down tasks T-01 to T-06 (#19 to #24) and stories US-01 to US-10 (#9 to #18), assign owners, check the Definition of Ready. |
| Backlog and Contract Sync | Wed, 28 Oct 2026, 21:00 | 30 min | Align the acceptance criteria of US-01 to US-10 with the operations in `api/openapi.yaml`, the reminder rules in ADR-002 and the task dependencies. |
| Sprint 1 Review | Wed, 4 Nov 2026, 21:00 | 45 min | Check all six deliverables against the course rubric, confirm the CI checks `backend-test` and `openapi-lint`, and complete `docs/SPRINT-1-SUBMISSION.md`. |
| Sprint 1 Retrospective | Wed, 4 Nov 2026, 21:45 | 30 min | What went well, what to improve, concrete actions for Sprint 2 (for example workload balance between mobile and backend, risk R1 in the proposal). |

### 4.2 Recurring routine

| Ceremony | When | Duration | Channel |
|---|---|---|---|
| Sprint Planning (Sprint 2 and later) | Thursday evening of the previous sprint's due date, 20:00; the sprint starts on Friday | 60 min | Google Meet |
| Daily stand-up, synchronous | Tue, Thu, Sat, 21:00 | 15 min | Google Meet |
| Daily stand-up, asynchronous | Mon, Wed, Fri, written update by 21:00 | 5 min | WhatsApp or GitHub issue comment |
| Sprint Review | Wednesday before the due date, 21:00 | 45 min | Google Meet |
| Sprint Retrospective | Same Wednesday, right after the review | 30 min | Google Meet |

Sunday has no scheduled stand-up.

### 4.3 Rules

1. **Stand-up questions.** What did I complete since the last check-in (issue or pull request)? What will I do next? Is anything blocking me?
2. **Blockers.** A blocker raised in a stand-up is labelled `blocked` on its GitHub issue and recorded in the impediment log (section 5) by the Scrum Master.
3. **Planning.** The Product Owner presents the prioritized backlog. The team checks dependencies (Lead Architect's notes on the issues, ADR-002, `api/openapi.yaml`), confirms the story points by planning poker, and assigns each story to an owner (GitHub assignee). The backlog owner column is updated afterwards to match the GitHub assignees.
4. **Definition of Ready and Definition of Done.** See [backlog section 6](../product/06-product-backlog.md).
5. **Review.** Every pull request needs at least one approval from a teammate who is not the author and passing required checks before it is merged into `develop`.

---

## 5. Impediment log

Blockers are tracked with the `blocked` label on GitHub issues and recorded here.

| ID | Date reported | Reported by | Area | Impediment | Resolution or action plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| IMP-01 | 2026-10-28 | Whole team | Repository and CI (T-02) | Branch protection and required status checks (`backend-test`, `openapi-lint`) had to be enforced on `main` and `develop`. | Rulesets and peer-review merge requirements configured and verified. | `@ybyaman`, `@AhmeTalhAkyol` | Resolved |
| IMP-02 | 2026-10-31 | `@ynessakar` | Process (T-06) | Milestone tracking of the setup tasks (T-01 to T-06) and the backlog stories (US-01 to US-10) had to be aligned. | Tasks and stories linked to the `Sprint-1` milestone, so that both appear in one milestone view. | `@ynessakar`, `@ybyaman` | Resolved |
| IMP-03 | 2026-10-31 | `@ybyaman` | Repository | The repository had to move to the `AbonelikVeFaturaHatirlatici` organization; documents still pointed to the old address. | Repository moved; links in the Git-Flow document, the proposal and the submission file updated. | `@ybyaman` | Resolved |
| IMP-04 | 2026-10-31 | `@ybyaman` | Requirements (US-08) | The reminder late-addition rule in the product documents differed from ADR-002 (catch-up behaviour). | Decision `D-02` rewritten to follow ADR-002 and merged with PR #35. | `@zsudedeveli`, `@ybyaman` | Resolved |
| IMP-05 | 2026-10-31 | `@ybyaman` | Workload (T-05) | Backend and mobile implementation rest on a single member (`@Faldozn`); bottleneck risk. | Proposed, to be confirmed at Sprint 2 planning: the Architect and the DevOps engineer support the core backend endpoints in Sprint 2 and Sprint 3. Sprint 2 update: the Figma prototype moved to the Product Owner and the Expo project setup to DevOps, so that the Implementation engineer works only on T-05. | `@ybyaman`, `@AhmeTalhAkyol` | Monitoring |
| IMP-06 | 2026-11-18 | `@ynessakar` | Mobile setup (T-05) | The Expo project setup in `mobile/`, planned to be merged by 17 Nov 2026, has not started. The Android skeleton (T-05, #23) cannot start without it. | DevOps sets up the Expo TypeScript project with lint and type checks by 19 Nov 2026. Done: [PR #64](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/64) (Expo scaffold and `mobile-lint` CI check) merged on 19 Nov 2026. | `@AhmeTalhAkyol`, `@Faldozn` | Resolved |
| IMP-07 | 2026-11-18 | `@ynessakar` | Schedule | The Sprint 2 due date in this document (26 Nov) differed from the instructor's deadline (24 Nov). | Calendar, review and retrospective dates moved to the 24 Nov deadline (section 2.2); milestone `Sprint-2` set to 24 Nov. | `@ynessakar` | Resolved |

---

## 6. Evidence and related documents

- Sprint 1 submission document: [`docs/SPRINT-1-SUBMISSION.md`](../SPRINT-1-SUBMISSION.md)
- Sprint 2 submission document: [`docs/SPRINT-2-SUBMISSION.md`](../SPRINT-2-SUBMISSION.md)
- Team roles and RACI matrix: [`04-team-roles-and-raci.md`](./04-team-roles-and-raci.md)
- Git-Flow and repository workflow: [`05-git-flow-and-repository-workflow.md`](./05-git-flow-and-repository-workflow.md)
- Product backlog: [`06-product-backlog.md`](../product/06-product-backlog.md)
- Decision log: [`decision-log.md`](../product/decision-log.md)
- Product Owner documents: [PR #35](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/35)
- Repository: <https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici>
- Sprint 1 milestone (issues #9 to #24): [Sprint-1](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-1)
- Sprint 2 milestone (issues #23, #57 to #63): [Sprint-2](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-2)
- Sprint 2 pull requests: [#64](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/64) (Expo scaffold and mobile CI), [#54](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/54) (C4), [#55](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/55) (UML), [#56](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/56) (SRS, NFR, backlog, user flows)
