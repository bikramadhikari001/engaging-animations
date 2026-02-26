---
name: tdd-coding
description: Step-by-step Test-Driven Development coding workflow. Guides writing tests first, then implementation, then refactoring. Language-agnostic TDD patterns.
---

# TDD Coding Skill

## When to Use
- Implementing any new feature or function
- Fixing a bug (write the failing test first)
- Adding new behavior to existing code

## The TDD Cycle

### Phase 1: RED — Write a Failing Test

1. **Think about the interface first**
   - What function/method/endpoint needs to exist?
   - What inputs does it take?
   - What output should it produce?
   - What errors should it throw?

2. **Write the test**
   ```
   // Test file: <module>.test.<ext> or <module>_test.<ext>
   // Test name pattern: should_<expected>_when_<condition>

   test("should return user when valid ID is provided")
   test("should throw NotFoundError when ID does not exist")
   test("should return empty list when no results match")
   ```

3. **Run the test — it MUST fail**
   - If it passes, your test isn't testing the right thing
   - The failure message should clearly describe what's missing

### Phase 2: GREEN — Minimal Implementation

1. **Write the minimum code to make the test pass**
   - Don't optimize yet
   - Don't handle edge cases yet (unless that's what the test covers)
   - Don't add features not covered by a test
   - Hardcoding is OK temporarily if it makes the test pass

2. **Run the test — it MUST pass**

3. **Run ALL tests — they MUST all pass**
   - If an existing test breaks, fix it before continuing

### Phase 3: REFACTOR — Clean Up

1. **Look for improvements** (only if all tests pass):
   - Extract repeated code into functions
   - Improve naming
   - Simplify logic
   - Remove duplication

2. **Run ALL tests after every change**
   - If any test fails after refactoring, undo the refactor

3. **Commit when clean**
   - `test(<scope>): add tests for <feature>`
   - `feat(<scope>): implement <feature>`
   - `refactor(<scope>): <what and why>`

## Testing Patterns

### Arrange-Act-Assert
```
// Arrange: set up preconditions
// Act: perform the action
// Assert: verify the outcome
```

### Test Doubles
- **Stub**: Returns predefined data (for dependencies)
- **Mock**: Verifies interactions (for side-effects)
- **Fake**: Simplified implementation (for complex systems like DB)
- **Spy**: Records calls for later inspection

### Edge Cases to Always Cover
- Empty input (null, undefined, "", [], {})
- Boundary values (0, -1, MAX_INT, empty string)
- Invalid types (string where number expected)
- Concurrent access (if applicable)
- Network/IO failures (if applicable)

## File Naming Convention
- Tests live next to the code they test OR in a parallel `test/` directory  
- Match the project's existing convention
- Common patterns:
  - `foo.ts` → `foo.test.ts` or `foo.spec.ts`
  - `foo.py` → `test_foo.py` or `foo_test.py`
  - `Foo.java` → `FooTest.java`
  - `foo.go` → `foo_test.go`
