---
description: Bug investigation and fix pipeline. Reproduce with a failing test, fix minimally, verify no regressions.
---

# /bugfix Workflow

Follow these steps to investigate and fix a bug:

## Step 1: Understand the Bug
1. Read the bug report / description
2. Identify the expected vs actual behavior
3. Identify the affected module/component

## Step 2: Reproduce with a Failing Test
1. Write a test that demonstrates the bug
2. The test MUST fail with the current code
3. The test name should describe the bug: `should_not_crash_when_input_is_null`
4. Run the test to confirm it fails

## Step 3: Create Bugfix Branch
```bash
git checkout develop
git pull origin develop
git checkout -b bugfix/<bug-description>
```

## Step 4: Fix the Bug
1. Make the **minimal change** to fix the bug
2. Do NOT refactor or add features — fix only the bug
3. Run the failing test — it MUST now pass
4. Run ALL tests — no regressions

## Step 5: Verify
1. Run the full test suite
2. Check that the fix doesn't break any existing behavior
3. Consider: are there similar bugs elsewhere? (same pattern, same module)

## Step 6: Commit
```bash
git add -A
git commit -m "fix(<scope>): <description>

<explain what caused the bug and why this fix is correct>

Closes #<issue-number>"
```

## Step 7: Update Status
1. Update `STATUS.md` with the bug fix
2. Update `CHANGELOG.md` under "Fixed"
