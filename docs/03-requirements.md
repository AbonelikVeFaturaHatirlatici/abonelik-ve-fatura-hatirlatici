# Requirements Specification and Traceability

**Owner:** Zeynep Sude Develi (`zsudedeveli`), Product Owner and Requirements Engineer
**Version / date:** 1.0 · 31 October 2026
**Applies decisions:** D-01 to D-22 in [decision-log.md](decision-log.md)

## 1. Functional requirements

| ID | Requirement | Decision |
|---|---|---|
| FR-01 | A user registers with email and password (minimum 8 characters). Valid: `201`. Invalid input: `400`. Email already registered: `409`, no second account is created. | |
| FR-02 | A user logs in with email and password: `200` with a JWT. Wrong password or unknown email: `401` with the same generic message. Malformed request: `400`. | |
| FR-03 | Every subscription and reminder operation requires authentication (`401` otherwise). A user can access only their own records; another user's record returns `404`, not `403`. | |
| FR-04 | A user creates a subscription with: service name (required, 1–100 characters), amount (integer kuruş, greater than 0, TRY only), period (`monthly` or `yearly`), start date. Valid: `201`. Missing or invalid fields, zero or negative amount, weekly period: `400`. | D-05, D-16 |
| FR-05 | A second **active** subscription with the same service name (case-insensitive) and period for the same user is rejected with `409`. Removed (cancelled) records do not block a new one. Uniqueness is per user. | D-04 |
| FR-06 | The system computes `nextRenewalDate` from the original start date: the earliest date of the series *start + k × period* (k ≥ 1) that is **after** today. A start date in the future therefore gives start + 1 period as the first renewal; if today is itself a renewal date, the next renewal is the following period. If the target month lacks the start day, the last day of that month is used (31 Jan → 28 Feb → 31 Mar). Always calculated from the original start date, never from the previous result (no drift). | D-06, D-16 |
| FR-07 | The subscription list returns the user's subscriptions, each with a read-only `reminders` array (`daysBefore`, `remindOn`, `status`). | D-08 |
| FR-08 | A user views one subscription by id (`getSubscription`). Unknown or foreign id: `404`. Covered by story US-04. | D-17 |
| FR-09 | A user removes a subscription from tracking (`POST /subscriptions/{id}/cancel`): status becomes `cancelled`, `200`. Already cancelled: `409`. Unknown or foreign: `404`. The interface states that the real provider subscription is **not** cancelled. | D-03 |
| FR-10 | A daily job at 09:00 Europe/Istanbul creates at most one reminder per (subscription, renewal date, days before) for 3 and 1 days before renewal, with status `sent_mock`. Running it twice creates no duplicates (database unique constraint). | D-01, D-07, D-11 |
| FR-11 | Late addition and catch-up (ADR-002): a reminder is never created for a date earlier than the day the subscription was added. A due reminder that was missed afterwards (the job did not run, or the subscription was added after 09:00 on its reminder date) is made up by the next daily run while the renewal day has not arrived. A subscription added after 09:00 on its 3-day date receives the 3-day reminder at the next run; one added after 09:00 on its 1-day date receives no catch-up for the 1-day reminder. At most one reminder exists per (subscription, renewal date, daysBefore). | D-02 |
| FR-12 | Cancelled subscriptions receive no new reminders; existing reminders remain visible. | D-09 |
| FR-13 | A user lists their reminders as a flat, read-only list (`listReminders`), ordered by `remindOn` descending (newest first), then by `daysBefore` ascending. No create, delete, update or snooze. | D-08 |

## 2. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | Passwords are stored hashed (argon2 or bcrypt), never in plain text. Authentication uses JWT. |
| NFR-02 | No card or bank data is stored. Stored data: email, service name, amount, period, dates. |
| NFR-03 | Amounts are stored as integer kuruş. Renewal dates are date-only values interpreted in Europe/Istanbul; timestamps are in UTC. |
| NFR-04 | All errors use the schema `{code, message}`. Invalid input always uses `400`. Machine-readable `code` values are English; `message` text is Turkish (D-19). |
| NFR-05 | Date and reminder logic are pure functions that take today's date as input. Test coverage must not fall below 50%. |
| NFR-06 | Platform: Android; one Docker Compose stack (API and database). |
| NFR-07 | A new user completes the add-subscription flow in under 60 seconds in a usability test (at least 5 participants, at least 4 succeed). |
| NFR-08 | The daily job is idempotent and logs the number of reminders created per run. |

## 3. Input validation rules (from decision D-16)

| Field | Rule |
|---|---|
| `serviceName` | Required; trimmed; 1–100 characters. |
| `amountKurus` | Integer, at least 1. |
| `period` | `monthly` or `yearly`. Any other value, including `weekly`, is `400`. |
| `startDate` | Date of the **first charge** (`YYYY-MM-DD`); renewals start one period after it. Past dates are valid (the user may have subscribed years ago). Future dates are valid up to 366 days from today. The earliest accepted date is 2000-01-01. Anything else is `400`. |
| `email` | Valid email format, at most 254 characters, case-insensitive uniqueness. |
| `password` | At least 8 characters. |

## 4. Traceability matrix

| Requirement | Story / issue | API operation | UI screen | Acceptance tests | Evidence |
|---|---|---|---|---|---|
| FR-01 | US-01 / #9 | `registerUser` | Login/register | AT-01 to AT-03 | TBD (link PR) |
| FR-02 | US-02 / #10 | `login` | Login/register | AT-04 to AT-06 | TBD |
| FR-03 | US-02, US-04 | all protected operations | all | AT-07, AT-10, AT-11, AT-28 | TBD |
| FR-04 | US-03 / #11 | `createSubscription` | Add form | AT-08, AT-09 | TBD |
| FR-05 | US-06 / #14 | `createSubscription` (409) | Add form (error) | AT-12 to AT-15 | TBD |
| FR-06 | US-07 / #15 | domain logic; shown in create and list | List | AT-18 to AT-21 | TBD |
| FR-07 | US-04 / #12 | `listSubscriptions` | List | AT-11 | TBD |
| FR-08 | US-04 / #12 | `getSubscription` | List (detail) | AT-10 | TBD |
| FR-09 | US-05 / #13 | `cancelSubscription` | List (remove + warning) | AT-16, AT-17 | TBD |
| FR-10 | US-08 / #16 | scheduled job | List (reminder badges) | AT-22 to AT-24, AT-27 | TBD |
| FR-11 | Late addition and catch-up (ADR-002): a reminder is never created for a date earlier than the day the subscription was added. A due reminder that was missed afterwards (the job did not run, or the subscription was added after 09:00 on its reminder date) is made up by the next daily run while the renewal day has not arrived. A subscription added after 09:00 on its 3-day date receives the 3-day reminder at the next run; one added after 09:00 on its 1-day date receives no catch-up for the 1-day reminder. At most one reminder exists per (subscription, renewal date, daysBefore). | D-02 |
| FR-12 | US-05, US-08 | `cancelSubscription`, job | List | AT-26 | TBD |
| FR-13 | US-09 / #17 | `listReminders` | List | AT-28, AT-29 | TBD |

Acceptance scenario identifiers (AT-01 … AT-30) are the Product Owner's identifiers used in the backlog and in the US-08 unit tests (`backend/tests/test_reminders.py`, AT-22 to AT-30). The QA test plan (task T-04, `docs/qa/`) uses its own scenario identifiers (`QA-*`). Expected result of AT-30 (D-02): added after 09:00 on the 3-day date → the 3-day reminder is made up at the next run; added after 09:00 on the 1-day date → no catch-up for the 1-day reminder.

The "Evidence" column is filled with the link to the merged pull request or test run as work is completed. It is empty on purpose: documented is not implemented, and implemented is not tested.
