# WordPress Block Testing Strategy Skill

Comprehensive testing guidance for WordPress blocks with Jest, PHPUnit, Playwright, and accessibility validation.

## When to Use

- **Setting up Jest for block unit tests** — Configuration, coverage requirements
- **Creating Playwright E2E tests** — Block interaction, editor workflows
- **PHPUnit for server-rendered blocks** — Plugin/theme integration tests
- **Accessibility testing** — WCAG 2.2 AAA compliance, screen reader testing
- **Test coverage targets** — >85% coverage requirements
- **Performance testing** — Core Web Vitals, bundle size, render time

## Testing by Block Type

### Interactive Blocks (Carousel, Accordion, Form)

**Required Tests:**
- ✅ Jest unit tests (>85% coverage)
- ✅ Playwright E2E tests (all interactions)
- ✅ Accessibility tests (WCAG 2.2 AAA)
- ✅ Visual regression tests

### Display Blocks (Hero, Testimonial, Banner)

**Required Tests:**
- ✅ Jest unit tests
- ✅ Accessibility tests (WCAG 2.2 AAA)
- ✅ Visual regression tests

### Container Blocks (Tabs, Columns, Group)

**Required Tests:**
- ✅ Jest unit tests
- ✅ Playwright E2E tests (nesting, reordering)
- ✅ Accessibility tests (WCAG 2.2 AAA)
- ✅ Visual regression tests

## Jest Unit Testing

### Configuration

**jest.config.js:**
```javascript
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  collectCoverageFrom: [
    'src/blocks/**/*.js',
    '!src/blocks/**/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

### Example Test

```javascript
import { renderHook, act } from '@testing-library/react';
import useCarouselState from './useCarouselState';

describe('useCarouselState', () => {
  it('initializes with default active slide', () => {
    const { result } = renderHook(() => useCarouselState(5));
    expect(result.current.activeSlide).toBe(0);
  });

  it('advances to next slide', () => {
    const { result } = renderHook(() => useCarouselState(5));
    act(() => {
      result.current.nextSlide();
    });
    expect(result.current.activeSlide).toBe(1);
  });

  it('wraps to first slide after last', () => {
    const { result } = renderHook(() => useCarouselState(5));
    act(() => {
      result.current.goToSlide(4);
      result.current.nextSlide();
    });
    expect(result.current.activeSlide).toBe(0);
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test -- --coverage

# Specific file
npm run test -- blocks/carousel/
```

## Playwright E2E Testing

### Configuration

**playwright.config.js:**
```javascript
export const config = {
  testDir: './e2e-tests',
  use: {
    baseURL: 'http://localhost:8888',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8888',
    reuseExistingServer: !process.env.CI,
  },
};
```

### Example Test

```javascript
import { test, expect } from '@playwright/test';

test('carousel accepts swipe gesture', async ({ page }) => {
  await page.goto('/wp-admin/');
  await page.login(); // Custom fixture

  // Insert carousel block
  await page.click('text=Inserter');
  await page.fill('[placeholder="Search"]', 'carousel');
  await page.click('text=Carousel');

  // Test swipe left
  const carousel = await page.locator('[data-type="carousel"]');
  await carousel.swipe({ start: { x: 400, y: 200 }, delta: { x: -100, y: 0 } });
  
  const currentSlide = await page.locator('.carousel__current-slide');
  await expect(currentSlide).toContainText('Slide 2');
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Watch mode
npm run test:e2e -- --watch

# Debug mode
npm run test:e2e -- --debug

# Single test file
npm run test:e2e blocks/carousel.spec.js
```

## Accessibility Testing (WCAG 2.2 AAA)

### axe-core Configuration

**a11y.test.js:**
```javascript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('carousel meets WCAG 2.2 AAA', async ({ page }) => {
  await page.goto('/wp-admin/');
  
  // Inject axe
  await injectAxe(page);
  
  // Insert carousel
  await page.click('text=Inserter');
  await page.click('text=Carousel');
  
  // Check accessibility
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: {
      html: true
    }
  });
});
```

### Manual Accessibility Testing

**Keyboard Navigation:**
- Tab through all interactive elements
- Enter to activate buttons
- Escape to close modals/dropdowns
- Arrow keys for carousel/carousel slides

**Screen Reader Testing:**
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (Mac/iOS)
- TalkBack (Android)

**Color Contrast:**
- Minimum WCAG AA: 4.5:1 for text
- WCAG AAA: 7:1 for text
- Use WebAIM contrast checker

### Running A11y Tests

```bash
npm run test:a11y
```

## PHPUnit Testing (Server-Rendered Blocks)

### Setup

**tests/test-blocks.php:**
```php
class Test_Block_Registration extends WP_UnitTestCase {
  public function test_block_registered() {
    $registry = WP_Block_Type_Registry::get_instance();
    $this->assertTrue( 
      $registry->is_registered( 'plugin-name/accordion' )
    );
  }

  public function test_block_attributes() {
    $registry = WP_Block_Type_Registry::get_instance();
    $block = $registry->get_registered( 'plugin-name/accordion' );
    
    $this->assertArrayHasKey( 'items', $block->attributes );
    $this->assertArrayHasKey( 'allowMultiple', $block->attributes );
  }
}
```

### Running PHPUnit

```bash
npm run test:unit
vendor/bin/phpunit
```

## Coverage Checklist

- [ ] >85% statement coverage
- [ ] >85% branch coverage
- [ ] >85% function coverage  
- [ ] >85% line coverage
- [ ] All interactive paths tested
- [ ] Error cases tested
- [ ] Edge cases covered

## Performance Testing

### Core Web Vitals

```bash
# Lighthouse in DevTools or CLI
npm run test:performance

# Check:
# - LCP (Largest Contentful Paint) < 2.5s
# - INP (Interaction to Next Paint) < 200ms
# - CLS (Cumulative Layout Shift) < 0.1
```

### Bundle Size

```bash
# Monitor block bundle size
npm run build
stat build/blocks/carousel/index.js
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Blocks

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - run: npm install
      - run: npm run test          # Jest
      - run: npm run test:e2e      # Playwright
      - run: npm run test:a11y     # Accessibility
      - run: npm run lint          # ESLint
```

## Testing Workflow

### Before Pushing

```bash
# 1. Run all tests locally
npm run test:all

# 2. Check coverage
npm run test -- --coverage

# 3. Run E2E tests
npm run test:e2e

# 4. Run accessibility audit
npm run test:a11y

# 5. Lint code
npm run lint

# 6. Manual testing
#    - Multiple browsers
#    - Multiple devices
#    - Screen reader
#    - Keyboard navigation
```

## Testing Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [axe-core Guide](https://github.com/dequelabs/axe-core)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WordPress Testing Handbook](https://make.wordpress.org/core/handbook/testing/)

## Support

For branch strategy → Use main `branch-validation-wordpress` skill
For theme-specific testing → Use [references/themes.md](themes.md)
For plugin-specific testing → Use [references/plugins.md](plugins.md)
For release testing → Use [references/release.md](release.md)
