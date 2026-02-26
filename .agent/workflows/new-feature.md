---
description: Full feature development pipeline. Guides through planning, branching, TDD implementation, self-review, docs update, and commit.
---

# /new-feature Workflow

Follow these steps to implement a new feature:

## Step 1: Understand & Plan
1. Read the feature requirement carefully
2. Use the **planning skill** to decompose into stages
3. Create/update `IMPLEMENTATION_PLAN.md`
4. Update `STATUS.md` with the new task

## Step 2: Create Feature Branch
1. Use the **git-workflow skill** to create the branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/<feature-name>
```

## Step 3: Implement with TDD (per stage)
For each stage in the implementation plan:

1. Use the **tdd-coding skill**:
   - Write failing tests first (RED)
   - Implement minimum code to pass (GREEN)
   - Refactor while keeping tests green (REFACTOR)

2. Commit after each stage:
   ```bash
   git add -A
   git commit -m "feat(<scope>): <description>"
   ```

3. Update `IMPLEMENTATION_PLAN.md` stage status to "Complete"

## Step 4: Self-Review
1. Use the **code-review skill** to review your own changes
2. Fix any BLOCKER or WARNING issues found
3. Re-run all tests

## Step 5: QA Pass
1. Use the **qa-testing skill** to verify coverage
2. Write any additional tests for gaps
3. Verify all tests pass

## Step 6: Update Documentation
1. Use the **documentation skill** to update relevant docs
2. Update `CHANGELOG.md` if user-facing
3. Update `README.md` if setup/usage changed

## Step 7: Final Commit & Status Update
1. Run linter and formatter
2. Make final commit
3. Update `STATUS.md`: mark feature as "Ready for Review"
4. Update `IMPLEMENTATION_PLAN.md`: mark all stages complete
