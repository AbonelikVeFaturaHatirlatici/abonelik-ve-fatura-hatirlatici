# SENG 321 · Sprint 1 Submission

## Team and project

| Field | Value |
|---|---|
| Team number | 11 |
| Project name | Subscription Reminder Mobile Application |
| GitHub repository | https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici |
| OpenAPI file | `api/openapi.yaml` |
| Sprint 1 release tag | `sprint-1` → [release page](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/releases/tag/sprint-1) |
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

| # | Deliverable | File | Owner (A) |
|---|---|---|---|
| 1 | Project Proposal | [`docs/product/01-project-proposal.md`](product/01-project-proposal.md) | PO |
| 2 | System Vision and Boundary | [`docs/product/02-system-vision-and-boundary.md`](product/02-system-vision-and-boundary.md) | PO |
| 3 | OpenAPI Draft | [`api/openapi.yaml`](../api/openapi.yaml) | Architect |
| 4 | Team Roles and RACI Matrix | [`docs/process/04-team-roles-and-raci.md`](process/04-team-roles-and-raci.md) | Scrum Master |
| 5 | GitHub Repository and Git-Flow Workflow | [`docs/process/05-git-flow-and-repository-workflow.md`](process/05-git-flow-and-repository-workflow.md) | Architect |
| 6 | Initial Product Backlog | [`docs/product/06-product-backlog.md`](product/06-product-backlog.md) | PO |
| – | Requirements and traceability | [`docs/product/03-requirements.md`](product/03-requirements.md) | PO |
| – | Decision log and PO approval | [`docs/product/decision-log.md`](product/decision-log.md) | PO |

## Consistency statement

All documents describe the same first release: two reminders (3 and 1 day before), monthly and yearly periods, TRY only, seven API operations, mock notifier, snooze out of scope. Documents that still say "one reminder" are marked superseded in `docs/product/revision-notes.md`.

## Evidence links

| Evidence | Link |
|---|---|
| Issues (stories #9–#18, tasks #19–#24, milestone `Sprint-1`) | [Sprint-1 issues](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/issues?q=is%3Aissue+milestone%3ASprint-1) |
| Pull request: product documents and RACI (PO) | [PR #35](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/35) |
| Pull requests: OpenAPI contract (Architect) | [PR #5](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/5) (draft), [PR #36](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/36) (field limits) |
| Pull request: Git-Flow and repository workflow (Architect) | [PR #31](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/pull/31) |
| Ruleset screenshots and required checks (issue #20) | [1 · targets and bypass list](process/evidence/ruleset-1-genel-ve-hedefler.png), [2 · deletion and force push](process/evidence/ruleset-2-silme-ve-force-push.png), [3 · pull request and status check details](process/evidence/ruleset-3-pr-ve-kontrol-ayrintilari.png) |
| Commit history / contributors graph | [Commits on `main`](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/commits/main), [Contributors](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/graphs/contributors) |
| Sprint 1 release tag | [`sprint-1`](https://github.com/AbonelikVeFaturaHatirlatici/abonelik-ve-fatura-hatirlatici/releases/tag/sprint-1) |

## Individual contributions

Counts are taken from the repository history on 1 November 2026 (`develop`). Commits include merge commits. "Approving reviews" counts the approvals recorded on pull requests #1–#37 (peer review). Commands to reproduce them are in section 6 of the workflow document.

| Member | Issues (assignee) | Pull requests (merged) | Commits | Approving reviews given |
|---|---|---|---|---|
| Zeynep Sude Develi | #18 | #35 | 2 | 1 |
| Nesibe Sakar | #24 | – | 0 | 3 |
| Yusuf Buğra Yaman | #15, #16, #17, #20 | #1–#8, #25, #26, #28, #30, #31, #32, #33, #36, #37 (17) | 36 | 5 |
| Nadir Efe Taşkıran | #22 | #27 | 3 | 5 |
| Ahmet Talha Akyol | #19 | #29 | 5 | 4 |
| Emre Alay | #9–#14, #21, #23 | #34 | 2 | 6 |

Note: `git shortlog` lists some authors under their local Git names (Nadir Efe Taşkıran as "JeniusD1", Emre Alay as "Ea007"). GitHub links these commits to the correct accounts through the commit e-mail addresses.
