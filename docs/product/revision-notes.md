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
