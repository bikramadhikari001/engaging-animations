---
name: project-bootstrap
description: Sets up a new project from the base template. Detects or asks for target language/framework, configures build tools, test framework, linter/formatter, and replaces placeholder rules with language-specific ones.
---

# Project Bootstrap Skill

## When to Use
- When starting a new project from this template
- When the `/bootstrap` workflow is triggered
- First-time project setup

## Bootstrap Process

### Step 1: Gather Requirements
Ask the user for:
1. **Language**: (e.g., TypeScript, Python, Go, Java, Rust, etc.)
2. **Framework**: (e.g., Next.js, FastAPI, Gin, Spring Boot, etc.) — optional
3. **Package manager**: (e.g., npm, pnpm, pip, poetry, go modules, maven, cargo)
4. **Test framework**: (e.g., Jest, Pytest, Go testing, JUnit, etc.)
5. **Linter/Formatter**: (e.g., ESLint+Prettier, Ruff, golangci-lint, etc.)
6. **Database**: (if applicable)
7. **CI/CD platform**: (e.g., GitHub Actions, GitLab CI, etc.) — optional

### Step 2: Initialize Project Structure
Based on the language/framework, create:

```
src/               # or equivalent (lib/, app/, cmd/, etc.)
test/              # or co-located tests
docs/
  ARCHITECTURE.md
  CONVENTIONS.md
```

### Step 3: Configure Build Tools
- Initialize package manager (`npm init`, `go mod init`, `poetry init`, etc.)
- Set up build/compile scripts
- Create development scripts (dev server, watch mode, etc.)

### Step 4: Configure Test Framework
- Install test runner
- Create test configuration file
- Set up coverage reporting
- Add a sample test to verify setup

### Step 5: Configure Linter & Formatter
- Install and configure linter
- Install and configure formatter
- Create config files (`.eslintrc`, `pyproject.toml`, `.golangci.yml`, etc.)
- Set up editor integration config (`.editorconfig`)

### Step 6: Set Up Git Hooks (Optional)
If pre-commit framework is available:
```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: lint
        name: Lint
        entry: <linter-command>
        language: system
        types: [<language>]
      - id: format
        name: Format
        entry: <formatter-command>
        language: system
        types: [<language>]
      - id: test
        name: Test
        entry: <test-command>
        language: system
        pass_filenames: false
```

### Step 7: Replace Language-Agnostic Rules
Replace `.agent/rules/06-language-agnostic.md` with language-specific rules:
- Language-specific naming conventions
- Idiomatic patterns
- Framework-specific best practices
- Common anti-patterns for that language

### Step 8: Create .gitignore
Generate a comprehensive `.gitignore` for the chosen language/framework.
Include:
- Build artifacts
- Dependency directories
- IDE files
- OS files
- Environment files
- Test coverage reports

### Step 9: Update Documentation
- Update `README.md` with project-specific setup instructions
- Populate `docs/CONVENTIONS.md` with language-specific conventions
- Update `docs/ARCHITECTURE.md` with initial architecture description

### Step 10: Create develop Branch
```bash
git add -A
git commit -m "chore: bootstrap project with <language>/<framework>"
git checkout -b develop
```

### Step 11: Verify
1. Project builds/compiles successfully
2. Sample test runs and passes
3. Linter runs without errors
4. Formatter runs without changes
5. Git hooks work (if set up)

## Output
- Fully configured project ready for development
- Updated `STATUS.md` with bootstrap completion
- Updated `README.md` with setup instructions
