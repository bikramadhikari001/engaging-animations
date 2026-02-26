---
description: Trigger a structured code review on current branch changes. Uses the code-review skill.
---

# /review Workflow

## Step 1: Identify Changes
```bash
git diff develop --stat
```
List all changed files and understand the scope.

## Step 2: Load Code Review Skill
Use the **code-review skill** to perform a full review covering:
- 🔒 Security
- ⚡ Performance
- 📖 Readability
- 🏗️ Maintainability
- ✅ Testing
- 📝 Documentation

## Step 3: Produce Report
Generate a structured review report with findings categorized as:
- 🔴 **BLOCKER** — Must fix before merge
- 🟡 **WARNING** — Should fix
- 🔵 **SUGGESTION** — Nice to have

## Step 4: Act on Findings
- Fix all BLOCKERs immediately
- Address WARNINGs where practical
- Note SUGGESTIONs for future improvement

## Step 5: Re-verify
After fixes:
1. Run all tests
2. Run linter
3. Confirm all BLOCKERs are resolved
