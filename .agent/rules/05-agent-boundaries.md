---
description: Safety boundaries for autonomous agent behavior
alwaysApply: true
---

# Agent Boundaries

## Actions Requiring Human Confirmation

The following actions MUST NOT be performed autonomously. Always ask first:

### Destructive Operations
- Deleting files or directories
- Dropping database tables or collections
- Removing git branches
- Force-pushing to any branch
- Resetting or reverting commits

### Architectural Changes
- Adding new dependencies or packages
- Modifying CI/CD configuration files
- Changing database schemas
- Modifying authentication/authorization logic
- Breaking existing public API contracts

### External Operations
- Making HTTP requests to external services (except during tests with mocks)
- Deploying to any environment
- Publishing packages
- Sending emails or notifications
- Modifying DNS or infrastructure

### Configuration Changes
- Changing environment variables
- Modifying Docker or container configs
- Updating build system configuration
- Changing port numbers or network settings

## Autonomous Actions (OK Without Asking)
- Creating new source files
- Modifying existing source files (within the implementation plan)
- Writing and running tests
- Running linters and formatters
- Reading documentation
- Creating git branches
- Making commits (following git discipline rules)
- Updating `STATUS.md` and `IMPLEMENTATION_PLAN.md`

## When in Doubt
If unsure whether an action requires confirmation, ASK. It's always better to ask than to break something.
