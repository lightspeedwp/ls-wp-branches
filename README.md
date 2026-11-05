# Branch Validation for WordPress Block Development

A comprehensive Claude Code skill for validating branch names and providing workflow guidance specifically tailored for WordPress block theme and block plugin development.

## What This Skill Does

✅ **Validates branch names** against WordPress block development conventions  
✅ **Enforces LightSpeed WP org-wide strategy** for consistent naming across projects  
✅ **Guides block development workflows** with step-by-step procedures  
✅ **Provides block-specific testing strategies** (unit, E2E, accessibility, performance)  
✅ **Coordinates releases** for WordPress blocks, themes, and plugins  
✅ **Integrates with CI/CD** for automated validation and testing  

## When to Use This Skill

### ✅ Use This Skill For

- Creating a new WordPress block feature branch
- Validating a branch name before pushing
- Understanding block development workflow
- Planning a block release or version bump
- Setting up testing for interactive/display/container blocks
- Coordinating multiple block features
- Understanding block pattern development
- Finding block development best practices

### 🤖 Use the WordPress Block Branching Agent For

- Complex architectural decisions for blocks
- Release coordination across multiple blocks
- CI/CD optimization for block validation
- Troubleshooting non-standard block scenarios
- Multi-team block development coordination
- Strategic block versioning decisions

## Quick Start

### Example 1: Validate a Block Branch

```
User: I'm creating a new hero block with parallax. What branch should I name it?

Skill Response:
✅ Branch name: feat/block-hero-parallax
Type: Feature Development
Pattern: feat/block-{blockname}-{feature}

Requirements:
- block.json with metadata
- edit.js editor component  
- save.js frontend rendering
- style.scss styling
- Jest tests (>85% coverage)
- Playwright E2E tests
- WCAG 2.2 AAA accessibility compliance
```

### Example 2: Release a Block Version

```
User: How do I release version 2.0.0 of my block with breaking changes?

Skill Response:
1. Create branch: release/block-v2-0-0
2. Update version in block.json, package.json, style.css
3. Update CHANGELOG.md with breaking changes
4. Document deprecation path for users
5. Implement migration for old block versions
6. Commit and create PR
7. CI validates version, tests, documentation
8. Merge and tag: block-v2-0-0
9. Document upgrade procedure
```

## Branch Types for WordPress Block Development

### Feature Development (6 types)

| Type | Pattern | Purpose | Example |
|------|---------|---------|---------|
| `feat/block-*` | `feat/block-{name}-{feature}` | New block or feature | `feat/block-hero-parallax` |
| `feat/block-*-a11y` | `feat/block-{name}-accessibility` | Accessibility improvements | `feat/block-form-a11y-labels` |
| `perf/block-*` | `perf/block-{name}-{optimization}` | Performance optimization | `perf/block-slider-lazy-load` |
| `feat/block-patterns-*` | `feat/block-patterns-{category}` | Block pattern library | `feat/block-patterns-landing` |
| `research/block-*` | `research/block-{topic}` | Block research/spike | `research/block-interactivity` |
| `refactor/block-*` | `refactor/block-{name}-{change}` | Block refactoring | `refactor/block-tabs-hooks` |

### Bug Fixes & Security (3 types)

| Type | Pattern | Purpose | Example |
|------|---------|---------|---------|
| `fix/block-*` | `fix/block-{name}-{issue}` | Block bug fix | `fix/block-button-contrast` |
| `security/block-*` | `security/block-{name}-{fix}` | Security fix | `security/block-html-xss` |
| `a11y/block-*` | `a11y/block-{name}-{issue}` | Accessibility fix | `a11y/block-menu-keyboard` |

### Testing & Infrastructure (4 types)

| Type | Pattern | Purpose | Example |
|------|---------|---------|---------|
| `test/block-*` | `test/block-{name}-{type}` | Block testing | `test/block-gallery-e2e` |
| `ci/block-*` | `ci/block-{tool}-{improvement}` | CI/CD for blocks | `ci/block-e2e-setup` |
| `docs/block-*` | `docs/block-{name}-{section}` | Block documentation | `docs/block-carousel-guide` |
| Other types | Various | Standard types | `refactor/*, chore/*, task/*` |

### Release & Versioning (2 types)

| Type | Pattern | Purpose | Example |
|------|---------|---------|---------|
| `release/block-*` | `release/block-v{MAJOR}-{MINOR}-{PATCH}` | Block release | `release/block-v2-0-0` |
| `hotfix/block-*` | `hotfix/block-{name}-critical` | Critical production fix | `hotfix/block-image-regression` |

## Directory Structure

```
branch-validation-wordpress/
│
├── README.md                         # This file (start here!)
├── SKILL.md                          # Main skill definition
├── AGENTS.md                         # Agent definitions
├── CLAUDE.md                         # Project configuration
├── CHANGELOG.md                      # Version history
│
├── docs/                             # Complete documentation
│   ├── INDEX.md                      # Documentation index & navigation
│   ├── ONBOARDING.md                 # 15-minute quickstart for new team members
│   ├── CONTRIBUTING.md               # How to improve this skill
│   ├── QUALITY_ASSURANCE.md          # Verification checklist (95/100)
│   ├── TEAM_READY_SUMMARY.md         # Deployment summary
│   ├── BRANCHING_STRATEGY_WORDPRESS_BLOCKS.md    # Block branching patterns
│   ├── WORDPRESS_BLOCK_THEME_GUIDE.md            # Theme development guide
│   └── WORDPRESS_BLOCK_PLUGIN_GUIDE.md           # Plugin development guide
│
├── references/                       # Loaded by SKILL.md when needed
│   ├── themes.md                     # Theme-specific patterns
│   ├── plugins.md                    # Plugin-specific patterns
│   ├── architecture.md               # Component design
│   ├── security.md                   # Security hardening
│   ├── accessibility.md              # WCAG 2.2
│   ├── testing.md                    # Testing strategies
│   ├── release.md                    # Release management
│   ├── branch-types.yml              # Synced from lightspeedwp/.github
│   ├── branch-labels.yml             # Synced from lightspeedwp/.github
│   └── LIGHTSPEED_INTEGRATION.md     # Canonical LightSpeed strategy mapping
│
├── prompts/                          # LLM prompts for validation
│   ├── validate-wordpress-block-branch.md         # Branch validation prompt
│   └── (Additional prompts)
│
├── assets/                           # Templates, checklists, examples
│   └── README.md                     # Asset documentation
│
├── scripts/                          # Validation and automation scripts
│   ├── validate-branch-name.cjs      # Synced from lightspeedwp/.github; do not edit
│   ├── sync-canonical.ts             # Refreshes the synced files (npm run sync)
│   └── __tests__/                    # Vitest suites (npm test, 80% coverage enforced)
│
├── vitest.config.ts                  # Test and coverage configuration
└── tsconfig.json                     # Type checking (npm run typecheck)
```

## Key Concepts

### Block Types

**Interactive Blocks**
- User interaction required (carousel, form, accordion)
- Requires: Unit + E2E + A11y + Visual tests
- Example: `feat/block-carousel-swipe-nav`

**Display Blocks**
- Content display only (hero banner, testimonial)
- Requires: Visual + A11y tests
- Example: `feat/block-hero-parallax`

**Container Blocks**
- Hold other blocks (columns, tabs, group)
- Requires: E2E (nesting) + A11y tests
- Example: `feat/block-accordion-container`

### Testing Requirements

| Block Type | Unit | E2E | A11y | Visual |
|-----------|------|-----|------|--------|
| Interactive | ✅ | ✅ | ✅ | ✅ |
| Display | ✅ | — | ✅ | ✅ |
| Container | ✅ | ✅ | ✅ | ✅ |
| Pattern | — | — | ✅ | ✅ |

## Example Workflows

### Creating a New Block

```bash
1. Create branch: git checkout -b feat/block-hero-parallax
2. Create block structure: mkdir -p src/blocks/hero
3. Implement: block.json, edit.js, save.js, style.scss
4. Write tests: Jest unit, Playwright E2E, accessibility
5. Commit: git commit -m "feat(block-hero): add parallax effect..."
6. Push: git push -u origin feat/block-hero-parallax
7. PR auto-labels: type:feature, area:blocks, priority:high
8. CI validates: WPCS, Jest, E2E, a11y, bundle size
9. Merge via squash merge
10. Block ready for use
```

### Fixing a Block Bug

```bash
1. Create branch: git checkout -b fix/block-button-contrast
2. Fix issue: Update button styles, add tests
3. Commit: git commit -m "fix(block-button): improve color contrast..."
4. Push and create PR
5. CI validates: All tests pass, no regressions
6. Merge when approved
```

### Releasing a Block

```bash
1. Create branch: git checkout -b release/block-v1-2-0
2. Update versions: block.json, package.json, style.css
3. Update CHANGELOG.md
4. Commit: git commit -m "release(block): version 1.2.0"
5. PR created, all CI passes
6. Merge to main, create tag
7. Back-merge to develop
8. Block deployed to WordPress.org (if plugin)
```

## Documentation Map

**Getting Started:**
| Need | Read | Purpose |
|------|------|---------|
| 15-minute quickstart | [docs/ONBOARDING.md](docs/ONBOARDING.md) | Team member intro |
| Block naming patterns | [SKILL.md](SKILL.md) | Quick reference |
| Complete branching guide | [docs/INDEX.md](docs/INDEX.md) | Full documentation index |

**Specialized Guides:**
| Need | Read | Purpose |
|------|------|---------|
| Block development workflow | [docs/BRANCHING_STRATEGY_WORDPRESS_BLOCKS.md](docs/BRANCHING_STRATEGY_WORDPRESS_BLOCKS.md) | Step-by-step guide |
| Theme block development | [docs/WORDPRESS_BLOCK_THEME_GUIDE.md](docs/WORDPRESS_BLOCK_THEME_GUIDE.md) | Theme-specific patterns |
| Plugin block development | [docs/WORDPRESS_BLOCK_PLUGIN_GUIDE.md](docs/WORDPRESS_BLOCK_PLUGIN_GUIDE.md) | Plugin-specific patterns |
| Architecture & component design | [references/architecture.md](references/architecture.md) | Component patterns, hooks |
| Security hardening | [references/security.md](references/security.md) | XSS, validation, audit |
| Accessibility (WCAG AAA) | [references/accessibility.md](references/accessibility.md) | Keyboard nav, screen readers |
| Testing strategies | [references/testing.md](references/testing.md) | Jest, Playwright, a11y |
| Release management | [references/release.md](references/release.md) | Versioning, deployment |

**Reference & Integration:**
| Need | Read | Purpose |
|------|------|---------|
| Canonical strategy mapping | [references/LIGHTSPEED_INTEGRATION.md](references/LIGHTSPEED_INTEGRATION.md) | Org-wide integration |
| Contributing guidelines | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Improve the skill |
| Quality assurance | [docs/QUALITY_ASSURANCE.md](docs/QUALITY_ASSURANCE.md) | Verification checklist |
| Team readiness | [docs/TEAM_READY_SUMMARY.md](docs/TEAM_READY_SUMMARY.md) | Deployment summary |
| Agent reference | [AGENTS.md](AGENTS.md) | When to use agent |
| Changelog | [CHANGELOG.md](CHANGELOG.md) | Recent updates |

## Integration with LightSpeed WP

This skill integrates the canonical LightSpeed WP branching strategy with WordPress block-specific conventions:

- ✅ Follows org-wide `{type}/{scope}-{title}` pattern
- ✅ Uses approved type list (30+ types)
- ✅ Respects forbidden prefixes (claude/, copilot/, openai/)
- ✅ Enforces WordPress block naming: `feat/block-{name}-{feature}`
- ✅ Supports org-wide CI/CD validation
- ✅ Compatible with PR template routing
- ✅ Auto-labels branches by type and area
- ✅ Routes to WordPress branching agent for complex decisions

See [LIGHTSPEED_INTEGRATION.md](references/LIGHTSPEED_INTEGRATION.md) for complete mapping.

## Troubleshooting

### Branch Name Not Valid

```
Error: "feat/button-block-color-fix"
Issue: Missing "block-" prefix

Fix: "feat/block-button-color-fix"
Pattern: feat/block-{blockname}-{feature}
```

### Type Not Recognized

```
Error: "feature/block-hero-parallax"
Issue: "feature" not an approved type

Fix: "feat/block-hero-parallax"
Approved types: feat, fix, a11y, perf, test, ci, docs, release, hotfix, security, etc.
```

### CI Tests Failing

Check:
- [ ] Jest tests passing with >85% coverage
- [ ] Playwright E2E tests included
- [ ] Accessibility audit passed (axe-core)
- [ ] WordPress Coding Standards clean
- [ ] No console errors
- [ ] CHANGELOG.md updated

## Support & Resources

**For simple questions:**
- Use this skill directly
- Check the documentation
- Review example workflows

**For complex decisions:**
- Invoke the WordPress Block Branching Agent
- Needed for release coordination, CI/CD setup, architectural decisions

**External Resources:**
- [WordPress Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [LightSpeed WP .github Repository](https://github.com/lightspeedwp/.github)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [WCAG 2.2 Accessibility Standards](https://www.w3.org/WAI/WCAG22/quickref/)

## Features at a Glance

- ✅ Block-specific branch name validation
- ✅ Step-by-step development workflows
- ✅ Testing strategy guidance per block type
- ✅ Release and version management
- ✅ Accessibility compliance (WCAG 2.2 AAA)
- ✅ Performance optimization guidance
- ✅ CI/CD integration examples
- ✅ GitHub Actions workflow templates
- ✅ Commits message format guide
- ✅ Theme and plugin development guides
- ✅ Pattern library best practices
- ✅ Multi-block coordination support
- ✅ LightSpeed WP canonical strategy integration
- ✅ WordPress standards compliance

## Version

**Current Version:** 1.0.0  
**Last Updated:** 2026-10-30  
**Compatibility:** WordPress 5.0+, Gutenberg, wp-scripts, Node.js 16+

---

**Need help?** Refer to the appropriate documentation or invoke the WordPress Block Branching Agent for complex scenarios.
