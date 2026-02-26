---
description: Test-Driven Development enforcement rules
alwaysApply: true
---

# TDD Workflow Rules

## Red-Green-Refactor Cycle

Every code change MUST follow this cycle:

1. **RED** — Write a failing test that describes the desired behavior
2. **GREEN** — Write the minimum code to make the test pass
3. **REFACTOR** — Clean up the code while keeping all tests green

## Test-First Mandate
- Write the test BEFORE writing the implementation
- If you find yourself writing implementation code without a test, STOP and write the test first
- The only exception is exploratory prototyping — but prototypes must NEVER be committed

## Test Quality Standards
- Test BEHAVIOR, not implementation details
- One assertion per test when practical
- Test names must describe the scenario: `should_return_error_when_input_is_empty`
- Tests must be deterministic — no random data, no time-dependent assertions
- Use existing test utilities and helpers from the project

## Test Coverage
- All public functions/methods must have tests
- All error paths must be tested
- Edge cases must be explicitly tested (null, empty, boundary values)
- Integration points (API, DB, filesystem) must have tests

## Rules
- **NEVER** disable a failing test — fix the code or fix the test
- **NEVER** use `skip`, `xit`, `xdescribe`, `@Ignore`, or equivalent
- **NEVER** commit code with failing tests
- If a test is flaky, fix the flakiness — do not retry until it passes
