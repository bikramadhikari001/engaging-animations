---
description: Generate a project status report. Reads STATUS.md, IMPLEMENTATION_PLAN.md, checks git status, and runs tests.
---

# /status Workflow

## Step 1: Read Project State
1. Read `STATUS.md` for current task tracking
2. Read `IMPLEMENTATION_PLAN.md` for implementation progress (if exists)
3. Read `CHANGELOG.md` for recent changes (if exists)

## Step 2: Check Git Status
```bash
git status
git log --oneline -10
git branch -a
```

## Step 3: Run Tests
Execute the project's test suite and record:
- Total tests
- Passed / Failed / Skipped
- Coverage (if available)

## Step 4: Produce Status Report

```markdown
# Project Status Report

## Current State
- **Branch**: <current branch>
- **Last commit**: <hash> <message>
- **Uncommitted changes**: Yes/No

## Implementation Progress
[Summary from IMPLEMENTATION_PLAN.md]
- Stage 1: ✅ Complete
- Stage 2: 🔄 In Progress
- Stage 3: ⬜ Not Started

## Test Health
- **Total**: X | **Pass**: X | **Fail**: X | **Skip**: X
- **Coverage**: X%

## Recent Activity
[Last 5 commits]

## Blockers
[Any identified blockers from STATUS.md]

## Next Steps
[What should be worked on next]
```

## Step 5: Update STATUS.md
If any status information has changed, update `STATUS.md`.
