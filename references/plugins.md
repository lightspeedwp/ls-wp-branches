# WordPress Block Plugin Development Skill

Complete workflow for developing, testing, and releasing blocks as WordPress plugins.

## When to Use

- **Creating standalone block plugins** — Accordion, carousel, pricing table plugins
- **Plugin structure setup** — Organizing blocks/, patterns/, tests/ directories
- **Plugin registration** — Block registration, REST API integration
- **Plugin testing** — PHPUnit + Jest + Playwright test suites
- **WordPress.org deployment** — Version management, readme.txt, stable tags
- **Plugin settings** — Admin panels, block configuration, options storage

## Branch Naming for Plugin Development

### Plugin Feature Branches

```
feat/plugin-blocks-{blockname}
feat/plugin-patterns-{category}
feat/plugin-settings-{feature}
feat/plugin-api-{integration}
```

**Examples:**
```
feat/plugin-blocks-accordion
feat/plugin-patterns-testimonials
feat/plugin-settings-color-picker
feat/plugin-api-rest-endpoint
```

## Complete Plugin Development Workflow

### Step 1: Plugin Structure

```
block-plugin/
├── plugin.php                   # Main plugin file
├── readme.txt                   # Plugin readme (Version here!)
├── package.json                 # NPM dependencies
├── blocks/
│   ├── accordion/
│   │   ├── block.json
│   │   ├── edit.js
│   │   ├── save.js
│   │   └── style.scss
│   └── index.php                # Block registration
├── patterns/                    # Block patterns
├── src/                         # Development source
├── build/                       # Compiled assets
└── tests/
    ├── unit/                    # PHPUnit tests
    └── e2e/                     # Playwright E2E tests
```

### Step 2: Plugin Header

**plugin.php:**
```php
<?php
/**
 * Plugin Name: Block Plugin Name
 * Plugin URI: https://example.com
 * Description: Collection of Gutenberg blocks
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL-2.0-or-later
 * Text Domain: block-plugin
 * Domain Path: /languages
 */

defined( 'ABSPATH' ) || exit;

// Plugin initialization
require_once plugin_dir_path( __FILE__ ) . 'blocks/index.php';
```

### Step 3: Block Registration

**blocks/index.php:**
```php
<?php
function block_plugin_register_blocks() {
  $blocks = array( 'accordion', 'carousel' );
  
  foreach ( $blocks as $block ) {
    $block_json = dirname( __FILE__ ) . "/{$block}/block.json";
    if ( file_exists( $block_json ) ) {
      register_block_type( $block_json );
    }
  }
}
add_action( 'init', 'block_plugin_register_blocks' );
```

### Step 4: Testing Setup

**PHPUnit Tests (block registration):**
```php
class Test_Block_Registration extends WP_UnitTestCase {
  public function test_accordion_block_registered() {
    $registry = WP_Block_Type_Registry::get_instance();
    $this->assertTrue( 
      $registry->is_registered( 'block-plugin/accordion' ) 
    );
  }
}
```

**Jest Unit Tests:**
```bash
npm run test blocks/accordion/ --coverage
# Required: >85% coverage
```

**Playwright E2E Tests:**
```bash
npm run test:e2e blocks/accordion/
# Block insertion, attribute changes, rendering
```

### Step 5: Commit & Push

```bash
git commit -m "feat(plugin-blocks): add accordion block

- Create accordion block with collapsible items
- Support single/multiple open mode
- Add block.json, edit.js, save.js, styles
- Include PHPUnit registration tests
- Add Jest unit tests (>85% coverage)
- Add Playwright E2E tests
- Update readme.txt
- Update CHANGELOG.md

Closes #123"

git push -u origin feat/plugin-blocks-accordion
```

## Version Management

### Update Versions

```bash
# Update in:
# 1. plugin.php - Plugin header
# 2. readme.txt - Stable tag
# 3. package.json - version field
```

### Semantic Versioning

```
MAJOR.MINOR.PATCH

1.0.0 - Breaking changes
1.1.0 - New features (backward compatible)
1.0.1 - Bug fixes only
```

### Release to WordPress.org

```bash
# 1. Update version numbers
# 2. Update readme.txt:
#    Stable tag: 1.1.0
#    == Changelog ==
#    = 1.1.0 =
#    * New accordion block
#    * Bug fixes

# 3. Commit and tag
git tag v1.1.0

# 4. Push to SVN repository
#    trunk/ → main development
#    tags/1.1.0/ → release tag
#    branches/stable/ → stable version
```

## Testing Checklist

- [ ] PHPUnit tests pass
- [ ] Jest unit tests pass (>85% coverage)
- [ ] Playwright E2E tests pass
- [ ] Accessibility audit passes (WCAG 2.2 AAA)
- [ ] WordPress Coding Standards pass
- [ ] Linting passes
- [ ] Plugin activates without errors
- [ ] Blocks appear in inserter
- [ ] Blocks save/publish correctly
- [ ] Block renders on frontend
- [ ] readme.txt formatted correctly
- [ ] CHANGELOG.md updated

## WordPress.org Compliance

- ✅ GPL 2.0+ license
- ✅ Plugin header complete
- ✅ Proper escaping/sanitization
- ✅ Nonce verification for admin
- ✅ Capability checks
- ✅ No external dependencies on incompatible licenses
- ✅ No admin.css overrides for frontend
- ✅ Plugin tested with current WordPress version

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build production assets

# Testing
npm run test             # Run all tests
npm run test:unit        # PHPUnit only
npm run test:e2e         # Playwright only
npm run test:a11y        # Accessibility audit

# Code Quality
npm run lint             # ESLint
npm run format           # Prettier
npm run validate         # All checks

# Release
npm version minor        # Bump version
npm run build            # Build for release
```

## Plugin Development Resources

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [Block API Documentation](https://developer.wordpress.org/block-editor/reference-guides/block-api/)
- [Plugin Security Guide](https://developer.wordpress.org/plugins/security/)
- [WordPress.org Plugin Review Guidelines](https://developer.wordpress.org/plugins/wordpress-org/plugin-review-guidelines/)
- [WCAG 2.2 Standards](https://www.w3.org/WAI/WCAG22/quickref/)

## Support

For complex branch strategy → Use main `branch-validation-wordpress` skill
For testing guidance → Use [references/testing.md](testing.md)
For release coordination → Use [references/release.md](release.md)
