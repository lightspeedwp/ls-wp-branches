# WordPress Block Theme Development Skill

Complete workflow guidance for developing, validating, and releasing blocks in WordPress themes.

## When to Use

- **Creating custom blocks for themes** — Hero, testimonial, carousel, accordion blocks
- **Theme structure planning** — Organizing blocks/, templates/, patterns/ directories
- **Theme testing** — Jest unit tests, Playwright E2E, accessibility validation
- **theme.json configuration** — Global settings, color palettes, typography systems
- **Release management** — Version bumping, changelog updates, WordPress.org deployment

## Branch Naming for Theme Development

### Theme Feature Branches

```
feat/theme-blocks-{blockname}-{feature}
feat/theme-templates-{pagename}
feat/theme-patterns-{category}
feat/theme-customize-{feature}
refactor/theme-config-{change}
```

**Examples:**
```
feat/theme-blocks-hero-parallax
feat/theme-templates-case-study
feat/theme-patterns-landing-pages
feat/theme-customize-fonts-panel
refactor/theme-config-spacing-scale
```

## Complete Theme Development Workflow

### Step 1: Branch Creation

```bash
git checkout -b feat/theme-blocks-hero-parallax
```

### Step 2: Theme Block Structure

```
src/blocks/hero/
├── block.json              # Block metadata
├── edit.js                 # Editor component
├── save.js                 # Frontend rendering
├── style.scss              # Block styling
├── index.js                # Block registration
└── __tests__/
    └── hero.test.js        # Jest unit tests
```

### Step 3: Implement Block

- Create `block.json` with apiVersion 3 and proper attributes
- Build `edit.js` React component for editor interface
- Implement `save.js` for frontend rendering
- Add `style.scss` using theme tokens from `theme.json`
- Register block in `functions.php` via `wp_register_script()`

### Step 4: Test Coverage

**Unit Tests (Jest):**
```bash
npm run test src/blocks/hero/ --coverage
# Required: >85% coverage
```

**E2E Tests (Playwright):**
```bash
npm run test:e2e src/blocks/hero/
# Test block insertion, attribute changes, save/publish
```

**Accessibility Tests (WCAG 2.2 AAA):**
```bash
npm run test:a11y
# Screen reader, keyboard navigation, color contrast
```

### Step 5: Theme.json Integration

```json
{
  "version": 2,
  "styles": {
    "blocks": {
      "theme-name/hero": {
        "color": {
          "text": "var(--wp--preset--color--primary)",
          "background": "var(--wp--preset--color--light)"
        },
        "spacing": {
          "padding": "var(--wp--preset--spacing--medium)"
        }
      }
    }
  }
}
```

### Step 6: Commit & Push

```bash
git commit -m "feat(theme-blocks): add hero block with parallax

- Implement parallax scroll using Intersection Observer
- Add prefers-reduced-motion accessibility support
- Include Jest unit tests (>85% coverage)
- Add Playwright E2E tests
- Update CHANGELOG.md

Closes #123"

git push -u origin feat/theme-blocks-hero-parallax
```

## Testing Checklist

- [ ] Unit tests pass (`npm run test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] A11y audit passes (`npm run test:a11y`)
- [ ] Coverage >85% (`npm run test -- --coverage`)
- [ ] Linting passes (`npm run lint`)
- [ ] Block renders in editor
- [ ] Block displays on frontend
- [ ] Responsive on mobile/tablet/desktop
- [ ] WCAG 2.2 AAA compliant
- [ ] CHANGELOG.md updated

## Release Process

### For Minor/Feature Release

```bash
git checkout -b release/theme-v1-2-0

# Update versions
# - style.css Version header
# - package.json version
# - Update CHANGELOG.md

git commit -m "release(theme): version 1.2.0
- Add hero block with parallax
- Improve carousel mobile support
- Update CHANGELOG.md"

git push -u origin release/theme-v1-2-0
```

### GitHub Actions Checks

- ✅ Branch name validation
- ✅ Jest tests (>85% coverage)
- ✅ Playwright E2E tests
- ✅ Accessibility audit
- ✅ WordPress Coding Standards
- ✅ Bundle size check
- ✅ CHANGELOG.md validation

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build production assets

# Testing
npm run test             # Run Jest tests
npm run test:watch      # Watch mode
npm run test:e2e        # Playwright E2E tests
npm run test:a11y       # Accessibility audit

# Code Quality
npm run lint            # ESLint
npm run format          # Prettier
npm run validate        # All checks

# Release
npm version minor       # Bump version
npm run build           # Build for release
```

## Theme Development Resources

- [WordPress Block Theme Handbook](https://developer.wordpress.org/themes/block-themes/)
- [Theme.json Reference](https://developer.wordpress.org/themes/global-settings-and-styles/theme-json/)
- [Block Patterns Guide](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-patterns/)
- [WCAG 2.2 Standards](https://www.w3.org/WAI/WCAG22/quickref/)

## Support

For complex branch strategy questions → Use main `branch-validation-wordpress` skill
For testing strategy → Use [references/testing.md](testing.md)
For release coordination → Use [references/release.md](release.md)
