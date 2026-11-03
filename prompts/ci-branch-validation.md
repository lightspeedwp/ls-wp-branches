# CI/CD Branch Validation

Use branch-validation in CI/CD pipelines to automatically validate branch names before PR merge, preventing invalid branches from reaching production.

## Purpose

Automatically validate branch names in CI/CD workflows to:
- Catch naming issues early (at PR creation time)
- Prevent invalid branches from being merged
- Enforce org-wide branching strategy consistently
- Auto-route PRs to correct templates and labels
- Maintain branch naming compliance across all repositories

## Integration Patterns

### GitHub Actions Workflow

```yaml
name: Validate Branch Name
on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches-ignore:
      - main
      - develop

jobs:
  validate-branch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get branch name
        id: branch
        run: |
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then
            BRANCH="${{ github.head_ref }}"
          else
            BRANCH="${{ github.ref_name }}"
          fi
          echo "name=$BRANCH" >> $GITHUB_OUTPUT

      - name: Validate branch name
        run: |
          BRANCH="${{ steps.branch.outputs.name }}"
          
          # Skip protected and exempted branches
          if [[ "$BRANCH" =~ ^(main|develop|master|staging|production)$ ]] || \
             [[ "$BRANCH" =~ ^(dependabot|renovate)/ ]]; then
            echo "✅ Branch is exempted from validation"
            exit 0
          fi
          
          # Validate against canonical types
          TYPES=$(grep "^  [a-z]" .github/branch-types.yml 2>/dev/null | sed 's/:.*//' | paste -sd '|' - || echo "feat|fix|hotfix|release|refactor|docs|test|ci|chore|task")
          
          # Check format
          if [[ ! $BRANCH =~ ^($TYPES)/[a-z0-9]+-[a-z0-9-]+$ ]]; then
            echo "❌ Invalid branch name: $BRANCH"
            echo ""
            echo "Expected pattern: {type}/{scope}-{title}"
            echo "Valid types: $TYPES"
            echo ""
            echo "Examples:"
            echo "  ✅ feat/user-auth-login"
            echo "  ✅ fix/cart-total-calculation"
            echo "  ✅ security/csrf-token-validation"
            echo ""
            echo "Rules:"
            echo "  - Use lowercase only"
            echo "  - Use hyphens to separate words (no underscores)"
            echo "  - Include both scope and title"
            exit 1
          fi
          
          echo "✅ Valid branch name: $BRANCH"

      - name: Check for forbidden prefixes
        run: |
          BRANCH="${{ steps.branch.outputs.name }}"
          
          if [[ $BRANCH =~ ^(claude|copilot|openai)/ ]]; then
            echo "❌ Forbidden prefix detected: $BRANCH"
            echo "Branches cannot start with: claude/, copilot/, openai/"
            echo "These prefixes are reserved for AI-generated branches."
            exit 1
          fi
          
          echo "✅ No forbidden prefixes found"
```

### Pre-Push Git Hook (Lefthook)

```yaml
# .lefthook/pre-push.yml
skip_on:
  - merge
  - rebase

commands:
  validate-branch-name:
    glob: ""
    run: |
      BRANCH=$(git rev-parse --abbrev-ref HEAD)
      
      # Skip protected branches
      if [[ "$BRANCH" =~ ^(main|develop|master)$ ]]; then
        exit 0
      fi
      
      # Skip exempted branches
      if [[ "$BRANCH" =~ ^(dependabot|renovate)/ ]]; then
        echo "✅ Branch $BRANCH is exempted (automated dependency update)"
        exit 0
      fi
      
      # Load types from canonical file if available
      TYPES=$(grep "^  [a-z]" .github/branch-types.yml 2>/dev/null | sed 's/:.*//' | paste -sd '|' -)
      
      # Validate format
      if [[ ! $BRANCH =~ ^($TYPES)/[a-z0-9]+-[a-z0-9-]+$ ]]; then
        echo "❌ Invalid branch name: $BRANCH"
        echo ""
        echo "Expected pattern: {type}/{scope}-{title}"
        echo "Example: feat/user-auth-login"
        exit 1
      fi
      
      echo "✅ Branch name is valid: $BRANCH"
```

### NPM Script Validation

```json
{
  "scripts": {
    "validate:branch": "node scripts/validate-branch-name.js",
    "prepare": "husky install"
  }
}
```

```javascript
// scripts/validate-branch-name.js
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load types from canonical file
let TYPES = ['feat', 'fix', 'hotfix', 'release', 'refactor', 'docs', 'test', 'ci', 'chore', 'task'];
try {
  const configPath = path.join(process.cwd(), '.github', 'branch-types.yml');
  const config = fs.readFileSync(configPath, 'utf8');
  TYPES = config
    .match(/^  [a-z]+:/gm)
    .map(m => m.replace(/[^a-z]/g, ''))
    .filter(Boolean);
} catch (e) {
  // Use defaults if file not found
}

const branch = process.argv[2] || process.env.BRANCH || require('child_process')
  .execSync('git rev-parse --abbrev-ref HEAD')
  .toString()
  .trim();

// Skip exempted branches
if (/^(main|develop|master|dependabot|renovate)/.test(branch)) {
  console.log(`✅ Branch ${branch} is exempted or protected`);
  process.exit(0);
}

// Validate format
const pattern = new RegExp(`^(${TYPES.join('|')})/[a-z0-9]+-[a-z0-9-]+$`);
if (pattern.test(branch)) {
  console.log(`✅ Valid branch: ${branch}`);
  process.exit(0);
} else {
  console.error(`❌ Invalid branch: ${branch}`);
  console.error(`Pattern: {type}/{scope}-{title}`);
  console.error(`Valid types: ${TYPES.join(', ')}`);
  console.error(`Example: feat/user-auth-login`);
  process.exit(1);
}
```

## Configuration Files

### .github/branch-types.yml

Canonical file defining all approved branch types:

```yaml
feat:
  template: pr_feature.md
  labels:
    - type:feature
  examples:
    - feat/user-auth-login

security:
  template: pr_security.md
  labels:
    - type:security
    - priority:critical
  examples:
    - security/csrf-token-validation
```

### .github/branch-labels.yml

Mapping of types to labels and area keywords:

```yaml
feat:
  default_labels:
    - type:feature
  area_keywords:
    - api
    - ui
    - backend
    - frontend

security:
  default_labels:
    - type:security
    - priority:critical
  area_keywords:
    - security
    - auth
    - vulnerability
```

## Automated Label Application

Once branch is validated and PR created:

1. **Type Label** applied from branch type
   - `feat/` → `type:feature`
   - `security/` → `type:security` + `priority:critical`
   - etc.

2. **Area Labels** inferred from scope keywords
   - Scope `auth` + branch type `security/` → `area:security`
   - Scope `api` + branch type `feat/` → `area:integration`
   - etc.

3. **PR Template** auto-selected
   - `feat/` → `pr_feature.md`
   - `fix/` → `pr_bug.md`
   - `security/` → `pr_security.md`
   - etc.

## Handling Validation Failures

### On CI Failure

If branch validation fails in CI:

1. Rename branch locally:
   ```bash
   git branch -m old-name new-name
   ```

2. Force push (only if branch not yet reviewed):
   ```bash
   git push origin --force-with-lease old-name:new-name
   ```

3. Update PR or close/reopen with new branch

### Common Issues

**Uppercase letters:** `Feat/UserAuth` → `feat/user-auth`
**Underscores:** `feat/user_auth` → `feat/user-auth`
**Wrong type:** `feature/login` → `feat/user-login`
**Too short:** `feat/auth` → `feat/user-auth-login`

## Monitoring

Track branch validation in CI:

```bash
# Count validation failures (GitHub CLI)
gh api repos/owner/repo/actions/runs \
  --jq '.workflow_runs[] | select(.conclusion=="failure") | .name' \
  | grep -c "Validate Branch"

# View recent failures
gh run list --workflow=validate-branch.yml --limit=10
```

## Best Practices

1. **Validate Early** — Check branch name before committing
2. **Use Templates** — Copy example names when creating branches
3. **Skip Only When Needed** — Exemptions exist for dependabot/renovate only
4. **Sync Canonical Files** — Keep `.github/branch-types.yml` in sync
5. **Review PRs** — Branch name impacts template routing and labeling

## Troubleshooting

**CI validation passes but template doesn't apply**
- Check branch type matches exactly (case-sensitive)
- Verify `.github/branch-types.yml` is in the repo
- Check PR template file exists

**Local validation passes but CI fails**
- Local and CI may have different type lists
- Pull latest `.github/branch-types.yml`
- Sync canonical files: `npm run sync`

**Want to override validation**
- Contact team lead or repo maintainer
- May need to update `.github/branch-types.yml` first
- Document exceptions in `CONTRIBUTING.md`
