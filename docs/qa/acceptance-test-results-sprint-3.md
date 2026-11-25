# Acceptance Test Results: Sprint 3 (MVP)

**Owner:** Zeynep Sude Develi (`zsudedeveli`), Product Owner · **Support:** Nadir Efe Taşkıran (`nadirtaskiran`), QA
**Scenarios:** AT-01 to AT-34, defined in [06-product-backlog.md](../product/06-product-backlog.md) and traced in [03-requirements.md](../product/03-requirements.md)
**Tested version:** (enter the commit hash or tag, e.g. `sprint3`) · **Test date:** (enter date) · **Environment:** (enter: local Docker / hosted link; Expo Go or emulator)

## 1. How to fill in this table

- **Method:** `API` = call the operation (for example in the Swagger page `/docs`); `App` = use the mobile app; `Job` = run the reminder job; `Unit test` = covered by an automated test (write the test file name in Evidence).
- **Result:** write `Pass`, `Fail` or `Not run`.
- **Evidence:** a short note, a screenshot name, or the issue number of the bug opened for a `Fail`.

## 2. Results

| AT | User story | Scenario (expected result) | Method | Result | Tester | Evidence / bug issue |
|---|---|---|---|---|---|---|
| AT-01 | US-01 | Valid email and password (8+ chars) → 201, account created, password hashed | API | Not run | | |
| AT-02 | US-01 | Invalid email, short password or missing field → 400 with {code, message} | API | Not run | | |
| AT-03 | US-01 | Email already registered (case-insensitive) → 409, no second account | API | Not run | | |
| AT-04 | US-02 | Valid credentials → 200 with a JWT | API | Not run | | |
| AT-05 | US-02 | Wrong password and unknown email → 401 with the same message | API | Not run | | |
| AT-06 | US-02 | Malformed login body → 400 | API | Not run | | |
| AT-07 | US-02 | GET /subscriptions, POST /subscriptions, GET /reminders without token → 401 | API | Not run | | |
| AT-08 | US-03 | Netflix, 22999 kuruş, monthly, valid start date → 201 with nextRenewalDate | API | Not run | | |
| AT-09 | US-03 | Amount 0/negative, empty name, 101-char name, weekly, missing or out-of-range start date → 400 | API | Not run | | |
| AT-10 | US-04 | GET /subscriptions/{id} of another user or unknown id → 404 (not 403) | API | Not run | | |
| AT-11 | US-04 | List shows only the caller's subscriptions with name, amount, period, next renewal date, reminders | API + App | Not run | | |
| AT-12 | US-06 | Active 'Netflix / monthly' exists; adding 'netflix / monthly' → 409, nothing created | API + App | Not run | | |
| AT-13 | US-06 | Same service with period yearly → 201 | API | Not run | | |
| AT-14 | US-06 | Another user adds the same service and period → 201 | API | Not run | | |
| AT-15 | US-06 | After removal, the same service and period can be added again → 201 | API | Not run | | |
| AT-16 | US-05 | Cancel an active owned subscription → 200, status cancelled; app shows the 'provider not cancelled' warning | API + App | Not run | | |
| AT-17 | US-05 | Cancel twice → 409; unknown or foreign id → 404 | API | Not run | | |
| AT-18 | US-07 | Monthly, start 31 Jan 2027 → 28 Feb 2027, then 31 Mar 2027 | API / Unit test | Not run | | |
| AT-19 | US-07 | Monthly, start 31 Jan 2028 (leap year) → 29 Feb 2028, then 31 Mar 2028 | API / Unit test | Not run | | |
| AT-20 | US-07 | Yearly, start 29 Feb 2028 → 28 Feb 2029, 2030, 2031, then 29 Feb 2032 | API / Unit test | Not run | | |
| AT-21 | US-07 | Monthly, start 31 Jan, consecutive months → 31 Mar, 30 Apr, 31 May (no drift) | API / Unit test | Not run | | |
| AT-22 | US-08 | Job on renewalDate − 3 → one 3-day reminder with status sent_mock | Job / Unit test | Not run | | |
| AT-23 | US-08 | Job on renewalDate − 1 → one 1-day reminder | Job / Unit test | Not run | | |
| AT-24 | US-08 | Job run twice for the same date → no duplicate rows | Job / Unit test | Not run | | |
| AT-25 | US-08 | Subscription added 2 days before renewal → only the 1-day reminder | Job / Unit test | Not run | | |
| AT-26 | US-05 / US-08 | Cancel, then run the job in the reminder window → no new reminder; earlier reminders stay visible | Job + App | Not run | | |
| AT-27 | US-08 | After the renewal date passes, the next cycle gets its own two reminders | Job / Unit test | Not run | | |
| AT-28 | US-09 | Only the caller's reminders, newest remindOn first; no token → 401 | API + App | Not run | | |
| AT-29 | US-09 | POST, PUT, PATCH, DELETE on /reminders → 405 | API | Not run | | |
| AT-30 | US-08 | Added after 09:00 on its 3-day date → made up at next run; after 09:00 on its 1-day date → no catch-up; thresholds before the add date are never created | Job / Unit test | Not run | | |
| AT-31 | US-11 | 'Çıkış Yap': token deleted, S1 shown, back button does not return to list, no server call | App | Not run | | |
| AT-32 | US-11 | Any call returns 401 → token deleted, S1 shown, message 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.' | App | Not run | | |
| AT-33 | US-03 | Amount typed in lira (229,99 or 229.99) is sent as 22999 | App | Not run | | |
| AT-34 | US-03 | Amount with more than 2 decimals, zero, negative or not a number is rejected on the device; nothing is sent | App | Not run | | |

## 3. Summary

| Item | Value |
|---|---|
| Scenarios passed | (enter) of 34 |
| Scenarios failed | (enter); bug issues: (enter numbers) |
| Scenarios not run | (enter) and the reason |
| User stories accepted by the Product Owner | (list US-xx that fully pass) |

## 4. Product Owner decision

(Write one short paragraph after testing: which user stories are accepted for the MVP, which are not, and what happens to the failed ones.)
