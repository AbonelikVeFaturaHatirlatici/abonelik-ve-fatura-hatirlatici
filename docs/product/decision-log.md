# Product Decision Log and Product Owner Approval Record

**Project:** Subscription Reminder Mobile Application
**Decision maker:** Zeynep Sude Develi (`zsudedeveli`), Product Owner and Requirements Engineer
**Decision date:** 31 October 2026
**Status key:** *Approved* = decided by the Product Owner. *Acknowledge* = the named role confirms in the pull request review that the decision is consistent with their artifact.

## 1. Decisions

| ID | Decision | Rationale | Status | Acknowledge | Source |
|---|---|---|---|---|---|
| D-01 | **Two reminders** per renewal: 3 days and 1 day before, each created once. | Core value of the product; two prompts give a second chance to act. | Approved | Architect | Issue #16; Architecture v4 |
| D-02 | **Late addition and catch-up rule (as defined in ADR-002).** A reminder is due on `remindOn = renewalDate − daysBefore`. It is created by a daily run once `remindOn` has been reached, and never for a date earlier than the day the subscription was added (added 2 days before renewal → only the 1-day reminder). A due reminder that was missed after the subscription existed (the job did not run, or the subscription was added after 09:00 on its reminder date) is made up by the next run, as long as the renewal day has not arrived: on the renewal day the next renewal date moves to the following period and no reminder is created. Examples: added after 09:00 on its 3-day date → the 3-day reminder is made up at the next run; added after 09:00 on its 1-day date → no catch-up, because the next run falls on the renewal day (a limitation accepted for Sprint 1, ADR-002). Each (subscription, renewal date, daysBefore) is created at most once. | Users who add a subscription late still receive the warnings that are still useful, and no reminder is created for a time that has already passed. The product rule stays simple; the technical detail stays with the Architect. | Approved | Architect (rule follows ADR-002) | Architecture v4; ADR-002; issue #16 |
| D-03 | "Cancel" in the API means **remove from tracking**. The interface warns that the real subscription is not cancelled. | Prevents the user from believing a provider subscription has been stopped. | Approved | none | Issue #13; API summary |
| D-04 | Duplicate rule: same user, same service name (case-insensitive) and same period, active records only. | Allows monthly and yearly plans of one service; allows re-adding after removal. | Approved | Architect (partial unique index) | API summary §2 |
| D-05 | Monthly and yearly periods only; TRY only; amounts as integer kuruş. | Matches survey scope; avoids floating-point errors. | Approved | none | API summary §2 |
| D-06 | Month-end rule: last day of the month, always calculated from the original start date. | Prevents drift (31 Jan → 28 Feb → 31 Mar, not 28 Mar). | Approved | Architect | Architecture v4; ADR-003 |
| D-07 | Mock notifier; reminder status `sent_mock`. | Real push needs a provider and device tokens; out of scope. | Approved | none | Issue #16 |
| D-08 | Reminders appear in each subscription (`reminders` array) **and** in a flat read-only list. Flat list order: `remindOn` descending, then `daysBefore` ascending. | Gives the list screen context and the reminder screen a history. | Approved | Architect, Implementation | Architecture v4 |
| D-09 | A cancelled subscription gets no new reminders; existing reminders stay visible. | Keeps history; stops further prompts. | Approved | Architect | Architecture v4 |
| D-10 | Snoozing (US-10) is out of scope for the first release. | Lowest priority. | Approved | none | Issue #18 |
| D-11 | The daily job runs at 09:00 Europe/Istanbul. | Morning notification time; Turkey uses a fixed UTC+3 offset, so there is no daylight-saving complication. | Approved | Architect, DevOps | API summary §3 |
| D-12 | **MIT License** for original project code. | Short, permissive, suitable for a course prototype; no patent-sensitive component. See proposal §5. | Approved | Team | Proposal |
| D-13 | The repository name (`abonelik-ve-fatura-hatirlatici`) is **kept** (the repository has moved to the `AbonelikVeFaturaHatirlatici` organization; the name is unchanged). Invoices are out of scope (D-22). | Renaming breaks links and the Sprint 1 evidence. | Approved | Scrum Master | Product Pack |
| D-14 | Priorities: **US-08 is P1** (raised from P2); US-06 stays P2. The GitHub label of #16 must be changed from `priority-2` to `priority-1`. | Reminders are the core value; duplicate protection is not. | Approved | Scrum Master (label update) | Product Pack; issue labels |
| D-15 | Initial story points in the backlog are adopted as estimates. The sprint commitment is set by the team at sprint planning, not by the PO. | Estimation belongs to the developers. | Approved | Whole team | Product Pack |
| D-16 | The user enters the **start date = date of the first charge**. Past dates are valid; future dates are valid up to 366 days ahead; earliest date 2000-01-01. Renewals start **one period after** the start date: `nextRenewalDate` is the earliest date of the series *start + k × period* (k ≥ 1) that is **after** today. If today is a renewal date, the next period is used; if the start date is in the future, the first renewal is start + 1 period. | Users often subscribed years ago. The API keeps one date field, and the rule is the one confirmed by the Architect. | Approved | Architect (contract), Implementation | Open item 4 of the PO review; Architect answer |
| D-17 | The single-subscription view (`getSubscription`, FR-08) is part of **US-04**. No new story. | Same screen and same data; avoids a story of one point. | Approved | Architect | FR-08 |
| D-18 | Git-Flow base branch: feature branches start from `develop`. `main` receives only reviewed, tagged versions. `docs/CONTRIBUTING.md` was aligned with this rule (done in PR #3). | Matches the Sprint 1 assignment and Architecture v4. | Approved | DevOps, Architect | Architecture v4; CONTRIBUTING |
| D-19 | Error messages are shown in **Turkish**; error `code` values are stable English identifiers. | The users are Turkish-speaking; codes stay machine-readable. A single UI language is consistent with "multilingual UI" being out of scope. | Approved | Architect | API summary §5 item 6 |
| D-20 | PO interview document v2 and Architecture v2 are **superseded** (they say "one reminder"). They stay unchanged as history and receive a revision note. | Keeps history; prevents a wrong rule from being read as current. | Approved | Architect | Revision notes |
| D-21 | Scrum Master is Nesibe Sakar (`ynessakar`). The RACI document and the escalation guide replace "to be assigned" with this name. | Assigned in issue #24. | Approved | Scrum Master | Issue #24 |
| D-22 | **Invoices and bills are out of scope** for the first release and may be added in a later release. The first release tracks subscriptions only. The repository name, which contains "fatura" (invoice), is kept (D-13). | Prevents readers of the repository name from expecting invoice features; keeps the first release small. | Approved | Scrum Master | Architect review of the Sprint 1 package |

## 2. Product Owner approval record

I, the Product Owner, approve the decisions D-01 to D-22 above, the requirements in [03-requirements.md](03-requirements.md), the scope in [02-system-vision-and-boundary.md](02-system-vision-and-boundary.md), and the behaviours of the API contract in [api/openapi.yaml](../../api/openapi.yaml) as the definition of the first release.

| Item | Value |
|---|---|
| Approved by | Zeynep Sude Develi (`zsudedeveli`), Product Owner and Requirements Engineer |
| Date | 31 October 2026 |
| Evidence | This file, merged through a pull request with a non-author reviewer |
| Contract note | The PO approves the *behaviour* in the contract. The contract itself remains owned by the Lead Architect; every change to it goes through the Architect. |

## 3. Open items after these decisions

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Architect confirms that D-02 and D-16 match ADR-002 and Architecture v4. | Architect | Done |
| 2 | `api/openapi.yaml` is the baseline contract; differences applied by the Architect. | Architect | Done (PR #36, PR #39) |
| 3 | Label of issue #16 changed to `priority-1` (D-14). | Scrum Master | Done |
| 4 | Three screen drafts and PO approval. | Implementation, PO | Done (PR #34) |
| 5 | Ruleset and CI evidence for issue #20. | Architect | Done (`docs/process/evidence/`) |
| 6 | Fill in the contribution table in the submission file after the last pull requests are merged. | Scrum Master, Architect | In progress |
