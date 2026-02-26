---
name: qa-testing
description: Quality Assurance testing skill. Runs test suites, analyzes coverage, identifies untested paths, writes additional tests for gaps, and produces a QA report.
---

# QA Testing Skill

## When to Use
- After a feature is implemented and initial tests pass
- When the `/qa` workflow is triggered
- Before any merge to `develop`
- During regression testing

## QA Process

### Step 1: Run the Full Test Suite
1. Execute all tests: use the project's test runner
2. Record results: total, passed, failed, skipped
3. If any tests FAIL, document the failures and STOP — do not proceed until they pass

### Step 2: Analyze Test Coverage
1. Run coverage report (if available in the project)
2. Identify files/functions with < 80% coverage
3. Focus on recently changed files — these must have high coverage

### Step 3: Identify Untested Paths
For each uncovered or partially covered module:

1. **Happy paths** — Is the main success flow tested?
2. **Error paths** — What happens when things go wrong?
   - Invalid input
   - Missing data
   - External service failures
   - Timeout/connection errors
3. **Edge cases** — Boundary conditions?
   - Empty collections
   - Single item
   - Maximum size
   - Null/undefined/nil values
   - Concurrent access
4. **Integration points** — Are module boundaries tested?
   - API endpoint contracts
   - Database queries
   - External service calls

### Step 4: Write Missing Tests
For each identified gap:
1. Write a test following the project's test patterns
2. Follow TDD naming: `should_<expected>_when_<condition>`
3. Run the new test — verify it passes
4. Run ALL tests — verify no regressions

### Step 5: Regression Check
1. Verify all previously passing tests still pass
2. Check for flaky tests (run tests 2-3 times if suspected)
3. Verify no test depends on execution order

### Step 6: Produce QA Report

```markdown
# QA Report

## Test Results
- **Total**: X tests
- **Passed**: X ✅
- **Failed**: X ❌
- **Skipped**: X ⏭️
- **Coverage**: X% (if available)

## Coverage Gaps Identified
| File | Current Coverage | Gap Description |
|------|-----------------|-----------------|
| path/to/file | 65% | Missing error handling tests |

## Tests Added
| Test File | Test Name | What it Covers |
|-----------|-----------|----------------|
| path/to/test | should_handle_empty_input | Edge case for empty list |

## Risk Assessment
- **High Risk**: [Areas with low coverage and high complexity]
- **Medium Risk**: [Areas with moderate coverage]
- **Low Risk**: [Well-tested areas]

## Verdict
- [ ] ✅ PASS — All tests pass, adequate coverage
- [ ] ⚠️ CONDITIONAL — Tests pass but coverage gaps remain
- [ ] ❌ FAIL — Test failures or critical coverage gaps
```
