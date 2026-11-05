# Team Onboarding: Branch Validation for WordPress Blocks

Welcome! This guide gets your team up to speed with the branch validation skill for WordPress block theme and plugin development.

## 🎯 What You Need to Know (5 min read)

### Your Branch Naming Pattern

```
{type}/block-{blockname}-{feature}
```

**Real Examples:**
```
feat/block-hero-parallax          ✅ New hero block with parallax
fix/block-carousel-mobile-layout  ✅ Bug fix for carousel on mobile
a11y/block-form-keyboard-nav      ✅ Keyboard navigation improvement
perf/block-slider-lazy-load       ✅ Performance optimization
release/block-v2-0-0              ✅ Release version 2.0.0
test/block-testimonial-e2e        ✅ E2E tests for testimonial block
```

**Invalid Examples & Fixes:**
```
feature/hero-block              ❌ Should be: feat/block-hero-feature
feat/HeroBlock                  ❌ Should be: feat/block-hero-feature
feat-block-hero-parallax        ❌ Should be: feat/block-hero-parallax
```

### The Three Questions

Before creating a branch, ask yourself:

1. **What type of work?**
   - New feature → `feat/`
   - Bug fix → `fix/`
   - Accessibility → `a11y/`
   - Performance → `perf/`
   - Testing → `test/`
   - Release → `release/`

2. **What block?**
   - `block-{blockname}` (lowercase, hyphens)
   - Examples: `block-hero`, `block-carousel`, `block-form`

3. **What's the feature/fix/change?**
   - Describe briefly (2-3 words max)
   - Examples: `parallax`, `mobile-layout`, `keyboard-nav`

## 📚 Quick Reference by Your Role

### I'm Creating a New Block

**In Theme Development:**
```bash
git checkout -b feat/block-hero-parallax

# Create files:
# - src/blocks/hero/block.json
# - src/blocks/hero/edit.js
# - src/blocks/hero/save.js
# - src/blocks/hero/style.scss

# Add tests:
# - npm run test blocks/hero/
# - npm run test:e2e blocks/hero/

git commit -m "feat(block-hero): add parallax scroll effect

- Implement parallax using Intersection Observer
- Add prefers-reduced-motion support
- Include E2E tests for interaction
- Update CHANGELOG.md

Closes #123"
```

**Read:** [WORDPRESS_BLOCK_THEME_GUIDE.md](docs/WORDPRESS_BLOCK_THEME_GUIDE.md)

**In Plugin Development:**
```bash
git checkout -b feat/plugin-blocks-accordion

# Create block in blocks/accordion/
# Register in blocks/index.php
# Write tests in tests/

git commit -m "feat(plugin-blocks): add accordion block..."
```

**Read:** [WORDPRESS_BLOCK_PLUGIN_GUIDE.md](docs/WORDPRESS_BLOCK_PLUGIN_GUIDE.md)

### I'm Fixing a Block Bug

```bash
# Is it a critical production bug?
git checkout -b hotfix/block-image-responsive-regression

# Is it a regular bug?
git checkout -b fix/block-button-color-contrast

# Make fix, test, commit, push
git commit -m "fix(block-button): improve color contrast per WCAG AA

- Update button color values
- Add regression test
- Verify on mobile

Closes #456"
```

### I'm Improving Accessibility

```bash
git checkout -b a11y/block-gallery-focus-management

# Test with screen reader and keyboard
git commit -m "a11y(block-gallery): add focus management

- Implement focus trap in modal
- Add ARIA labels
- Test with NVDA
- WCAG 2.2 AAA compliant"
```

### I'm Optimizing Performance

```bash
git checkout -b perf/block-slider-lazy-loading

# Measure before and after
git commit -m "perf(block-slider): implement lazy image loading

- Load images only when visible
- Before: LCP 2.8s → After: LCP 1.9s
- Include performance test

Closes #789"
```

### I'm Writing Tests

```bash
git checkout -b test/block-form-validation-e2e

# Jest unit tests
npm run test blocks/form/

# Playwright E2E tests
npm run test:e2e blocks/form/

# Accessibility tests
npm run test:a11y

git commit -m "test(block-form): add comprehensive E2E tests

- Input validation
- Form submission
- Error messages
- Keyboard navigation
- >85% coverage

Closes #321"
```

### I'm Releasing a Block

```bash
git checkout -b release/block-v2-0-0

# Update versions in:
# - block.json
# - package.json (if plugin)
# - style.css

# Update CHANGELOG.md with:
# - New features
# - Bug fixes
# - Breaking changes

git commit -m "release(block): version 2.0.0

- Add new carousel variations
- Fix mobile rendering issues
- Deprecate old API
- See CHANGELOG.md for migration

Closes #999"
```

**Read:** [BRANCHING_STRATEGY_WORDPRESS_BLOCKS.md](docs/BRANCHING_STRATEGY_WORDPRESS_BLOCKS.md#release-branches)

## 🧪 Testing Checklist by Block Type

### Interactive Blocks (carousel, accordion, form, etc.)

Your block needs:
- ✅ **Unit Tests** — Jest tests for logic
  ```bash
  npm run test blocks/carousel/ --coverage
  # Required: >85% coverage
  ```

- ✅ **E2E Tests** — Playwright tests for interaction
  ```bash
  npm run test:e2e blocks/carousel/
  # Test: Click, swipe, keyboard navigation
  ```

- ✅ **Accessibility Tests** — WCAG 2.2 AAA
  ```bash
  npm run test:a11y
  # Test: Screen reader, keyboard only, color contrast
  ```

- ✅ **Visual Tests** — Visual regression
  ```bash
  # Percy or Pixelmatch
  # Test: Desktop, tablet, mobile
  ```

### Display Blocks (hero, testimonial, banner, etc.)

Your block needs:
- ✅ **Unit Tests** — Basic Jest tests
- ✅ **Accessibility Tests** — WCAG 2.2 AAA
- ✅ **Visual Tests** — All breakpoints

### Container Blocks (tabs, accordion, columns, etc.)

Your block needs:
- ✅ **Unit Tests** — Jest tests
- ✅ **E2E Tests** — Nested block interaction
- ✅ **Accessibility Tests** — WCAG 2.2 AAA
- ✅ **Visual Tests** — Layout across breakpoints

## 🔍 Validation Before Pushing

### Self-Check Before Push

```bash
# 1. Is branch name valid?
npm run validate:branch-name -- --branch feat/block-hero-parallax
# ✅ Valid branch: feat/block-hero-parallax

# 2. Do all tests pass?
npm run test

# 3. Is code clean?
npm run lint

# 4. Is CHANGELOG.md updated?
grep "feat(block-hero)" CHANGELOG.md

# 5. Commit message good?
git log -1 --format=%B
# Should follow: {type}({scope}): {description}
```

### What GitHub Actions Will Check

When you push, automated checks will verify:

- ✅ Branch name follows pattern
- ✅ Jest tests pass (>85% coverage)
- ✅ Playwright E2E tests pass
- ✅ Accessibility audit passes
- ✅ WordPress Coding Standards pass
- ✅ No console errors
- ✅ CHANGELOG.md updated
- ✅ Commit message format correct

**If checks fail:**
1. Read the error message
2. Fix locally
3. Run tests again
4. Commit and push
5. Checks re-run automatically

## 📖 Documentation by Scenario

| You Need... | Read This |
|-----------|-----------|
| Block naming rules | [SKILL.md](SKILL.md) — 2 min read |
| How to build a theme block | [WORDPRESS_BLOCK_THEME_GUIDE.md](docs/WORDPRESS_BLOCK_THEME_GUIDE.md) — 15 min |
| How to build a plugin block | [WORDPRESS_BLOCK_PLUGIN_GUIDE.md](docs/WORDPRESS_BLOCK_PLUGIN_GUIDE.md) — 15 min |
| Block branching strategy | [BRANCHING_STRATEGY_WORDPRESS_BLOCKS.md](docs/BRANCHING_STRATEGY_WORDPRESS_BLOCKS.md) — 10 min |
| Fixing a branch name | [README.md](README.md#troubleshooting) — 2 min |
| WordPress standards | [External: WordPress Coding Standards](https://developer.wordpress.org/coding-standards/) — as needed |
| Block API reference | [External: Block Handbook](https://developer.wordpress.org/block-editor/) — as needed |
| Org-wide strategy | [LIGHTSPEED_INTEGRATION.md](references/LIGHTSPEED_INTEGRATION.md) — 5 min |

## 💬 Common Questions

### Q: Can I rename my branch after pushing?

**A:** Yes! If your branch name is wrong:

```bash
# 1. Rename locally
git branch -m old-name new-name

# 2. Push new name
git push origin new-name

# 3. Delete old remote branch
git push origin -d old-name

# 4. Update or recreate PR
```

### Q: What if I forgot to update CHANGELOG.md?

**A:** Add it in a follow-up commit:

```bash
# Edit CHANGELOG.md
git add CHANGELOG.md
git commit -m "docs(changelog): add entry for block feature"
git push
```

GitHub Actions will re-run checks and pass.

### Q: Should I test on mobile?

**A:** Yes! For all blocks:

1. Desktop (1920px)
2. Tablet (768px)
3. Mobile (375px)

Use Chrome DevTools or actual devices.

### Q: How do I know if WCAG 2.2 AAA is met?

**A:** Test with:

```bash
# Automated
npm run test:a11y

# Manual (free tools)
# 1. axe DevTools Chrome extension
# 2. Lighthouse in DevTools
# 3. NVDA screen reader (Windows)
# 4. VoiceOver (Mac/iPhone)
# 5. Keyboard only (Tab, Enter, Escape, Arrows)
```

### Q: What's the difference between `fix/` and `hotfix/`?

**A:**

- **`fix/`** — Regular bug, can wait for next release
  - Branch from: `develop`
  - Merge to: `develop` first

- **`hotfix/`** — Production-blocking critical bug
  - Branch from: `main`
  - Merge to: `main` AND back-merge to `develop`
  - Patch version bump only

### Q: Can multiple developers work on one block?

**A:** Yes! Use separate branches:

```
Developer 1: feat/block-hero-parallax
Developer 2: feat/block-hero-video-background

# Both branches stay independent
# Merge separately
# Coordinate in PR comments
```

### Q: How do I coordinate a release with multiple blocks?

**A:** Create one release branch:

```bash
git checkout -b release/v2-0-0

# Update all block versions
# Update CHANGELOG.md with all changes
# Single PR for entire release
```

For complex coordination, **invoke the WordPress Block Branching Agent**.

## 🚀 Getting Started

### First Time Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourorg/block-theme.git
cd block-theme

# 2. Install dependencies
npm install

# 3. Set up git hooks (if not automatic)
npm run setup:hooks

# 4. Create your first branch
git checkout -b feat/block-hero-parallax

# 5. Develop, test, commit
npm run dev
npm run test
npm run lint

git commit -m "feat(block-hero): add parallax effect..."

# 6. Push and create PR
git push -u origin feat/block-hero-parallax
```

### Development Workflow

```bash
# Start dev server
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch

# Format code
npm run format

# Lint before pushing
npm run lint

# Run full validation
npm run validate
```

## 🤝 How to Get Help

### Quick Questions

→ Check [README.md](README.md) or this file

### Block Development Help

→ Read the relevant guide:
- [WORDPRESS_BLOCK_THEME_GUIDE.md](docs/WORDPRESS_BLOCK_THEME_GUIDE.md)
- [WORDPRESS_BLOCK_PLUGIN_GUIDE.md](docs/WORDPRESS_BLOCK_PLUGIN_GUIDE.md)

### Complex Decisions

→ Invoke **WordPress Block Branching Agent**:

```
"I need help coordinating a release with 5 blocks that have breaking changes"
"How should I structure our CI/CD for block testing?"
"What's the best approach for deprecating an old block API?"
```

### Still Stuck?

1. Check [SKILL.md](SKILL.md) for branch type reference
2. Search documentation for your scenario
3. Check troubleshooting in [README.md](README.md)
4. Ask a team member
5. Invoke the agent for strategic questions

## 📋 Pre-Merge Checklist

Before asking for review on your PR:

- [ ] Branch name follows `{type}/block-{name}-{feature}` pattern
- [ ] All tests pass locally (`npm run test`)
- [ ] Tests pass with coverage >85% (`npm run test -- --coverage`)
- [ ] Linting passes (`npm run lint`)
- [ ] No console errors or warnings
- [ ] CHANGELOG.md updated with your change
- [ ] Commit message follows format
- [ ] Tested on mobile (375px), tablet (768px), desktop (1920px)
- [ ] Accessibility tested (keyboard, screen reader, color contrast)
- [ ] No breaking changes OR migration path documented
- [ ] WordPress Coding Standards followed

## 🎓 Learning Resources

**Team Resources:**
- [Branch Validation Main Skill](SKILL.md)
- [All Documentation](docs/)
- [Org-Wide Strategy](references/LIGHTSPEED_INTEGRATION.md)

**WordPress Block Development:**
- [Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [Block API Reference](https://developer.wordpress.org/block-editor/reference-guides/block-api/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)

**Testing & Quality:**
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

**Tools:**
- [Lighthouse (Chrome DevTools)](https://developer.chrome.com/docs/lighthouse/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [VoiceOver (Mac/iOS)](https://www.apple.com/accessibility/voiceover/)

## ✅ You're Ready!

You now know:
- ✅ How to name your branch
- ✅ What to put in your commit message
- ✅ How to test your block
- ✅ Where to find answers

**Pick a block to build and get started!**

Questions? → Check the docs → Ask the team → Invoke the agent

---

**Last Updated:** 2026-10-30  
**Version:** 1.0.0  
**Questions or improvements?** Contribute to the documentation!
