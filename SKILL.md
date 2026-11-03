---
name: branch-validation-wordpress
description: Choose, check and fix Git branch names against the LightSpeed org branching strategy ({type}/{scope}-{title}), for WordPress block themes, block plugins and any other LightSpeed repository. Use it before creating or renaming a branch, when a branch-name check fails locally or in CI, when Linear or Spec Kit suggests a branch name, when picking the branch type for a piece of work, or when planning a release or hotfix branch. Also has reference guides for block themes, block plugins, block testing, accessibility, security and releases.
compatibility: git, Node.js 18+ (the validator has no npm dependencies)
---

# Branch validation for WordPress projects

Every LightSpeed repository names branches the same way, so labels, PR templates and project fields can be set from the branch name. The rules come from the org strategy in [lightspeedwp/.github `docs/BRANCHING_STRATEGY.md`](https://github.com/lightspeedwp/.github/blob/develop/docs/BRANCHING_STRATEGY.md). This skill applies them; it does not add rules of its own.

## The pattern

```text
{type}/{scope}-{title}
```

- **type**: one of the allowed types below.
- **scope**: what the work affects (an area, a block, or a Linear issue key).
- **title**: a short description in the present tense.
- Lowercase letters, numbers and single hyphens only. No underscores, dots, spaces, uppercase or double hyphens.
- There must be at least one hyphen after the slash, so `fix/header` fails and `fix/header-sticky-overlap` passes.
- Release branches may also use a version: `release/v1.2.0`, `release/1.2.0`, or the standard form, such as `release/go-live-2026-12-01`.

`main` and `develop` are exempt, as are `dependabot/` and `renovate/` branches. Any other name, including `master` and `staging`, must match the pattern.

### Forbidden prefixes

Never create `claude/`, `copilot/` or `openai/` branches, even when a tool suggests one. CI rejects them. Name the branch for the work instead.

## Step 1: Choose the type

| The work is... | Type |
| --- | --- |
| A new feature, block, pattern, template or capability | `feat` |
| A bug fix | `fix` |
| An urgent fix for production | `hotfix` |
| Maintenance or tooling with no change in behaviour | `chore` |
| Restructuring code with no change in behaviour | `refactor` |
| Tests only | `test` (or `qa` for test harnesses and UAT scaffolding) |
| Documentation only | `docs` |
| Design tokens, design system or UI design changes | `design` (or `ds`, `ux`) |
| An accessibility fix | `a11y` |
| Performance | `perf` |
| Security | `security` |
| CI workflows | `ci`; bundling and build tooling: `build` |
| Dependency updates | `deps` |
| Content edits, redirects or IA | `content` |
| SEO, metadata, schema markup or sitemaps | `seo` |
| Site or plugin configuration | `config` |
| Data or content migration | `migrate` |
| A time-boxed spike | `research`; a prototype: `proto` |
| A release | `release` |

All 38 allowed types: `feat`, `fix`, `hotfix`, `release`, `refactor`, `chore`, `task`, `doc`, `docs`, `test`, `perf`, `ci`, `build`, `deps`, `security`, `revert`, `research`, `design`, `a11y`, `ux`, `i18n`, `ops`, `proto`, `ds`, `api`, `schema`, `telemetry`, `content`, `seo`, `config`, `migrate`, `qa`, `uat`, `audit`, `codex`, `aiops`, `automation`, `epic`. Descriptions and PR template routing are in [references/branch-types.yml](references/branch-types.yml).

## Step 2: Build the name

Pick the scope that makes the branch easiest to recognise:

| Situation | Scope | Example |
| --- | --- | --- |
| Work tracked in Linear | The issue key, lowercased | `feat/tsp-27-hero-layout` |
| A custom block | `block-{name}` | `feat/block-hero-parallax-scroll` |
| A core block style or variation | `block-core-{name}` | `feat/block-core-button-outline-style` |
| Block patterns | `block-patterns-{category}` | `feat/block-patterns-landing-pages` |
| A theme area | The area | `fix/header-sticky-overlap`, `design/tokens-spacing-scale` |

The `block-` scopes are a convention for readability. The validator does not require them.

Names suggested by other tools often fail, so convert them:

| Suggested | Problem | Use |
| --- | --- | --- |
| `feature/tsp-27-hero-layout` (Linear's default) | `feature` is not a type | `feat/tsp-27-hero-layout` |
| `zared/tsp-27-hero-layout` (Linear with a user prefix) | No type | `feat/tsp-27-hero-layout` |
| `001-concierge-hero` (Spec Kit's default) | No type | `feat/concierge-hero-section`, passed explicitly to Spec Kit |
| `claude/fix-header` | Forbidden prefix | `fix/header-sticky-overlap` |
| `feat/Hero_Block` | Uppercase and underscore | `feat/block-hero-layout` |

## Step 3: Validate before creating the branch

Use the repository's own copy of the validator when it has one, because that is the copy its CI runs:

```bash
node scripts/validation/validate-branch-name.cjs --branch <name>
```

If the repository has no copy, use the one bundled with this skill:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/validate-branch-name.cjs" --branch <name>
```

Exit code `0` means the name is valid. Exit code `1` means it is invalid, and the reason is printed. Without `--branch`, the script checks the current branch, reading `BRANCH_NAME`, `GITHUB_HEAD_REF` or `GITHUB_REF_NAME` before asking Git. `--show-pattern` prints the exact regular expressions.

Validate the name before running `git checkout -b`, not after. When you propose a branch to the user, show the name and the validator result together.

## Step 4: Branch from the right place

| Branch | From | PR into |
| --- | --- | --- |
| Most work (`feat`, `fix`, `docs`, `chore`, ...) | `develop` if the repository has it, otherwise `main` | The same branch |
| `release/...` | `develop` | `main`, then tag the release |
| `hotfix/...` | `main` | `main`, then merge back into `develop` |

Keep branches short-lived and small. PRs are squash-merged, so the PR title becomes the commit on the target branch, and the branch is deleted after merging. Commit, push and open PRs only when the user asks; follow their instructions on who reviews.

## Fixing a branch that already has the wrong name

```bash
git branch -m <old-name> <new-name>          # rename locally
git push origin -u <new-name>                # only when the user asks to push
git push origin --delete <old-name>          # only when the user confirms
```

An open PR cannot change its head branch. After renaming, open a new PR from the new branch and close the old one.

## Commit messages

Use Conventional Commits, with the scope matching the branch where it helps:

```text
feat(block-hero): add parallax scroll effect

Closes TSP-27
```

## Reference guides

Read these only when the task needs them:

- [references/themes.md](references/themes.md): block theme workflow (structure, `theme.json`, templates, patterns).
- [references/plugins.md](references/plugins.md): block plugin workflow (registration, settings, WordPress.org).
- [references/architecture.md](references/architecture.md): block component and hook design.
- [references/testing.md](references/testing.md): Jest, PHPUnit and Playwright strategy by block type.
- [references/accessibility.md](references/accessibility.md): WCAG 2.2 keyboard, focus, ARIA and contrast checks.
- [references/security.md](references/security.md): sanitising, escaping, nonces and capability checks in blocks.
- [references/release.md](references/release.md): semantic versioning, changelogs, release and hotfix flow.
- [references/branch-types.yml](references/branch-types.yml) and [references/branch-labels.yml](references/branch-labels.yml): canonical type, template and label maps.

These guides describe recommended practice. They do not describe CI that a given repository runs: check the repository's `.github/workflows/` before saying a check will run.

## Keeping this skill in sync

`scripts/validate-branch-name.cjs` and the files in `references/*.yml` are unmodified copies from `lightspeedwp/.github`. Do not edit them here. Run `scripts/sync-canonical.sh` to refresh them, then check the diff.
