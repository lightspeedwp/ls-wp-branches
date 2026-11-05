# Canonical File Structure

How the branch-validation skill inherits and references org-wide canonical files.

## Repository Structure

```
branch-validation/
├── SKILL.md                          ← Claude Code skill (references canonical files)
├── README.md                         ← User-facing documentation
├── LICENSE
│
├── references/                       ← Local reference copies (auto-synced)
│   ├── branch-types.yml              ← Branch type definitions
│   ├── branch-labels.yml             ← Label mapping & area keywords
│   └── CANONICAL_FILES.md            ← Sync metadata and instructions
│
├── docs/                             ← Documentation
│   ├── IMPLEMENTATION.md             ← How to use this skill
│   └── CANONICAL_STRUCTURE.md        ← This file
│
├── scripts/
│   └── sync-canonical.ts             ← Fetch latest canonical files (npm run sync)
│
└── .github/ (repository settings)
    ├── BRANCHING_STRATEGY.md         ← (referenced, not copied)
    ├── branch-types.yml              ← (referenced, not copied)
    └── branch-labels.yml             ← (referenced, not copied)
```

## Canonical Files Source

All canonical files originate from [lightspeedwp/.github](https://github.com/lightspeedwp/.github):

```
lightspeedwp/.github/
├── docs/
│   └── BRANCHING_STRATEGY.md         ← Master strategy document
│
├── .github/
│   ├── branch-types.yml              ← 38 branch types & routing
│   ├── branch-labels.yml             ← Type-to-label mapping
│   ├── labels.yml                    ← Label definitions
│   ├── branch-validation.yml         ← CI validation config
│   ├── PULL_REQUEST_TEMPLATE/        ← PR templates by type
│   └── ISSUE_TEMPLATE/               ← Issue templates
│
└── scripts/
    └── validate-branch-name.js       ← Validation script (optional)
```

## File Purposes

### BRANCHING_STRATEGY.md (Source Only)

**Location:** `lightspeedwp/.github/docs/BRANCHING_STRATEGY.md`

**Purpose:** Master document defining the org-wide branching strategy

**Contents:**
- Naming pattern and rules
- List of 38 approved branch types
- Forbidden prefixes
- Release and hotfix flow
- Merge strategy and best practices
- Branch protection requirements

**Usage:** Referenced in SKILL.md; defines the authoritative rules

**Kept in:** `.github` only (not copied; URL-referenced)

### branch-types.yml (Synced Reference + Used)

**Location:** 
- Canonical: `lightspeedwp/.github/.github/branch-types.yml`
- Reference copy: `branch-validation/references/branch-types.yml`

**Purpose:** Authoritative definition of all 38 branch types

**Structure:**

```yaml
feat:
  template: pr_feature.md                    # PR template file to use
  labels:
    - type:feature                           # Labels to apply
  examples:
    - feat/user-registration-flow            # Example branch names
    - feat/dark-mode-support

hotfix:
  template: pr_hotfix.md
  labels:
    - type:release
    - priority:critical
  examples:
    - hotfix/csrf-validation
    - hotfix/cart-total-calculation
```

**Usage:** 
- CI/CD validation workflows read this to check branch types
- PR template routing determined from `template` field
- Labels applied from `labels` field
- Examples show valid naming patterns

**Kept in:** Both `.github` (canonical) and `branch-validation/references/` (reference copy)

### branch-labels.yml (Synced Reference + Used)

**Location:**
- Canonical: `lightspeedwp/.github/.github/branch-labels.yml`
- Reference copy: `branch-validation/references/branch-labels.yml`

**Purpose:** Map branch types to labels and area keywords

**Structure:**

```yaml
feat:
  default_labels:
    - type:feature                    # Labels to apply
  area_keywords:
    - api                             # Keywords triggering area labels
    - ui
    - component
    - backend
    - frontend

security:
  default_labels:
    - type:security
    - priority:critical               # Security is always critical
  area_keywords:
    - security
    - auth
    - vulnerability
    - xss
    - csrf
    - injection
```

**Usage:**
- Determine which labels to apply based on branch type
- Match scope keywords against area_keywords to add area labels
- Mark high-priority types (security, hotfix, a11y)

**Kept in:** Both `.github` (canonical) and `branch-validation/references/` (reference copy)

## Syncing Process

### Manual Sync

```bash
cd branch-validation
npm run sync

# Review changes
git diff references/

# Commit
git add references/
git commit -m "chore: sync canonical files from .github"
git push
```

### Automated Sync (Recommended)

Set up a scheduled GitHub Actions workflow:

```yaml
name: Sync Canonical Files

on:
  schedule:
    # Weekly on Monday at 9 AM UTC
    - cron: '0 9 * * 1'
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: main

      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - name: Sync canonical files
        run: npm install && npm run sync
      
      - name: Create pull request
        if: github.event_name != 'schedule' || failure() == false
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: sync canonical files from .github'
          title: 'chore: sync canonical files from .github'
          body: |
            Automated sync of canonical files from lightspeedwp/.github
            
            ## Checklist
            - [ ] Review changes
            - [ ] Ensure SKILL.md is still accurate
            - [ ] Run tests/validation
          branch: sync/canonical-files
          delete-branch: true
```

## What Gets Synced?

**Files Synced:**
- `.github/branch-types.yml` → `references/branch-types.yml`
- `.github/branch-labels.yml` → `references/branch-labels.yml`

**Files NOT Synced (Reference Only):**
- `docs/BRANCHING_STRATEGY.md` (linked, not copied)
- `PULL_REQUEST_TEMPLATE/` (linked, not copied)
- `ISSUE_TEMPLATE/` (linked, not copied)
- `labels.yml` (reference in skill, not copied)

**Why Not Sync Everything?**
- Strategy document is for reading, not config
- PR/Issue templates are repo-specific
- Labels file is shared; repos reference it directly
- Reducing copies keeps sync simpler and reduces conflicts

## Validating Sync

After syncing, verify:

```bash
# 1. Check files were updated
ls -l references/

# 2. Validate YAML syntax
yamllint references/*.yml

# 3. Verify types still match documentation
grep "^  [a-z]" references/branch-types.yml | wc -l
# Should output 38

# 4. Check for breaking changes
git diff references/
# Look for removed types, renamed labels, etc.
```

## Handling Conflicts

If canonical files change in a way that affects the skill:

### New Branch Type Added

1. Sync canonical files
2. Update SKILL.md to document the new type
3. Commit both changes

Example:

```bash
npm run sync
# branch-types.yml now has: foobar: ...

# Edit SKILL.md to add foobar to the type list
git add SKILL.md references/
git commit -m "feat: add new branch type 'foobar'"
```

### Type Renamed

1. Sync canonical files
2. Update SKILL.md with new type name
3. Document migration path if needed

### Type Removed (Rare)

1. Sync canonical files
2. Update SKILL.md, removing the type
3. Document migration in release notes

Example:

```bash
npm run sync
# branch-types.yml no longer has: deprecated_type: ...

# Edit SKILL.md to remove the type
git add SKILL.md references/
git commit -m "chore: remove deprecated branch type"
git push

# Release as minor version bump
git tag v1.2.0
```

## Version Compatibility

This skill is compatible with:

- **lightspeedwp/.github** `develop` branch
- **All repos** using the standard branching strategy

Check compatibility by comparing type counts:

```bash
# In branch-validation
SKILL_TYPES=$(grep "^- \*\*\`" SKILL.md | wc -l)
CANONICAL_TYPES=$(grep "^  [a-z]" references/branch-types.yml | wc -l)

echo "Skill: $SKILL_TYPES types"
echo "Canonical: $CANONICAL_TYPES types"
# Should match!
```

## Questions?

- See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for usage patterns
- Check [README.md](../README.md) for overview
- Review [BRANCHING_STRATEGY.md](https://github.com/lightspeedwp/.github/blob/develop/docs/BRANCHING_STRATEGY.md) for strategy details
