---
name: documentation
description: Generates and maintains project documentation including README, API docs, changelogs, and architecture decision records (ADRs).
---

# Documentation Skill

## When to Use
- After a feature is complete and reviewed
- When the public API changes
- When architectural decisions are made
- When a release is being prepared

## Documentation Types

### 1. README.md
Every project must have a README with:

```markdown
# Project Name

Brief description of what this project does.

## Quick Start
1. Prerequisites
2. Installation
3. Running locally
4. Running tests

## Architecture
Brief overview or link to `docs/ARCHITECTURE.md`

## Development
- How to create a new feature
- Coding conventions (link to `docs/CONVENTIONS.md`)
- Testing approach

## Deployment
How to deploy (or link to deployment docs)

## Contributing
How to contribute, branch strategy, commit format
```

### 2. API Documentation
For each public API endpoint or exported function:
- Method/function signature
- Parameters with types and descriptions
- Return type and description
- Error cases
- Usage example

### 3. Changelog (Keep a Changelog format)
File: `CHANGELOG.md`

```markdown
# Changelog

## [Unreleased]

### Added
- New feature description

### Changed
- Modified behavior description

### Fixed
- Bug fix description

### Removed
- Removed feature description

## [1.0.0] - YYYY-MM-DD
### Added
- Initial release features
```

### 4. Architecture Decision Records (ADR)
File: `docs/adr/NNN-title.md`

```markdown
# ADR-NNN: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context
[Why was this decision needed?]

## Decision
[What was decided?]

## Consequences
[What are the results — positive and negative?]
```

### 5. docs/CONVENTIONS.md
Project-specific coding conventions:
- Naming patterns
- File organization
- Error handling approach
- Testing patterns
- Code formatting settings

## Process
1. Identify what documentation needs updating based on the changes
2. Update the appropriate documents
3. Verify all code examples in docs still compile/run
4. Check for broken links
5. Commit: `docs(<scope>): <description>`
