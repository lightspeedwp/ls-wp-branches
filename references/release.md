# WordPress Block Release Management Skill

Comprehensive guidance for planning, coordinating, and executing block releases.

## When to Use

- **Planning a block release** — Version bumping, changelog updates
- **Multi-block coordination** — Releasing multiple blocks together
- **Breaking changes** — Versioning strategy, deprecation paths
- **Release notes** — Changelog formatting, migration guides
- **WordPress.org deployment** — SVN, stable tags, version management
- **Hotfix management** — Emergency production fixes

## Semantic Versioning for Blocks

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (incompatible saves)
MINOR: New features (backward compatible)
PATCH: Bug fixes only
```

### Examples

```
1.0.0  - Initial release
1.1.0  - New carousel variations (backward compatible)
1.1.1  - Bug fix for mobile layout
2.0.0  - Breaking change: new block API
```

## Release Workflow

### Step 1: Prepare Release Branch

```bash
# Create release branch
git checkout -b release/block-v2-0-0
```

### Step 2: Update Versions

**For block plugins:**
```bash
# Update plugin.php header
Version: 2.0.0

# Update package.json
"version": "2.0.0"

# Update readme.txt
Stable tag: 2.0.0
```

**For block themes:**
```bash
# Update style.css header
Version: 2.0.0

# Update package.json
"version": "2.0.0"
```

### Step 3: Update CHANGELOG

**CHANGELOG.md format:**
```markdown
## 2.0.0 - 2024-03-15

### Added
- New carousel block with swipe gestures
- Video background support for hero block
- Advanced customization options

### Changed
- Refactored button block internals
- Updated to WordPress 6.4 block API

### Fixed
- Mobile layout issues on iOS Safari
- Color contrast for accessibility

### Deprecated
- Old carousel API (use new variant instead)

### Removed
- Legacy block template support

### Breaking Changes
- `data-slides` attribute removed (use `data-items`)
- Old color picker removed (use theme tokens)
- Migration guide: see MIGRATION.md
```

### Step 4: Create Migration Guide (if breaking changes)

**MIGRATION.md:**
```markdown
# Migration Guide: Block v2.0.0

## Breaking Changes

### Old Carousel API → New

**Before (v1.x):**
```jsx
<!-- wp:plugin-name/carousel {
  "autoplay": true,
  "delay": 5000
} /-->
```

**After (v2.0.0):**
```jsx
<!-- wp:plugin-name/carousel {
  "autoplayEnabled": true,
  "autoplayDelay": 5000
} /-->
```

### Automatic Migration

Blocks automatically migrate old saves to new format via `deprecated` field in block.json:

```json
{
  "version": "2.0.0",
  "deprecated": [
    {
      "supports": {...},
      "attributes": {...},
      "save": () => { /* old save format */ }
    }
  ]
}
```

### Manual Steps Required

None — migration is automatic.
```

### Step 5: Commit Release

```bash
git commit -m "release(block): version 2.0.0

- Add carousel swipe gesture support
- Add video backgrounds for hero
- Update to WordPress 6.4 block API
- Improve accessibility compliance
- See CHANGELOG.md for full details
- See MIGRATION.md for breaking changes

Closes #999"

git push -u origin release/block-v2-0-0
```

## Release Checklist

**Before Release:**
- [ ] All tests pass (Jest >85%, E2E, A11y)
- [ ] CHANGELOG.md updated
- [ ] Version bumped in all files
- [ ] MIGRATION.md created (if breaking changes)
- [ ] Deprecated items documented
- [ ] Branch protection rules passing
- [ ] Code review approved
- [ ] Accessibility audit passing
- [ ] Performance benchmarks acceptable

**After Merge to Main:**
- [ ] Create git tag: `git tag block-v2-0-0`
- [ ] Push tag: `git push origin block-v2-0-0`
- [ ] Create GitHub Release with changelog
- [ ] Back-merge to develop branch

**For WordPress.org (Plugins):**
- [ ] Update readme.txt with new version
- [ ] Add new Changelog section
- [ ] Test plugin installation
- [ ] Deploy via SVN to WordPress.org

## Multi-Block Release Coordination

### Coordinating Multiple Blocks

**Scenario:** Releasing 5 blocks with shared dependencies

```bash
# Single release branch
git checkout -b release/multi-block-v2-0-0

# Update each block:
#   blocks/carousel/block.json - version 2.0.0
#   blocks/accordion/block.json - version 2.0.0
#   blocks/form/block.json - version 2.0.0
#   blocks/hero/block.json - version 2.0.0
#   blocks/testimonial/block.json - version 2.0.0

# Single CHANGELOG.md entry covering all
# Single package.json version bump

# Single commit, single PR, single release
git commit -m "release(blocks): version 2.0.0
- New features for carousel, accordion, form, hero, testimonial
- Breaking changes: see MIGRATION.md"
```

## Breaking Changes Strategy

### Deprecation Process

1. **Version N**: Feature works, mark as deprecated
2. **Version N+1**: Feature still works, show deprecation notice
3. **Version N+2**: Feature removed

### Example Deprecation

**Version 1.5 (deprecated):**
```javascript
// Old prop still works, but console warning
if (itemsPerPage !== undefined) {
  console.warn('itemsPerPage is deprecated. Use slidesPerView instead.');
  slidesPerView = itemsPerPage;
}
```

**Version 1.6 (final deprecation):**
```javascript
// Warning, prepare users
console.warn('itemsPerPage will be removed in v2.0');
```

**Version 2.0 (removal):**
```javascript
// Removed completely
// Use slidesPerView instead
```

## Hotfix Management

### Emergency Production Fix

```bash
# Branch from main only!
git checkout -b hotfix/block-button-critical-bug

# Fix the issue
# Add regression test

# Bump PATCH version only
# 1.2.3 → 1.2.4

# Commit
git commit -m "hotfix(block-button): critical rendering bug

- Fix button not rendering on iOS Safari
- Add regression test
- Version 1.2.4"

# Merge to main
git push -u origin hotfix/block-button-critical-bug
# Create PR, merge, tag: block-v1-2-4

# Back-merge to develop
git checkout develop
git merge main
git push origin develop
```

## WordPress.org Deployment (Plugins)

### SVN Structure

```
wporg-plugin-repo/
├── trunk/              # Main development (v2.0.0)
├── tags/
│   ├── 1.0.0/
│   ├── 1.1.0/
│   └── 2.0.0/         # Released versions
└── branches/
    └── stable/        # Stable branch
```

### SVN Deployment Process

```bash
# 1. Prepare release on main branch
npm run build
git tag block-v2-0-0
git push origin block-v2-0-0

# 2. Checkout SVN
svn checkout https://plugins.svn.wordpress.org/plugin-name/ wporg

# 3. Update trunk/ with new version
cp -r build/* wporg/trunk/
cp plugin.php wporg/trunk/

# 4. Create tag
cp -r wporg/trunk wporg/tags/2.0.0

# 5. Commit
cd wporg
svn add trunk/ tags/2.0.0
svn commit -m "Release version 2.0.0"

# 6. Plugin is now live on WordPress.org
```

### readme.txt Format

```
=== Block Plugin Name ===
Contributors: author
Requires at least: 5.0
Requires PHP: 7.4
Stable tag: 2.0.0
License: GPL-2.0-or-later

Plugin description

== Installation ==
1. Upload to /wp-content/plugins/
2. Activate in WordPress admin
3. Blocks appear in editor

== Frequently Asked Questions ==
Q: How do I use the carousel block?
A: Search for "Carousel" in the block editor

== Changelog ==

= 2.0.0 =
* New carousel block with swipe
* Video backgrounds for hero
* Breaking change: see MIGRATION.md

= 1.1.0 =
* Add accordion block
* Improve performance

= 1.0.0 =
* Initial release
```

## Release Checklist Automation

### GitHub Actions for Releases

```yaml
name: Release

on:
  push:
    tags:
      - 'block-v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run test
      - run: npm run build
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          body_path: CHANGELOG.md
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      # Deploy to WordPress.org (if applicable)
      - name: Deploy to WordPress.org
        uses: 10up/action-wordpress-plugin-deploy@stable
        env:
          SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
          SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
```

## Release Calendar

Plan releases around:
- WordPress major releases (schedule release after)
- Plugin review (allow 1-2 weeks for WordPress.org)
- Team availability
- Feature completion

## Support

For branch strategy → Use main `branch-validation-wordpress` skill
For theme releases → Use [references/themes.md](themes.md)
For plugin releases → Use [references/plugins.md](plugins.md)
For testing before release → Use [references/testing.md](testing.md)
