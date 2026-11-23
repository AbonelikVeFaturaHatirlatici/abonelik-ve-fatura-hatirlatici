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
| Figma prototype (view link) | [Clickable prototype](https://www.figma.com/proto/zLadyqszvs7lVNyQWzMO9A/Untitled?node-id=1-215&p=f&t=BNO0PVdAVM6gcWR1-0&scaling=min-zoom&content-scaling=fixed&page-id=1%3A3&starting-point-node-id=1%3A215) · [Figma design file](https://www.figma.com/design/zLadyqszvs7lVNyQWzMO9A/Untitled) (view-only) |
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
| 3 | Figma UI/UX prototypes with user-flow diagrams | Figma links (above); [`docs/product/08-user-flows-and-prototype-spec.md`](product/08-user-flows-and-prototype-spec.md) (user flows F1 to F6, five screens, text catalogue); usability test record [`docs/qa/usability-test-sprint-2.md`](qa/usability-test-sprint-2.md) | Product Owner | Implementation, QA |
| 4 | Software architecture documentation: C4 model and UML diagrams | [`c4-diyagramlar.md`](architecture/c4-diyagramlar.md) (C4 levels 1 to 3: context, containers, backend and mobile components), [`uml.md`](architecture/uml.md) (class, sequence, state and deployment diagrams); [ADR-001 to ADR-004](adr/); [database schema](architecture/db-semasi.md) | Lead Architect | Product Owner, DevOps |
| 5 | Android application skeleton (React Native with Expo): five screens, navigation, typed API client generated from the contract, JWT in secure storage | [`mobile/`](../mobile/) ([README](../mobile/README.md)); issue [#23](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/23) | Implementation | DevOps (Expo setup and CI), Product Owner (screens) |
| – | API contract (baseline from Sprint 1) | [`api/openapi.yaml`](../api/openapi.yaml) | Lead Architect | Product Owner |
| – | QA test plan and scenarios | [`docs/qa/test-plan.md`](qa/test-plan.md), [`docs/qa/test-cases.md`](qa/test-cases.md) | QA | Product Owner |

## Consistency statement

All Sprint 2 documents describe the same first release as Sprint 1: two reminders (3 and 1 day before renewal), monthly and yearly periods, TRY only, seven API operations, a mock notifier and no snoozing. Changes made in Sprint 2 are listed in [`docs/product/revision-notes.md`](product/revision-notes.md) and in section 9 of the backlog: five screens instead of three (D-23), a client-side sign-out story US-11 (D-24), amount entry in lira (D-26) and the quality bar (D-27). None of them changes the OpenAPI contract. Every functional requirement is traced to a story, a use case, an API operation, a screen and acceptance scenarios in section 4.1 of the SRS.

## Evidence links

| Evidence | Link |
|---|---|
| Issues and tasks of the sprint (milestone `Sprint-2`) | [Sprint-2 issues](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-2) |
| Backlog stories for the first release (milestone `Sprint-3`) | [Sprint-3 issues](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-3) |
| Pull request: SRS, NFR, backlog, user flows, usability test (Product Owner) | [#56](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/56) |
| Pull requests: C4 and UML architecture documents (Architect; deployment diagram by DevOps) | [#54](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/54) (C4), [#55](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/55) (UML), [#70](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/70) (ADR-002, UML and C4 aligned with the code) |
| Pull requests: Android skeleton (Implementation, DevOps) | [#64](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/64) (Expo setup and mobile CI), [#67](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/67) (five screens and navigation), [#68](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/68) (typed API client, SecureStore) |
| Pull request: sprint calendar and impediment log (Scrum Master) | [#66](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/66) |
| Pull request: repository clean-up, `develop` into `main` (DevOps, Architect) | Linked from issue [#63](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/63) and from the [`sprint2` release page](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/releases/tag/sprint2) |
| Pull request: Sprint 2 submission file and evidence (Scrum Master) | Linked from issue [#62](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues/62) |
| Usability test record | [`docs/qa/usability-test-sprint-2.md`](qa/usability-test-sprint-2.md) |
| CI status of `develop` (ruff, pytest, Spectral) | [GitHub Actions](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/actions) |
| Ruleset evidence (from Sprint 1) | [`docs/process/evidence/`](process/evidence/) |
| Commit history / contributors | [Commits on `main`](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/commits/main), [Contributors](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/graphs/contributors) |
| Release `sprint2` | [`sprint2`](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/releases/tag/sprint2) |

## Individual contributions (Sprint 2)

The repository history is intact: no history was rewritten and no force push was used. Counts are taken from `develop` on 21 November 2026 (period 3 to 21 November), before the final merge into `main`; commits include merge commits; "Pull requests reviewed" counts the merged Sprint 2 pull requests each member reviewed (GitHub search `is:pr is:merged merged:>=2026-11-03 reviewed-by:<user>`). Commands to reproduce the counts are in section 6 of the workflow document.

| Member | Sprint 2 work (issues) | Pull requests merged in Sprint 2 | Commits | Pull requests reviewed |
|---|---|---|---|---|
| Zeynep Sude Develi | T-07 #57, T-08 #58, T-09 #59, T-11 #61; US-11 #69 | 1 (#56) | 1 | 0 |
| Nesibe Sakar | T-12 #62 (sprint calendar, impediment log, milestones, submission file) | 1 (#66) | 1 | 0 |
| Yusuf Buğra Yaman | T-10 #60 (C4, UML, ADR-002 update) | 3 (#54, #55, #70) | 8 | 7 (#40, #56, #64, #65, #66, #67, #68) |
| Nadir Efe Taşkıran | QA test plan and scenarios (#40) | 1 (#40) | 3 | 5 (#54, #55, #56, #68, #70) |
| Ahmet Talha Akyol | Expo setup and mobile CI (#64), deployment diagram in T-10 (#55), T-13 #63 | 1 (#64) | 2 | 0 |
| Emre Alay | T-05 #23 (Android skeleton, API client); backend services (#65) | 3 (#65, #67, #68) | 3 | 0 |

Note on commit counts: pull requests #56, #65 and #68 were merged with squash, so each appears as one commit on `develop`; the original commits are listed on the pull request pages (#56 had 13 commits). Commits of pull request #40 were made before 3 November and are not counted in this period.

Note: `git shortlog` lists some authors under their local Git names (Nadir Efe Taşkıran as "JeniusD1", Emre Alay as "Ea007"). GitHub links these commits to the correct accounts through the commit e-mail addresses.
