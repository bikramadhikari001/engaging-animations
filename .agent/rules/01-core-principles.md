---
description: Core software engineering principles that govern all agent behavior
alwaysApply: true
---

# Core Principles

## Philosophy
- **Incremental progress over big bangs** — Small changes that compile and pass tests
- **Composition over inheritance** — Use dependency injection
- **Explicit over implicit** — Clear data flow and dependencies
- **Clear intent over clever code** — Choose the boring, obvious solution
- **Single responsibility** — One purpose per function, class, and module

## The 3-Attempt Rule
**CRITICAL**: Maximum 3 attempts per issue, then STOP.

After 3 failed attempts:
1. Document what you tried, exact error messages, and why you think it failed
2. Research 2-3 alternative approaches
3. Question whether this is the right abstraction level
4. Ask the user for guidance — do NOT keep trying the same approach

## Decision Framework
When multiple valid approaches exist, choose based on:
1. **Testability** — Can I easily test this?
2. **Readability** — Will someone understand this in 6 months?
3. **Consistency** — Does this match existing project patterns?
4. **Simplicity** — Is this the simplest solution that works?
5. **Reversibility** — How hard is it to change later?

## Non-Negotiables
- Every change MUST compile successfully
- Every change MUST pass all existing tests
- New functionality MUST include tests
- Never silently swallow exceptions — fail fast with descriptive messages
- Include debugging context in error messages
