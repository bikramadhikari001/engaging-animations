---
name: architecture-review
description: Reviews architectural decisions against SOLID principles, checks dependency direction, validates layer separation, and assesses scalability. Produces an architecture assessment.
---

# Architecture Review Skill

## When to Use
- After a feature with structural changes is complete
- When introducing new modules, services, or layers
- When changing dependency relationships
- Periodically as a health check on the codebase

## Review Criteria

### 1. SOLID Principles Check

#### Single Responsibility (S)
- Does each class/module have ONE reason to change?
- Are there "God classes" that do too much?
- Are utility classes actually dumping grounds?

#### Open/Closed (O)
- Can behavior be extended without modifying existing code?
- Are there switch/if-else chains that grow with each feature?
- Is polymorphism used where appropriate?

#### Liskov Substitution (L)
- Can subclasses be used in place of base classes without breaking?
- Are interface contracts honored by all implementations?

#### Interface Segregation (I)
- Are interfaces focused and minimal?
- Are clients forced to depend on methods they don't use?

#### Dependency Inversion (D)
- Do high-level modules depend on abstractions, not implementations?
- Are dependencies injected, not constructed internally?

### 2. Dependency Graph Analysis
- **Direction**: Dependencies should flow inward (infrastructure → application → domain)
- **Cycles**: No circular dependencies between modules
- **Coupling**: Modules should communicate through interfaces
- **Fan-out**: No module should depend on too many others (max 5-7 direct deps)

### 3. Layer Separation
- **Presentation layer** doesn't contain business logic
- **Business logic** doesn't depend on framework/infrastructure
- **Data access** is abstracted behind repositories/interfaces
- **Configuration** is centralized and injectable

### 4. Scalability & Extensibility
- Can a new feature be added without modifying 10+ files?
- Are cross-cutting concerns (logging, auth, validation) handled via middleware/decorators?
- Is the codebase modular enough to extract into separate services?

### 5. Anti-Pattern Detection
- [ ] **God Object** — Class/module doing too much
- [ ] **Shotgun Surgery** — One change requires modifying many files
- [ ] **Feature Envy** — Code accessing another module's data excessively
- [ ] **Primitive Obsession** — Using primitives instead of domain types
- [ ] **Deep Nesting** — More than 3 levels of nesting
- [ ] **Long Parameter List** — Functions with 5+ parameters
- [ ] **Circular Dependencies** — Module A → B → A

## Output Format

```markdown
# Architecture Review

## Summary
[Overall assessment of architectural health]

## Strengths
- [What's well-designed]

## Concerns

### 🔴 Critical
- **Issue**: [Description]
  - **Location**: [Files/modules affected]
  - **Impact**: [What happens if not addressed]
  - **Recommendation**: [How to fix]

### 🟡 Warning
- [Same format]

### 🔵 Improvement
- [Same format]

## Dependency Map
[Describe or diagram the current dependency flow]

## Recommendations
1. [Prioritized list of architectural improvements]
```
