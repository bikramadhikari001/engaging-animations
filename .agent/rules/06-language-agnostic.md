---
description: Language-specific rules placeholder — replace after running /bootstrap
alwaysApply: true
---

# Language-Specific Rules

> **This file is a placeholder.** Run the `/bootstrap` workflow to replace it with
> rules tailored to your chosen language and framework.

## Generic Best Practices (Until Specialized)

### Naming
- Use descriptive, intention-revealing names
- Functions: verb + noun (`getUserById`, `calculateTotal`)
- Booleans: question form (`isValid`, `hasPermission`, `canExecute`)
- Constants: UPPER_SNAKE_CASE
- Avoid abbreviations unless universally understood (`id`, `url`, `http`)

### File Organization
- One primary export/class per file
- File names match the primary export
- Group by feature/domain, not by type (avoid `controllers/`, `models/`, `services/` at top level)
- Keep files under 300 lines — split if larger

### Functions
- Max 20 lines per function (guideline, not hard rule)
- Max 3 parameters — use an options/config object for more
- Single return point preferred (early returns for guards are OK)
- Pure functions preferred — minimize side effects

### Error Handling
- Use the language's idiomatic error handling (exceptions, Result types, error returns)
- Never use generic catch-all without re-throwing or logging
- Include context: what operation failed, what input caused it, what was expected

### Documentation
- Public APIs must have doc comments
- Complex algorithms need inline comments explaining WHY (not what)
- README must explain how to set up, run, and test the project
