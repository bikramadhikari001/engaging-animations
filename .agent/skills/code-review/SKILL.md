---
name: code-review
description: Structured code review checklist covering security, performance, readability, maintainability, and adherence to project conventions. Produces a review report with severity levels.
---

# Code Review Skill

## When to Use
- After implementation is complete and tests pass
- When the `/review` workflow is triggered
- Before merging any branch to `develop`

## Review Process

### Step 1: Understand the Change
1. Read the implementation plan or issue description
2. Understand the INTENT of the change
3. Check which files were modified: `git diff develop --stat`
4. Read the full diff: `git diff develop`

### Step 2: Review Checklist

For each changed file, evaluate:

#### 🔒 Security (Severity: BLOCKER)
- [ ] No hardcoded secrets, tokens, passwords, or API keys
- [ ] No SQL injection vectors (use parameterized queries)
- [ ] No XSS vulnerabilities (sanitize user input)
- [ ] No path traversal vulnerabilities
- [ ] Authentication/authorization changes are correct
- [ ] Sensitive data is not logged

#### ⚡ Performance (Severity: WARNING)
- [ ] No N+1 query patterns
- [ ] No unnecessary loops or redundant iterations
- [ ] Large datasets use pagination
- [ ] No blocking operations in async code
- [ ] Database indexes exist for frequently queried fields
- [ ] No memory leaks (unclosed resources, event listeners)

#### 📖 Readability (Severity: SUGGESTION)
- [ ] Variable/function names are descriptive and consistent
- [ ] Complex logic has explanatory comments (WHY, not WHAT)
- [ ] Functions are short and focused (single responsibility)
- [ ] No deeply nested code (max 3 levels of indentation)
- [ ] No magic numbers — use named constants

#### 🏗️ Maintainability (Severity: WARNING)
- [ ] Code follows project conventions (check `docs/CONVENTIONS.md`)
- [ ] No code duplication — extracted into shared utilities
- [ ] Dependencies flow in one direction (no circular deps)
- [ ] New files are in the correct directory per project structure
- [ ] No tight coupling to specific implementations

#### ✅ Testing (Severity: BLOCKER)
- [ ] New code has corresponding tests
- [ ] Tests cover happy path AND error paths
- [ ] Tests cover edge cases
- [ ] No tests were disabled or skipped
- [ ] Tests are deterministic

#### 📝 Documentation (Severity: SUGGESTION)
- [ ] Public APIs have doc comments
- [ ] README updated if behavior changed
- [ ] Changelog updated for user-facing changes
- [ ] Architecture docs updated if patterns changed

### Step 3: Produce Review Report

Output format:
```markdown
# Code Review Report

## Summary
[Brief description of what was reviewed and overall assessment]

## Findings

### 🔴 BLOCKER (Must fix before merge)
1. **[File:Line]** — Description of the issue
   - **Why**: Explanation of the risk
   - **Fix**: Suggested resolution

### 🟡 WARNING (Should fix, but not blocking)
1. **[File:Line]** — Description
   - **Why**: Explanation
   - **Fix**: Suggestion

### 🔵 SUGGESTION (Nice to have)
1. **[File:Line]** — Description
   - **Fix**: Suggestion

## Verdict
- [ ] ✅ APPROVE — No blockers, good to merge
- [ ] 🔄 REQUEST CHANGES — Blockers found, must address
- [ ] 💬 COMMENT — Non-blocking feedback only
```
