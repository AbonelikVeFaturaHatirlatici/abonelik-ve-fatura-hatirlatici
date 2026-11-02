# Contributing

This is a short summary. The full workflow is in [`process/05-git-flow-and-repository-workflow.md`](process/05-git-flow-and-repository-workflow.md).

## Branches

| Branch | Purpose |
|---|---|
| `main` | Sprint deliveries. Every delivery gets a **tag** (`sprint-1`, `sprint-2`, ...). |
| `develop` | Integration branch where finished work is merged. |
| `feature/US-xx-short-name` | One story, defect or technical task. Created from `develop`, merged back into `develop`. |

Branch name examples: `feature/US-12-add-subscription`, `fix/US-15-month-end`, `chore/ci-setup`. `release` and `hotfix` branches are not used.

## Daily workflow

1. Open an **issue** for the work (user story or bug template).
2. Create a branch from `develop`:

   ```bash
   git checkout develop && git pull
   git checkout -b feature/US-12-add-subscription
   ```

3. Make small commits. Message format: `feat: add subscription endpoint` (types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `ci`). The issue is linked in the pull request description.
4. Open a pull request. **The target is always `develop`**: `gh pr create --base develop`. Fill in the template and link the issue: use `Closes #12` if the pull request finishes the work, and `Refs #12` if it only contributes to it.
5. At least **one teammate's approval** is required. The author cannot approve their own pull request. A new commit dismisses earlier approvals.
6. Delete the branch after merging.

## Sprint delivery

1. At the end of the sprint, a `develop` → `main` pull request is opened (1 approval).
2. After the merge, `main` is tagged: `git tag sprint-1 && git push origin sprint-1`.
3. The Scrum Master collects the delivery evidence: team, repository, tag, role owners, issue and pull request links, document links.

## Rules

- There are no direct pushes to `main` or `develop`. Force pushes and branch deletion are blocked.
- Date calculations, state transitions and changes to `api/openapi.yaml` are reviewed by the Lead Architect.
- The OpenAPI contract is updated before the code (API-first).
- Test coverage must not fall below 50%.
