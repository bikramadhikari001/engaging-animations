---
description: Quality gates and Definition of Done checklist
alwaysApply: true
---

# Quality Gates

## Definition of Done

Before considering ANY task complete, verify ALL of the following:

- [ ] Tests written and passing (including edge cases)
- [ ] Code follows project conventions (check `docs/CONVENTIONS.md`)
- [ ] No linter/formatter warnings
- [ ] No compiler/type-checker warnings
- [ ] Commit messages follow conventional format
- [ ] Implementation matches the plan in `IMPLEMENTATION_PLAN.md`
- [ ] No TODOs without issue numbers (e.g., `// TODO(#42): fix this`)
- [ ] No hardcoded values that should be configurable
- [ ] Error handling is explicit and tested
- [ ] `STATUS.md` is updated with current progress

## Pre-Commit Checklist
Run these before every commit:
1. Format all changed files
2. Run linter on all changed files
3. Run type-checker (if applicable)
4. Run the full test suite
5. Verify no secrets or sensitive data in the diff

## Pre-Merge Checklist
Before merging any branch to `develop`:
1. All CI checks pass
2. Code has been reviewed (by agent or human)
3. No merge conflicts
4. Branch is up-to-date with target branch
5. Documentation is updated if behavior changed
6. Changelog is updated for user-facing changes

## Escalation Triggers
STOP and ask the user when:
- A test is consistently failing and you don't know why
- Multiple quality gates cannot be satisfied simultaneously
- The implementation plan seems wrong after deeper investigation
- You discover a security vulnerability
- A dependency has a known CVE
