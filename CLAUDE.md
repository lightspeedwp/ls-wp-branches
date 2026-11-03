# Claude Code Configuration

Project-specific instructions and conventions for working with the branch-validation repository in Claude Code.

## Overview

This repository contains:
- **SKILL.md** — Claude Code skill for branch name validation
- **agents/branch-validation.md** — Agent role; install it to `~/.claude/agents/` (see `agents/README.md`)
- **Canonical file references** — Synced from lightspeedwp/.github
- **Documentation** — Implementation patterns and integration guides

## How to Work on This Repository

### Opening the Project

```bash
# Clone or open
git clone https://github.com/lightspeedwp/ls-wp-branches.git ~/.claude/skills/branch-validation-wordpress
cd ~/.claude/skills/branch-validation-wordpress
npm install
```

### Scripting standards (this repository's own tooling)

- Never add shell scripts (`.sh`) or BATS tests. Write tooling in TypeScript and run it with `tsx`.
- Every script has Vitest tests in a `__tests__/` folder beside it. `npm test` enforces at least 80% statements, branches, functions and lines through the thresholds in `vitest.config.ts`.
- Keep side effects (network, file system, git) behind injectable collaborators so tests never touch the network or real files.
- Run `npm test` and `npm run typecheck` before handing work over.
- The synced `scripts/validate-branch-name.cjs` is exempt: it is an unmodified copy from lightspeedwp/.github, and its TypeScript conversion is tracked upstream in GIT-2750.

### Before Starting Work

1. **Sync canonical files** (if they may have changed):
   ```bash
   npm run sync
   git status
   ```

2. **Check recent changes**:
   ```bash
   git log --oneline -5
   git diff origin/main
   ```

3. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature
   # or use the skill: "I'm creating a branch for..."
   ```

## Key Files

### Core Files

- **SKILL.md** — The Claude Code skill
  - 38 branch types with full documentation
  - Naming rules and patterns
  - Scope keywords and area label detection
  - Best practices and merge strategy
  - **When to edit:** When strategy changes or new docs needed

- **README.md** — User-facing documentation
  - Project overview and purpose
  - Quick reference for all types
  - Common errors and fixes
  - **When to edit:** When updating user guidance

- **AGENTS.md** — Agent definitions and roles
  - Branch validation agent capabilities
  - When to use agents vs skills
  - Integration patterns
  - **When to edit:** When agent capabilities change

- **agents/branch-validation.md** — Agent role definition
  - Preloads this skill and sets the agent's working rules
  - Claude Code does not load it from this folder; symlink or copy it to `~/.claude/agents/`
  - **When to edit:** When the agent's behaviour or boundaries change

### Documentation

- **docs/IMPLEMENTATION.md** — How to use in CI/CD
  - GitHub Actions workflow examples
  - Lefthook configuration
  - NPM script validation
  - Label application
  - **When to edit:** When adding new integration patterns

- **docs/CANONICAL_STRUCTURE.md** — File structure and sync
  - Repository structure overview
  - Sync process and automation
  - Conflict handling
  - Version compatibility
  - **When to edit:** When structure changes or adding new patterns

### Reference Files

- **references/branch-types.yml** — Synced from .github
  - 38 branch types
  - PR template routing
  - Examples
  - **Don't edit directly:** Sync with `npm run sync`

- **references/branch-labels.yml** — Synced from .github
  - Type-to-label mapping
  - Area keyword detection
  - Default labels per type
  - **Don't edit directly:** Sync with `npm run sync`

### Prompts

- **prompts/validate-branch-name.md** — Branch validation prompt
  - Input/output specifications
  - Examples and validation rules
  - When to use
  - **When to edit:** When updating validation logic

- **prompts/ci-branch-validation.md** — CI/CD integration prompt
  - Workflow examples
  - Hook setup examples
  - Label application logic
  - **When to edit:** When adding new CI patterns

## Common Tasks

### Task 1: Update Documentation

```bash
# Make changes to README.md, SKILL.md, or docs/
git checkout -b docs/update-section
# Edit files
git add docs/ README.md
git commit -m "docs: update section description"
git push -u origin docs/update-section
# Create PR
```

### Task 2: Sync Canonical Files

```bash
# When .github files change
npm run sync

# Review changes
git status
git diff references/

# Commit if changed
git add references/
git commit -m "chore: sync canonical files from .github"
git push
```

### Task 3: Add New Branch Type

This is rare and requires coordination:

1. **In lightspeedwp/.github:**
   - Add to `.github/branch-types.yml`
   - Add to `.github/branch-labels.yml`
   - Update `docs/BRANCHING_STRATEGY.md`
   - Merge to develop branch

2. **In branch-validation:**
   ```bash
   npm run sync
   ```

3. **Update documentation:**
   - Add to "Valid Types" section in SKILL.md
   - Add to AGENTS.md if needed
   - Add examples to prompts/

4. **Commit:**
   ```bash
   git add -A
   git commit -m "feat: add new branch type 'xyz'"
   git push
   ```

### Task 4: Update Agent Role

```bash
# Edit agents/branch-validation.md in this repository.
# If it is installed as a symlink, ~/.claude/agents/branch-validation.md
# picks up the change immediately.
git add agents/
git commit -m "docs(agents): update branch-validation agent role"
git push
```

## Testing & Validation

### Test Branch Names

Use the skill directly:
```
"Validate this branch name: feat/user-auth-login"
"What labels will this get? security/csrf-token-validation"
```

### Test Prompts

The prompts should work standalone:
```
curl -X POST https://api.anthropic.com/messages \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "system": "$(cat prompts/validate-branch-name.md)",
    "messages": [{"role": "user", "content": "feat/user-auth-login"}]
  }'
```

### Test CI Integration

If you update CI examples in `docs/IMPLEMENTATION.md`:
1. Create a test repo or branch
2. Add the workflow
3. Test with a real PR
4. Document results

## Git Workflow

### Branch Naming

Use the skill! Examples:
- `feat/update-docs-section`
- `fix/typo-in-readme`
- `docs/add-ci-example`
- `refactor/improve-prompt-clarity`

### Commit Messages

Format: `type(scope): description`

Examples:
```
docs(skill): add new branch type example
chore(references): sync canonical files from .github
feat(agent): update agent role with new patterns
fix(readme): correct formatting in examples
```

### Pull Requests

1. Push to feature branch
2. Open PR with descriptive title
3. Reference any related issues
4. Ensure SKILL.md and docs are consistent
5. Get review (ideally from team lead)
6. Squash merge to main

## Configuration Files

### .gitignore

Already configured for:
- Dependencies (node_modules, yarn.lock)
- Logs and temp files
- IDE files (.vscode, .idea)
- OS files (.DS_Store, Thumbs.db)

Add more as needed.

### .github/workflows (when added)

If adding automated sync or validation:
- Use conventional GitHub Actions structure
- Document in README.md
- Add to this CLAUDE.md

## Project Conventions

### Documentation Style

- Use markdown formatting
- Use code blocks with syntax highlighting
- Include examples for every pattern
- Cross-reference related docs
- Keep sections concise but complete

### YAML Files

- Keep references/ files (auto-synced)
- Use 2-space indentation
- Validate syntax: `yamllint references/*.yml`
- Include comments for complex sections

### Prompt Files

- Clear input/output specification
- Multiple examples (valid and invalid)
- Explain the reasoning
- Link to related documentation

## Troubleshooting

### Canonical Files Out of Sync

```bash
npm run sync
git diff references/
# Review and commit
```

### Merge Conflicts

If canonical files have conflicts during merge:

1. **Keep remote (canonical):**
   ```bash
   git checkout --theirs references/branch-types.yml
   git add references/
   git commit -m "merge: resolve by keeping canonical files"
   ```

2. **Manual merge:**
   - Open conflicting file
   - Manually merge changes
   - Test that validation still works
   - Commit

### Tests Failing

If any validation examples in docs don't match schema:

1. Check references/ files are current
2. Verify 38 types match SKILL.md
3. Ensure label names match canonical labels.yml
4. Test with the agent

## Performance Notes

- SKILL.md is under 20KB (good size)
- Agent role is under 20KB (good size)
- References are ~12KB total (synced only)
- Docs are ~30KB total (reference only)

If any file grows significantly:
- Split into multiple files
- Use progressive disclosure
- Link to external resources

## Related Repositories

- **lightspeedwp/.github** — Canonical configuration (source of truth)
- **lightspeedwp/.agent-roles** — Central agent definitions (future)

## Questions or Issues?

1. **Strategy questions:** Check BRANCHING_STRATEGY.md in .github
2. **Agent capability questions:** See agents/branch-validation.md
3. **Integration questions:** See docs/IMPLEMENTATION.md
4. **File sync issues:** Run `npm run sync`
5. **Contribution questions:** Check CONTRIBUTING.md in your repo

## Last Updated

October 30, 2026

Maintained by: LightSpeed WP Development Team
