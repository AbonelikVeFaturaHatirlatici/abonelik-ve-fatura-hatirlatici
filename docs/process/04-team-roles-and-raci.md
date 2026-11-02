# Team Roles and RACI Matrix

**Project:** Subscription Reminder Mobile Application
**Team number:** 11
**Version / date:** 1.0 · 31 October 2026
**Prepared by:** Zeynep Sude Develi (`zsudedeveli`), Product Owner · **Accountable for this document:** Scrum Master (Nesibe Sakar)

## 1. Team members and roles

| Role | Member | GitHub |
|---|---|---|
| Product Owner and Requirements Engineer | Zeynep Sude Develi | `zsudedeveli` |
| Scrum Master | Nesibe Sakar | `ynessakar` |
| Lead Architect and Tech Lead | Yusuf Buğra Yaman | `ybyaman` |
| QA and Test Automation Engineer | Nadir Efe Taşkıran | `nadirtaskiran` |
| DevOps and CI/CD Engineer | Ahmet Talha Akyol | `AhmeTalhAkyol` |
| Implementation and Integration Engineer | Emre Alay | `Faldozn` |

Every member works from an individual GitHub account so that contributions are traceable.

## 2. Responsibilities by area

| Area | Role | Responsibilities |
|---|---|---|
| **Product** | Product Owner | Problem definition, stakeholder analysis, scope, requirements, backlog order, acceptance of stories, decision log, license proposal. |
| **Process** | Scrum Master | Sprint calendar and ceremonies, RACI upkeep, impediment removal, sprint evidence and release tag, label hygiene. |
| **Architecture** | Lead Architect | OpenAPI contract (single owner), database design, architecture decisions, review of contract changes (requested automatically through CODEOWNERS; a team agreement, not enforced by the ruleset). |
| **Quality** | QA Engineer | Test plan, acceptance tests, test automation, coverage gate, verification of Definition of Done. |
| **DevOps** | DevOps Engineer | Repository rulesets, branch protection, CI pipeline, Docker Compose stack, dependency license inspection. |
| **Implementation** | Implementation Engineer | Backend and Android implementation against the contract, unit tests, pull requests that link issues. |

Concentration risk R1: backend and mobile both rest on one person. Mitigation: contract-first work so mobile can use mock responses; the Architect supports backend work; tasks are re-balanced at sprint planning.

## 3. RACI matrix

R = Responsible (does the work) · A = Accountable (owns the result and approves it; exactly one per row) · C = Consulted (two-way input before) · I = Informed (told afterwards).
"A/R" means the same person is accountable and also does the work.

| # | Activity | PO | SM | Architect | QA | DevOps | Impl. |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 | Project proposal and problem definition | A/R | C | C | I | I | C |
| 2 | System vision, boundary and scope | A/R | C | R | I | I | C |
| 3 | Open-source license selection | A/R | I | C | I | C | C |
| 4 | Requirements and acceptance criteria | A/R | C | C | R | I | C |
| 5 | Product backlog and priorities | A/R | C | C | C | I | C |
| 6 | OpenAPI contract draft and changes | C | I | A/R | C | I | R |
| 7 | Approval of contract behaviour (product rules) | A/R | I | C | C | I | I |
| 8 | Team roles and RACI matrix | C | A/R | C | I | I | I |
| 9 | Git-Flow policy, rulesets, branch protection | I | C | A | C | R | C |
| 10 | CI pipeline and required checks (T-02) | I | I | A/R | C | C | C |
| 11 | Database schema and migration (T-03) | I | I | A | C | R | C |
| 12 | Test plan and acceptance test suite (T-04) | C | I | C | A/R | C | C |
| 13 | Android application skeleton (T-05) | C | I | A | C | C | R |
| 14 | Backend and mobile implementation of stories | C | I | A | C | C | R |
| 15 | Sprint calendar and ceremonies (T-06) | C | A/R | I | I | I | I |
| 16 | Sprint 1 evidence, links and release tag | C | A | C | C | R | C |

Row check: each row has exactly one **A**.

### Notes

- **Row 7.** The contract belongs to the Architect (row 6). The PO approves the *behaviour* the contract describes; this approval is recorded in the decision log.
- **Code review.** Every pull request needs a reviewer who is not the author. Documentation pull requests by the PO are reviewed by the Architect; the reviewer is named in the pull request before it is opened.
- **Escalation.** A disagreement is first raised with the Scrum Master. If it concerns scope or priority, the PO decides; if it concerns the contract or architecture, the Architect decides. Decisions are recorded in the decision log.
- **Scrum Master.** The Scrum Master is Nesibe Sakar (issue #24, decision D-21).
