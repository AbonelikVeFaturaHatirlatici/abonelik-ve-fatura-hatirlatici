# Project Proposal and Problem Definition

**Project:** Subscription Reminder Mobile Application
**Course:** SENG 321 · Software Engineering Project · Sprint 1
**Team number:** 11
**Repository:** https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici
**Author / owner:** Zeynep Sude Develi (GitHub: `zsudedeveli`), Product Owner and Requirements Engineer
**Version / date:** 1.0 · 31 October 2026
**Status:** Product Owner approved; peer review through pull request

| Role | Name (GitHub) |
|---|---|
| Product Owner and Requirements Engineer | Zeynep Sude Develi (`zsudedeveli`) |
| Scrum Master | Nesibe Sakar (`ynessakar`) |
| Lead Architect and Tech Lead | Yusuf Buğra Yaman (`ybyaman`) |
| QA and Test Automation Engineer | Nadir Efe Taşkıran (`nadirtaskiran`) |
| DevOps and CI/CD Engineer | Ahmet Talha Akyol (`AhmeTalhAkyol`) |
| Implementation and Integration Engineer | Emre Alay (`Faldozn`) |

Related documents: [System Vision and Boundary](02-system-vision-and-boundary.md) · [Requirements](03-requirements.md) · [Product Backlog](06-product-backlog.md) · [Decision Log](decision-log.md) · [OpenAPI contract](../../api/openapi.yaml)

---

## 1. Problem statement and supporting evidence

### 1.1 Problem statement

University students and young professionals subscribe to several digital services (streaming, music, cloud storage, software). Each service renews automatically. Most users have no single place that shows when each subscription renews, so they are charged for services they no longer use and notice the charge only after it happens.

### 1.2 Current process

Users rely on memory, the app-store subscription page, a calendar entry, or a note. None of these warns the user a few days before a renewal. Information is scattered, and each method depends on the user remembering to check it.

### 1.3 Evidence: pilot survey

A short pilot survey was run on 21–24 October 2026. **14 responses; small, self-reported, and not representative.** It is used to justify the direction of the project, not to prove market demand.

| Measure | Result | Share |
|---|---|---|
| Number of subscriptions: 1–2 / 3–5 / 6 or more | 5 / 7 / 2 | 35.7% / 50.0% / 14.3% of 14 |
| Experienced an unwanted renewal or charge: yes / no | 12 / 2 | 85.7% / 14.3% of 14 |
| Amount lost among those 12: up to 100 TL / 100–500 TL / over 500 TL | 1 / 7 / 4 | 8.3% / 58.3% / 33.3% of 12 |
| How subscriptions are tracked today: keep in mind / do not track | 7 / 4 | 50.0% / 28.6% of 14 |
| Other methods (Apple subscription page, calendar or notes, "empty account" workaround) | 1 each | 7.1% each of 14 |
| Would use a reminder app: yes / maybe / no | 12 / 1 / 1 | 85.7% / 7.1% / 7.1% of 14 |

### 1.4 Consequences

- Of the 12 respondents who had an unwanted charge, 11 reported losses in the 100–500 TL band or higher, and 4 of them more than 500 TL.
- Half of the respondents track subscriptions only from memory.
- No reliable moment exists at which the user is prompted to decide *before* a renewal.

### 1.5 Baseline for later comparison

The baseline is the survey above: 85.7% of respondents had an unwanted renewal and 50% track by memory. These figures are only a reference point. A follow-up question can be asked after the prototype is demonstrated.

> The problem statement does not prescribe a technology. The solution hypothesis in section 3 can change if evidence contradicts it.

---

## 2. Stakeholder identification and analysis

| Stakeholder | Role | Main interest | Influence on project | Dependence on system | Engagement |
|---|---|---|---|---|---|
| Students and young professionals | Primary users | Know renewal dates, get warned before charges, minimal effort to enter data | Medium (requirements source, via survey) | High | Survey; feedback on prototype and wireframes |
| Course instructor and assessors | Governance and evaluation | Evidence that Sprint 1 requirements are met; individual contribution traceable | High (accept or reject deliverables) | Low | Submission; peer review exercise |
| Product Owner (team) | Decision maker for scope and priority | A coherent first release delivered on time | High | Medium | Owns backlog and approvals |
| Lead Architect (team) | Owner of contract and architecture | A stable API-first contract and sustainable design | High | Medium | Consulted on every requirement that affects the API |
| Implementation and QA engineers (team) | Builders and verifiers | Clear, testable stories; small scope | Medium | Medium | Refinement; Definition of Ready |
| Scrum Master and DevOps (team) | Process and delivery | Working repository workflow, protected branches, CI | Medium | Medium | Ruleset and process review |
| Subscription providers (Netflix, Spotify, etc.) | External parties | None (no data exchange) | None | None | Not integrated. Cancellation and billing stay with the provider |
| Future push-notification provider | Possible external service | Interface and token handling | Low (deferred) | Low | Replaced by a mock notifier now; boundary kept so it can be swapped later |

**Observation.** The provider of each subscription is deliberately *not* an integration partner. The system tracks only what the user types in. This keeps the project feasible and keeps the system out of payments and bank data.

---

## 3. Proposed solution and expected outcomes

### 3.1 Solution hypothesis

> If users can quickly record their subscriptions in an Android application that calculates the next renewal date and creates a reminder 3 days and 1 day before it, then users will notice upcoming renewals in time to decide whether to keep the subscription, and unwanted charges will decrease.

Key assumptions behind the hypothesis are listed in section 6.

### 3.2 Expected outcomes

| # | Outcome | How the team recognizes success |
|---|---|---|
| O1 | A user records a subscription quickly | A new user completes the add-subscription flow in **under 60 seconds** in a defined usability test with at least 5 participants (target: at least 4 of 5 succeed) |
| O2 | The next renewal date is always correct | All renewal-date acceptance tests pass, including month-end, leap-year and yearly cases |
| O3 | Each reminder is created exactly once | Running the daily job twice for the same date creates no duplicates; verified by an automated test and a database unique constraint |
| O4 | Each user sees only their own data | Cross-user access tests return 404 for foreign records and 401 without a token |
| O5 | The product states honestly what it does | The interface shows that removing a subscription does **not** cancel it at the provider |
| O6 | The engineering evidence is traceable | Every change links to an issue and a reviewed pull request; test coverage is at least 50% |

---

## 4. Feasibility assessment and initial project scope

### 4.1 Feasibility

| Dimension | Assessment | Verdict |
|---|---|---|
| Technical | Standard components: Android client (React Native with Expo), REST API (FastAPI, Python) with JWT, PostgreSQL (SQLAlchemy, Alembic), a daily job (APScheduler, 09:00 Europe/Istanbul), Docker Compose, and GitHub Actions (ruff, pytest, Spectral). Date logic is isolated in pure functions that are easy to unit test. | Feasible |
| Data and integration | No external system is required. Notifications use a mock notifier. No bank, card or mailbox access. | Feasible |
| Skills and schedule | A six-person team with defined roles. Main concentration risk: backend and mobile both rest on one implementation engineer (see R1). The scope has been trimmed to compensate (no snooze, no payments, no real push). | Feasible with scope control |
| Legal and ethical | Only email address, service name, amount, period and dates are stored. Passwords are hashed. If the app were released publicly, personal-data rules (KVKK in Turkey) and account deletion would need to be addressed. | Feasible for a course prototype; recorded as a release risk (R7) |
| Operational | Runs from one Docker Compose stack (API and database). | Feasible |
| Economic | No paid service is required. | Feasible |

**Conclusion.** The first release is feasible within the course schedule if scope is held to the list below.

### 4.2 Initial scope of the first release

**Included**

- Registration and login with email and password (JWT).
- Manual add, list, view and remove-from-tracking of subscriptions.
- Monthly and yearly billing periods; amounts in TRY.
- Automatic next-renewal calculation with the month-end rule.
- Two reminders per renewal (3 days and 1 day before), produced by a daily job at 09:00 Europe/Istanbul, delivered through a mock notifier (`sent_mock`).
- Duplicate prevention (same service name and period, case-insensitive).
- Read-only list of reminders.

**Excluded from the first release**

- Cancelling the subscription at the provider; payments; bank or mailbox integration.
- Real push notifications and device tokens.
- Weekly periods, multiple currencies, custom reminder schedules, snoozing.
- Invoices and bills (possible later release); the first release tracks subscriptions only.
- Analytics, family sharing, social login, account deletion, iOS, multilingual UI.

The full boundary is in [02-system-vision-and-boundary.md](02-system-vision-and-boundary.md).

---

## 5. Open-source license selection

**Decision D-12: MIT License for original project code.**

| Question | Answer for this project |
|---|---|
| May others use the code commercially? | Yes. This is acceptable for the team. |
| Must derived work use the same license? | No. MIT is permissive and has no copyleft. |
| Is an explicit patent grant needed? | Not required. The project has no patent-sensitive component; Apache 2.0 was considered for its patent grant, but MIT is shorter and sufficient for a course prototype. |
| Are dependency licenses compatible? | MIT can be combined with MIT, BSD and Apache-2.0 dependencies. Every direct and transitive dependency must still be inspected. |

**Rationale.** The license is short, easy for students to understand, and allows reuse and modification, which fits an educational project.

**Alternatives considered**

| Option | Reason not selected |
|---|---|
| Apache License 2.0 | Adds a patent grant that this project does not need; longer text and `NOTICE` handling. |
| GPL | Strong copyleft would restrict reuse of the code in other courses or projects. |

**Follow-up actions**

1. Add the complete MIT text as `LICENSE` in the repository root (provided).
2. Keep the copyright line: "Copyright (c) 2026 The Subscription Reminder project contributors".
3. Inspect every direct and transitive dependency license before the final release; record unknown or incompatible licenses as release risks.
4. Keep third-party notices where a dependency requires them.

*This decision is not legal advice. The team follows university policy.*

---

## 6. Assumptions

| ID | Assumption | Validation or response |
|---|---|---|
| A1 | Users are willing to type in their subscriptions manually. | Test through the usability test (O1). Survey shows 85.7% interest in a reminder app. |
| A2 | Two reminders (3 days and 1 day before) give the user enough time to react. | Ask pilot users after demonstration. Reminder offsets are constants and can be changed in a later sprint. |
| A3 | Monthly and yearly periods cover the large majority of consumer subscriptions. | Survey follow-up; weekly periods are deferred, not rejected. |
| A4 | Amounts are in TRY. | Confirmed by the target audience (Turkey). Multi-currency is deferred. |
| A5 | A mock notifier is acceptable for the course. | Confirm with the course instructor in the Sprint 1 review. |
| A6 | The team can run the full stack locally with Docker Compose. | DevOps verifies in the Docker and CI tasks (#19, #20). |
| A7 | The survey is a reasonable, though weak, indicator of need. | Treated as indicative only; limitations are stated in section 1.3. |

## 7. Potential risks

Likelihood (L) and Impact (I): Low / Medium / High.

| ID | Risk | L | I | Response | Owner |
|---|---|---|---|---|---|
| R1 | Backend and mobile both depend on one implementation engineer. | H | H | Keep scope small; contract first so mobile can use mock responses; Architect pairs on backend; re-balance at sprint planning. | Scrum Master |
| R2 | Date logic errors (month-end, leap year, yearly 29 February). | M | H | Pure functions with the current date as input; acceptance tests AT-18 to AT-21; unit tests before integration. | QA, Architect |
| R3 | Reminder job creates duplicates or mislabels reminders. | M | H | Catch-up rule from ADR-002 (D-02), database unique constraint, idempotency test. | Architect, QA |
| R4 | Contract drifts away from requirements. | M | M | API-first rule; contract changes only through the Lead Architect; PO checks each change against FR-01…FR-13. | Architect, PO |
| R5 | Scope creep (snooze, push, payments). | M | M | Out-of-scope list is binding; new items enter the backlog and need a PO decision. | PO |
| R6 | Users think "remove from tracking" cancels the real subscription. | M | H | Mandatory UI warning (D-03); acceptance test AT-16. | PO, Implementation |
| R7 | Personal data (email) and missing account deletion block a public release. | L | M | Out of scope for the course prototype; revisit before any public deployment. | PO |
| R8 | Process evidence is weak (direct pushes, missing reviews, pull requests that do not name their issue). | M | H | Branch protection, PR template, issue-first rule (see Git-Flow document). | DevOps, Scrum Master |
| R9 | Dependency license is incompatible or unknown. | L | M | License inspection checklist; record findings. | DevOps |
| R10 | Survey evidence is too small to support strong claims. | H | L | State limitation openly; re-survey after demonstration. | PO |
