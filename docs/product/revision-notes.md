# Revision Notes for Superseded Documents

**Owner:** Zeynep Sude Develi (`zsudedeveli`), Product Owner · **Date:** 31 October 2026 · **Decision:** D-20

The documents below are kept unchanged as history. Add the matching note at the top of each document.

## Note for "PO Interview Document v2"

> **Revision note (31 October 2026).** This document is an Architect-authored proposal and question sheet. It is **not** a record of interview answers, and the survey respondents did not ask for any reminder rule. The statements below changed after v2 and are superseded by Architecture v4, issue #16 and the Product Owner decision log (D-01, D-02):
>
> | Statement in v2 | Current rule |
> |---|---|
> | One reminder, 3 days before renewal; second reminder out of scope | Two reminders, 3 days and 1 day before renewal, each once (D-01) |
> | Success criterion: exactly one reminder 3 days before | One reminder per day-offset, each at most once |
> | Invalid input returns 400 or 422; past renewal date is invalid | Invalid input is always 400. Past start dates are valid (D-16) |
>
> All other statements (monthly/yearly, TRY, three screens, MIT license, mock notifier, duplicate rule) remain consistent with later documents.

## Note for "Technical Architecture v2"

> **Revision note (31 October 2026).** This version describes one reminder per renewal. It is **superseded** by Technical Architecture v4 (the current version; v3 already described two reminders). See the decision log, D-01, D-02 and D-20.

---

# Sprint 2 revision notes (17 November 2026)

**Owner:** Zeynep Sude Develi (`zsudedeveli`), Product Owner

These notes record how the Sprint 2 documents relate to the Sprint 1 documents, so that history stays readable.

| Sprint 1 document | Sprint 2 change |
|---|---|
| `03-requirements.md` version 1.0 (Requirements Specification and Traceability) | Replaced in place by the **Software Requirements Specification, version 2.0**. FR-01 to FR-13 keep their identifiers and meaning; FR-14, FR-15, use cases, UI requirements, business rules, data requirements and the error catalogue are new. The eight short NFRs of section 2 moved to `07-nonfunctional-requirements.md` (mapping in its section 7). Version 1.0 remains in the Git history (tag `sprint1`). |
| `06-product-backlog.md` version 1.0 | Replaced in place by **version 2.0**: status column, US-11, Sprint 3 proposal, Sprint 2 tasks, Definition of Ready check. Story points are unchanged. See section 9 of the backlog. |
| `ekran-taslaklari.md` (three screen drafts, PR #34) | **Superseded** by `08-user-flows-and-prototype-spec.md` (five screens). The file stays as history; a revision note at its top points to the new document. |

Other documents are unchanged by Sprint 2 and remain valid: the proposal, the system vision and boundary, the decision log (extended with D-23 to D-27), the OpenAPI contract and the ADRs.
