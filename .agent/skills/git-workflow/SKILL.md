---
name: git-workflow
description: Git operations helper. Handles branch creation, conventional commit messages, PR descriptions, and merge strategy guidance aligned with project git discipline rules.
---

# Git Workflow Skill

## When to Use
- Creating a new branch for a task
- Crafting commit messages
- Preparing a Pull Request description
- Deciding merge strategy

## Branch Creation

### From a Task in IMPLEMENTATION_PLAN.md
1. Determine the branch type from the task:
   - New feature → `feature/<short-name>`
   - Bug fix → `bugfix/<short-name>`
   - Refactoring → `refactor/<short-name>`
   - Hot fix → `hotfix/<short-name>`

2. Create the branch:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/<short-name>
   ```

3. Naming rules:
   - All lowercase
   - Use hyphens as separators
   - Be descriptive but concise
   - Examples: `feature/user-authentication`, `bugfix/null-pointer-on-login`, `refactor/extract-query-builder`

## Conventional Commit Messages

### Format
```
<type>(<scope>): <description>

[optional body explaining WHY, not WHAT]

[optional footer: Breaking changes, issue references]
```

### Building the Message
1. **Type**: What kind of change?
   - `feat` — New feature (triggers minor version bump)
   - `fix` — Bug fix (triggers patch version bump)
   - `refactor` — Code restructuring (no behavior change)
   - `test` — Adding/updating tests
   - `docs` — Documentation
   - `chore` — Build, CI, deps
   - `style` — Formatting only

2. **Scope**: What module/area? (e.g., `auth`, `api`, `db`, `ui`)

3. **Description**: Imperative mood, no period, max 72 chars
   - ✅ `feat(auth): add JWT token refresh`
   - ❌ `feat(auth): Added JWT token refresh.`

4. **Body** (optional): Explain WHY, not WHAT
   ```
   The previous token implementation didn't handle expiry gracefully.
   Users were logged out without warning. This adds a refresh mechanism
   that silently renews tokens 5 minutes before expiry.
   ```

5. **Footer** (optional):
   ```
   BREAKING CHANGE: auth middleware now requires refresh token in headers
   Closes #42
   ```

## PR Description Template

```markdown
## What
[Brief description of what this PR does]

## Why
[Why is this change needed? Link to issue/plan]

## How
[Technical approach — key decisions and tradeoffs]

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] All tests pass

## Checklist
- [ ] Follows project conventions
- [ ] No linter warnings
- [ ] Documentation updated
- [ ] Changelog updated (if user-facing)
- [ ] No breaking changes (or documented in BREAKING CHANGE footer)
```

## Merge Strategy
- **Feature → develop**: Squash merge (clean history)
- **develop → main**: Merge commit (preserve feature context)
- **hotfix → main**: Merge commit + cherry-pick to develop
- Always delete the source branch after merge
