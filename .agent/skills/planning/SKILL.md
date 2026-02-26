---
name: planning
description: Guides decomposition of features into implementation stages with dependencies, complexity estimates, and parallelization opportunities. Creates and maintains IMPLEMENTATION_PLAN.md.
---

# Planning Skill

## When to Use
- Starting a new feature or epic
- Breaking down a large task into manageable pieces
- Creating or updating `IMPLEMENTATION_PLAN.md`

## Planning Process

### Step 1: Understand the Requirement
1. Read the full requirement/request carefully
2. Identify ambiguities and ask clarifying questions
3. List assumptions and constraints
4. Check `docs/ARCHITECTURE.md` for relevant architectural context

### Step 2: Research Existing Code
1. Find 3+ similar features in the codebase
2. Identify patterns, utilities, and conventions used
3. Note any reusable components
4. Understand the dependency graph

### Step 3: Decompose into Stages
Break the work into **3-5 stages**, ordered by dependency:

```markdown
## Stage N: [Name]
**Goal**: [Specific, measurable deliverable]
**Dependencies**: [Which stages must complete first]
**Parallel**: [Can this run alongside other stages? Which ones?]
**Files**:
  - [NEW] `path/to/new/file.ext` — purpose
  - [MODIFY] `path/to/existing/file.ext` — what changes
**Tests**:
  - [ ] Test case 1: description
  - [ ] Test case 2: description
**Success Criteria**: [How to verify this stage is done]
**Estimated Complexity**: [Low | Medium | High]
**Status**: [Not Started | In Progress | Complete]
```

### Step 4: Identify Risks
- What could go wrong?
- What are the unknowns?
- What dependencies are fragile?
- What needs human review?

### Step 5: Write the Plan
Create/update `IMPLEMENTATION_PLAN.md` at the project root with:
1. Overview of the feature
2. All stages with detail above
3. Risk assessment
4. Parallelization map (which stages can run concurrently)

### Step 6: Update STATUS.md
Add the new feature/task to `STATUS.md` with initial status.

## Output Format
The plan MUST be written to `IMPLEMENTATION_PLAN.md` at the project root.
Update `STATUS.md` with the current task and its status.
