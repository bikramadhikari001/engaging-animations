---
description: Bootstrap a new project from this template. Sets up language, framework, build tools, test framework, and linter.
---

# /bootstrap Workflow

Use the **project-bootstrap skill** to set up this project for a specific language and framework.

## Step 1: Gather Requirements
Ask the user:
1. What **language**? (TypeScript, Python, Go, Java, Rust, etc.)
2. What **framework**? (Next.js, FastAPI, Gin, Spring Boot, etc.)
3. What **package manager**? (npm, pnpm, pip, poetry, cargo, etc.)
4. What **test framework**? (Jest, Pytest, Go testing, JUnit, etc.)
5. What **linter/formatter**? (ESLint+Prettier, Ruff, golangci-lint, etc.)
6. Any **database**? (PostgreSQL, MongoDB, SQLite, etc.)
7. Any **CI/CD**? (GitHub Actions, GitLab CI, etc.)

## Step 2: Execute Bootstrap
Follow the **project-bootstrap skill** to:
1. Initialize project structure
2. Configure build tools
3. Set up test framework
4. Configure linter & formatter
5. Set up git hooks (optional)
6. Replace `06-language-agnostic.md` with language-specific rules
7. Generate `.gitignore`
8. Update documentation

## Step 3: Verify
1. Project builds successfully
2. Sample test runs and passes
3. Linter runs clean
4. Formatter runs clean

## Step 4: Initial Commit
```bash
git add -A
git commit -m "chore: bootstrap project with <language>/<framework>"
git checkout -b develop
```

## Step 5: Update Status
Update `STATUS.md`: "Project bootstrapped with <language>/<framework>"
