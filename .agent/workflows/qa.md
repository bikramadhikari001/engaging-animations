---
description: Trigger a QA pass — run tests, check coverage, identify gaps, write additional tests.
---

# /qa Workflow

## Step 1: Run Full Test Suite
Execute all tests and record results.

## Step 2: Coverage Analysis
1. Run coverage report
2. Identify modules with < 80% coverage
3. Focus especially on recently changed files

## Step 3: Gap Analysis
Use the **qa-testing skill** to identify:
- Untested happy paths
- Untested error paths
- Missing edge case tests
- Untested integration points

## Step 4: Write Missing Tests
For each identified gap:
1. Write the test following project patterns
2. Verify it passes
3. Run ALL tests to check for regressions

## Step 5: Produce QA Report
Generate a structured report with:
- Test results summary
- Coverage metrics
- Gaps identified and filled
- Risk assessment
- Pass/Fail verdict

## Step 6: Commit
```bash
git add -A
git commit -m "test(<scope>): add tests for <coverage gaps>"
```
