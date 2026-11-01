# Sprint 1: Agile Process, Schedule and Impediment Log

| Field | Value |
|---|---|
| Project | Subscription Reminder (`abonelik-ve-fatura-hatirlatici`) |
| Course | SENG 321 Software Engineering · Team 11 |
| Milestone | [Sprint-1](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-1) (15% of the course grade) |
| Task reference | T-06, [Issue #24](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/24) (issue title: "Scrum Master: sprint takvimi ve toplantı düzeni", in English: sprint calendar and meeting routine) |
| Scrum Master | Yeter Nesibe Sakar (`@ynessakar`) |
| Last updated | 1 November 2026 |

---

## 1. Sprint 1 goal, scope and dates

**Sprint goal.** Lay the project foundation: define the problem and the system boundary, agree the API contract before implementation, set up the protected Git-Flow repository, assign roles, and prepare a prioritized backlog with acceptance criteria.

Decision `D-22` records that invoices and bills are out of scope for the first release, so the product focuses on subscription reminders only.

| Sprint | Start | Due | Status |
|---|---|---|---|
| Sprint 1 | Thu, 22 Oct 2026 | Thu, 5 Nov 2026 | Active, in review |

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

## 2. Course milestones

| Milestone | Start | Due | Course week | Weight | Focus |
|---|---|---|---|---|---|
| Sprint 1 | Thu, 22 Oct 2026 | Thu, 5 Nov 2026 | Week 2 | 15% | Project foundation and contract first (section 1.1). |
| Sprint 2 | Fri, 6 Nov 2026 | Thu, 26 Nov 2026 | Week 5 | 20% | Detailed requirements (SRS), non-functional requirements, Figma prototypes and user flows, C4 model and UML architecture, and the Android application skeleton (T-05, issue #23). |
| Sprint 3 | Fri, 27 Nov 2026 | Thu, 17 Dec 2026 | Week 8 | 25% | First working MVP (stories US-01 to US-09) and a GitHub Actions pipeline with at least 50% unit-test coverage. |
| Final submission | Fri, 18 Dec 2026 | Thu, 31 Dec 2026 | Week 10 | 40% | Live product started with one `docker-compose` command, integration and end-to-end test report, SonarQube report, live demonstration and architectural defense. |

Week numbers and weights are taken from the course project specification. The calendar dates are computed from the Sprint 1 due date (5 Nov 2026, end of Week 2), so that each sprint ends on a Thursday of the week named in the specification.

---

## 3. Ceremonies and meeting routine

All six team members attend every ceremony. Synchronous meetings run on Google Meet. Asynchronous updates go to the team WhatsApp group and to comments on the GitHub issues.

### 3.1 Sprint 1 calendar

The dates below are the planned schedule.

| Ceremony | Date and time (TRT, UTC+3) | Duration | Purpose and output |
|---|---|---|---|
| Sprint 1 Planning | Thu, 22 Oct 2026, 20:00 | 60 min | Define the sprint scope, break down tasks T-01 to T-06 (#19 to #24) and stories US-01 to US-10 (#9 to #18), assign owners, check the Definition of Ready. |
| Backlog and Contract Sync | Wed, 28 Oct 2026, 21:00 | 30 min | Align the acceptance criteria of US-01 to US-10 with the operations in `api/openapi.yaml`, the reminder rules in ADR-002 and the task dependencies. |
| Sprint 1 Review | Wed, 4 Nov 2026, 21:00 | 45 min | Check all six deliverables against the course rubric, confirm the CI checks `backend-test` and `openapi-lint`, and complete `docs/SPRINT-1-SUBMISSION.md`. |
| Sprint 1 Retrospective | Wed, 4 Nov 2026, 21:45 | 30 min | What went well, what to improve, concrete actions for Sprint 2 (for example workload balance between mobile and backend, risk R1 in the proposal). |

### 3.2 Recurring routine

| Ceremony | When | Duration | Channel |
|---|---|---|---|
| Sprint Planning (Sprint 2 and later) | Thursday evening of the previous sprint's due date, 20:00; the sprint starts on Friday | 60 min | Google Meet |
| Daily stand-up, synchronous | Tue, Thu, Sat, 21:00 | 15 min | Google Meet |
| Daily stand-up, asynchronous | Mon, Wed, Fri, written update by 21:00 | 5 min | WhatsApp or GitHub issue comment |
| Sprint Review | Wednesday before the due date, 21:00 | 45 min | Google Meet |
| Sprint Retrospective | Same Wednesday, right after the review | 30 min | Google Meet |

Sunday has no scheduled stand-up.

### 3.3 Rules

1. **Stand-up questions.** What did I complete since the last check-in (issue or pull request)? What will I do next? Is anything blocking me?
2. **Blockers.** A blocker raised in a stand-up is labelled `blocked` on its GitHub issue and recorded in the impediment log (section 4) by the Scrum Master.
3. **Planning.** The Product Owner presents the prioritized backlog. The team checks dependencies (Lead Architect's notes on the issues, ADR-002, `api/openapi.yaml`), confirms the story points by planning poker, and assigns each story to an owner (GitHub assignee). The backlog owner column is updated afterwards to match the GitHub assignees.
4. **Definition of Ready and Definition of Done.** See [backlog section 6](../product/06-product-backlog.md).
5. **Review.** Every pull request needs at least one approval from a teammate who is not the author and passing required checks before it is merged into `develop`.

---

## 4. Impediment log

Blockers are tracked with the `blocked` label on GitHub issues and recorded here.

| ID | Date reported | Reported by | Area | Impediment | Resolution or action plan | Owner | Status |
|---|---|---|---|---|---|---|---|
| IMP-01 | 2026-10-28 | Whole team | Repository and CI (T-02) | Branch protection and required status checks (`backend-test`, `openapi-lint`) had to be enforced on `main` and `develop`. | Rulesets and peer-review merge requirements configured and verified. | `@ybyaman`, `@AhmeTalhAkyol` | Resolved |
| IMP-02 | 2026-10-31 | `@ynessakar` | Process (T-06) | Milestone tracking of the setup tasks (T-01 to T-06) and the backlog stories (US-01 to US-10) had to be aligned. | Tasks and stories linked to the `Sprint-1` milestone, so that both appear in one milestone view. | `@ynessakar`, `@ybyaman` | Resolved |
| IMP-03 | 2026-10-31 | `@ybyaman` | Repository | The repository had to move to the `AbonelikVeFaturaHatirlatici` organization; documents still pointed to the old address. | Repository moved; links in the Git-Flow document, the proposal and the submission file updated. | `@ybyaman` | Resolved |
| IMP-04 | 2026-10-31 | `@ybyaman` | Requirements (US-08) | The reminder late-addition rule in the product documents differed from ADR-002 (catch-up behaviour). | Decision `D-02` rewritten to follow ADR-002 and merged with PR #35. | `@zsudedeveli`, `@ybyaman` | Resolved |
| IMP-05 | 2026-10-31 | `@ybyaman` | Workload (T-05) | Backend and mobile implementation rest on a single member (`@Faldozn`); bottleneck risk. | Proposed, to be confirmed at Sprint 2 planning: the Architect and the DevOps engineer support the core backend endpoints in Sprint 2 and Sprint 3. | `@ybyaman`, `@AhmeTalhAkyol` | Monitoring |

---

## 5. Evidence and related documents

- Sprint 1 submission document: [`docs/SPRINT-1-SUBMISSION.md`](../SPRINT-1-SUBMISSION.md)
- Team roles and RACI matrix: [`04-team-roles-and-raci.md`](./04-team-roles-and-raci.md)
- Git-Flow and repository workflow: [`05-git-flow-and-repository-workflow.md`](./05-git-flow-and-repository-workflow.md)
- Product backlog: [`06-product-backlog.md`](../product/06-product-backlog.md)
- Decision log: [`decision-log.md`](../product/decision-log.md)
- Product Owner documents: [PR #35](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/35)
- Repository: <https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici>
- Sprint 1 milestone (issues #9 to #24): [Sprint-1](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-1)
