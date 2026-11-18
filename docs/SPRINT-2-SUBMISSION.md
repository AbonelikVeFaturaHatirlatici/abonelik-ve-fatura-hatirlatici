# BM 321 / SENG 321 · Sprint 2 Submission

Submission deadline: 24 November 2026 · Sprint 2 weight: 20% · Sprint 1 submission: [`SPRINT-1-SUBMISSION.md`](SPRINT-1-SUBMISSION.md)

## Team and project

| Field | Value |
|---|---|
| Team number | 11 |
| Project name | Subscription Reminder Mobile Application |
| GitHub repository | https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici |
| Sprint 2 release tag | `sprint2` → [release page](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/releases/tag/sprint2) *(created by DevOps after `develop` is merged into `main`)* |
| Sprint 1 release tag | `sprint1` → [release page](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/releases/tag/sprint1) |
| Figma prototype (view link) | *(enter the link; the file is shared with "anyone with the link can view")* |
| License | MIT (`LICENSE`) |

| Member | Role | GitHub |
|---|---|---|
| Zeynep Sude Develi | Product Owner and Requirements Engineer | `zsudedeveli` |
| Nesibe Sakar | Scrum Master | `ynessakar` |
| Yusuf Buğra Yaman | Lead Architect and Tech Lead | `ybyaman` |
| Nadir Efe Taşkıran | QA and Test Automation Engineer | `nadirtaskiran` |
| Ahmet Talha Akyol | DevOps and CI/CD Engineer | `AhmeTalhAkyol` |
| Emre Alay | Implementation and Integration Engineer | `Faldozn` |

## Deliverables

| # | Required deliverable | Files and links | Owner (A) | Consulted |
|---|---|---|---|---|
| 1 | Detailed Software Requirements Specification (SRS) and refined Product Backlog | [`docs/product/03-requirements.md`](product/03-requirements.md) (SRS 2.0), [`docs/product/06-product-backlog.md`](product/06-product-backlog.md) (backlog 2.0), [`docs/product/decision-log.md`](product/decision-log.md) (D-01 to D-27) | Product Owner | Architect, QA |
| 2 | Non-functional requirements and quality-measure specification | [`docs/product/07-nonfunctional-requirements.md`](product/07-nonfunctional-requirements.md) | Product Owner | Architect, QA, DevOps |
| 3 | Figma UI/UX prototypes with user-flow diagrams | Figma view link (above); [`docs/product/08-user-flows-and-prototype-spec.md`](product/08-user-flows-and-prototype-spec.md) (user flows F1 to F6, five screens, text catalogue); usability test record [`docs/qa/usability-test-sprint-2.md`](qa/usability-test-sprint-2.md) | Product Owner | Implementation, QA |
| 4 | Software architecture documentation: C4 model and UML diagrams | [`docs/architecture/`](architecture/) *(list the files: C4 levels 1 to 3 and the UML diagrams, entered by the Architect)*; [ADR-001 to ADR-004](adr/); [database schema](architecture/db-semasi.md) | Lead Architect | Product Owner, DevOps |
| – | API contract (baseline from Sprint 1) | [`api/openapi.yaml`](../api/openapi.yaml) | Lead Architect | Product Owner |
| – | QA test plan and scenarios | [`docs/qa/test-plan.md`](qa/test-plan.md), [`docs/qa/test-cases.md`](qa/test-cases.md) | QA | Product Owner |

## Consistency statement

All Sprint 2 documents describe the same first release as Sprint 1: two reminders (3 and 1 day before renewal), monthly and yearly periods, TRY only, seven API operations, a mock notifier and no snoozing. Changes made in Sprint 2 are listed in [`docs/product/revision-notes.md`](product/revision-notes.md) and in section 9 of the backlog: five screens instead of three (D-23), a client-side sign-out story US-11 (D-24), amount entry in lira (D-26) and the quality bar (D-27). None of them changes the OpenAPI contract. Every functional requirement is traced to a story, a use case, an API operation, a screen and acceptance scenarios in section 4.1 of the SRS.

## Evidence links

| Evidence | Link |
|---|---|
| Issues and tasks of the sprint (milestone `Sprint-2`) | [Sprint-2 issues](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-2) |
| Backlog stories (milestone `Sprint-1` and later `Sprint-3`) | [Sprint-1 issues](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-1) |
| Pull request: SRS, NFR, backlog, user flows (Product Owner) | *(enter the pull request link when opened)* |
| Pull request: C4 and UML architecture document (Architect) | *(enter the pull request link)* |
| Pull request: repository clean-up, `develop` into `main` (DevOps, Architect) | *(enter the pull request link)* |
| Pull request: Sprint 2 submission file and evidence (Scrum Master) | *(enter the pull request link)* |
| Usability test record | [`docs/qa/usability-test-sprint-2.md`](qa/usability-test-sprint-2.md) |
| CI status of `develop` (ruff, pytest, Spectral) | [GitHub Actions](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/actions) |
| Ruleset evidence (from Sprint 1) | [`docs/process/evidence/`](process/evidence/) |
| Commit history / contributors | [Commits on `main`](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/commits/main), [Contributors](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/graphs/contributors) |
| Release `sprint2` | [`sprint2`](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/releases/tag/sprint2) |

## Individual contributions (Sprint 2)

The repository history is intact: no history was rewritten and no force push was used. Counts are taken from `main` after the final merge on *(enter the date)*; commits include merge commits; "Approving reviews" counts approvals recorded on the Sprint 2 pull requests. Commands to reproduce the counts are in section 6 of the workflow document.

| Member | Sprint 2 work (issues) | Pull requests merged in Sprint 2 | Commits | Approving reviews given |
|---|---|---|---|---|
| Zeynep Sude Develi | T-07, T-08, T-09, T-11 | *(enter)* | *(enter)* | *(enter)* |
| Nesibe Sakar | T-12 | *(enter)* | *(enter)* | *(enter)* |
| Yusuf Buğra Yaman | T-10 | *(enter)* | *(enter)* | *(enter)* |
| Nadir Efe Taşkıran | usability test support, QA mapping of AT to QA scenarios | *(enter)* | *(enter)* | *(enter)* |
| Ahmet Talha Akyol | T-13 | *(enter)* | *(enter)* | *(enter)* |
| Emre Alay | T-05 | *(enter)* | *(enter)* | *(enter)* |

Note: `git shortlog` lists some authors under their local Git names (Nadir Efe Taşkıran as "JeniusD1", Emre Alay as "Ea007"). GitHub links these commits to the correct accounts through the commit e-mail addresses.
