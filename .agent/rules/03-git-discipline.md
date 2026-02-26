---
description: Git workflow and commit discipline rules
alwaysApply: true
---

# Git Discipline Rules

## Branch Strategy
- `main` — Production-ready code. Tagged releases only. Never commit directly.
- `develop` — Integration branch. All feature branches merge here via PR.
- `feature/<name>` — New features. Branch from `develop`.
- `bugfix/<name>` — Bug fixes. Branch from `develop`.
- `refactor/<name>` — Refactoring. Branch from `develop`.
- `hotfix/<name>` — Critical production fixes. Branch from `main`, merge to both `main` and `develop`.

## Conventional Commits
All commit messages MUST follow this format:
```
<type>(<scope>): <description>

[optional body]
```

Types:
- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code restructuring (no behavior change)
- `test` — Adding or updating tests
- `docs` — Documentation changes
- `chore` — Build, CI, dependency updates
- `style` — Formatting, whitespace (no logic change)

Examples:
```
feat(auth): add JWT token refresh mechanism
fix(api): handle null response from payment gateway
test(user): add edge case tests for email validation
refactor(db): extract query builder from repository
```

## Commit Rules
- **Atomic commits** — One logical change per commit
- **Commit message explains WHY**, not just what
- **Never force push** to shared branches
- **Never use `--no-verify`** to bypass hooks
- **Never commit** generated files, secrets, or `.env` files
- **Squash** WIP commits before merging to develop

## Before Every Commit
1. Run the linter/formatter
2. Run the full test suite
3. Self-review the diff
4. Verify the commit message follows conventional format
