# Non-Functional Requirements and Quality-Measure Specification

**Project:** Subscription Reminder Mobile Application
**Course:** BM 321 / SENG 321 · Software Engineering Project · Sprint 2 · Team 11
**Owner:** Zeynep Sude Develi (`zsudedeveli`), Product Owner and Requirements Engineer
**Version / date:** 1.0 · 17 November 2026
**Applies decisions:** D-26 and D-27 in [decision-log.md](decision-log.md); replaces the eight short NFRs of the Requirements Specification version 1.0 (mapping in section 7)
**Status:** Targets proposed by the Product Owner; to be acknowledged by the Architect, QA and DevOps in the pull request review (decision D-27)

Related documents: [SRS](03-requirements.md) · [Backlog](06-product-backlog.md) · [User flows and prototype specification](08-user-flows-and-prototype-spec.md) · [QA test plan](../qa/test-plan.md) · [Architecture decisions](../adr/)

---

## 1. Purpose and approach

A functional requirement says *what* the product does; a non-functional requirement (NFR) says *how well*. This document fixes the quality bar of the first release in numbers that can be measured, so that "good enough" is decided by evidence and not by opinion.

How the requirements were derived:

1. The quality attributes follow **ISO/IEC 25010** (functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, portability), reduced to what this small product needs.
2. Each requirement is **specific, measurable and verifiable**: it names a target value, the way it is measured, the tool, the owner and the sprint in which it is checked.
3. Targets are sized for a course product that runs in one Docker Compose stack for a demonstration, not for production traffic. Excluded attributes are listed in section 5 so that nobody has to guess.
4. Priorities use MoSCoW: **Must** (the release is not accepted without it), **Should** (expected for a complete release), **Could** (wanted if time allows).

## 2. Quality requirements

Identifier scheme: `NFR-<attribute letter><number>`. F = functional suitability, P = performance efficiency, R = reliability and data integrity, S = security, U = usability and accessibility, M = maintainability and process quality, C = compatibility, D = deployability and operability.

### 2.1 Functional suitability

| ID | Requirement | Target | Measure and method | Tool | Owner | When | Priority |
|---|---|---|---|---|---|---|---|
| NFR-F1 | The renewal date and reminder rules are correct. | 100% of the specified test vectors pass (renewal: AT-18 to AT-21 and QA-DATE-01 to 11; reminders: AT-22 to AT-27, AT-30 and QA-REM-*). In addition, a randomized comparison of `next_renewal` with an independent reference calculation over at least 10,000 random (start date, period, today) triples shows 0 differences. | Unit tests in CI; one-off randomized comparison script. | pytest | QA, Architect | Sprint 3 | Must |
| NFR-F2 | The behaviour of the API equals the contract. | All 7 operations: status codes and response bodies validate against `api/openapi.yaml`; 0 contract deviations. | Contract tests (QA-CONTRACT-*). | pytest + schema validation | QA | Sprint 3 | Must |

### 2.2 Performance efficiency

Measured on the Docker Compose stack on one developer laptop (4 CPU cores, 8 GB memory or better), database seeded with 1,000 users and 20,000 subscriptions, 20 concurrent clients for 5 minutes.

| ID | Requirement | Target | Measure and method | Tool | Owner | When | Priority |
|---|---|---|---|---|---|---|---|
| NFR-P1 | API response time. | 95th percentile ≤ **300 ms** for `createSubscription`, `listSubscriptions`, `getSubscription`, `cancelSubscription` and `listReminders`; ≤ **800 ms** for `registerUser` and `login` (the argon2 hash is deliberately slow). Error rate ≤ 0.5%. | Load test; the report is attached to the pull request. | k6 or Locust (QA chooses) | QA | Sprint 3 (first run), Final | Should |
| NFR-P2 | The list screen opens quickly. | Median time from opening the subscription list (S2) to the first card shown ≤ **2 s** with 50 subscriptions on a mid-range Android phone on Wi-Fi (5 runs). | Stopwatch or screen recording. | Device | Implementation, QA | Sprint 3 | Should |
| NFR-P3 | The daily job scales to the demonstration size. | One run over **10,000 active subscriptions** completes in ≤ **60 s** and creates the same reminders as a run over smaller batches. | Timed integration test with seeded data; the job logs its duration. | pytest, job log | Architect, QA | Final | Should |

### 2.3 Reliability and data integrity

| ID | Requirement | Target | Measure and method | Tool | Owner | When | Priority |
|---|---|---|---|---|---|---|---|
| NFR-R1 | The daily job is idempotent. | After the job runs 2 times for the same date, and after 2 concurrent runs, **0 duplicate** reminders exist for any (subscription, renewal date, daysBefore). | Unit and integration tests; the unique constraint is the last line of defence. | pytest | Architect, QA | Sprint 3 | Must |
| NFR-R2 | A missed run does not lose a reminder. | After a simulated missed run (job not executed on a reminder date), the next run creates the missed reminder if the renewal day has not arrived (ADR-002); **100%** of the catch-up vectors (AT-30, QA-REM-*) pass. | Unit tests with an injected "today". | pytest | QA | Sprint 3 | Must |
| NFR-R3 | Business invariants are enforced by the database, not only by code. | The partial unique index on active subscriptions, the unique constraint on reminders, `CHECK` constraints on amount, period, status and `days_before`, and the foreign keys exist after `alembic upgrade head`; **0** invalid rows can be inserted by a direct SQL attempt. | Migration test that tries each violation. | pytest + PostgreSQL | DevOps, QA | Sprint 3 | Must |
| NFR-R4 | The system recovers after a restart. | After `docker compose restart`, the API answers `GET /health` with `200` within **60 s** and no data is lost. | Manual script, repeated 3 times. | Docker | DevOps | Final | Should |

### 2.4 Security

| ID | Requirement | Target | Measure and method | Tool | Owner | When | Priority |
|---|---|---|---|---|---|---|---|
| NFR-S1 | Passwords are never stored or logged in plain text. | Stored as an **argon2** hash (ADR-004); a search of the database and of the application log after a test run finds **0** plain-text passwords. | Inspection and test. | pytest, SQL | Architect, QA | Sprint 3 | Must |
| NFR-S2 | All input is validated on the server. | At least **30 invalid payloads per write operation** (missing field, wrong type, oversize, out-of-range date, SQL-like and script-like strings) return `400` with `{code, message}`; **0** produce a `5xx`. | Parameterized negative tests. | pytest | QA | Sprint 3 | Must |
| NFR-S3 | Access control: authentication and ownership. | All protected operations return `401` without a valid token (**100%** of the operations in the contract matrix); every access to another user's record returns `404`; a bearer token lasts **24 hours** (ADR-004). | Test matrix over operations × (no token, expired token, foreign record). | pytest | QA | Sprint 3 | Must |
| NFR-S4 | Data minimization. | Only email, password hash, service name, amount, period, dates and reminder records are stored; **0** card, bank, location or contact fields exist in the schema. | Schema review at each migration. | Inspection | PO, Architect | Sprint 2, Final | Must |
| NFR-S5 | Session handling on the device. | The token is kept in the platform's secure storage (Expo SecureStore), not in plain storage; it is deleted on logout and on every `401` (FR-14). | Code inspection and a device test. | Inspection, device | Implementation, QA | Sprint 3 | Should |
| NFR-S6 | Transport security in a deployed demonstration. | A demonstration reachable over a network uses **HTTPS**; the local development setup may use HTTP on `localhost`. | Inspection of the deployment. | Browser or `curl` | DevOps | Final | Could |
| NFR-S7 | No secrets in the repository. | **0** secrets (keys, tokens, passwords) in the repository; `.env` is ignored; only `.env.example` is committed. | Automated secret scan on pull requests. | gitleaks or similar in CI | DevOps | Sprint 3 | Should |

### 2.5 Usability and accessibility

Usability is tested with the Figma prototype in Sprint 2 and with the working application in Sprint 3 (protocol in section 6). Participants belong to the target group (students and young professionals who have at least two subscriptions) and are not members of the team.

| ID | Requirement | Target | Measure and method | Tool | Owner | When | Priority |
|---|---|---|---|---|---|---|---|
| NFR-U1 | A new user can add a subscription quickly. | Task "add a subscription" completed in **≤ 60 s** by at least **4 of 5** participants without help (v1.0 NFR-07). | Moderated usability test with a stopwatch. | Prototype, then app | PO | Sprint 2 (prototype), Sprint 3 (app) | Should |
| NFR-U2 | Overall perceived usability. | Mean **System Usability Scale (SUS) score ≥ 68** (the usual "acceptable" threshold) over at least 5 participants. | SUS questionnaire after the test (10 statements). | Form | PO | Sprint 3 | Should |
| NFR-U3 | Basic accessibility. | Touch targets **≥ 48 × 48 dp**; text contrast **≥ 4.5 : 1**; the interface stays readable (no clipped text) at **130%** system font size. | Design review of the Figma file; device check. | Figma, Android settings | PO, Implementation | Sprint 2, Sprint 3 | Should |
| NFR-U4 | The meaning of "Takipten Çıkar" is understood. | At least **4 of 5** participants state correctly, after the dialog, that the real subscription is **not** cancelled (D-03, UIR-03). | Question after task "remove a subscription". | Prototype, then app | PO | Sprint 2, Sprint 3 | Must |
| NFR-U5 | Errors are understandable. | Every error shown to the user is in Turkish and tells what to correct; **0** raw error codes, stack traces or English technical messages are shown. | Walk-through of every error in the error catalogue ([SRS](03-requirements.md) section 3.8) on the app. | Device | QA, PO | Sprint 3 | Must |

### 2.6 Maintainability and process quality

| ID | Requirement | Target | Measure and method | Tool | Owner | When | Priority |
|---|---|---|---|---|---|---|---|
| NFR-M1 | Unit-test coverage. | Overall **≥ 50%** (course threshold, enforced in CI with `--cov-fail-under=50`); target **≥ 80%** for `backend/app/domain/`. The report states the measured modules and the excluded code with the reason. | Coverage report in every CI run. | pytest-cov | QA, DevOps | Every pull request | Must |
| NFR-M2 | Business rules are pure functions. | `backend/app/domain/` imports no web framework or database module; date and reminder functions take "today" as an input. | Import check in a test; code review. | pytest | Architect | Sprint 3 | Must |
| NFR-M3 | Static checks are clean. | **0** `ruff` errors and **0** Spectral errors on `api/openapi.yaml`; both are required status checks on `main` and `develop`. | CI jobs `backend-test` and `openapi-lint`. | GitHub Actions | DevOps | Every pull request | Must |
| NFR-M4 | Static-analysis quality gate (final submission). | SonarQube gate passes: **0 blocker and 0 critical** issues; duplicated lines **≤ 3%**; maintainability rating **A**; technical-debt ratio **≤ 5%**. | SonarQube report attached to the final submission. | SonarQube | DevOps, Architect | Final | Must |
| NFR-M5 | Traceability and review discipline. | **100%** of merged pull requests link an issue and have at least one approval from a non-author; at the end of Sprint 3 the Evidence column of the traceability matrix is filled for **100%** of the *Must* requirements. | GitHub query and review of the matrix. | GitHub | Scrum Master, PO | Every sprint end | Must |
| NFR-M6 | Defects do not accumulate. | At every sprint end, **0 open defects** of severity *critical* or *high*; defects are tracked as issues with the `bug` template. | Issue query. | GitHub | QA | Every sprint end | Must |

### 2.7 Compatibility

| ID | Requirement | Target | Measure and method | Tool | Owner | When | Priority |
|---|---|---|---|---|---|---|---|
| NFR-C1 | Supported platform. | Android **10 or later** (D-25): the primary journey (register, log in, add, list, remove, view reminders) works on at least **1 emulator and 1 physical device**. | Manual run of the acceptance scenarios. | Android Studio emulator, device | Implementation, QA | Sprint 3 | Must |
| NFR-C2 | Error schema and language. | **100%** of error responses use `{code, message}`; `code` values are stable English identifiers; `message` is Turkish (D-19). | Contract and API tests. | pytest | QA | Sprint 3 | Must |

### 2.8 Deployability and operability

| ID | Requirement | Target | Measure and method | Tool | Owner | When | Priority |
|---|---|---|---|---|---|---|---|
| NFR-D1 | One-command start. | On a clean machine with Docker, `docker compose up` starts the API and the database; `GET /health` returns `200` within **120 s**; the migrations are applied automatically. | Timed run on a clean checkout, repeated on 2 machines. | Docker | DevOps | Sprint 3, Final | Must |
| NFR-D2 | Configuration outside the code. | All settings (database URL, `JWT_SECRET`, job time) come from environment variables; switching them needs **0** code changes. | Inspection. | Inspection | DevOps | Sprint 3 | Should |
| NFR-D3 | The job is observable. | Every run of the daily job writes one log line with the date, the number of subscriptions checked and the number of reminders created (v1.0 NFR-08). | Log inspection after a test run. | Docker logs | Architect, DevOps | Sprint 3 | Should |

## 3. Quality attribute scenarios

Four scenarios turn the most important targets into testable situations (source, stimulus, environment, response, response measure).

| # | Attribute | Scenario | Response measure |
|---|---|---|---|
| QS-1 | Reliability (NFR-R1, R2) | The API container was down on 14 March 09:00. A user's renewal is on 17 March. The container is back on 14 March 11:00 and the job runs at the next scheduled time. | The 3-day reminder for 17 March is created at that run; running the job again creates no second one. |
| QS-2 | Security (NFR-S3) | A logged-in user sends `GET /subscriptions/{id}` with the id of a subscription that belongs to another user. | `404 NOT_FOUND`; the response does not reveal that the record exists; the attempt changes no data. |
| QS-3 | Usability (NFR-U1, U4) | A first-time user opens the application, registers and adds "Netflix, 229,99 TL, monthly, start 31.01.2026". Later the user removes it. | Add flow ≤ 60 s for 4 of 5 participants; after the dialog 4 of 5 say correctly that the real subscription is not cancelled. |
| QS-4 | Performance (NFR-P1) | 20 clients call `listSubscriptions` continuously for 5 minutes against 20,000 stored subscriptions. | 95th percentile ≤ 300 ms; error rate ≤ 0.5%. |

## 4. Quality measures (metrics)

The measures below are read at the points named in the last column. A value outside the threshold is an *impediment* and goes to the Scrum Master's impediment log.

| ID | Measure | Definition | Target | Action threshold | Source | Frequency | Owner |
|---|---|---|---|---|---|---|---|
| QM-01 | Unit-test coverage, overall | Covered lines ÷ measured lines of `backend/app` | ≥ 50% (CI gate) | < 50% blocks the merge | pytest-cov in CI | Every PR | QA |
| QM-02 | Unit-test coverage, domain | Same, for `backend/app/domain/` | ≥ 80% | < 70% | pytest-cov | Every PR | QA |
| QM-03 | Static-check errors | `ruff` errors + Spectral errors | 0 | > 0 blocks the merge | CI | Every PR | DevOps |
| QM-04 | CI pass rate on `develop` | Successful runs ÷ all runs of the last 7 days | ≥ 90% | < 80% | GitHub Actions | Weekly | DevOps |
| QM-05 | Open critical/high defects | Open issues labelled `bug` with severity critical or high | 0 at sprint end | ≥ 1 at sprint end | GitHub issues | Sprint end | QA |
| QM-06 | Acceptance scenarios passing | AT scenarios with a passing automated test ÷ AT scenarios of stories in the sprint | 100% of the stories marked done | < 100% means the story is not done | Test reports | Sprint end | QA |
| QM-07 | Requirement evidence | *Must* requirements with a filled Evidence link ÷ all *Must* requirements | 100% at the end of Sprint 3 | < 80% at mid-sprint | Traceability matrix | Weekly in Sprint 3 | PO |
| QM-08 | Review discipline | Merged PRs with an issue link and a non-author approval ÷ merged PRs | 100% | any exception | GitHub | Sprint end | Scrum Master |
| QM-09 | API latency | 95th percentile per operation (NFR-P1) | ≤ 300 ms (≤ 800 ms for register and login) | > 2× target | Load-test report | Sprint 3, Final | QA |
| QM-10 | Daily-job duration | Duration logged by the job for 10,000 subscriptions | ≤ 60 s | > 120 s | Job log | Final | Architect |
| QM-11 | Usability: task success | Participants who finish "add a subscription" in ≤ 60 s ÷ participants | ≥ 80% (4 of 5) | < 60% | Usability test | Sprint 2, Sprint 3 | PO |
| QM-12 | Usability: SUS | Mean SUS score | ≥ 68 | < 60 | Questionnaire | Sprint 3 | PO |
| QM-13 | Static-analysis gate | SonarQube quality gate status | Passed | Failed | SonarQube | Final | DevOps |

## 5. Quality attributes that are not required (explicit exclusions)

| Attribute | Decision | Reason |
|---|---|---|
| Scalability beyond about 1,000 users | Won't | The product is a course demonstration; one container and one database are enough (ADR-001). |
| Rate limiting, brute-force protection, two-factor login | Won't (first release) | Recorded as a security risk for a later release; passwords are hashed and tokens expire. |
| Offline use | Won't | The product needs the server to calculate and store (assumption A6). |
| Multiple languages | Won't | One Turkish interface (D-19). |
| iOS and web clients | Won't | Android only (C1). |
| High availability and backups | Won't | A single stack for the demonstration; restart recovery is covered by NFR-R4. |
| Real push delivery latency | Not applicable | A mock notifier is used (D-07). |

## 6. Verification plan

### 6.1 When each requirement is checked

| Sprint | Checked | Evidence |
|---|---|---|
| Sprint 2 (this sprint) | Documents: NFR-S4 (data minimization in the schema), NFR-U1, U3, U4 on the **Figma prototype** | Usability-test record (section 6.2), review comments on the Figma file |
| Sprint 3 | NFR-F1, F2, R1, R2, R3, S1, S2, S3, S5, S7, U1 to U5 (on the app), M1 to M3, M5, M6, C1, C2, D1 to D3, P1, P2 | CI reports, test reports linked in the pull requests, usability record |
| Final submission | NFR-P3, R4, S6, M4, D1 on a clean machine, repeat of P1 | Load-test report, SonarQube report, demonstration |

### 6.2 Usability-test protocol (used in Sprint 2 on the prototype and in Sprint 3 on the app)

| Item | Description |
|---|---|
| Participants | At least 5 people from the target group, not team members. Record age group and number of subscriptions only (no names). |
| Setting | One person at a time, 15 minutes; the prototype link or the app on a phone; think-aloud encouraged; the moderator does not help unless the participant is stuck for more than 30 seconds (counts as "needed help"). |
| Tasks | **T1** Register and log in. **T2** Add "Netflix, 229,99 TL, monthly, start date 31.01.2026". **T3** Find the next renewal date of Netflix. **T4** Remove Netflix from tracking and say what happens to the real subscription. **T5** Find the reminders. |
| Recorded | Time and success per task, number of errors, help needed, comments. After the tasks: the 10-statement SUS questionnaire. |
| Pass criteria | NFR-U1 (T2 ≤ 60 s for 4 of 5), NFR-U4 (T4 answer correct for 4 of 5), NFR-U2 (SUS ≥ 68, Sprint 3). |
| Result | A table in `docs/qa/usability-test-sprint-2.md` (template below), linked in the Sprint 2 submission. Problems found become issues labelled `usability`. |

| Participant | T1 ok / time | T2 ok / time | T3 ok | T4 correct answer | T5 ok | Errors | Help | Comment |
|---|---|---|---|---|---|---|---|---|
| P1 | | | | | | | | |
| P2 | | | | | | | | |
| P3 | | | | | | | | |
| P4 | | | | | | | | |
| P5 | | | | | | | | |

## 7. Mapping from the eight NFRs of version 1.0

| v1.0 | Replaced by |
|---|---|
| NFR-01 Passwords hashed, JWT | NFR-S1, NFR-S3 |
| NFR-02 No card or bank data | NFR-S4 |
| NFR-03 Kuruş, Istanbul dates, UTC timestamps | NFR-F1, NFR-R3 and business rules BR-01, BR-02 of the SRS |
| NFR-04 Error schema, Turkish messages | NFR-C2, NFR-U5 |
| NFR-05 Pure functions, coverage ≥ 50% | NFR-M1, NFR-M2 |
| NFR-06 Android, one Docker Compose stack | NFR-C1, NFR-D1 |
| NFR-07 Add flow in under 60 seconds | NFR-U1 |
| NFR-08 Idempotent job with log line | NFR-R1, NFR-D3 |

## 8. Approval and open points

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | The Product Owner approves the targets as the quality bar of the first release (D-27). | PO | Approved on 17 November 2026 |
| 2 | The Architect acknowledges NFR-P1 to P3, R1 to R4, S1 to S7, M2, M4 and D3 as feasible. | Architect | Open: pull request review |
| 3 | QA acknowledges the measurement methods and chooses the load-test tool. | QA | Open: pull request review |
| 4 | DevOps acknowledges NFR-M3, M4, S7, D1 and D2 and adds the secret scan and the coverage report to CI. | DevOps | Open: pull request review |
| 5 | The Implementation engineer confirms NFR-C1 (Android 10 or later) and NFR-S5 (secure storage) against the Expo SDK in use. | Implementation | Open: pull request review |

A target that the owning role cannot meet is changed through a decision-log entry and a new version of this document, not silently.
