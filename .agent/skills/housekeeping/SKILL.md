---
name: housekeeping
description: Code cleanup and maintenance. Detects dead code, audits dependencies, enforces formatting, reviews file organization, and removes technical debt.
---

# Housekeeping Skill

## When to Use
- After a feature is complete and merged
- Periodically as a codebase health check
- When preparing for a release
- When the `/housekeeping` or cleanup task is triggered

## Housekeeping Tasks

### 1. Dead Code Detection
- Find unused imports
- Find unused functions/methods
- Find unused variables
- Find unreachable code paths
- Find commented-out code blocks (should be removed — git has history)

### 2. Dependency Audit
- Check for unused dependencies
- Check for outdated dependencies (major/minor/patch)
- Check for known vulnerabilities (CVEs)
- Remove dependencies that are no longer used
- Flag dependencies that could be replaced with stdlib

### 3. Code Formatting
- Run the project's formatter on ALL files
- Verify consistent indentation (tabs vs spaces, width)
- Verify consistent line endings
- Remove trailing whitespace
- Ensure files end with a newline

### 4. Linting
- Run the project's linter on ALL files
- Fix auto-fixable issues
- Document any remaining warnings with justification

### 5. File Organization
- Verify files are in the correct directories per project structure
- Check for overly large files (> 300 lines) — suggest splitting
- Check for empty files — remove or populate
- Verify test files mirror source file structure

### 6. Technical Debt Inventory
Scan for and catalog:
- `TODO` comments without issue numbers
- `FIXME` comments
- `HACK` or `WORKAROUND` comments
- `@deprecated` items still in use
- Known performance bottlenecks

## Output Format

```markdown
# Housekeeping Report

## Summary
[Overview of codebase health]

## Actions Taken
- [x] Removed N unused imports across M files
- [x] Formatted all files
- [x] Fixed N linter warnings

## Actions Requiring Review
- [ ] [File]: unused function `foo()` — safe to remove?
- [ ] [Package]: outdated by 2 major versions — upgrade?

## Technical Debt Inventory
| Location | Type | Description | Priority |
|----------|------|-------------|----------|
| file:line | TODO | Description | Low/Med/High |

## Dependencies
| Package | Current | Latest | Status |
|---------|---------|--------|--------|
| pkg-a   | 1.0.0   | 2.1.0  | ⚠️ Major update |
```
