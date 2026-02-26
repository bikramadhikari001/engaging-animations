---
description: Safe refactoring pipeline. Ensures full test coverage before refactoring, atomic steps, no behavior changes.
---

# /refactor Workflow

Follow these steps for safe refactoring:

## Step 1: Define the Goal
1. What code is being refactored?
2. WHY is this refactoring needed? (readability, performance, maintainability)
3. What is the desired end state?
4. Confirm: this is a BEHAVIOR-PRESERVING change

## Step 2: Ensure Test Coverage
1. Run existing tests on the target code
2. Check coverage of the code being refactored
3. If coverage is < 80%, write additional tests FIRST
4. All tests must pass before starting

## Step 3: Create Refactor Branch
```bash
git checkout develop
git pull origin develop
git checkout -b refactor/<description>
```

## Step 4: Refactor in Atomic Steps
For each refactoring step:
1. Make ONE small change
2. Run ALL tests — they MUST pass
3. If tests fail, UNDO the change and try differently
4. Commit when green:
   ```bash
   git commit -m "refactor(<scope>): <what and why>"
   ```

### Safe Refactoring Techniques
- **Extract Method/Function** — Pull complex logic into a named function
- **Rename** — Improve clarity of names
- **Move** — Relocate code to a more appropriate module
- **Inline** — Remove unnecessary indirection
- **Extract Interface** — Decouple from implementation
- **Replace Conditional with Polymorphism** — Simplify branching

## Step 5: Verify
1. Run the FULL test suite — every test must pass
2. Verify no behavior changes (inputs and outputs are identical)
3. Use the **architecture-review skill** if structural changes were significant

## Step 6: Final Commit
```bash
git add -A
git commit -m "refactor(<scope>): <overall description>

No behavior changes. Motivated by: <readability|performance|maintainability>"
```

## Rules
- **ZERO tolerance for behavior changes** — If a test fails, undo
- **Each commit must be independently valid** — Can be reverted safely
- **No feature additions** — If you discover a needed feature, create a separate task
