# WordPress Block Accessibility (WCAG 2.2 AAA)

Accessibility best practices, ARIA implementation, keyboard navigation, and testing workflows for inclusive WordPress blocks.

## Purpose

Accessible blocks work for everyone — users with visual, motor, hearing, or cognitive disabilities. This skill ensures your blocks meet WCAG 2.2 AAA standards and are tested thoroughly.

## When to Use

- Building an interactive block (buttons, forms, navigation, accordions)
- Implementing focus management or keyboard navigation
- Setting up screen reader testing
- Reviewing block code for accessibility issues
- Planning an accessibility audit
- Testing blocks for WCAG 2.2 AAA compliance

## Keyboard Navigation

### Focus Management

**All interactive elements must be keyboard accessible:**

**❌ NOT ACCESSIBLE:**
```jsx
const Accordion = ({ items }) => (
  <div onClick={() => toggleItem()}>
    {/* Click-only accordion */}
  </div>
);
```

**✅ ACCESSIBLE:**
```jsx
const AccordionItem = ({ title, content, isOpen, onToggle }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };
  
  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
      >
        {title}
      </button>
      <div id={`panel-${id}`} role="region" hidden={!isOpen}>
        {content}
      </div>
    </div>
  );
};
```

### Keyboard Patterns by Block Type

**Button Block:**
```jsx
- Space/Enter: Activate button
- Tab: Focus button
- Shift+Tab: Previous focusable element
```

**Form Block:**
```jsx
- Tab: Move to next field
- Shift+Tab: Previous field
- Space/Enter: Activate buttons/checkboxes
- Arrow keys: Radio buttons, select menus
```

**Navigation Block:**
```jsx
- Tab: Focus menu items
- Enter: Activate menu item
- Escape: Close submenu
- Arrow keys: Navigate between items
```

**Accordion Block:**
```jsx
- Tab: Focus accordion headers
- Space/Enter: Toggle accordion section
- Arrow Up/Down: Navigate between sections
```

**Carousel Block:**
```jsx
- Tab: Focus carousel, controls
- Arrow keys: Previous/next slide
- Enter: Activate slide actions
- Home/End: First/last slide
```

**Branch naming:** `a11y/block-{type}-keyboard-navigation`

### Focus Indicators

**Always provide visible focus indicators:**

```css
button:focus,
button:focus-visible {
  outline: 3px solid #0073aa;
  outline-offset: 2px;
}

/* Don't remove outline for keyboard users */
button:focus-visible {
  outline: 3px solid #0073aa;
}

/* Hide for mouse users only */
button:focus:not(:focus-visible) {
  outline: none;
}
```

### Skip Links

**For blocks with navigation:**

```jsx
export const NavigationBlock = ({ items }) => {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <nav aria-label="Main navigation">
        {/* Navigation items */}
      </nav>
      
      <main id="main-content">
        {/* Main content */}
      </main>
    </>
  );
};
```

## Screen Reader Optimization

### ARIA Attributes

| Attribute | Use Case | Example |
|-----------|----------|---------|
| `aria-label` | Label for icon-only buttons | `<button aria-label="Close menu">×</button>` |
| `aria-labelledby` | Label from another element | `<button aria-labelledby="header-id">` |
| `aria-describedby` | Additional description | `<input aria-describedby="help-text">` |
| `aria-expanded` | Accordion/menu expanded state | `<button aria-expanded="false">` |
| `aria-pressed` | Toggle button state | `<button aria-pressed="false">` |
| `aria-hidden` | Hide decorative elements | `<span aria-hidden="true">→</span>` |
| `aria-live` | Announce dynamic changes | `<div aria-live="polite">` |
| `aria-current` | Current page in navigation | `<a aria-current="page">` |

### Icon Buttons

**❌ NOT ACCESSIBLE:**
```jsx
<button>🔍</button> {/* Screen reader reads "image" */}
```

**✅ ACCESSIBLE:**
```jsx
<button aria-label="Search">🔍</button>
// or
<button>
  <SearchIcon />
  <span className="sr-only">Search</span>
</button>
```

### Form Labeling

**❌ NOT ACCESSIBLE:**
```jsx
<input type="text" placeholder="Enter your name" />
```

**✅ ACCESSIBLE:**
```jsx
<label htmlFor="user-name">Name</label>
<input id="user-name" type="text" placeholder="e.g., John Doe" />

{/* With error message */}
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Please enter a valid email
</span>
```

### Announcing Dynamic Changes

```jsx
const Alert = ({ message }) => (
  <div role="alert" aria-live="assertive">
    {message}
  </div>
);

// For subtle notifications
const Notification = ({ message }) => (
  <div aria-live="polite" aria-atomic="true">
    {message}
  </div>
);
```

**Branch naming:** `a11y/block-{type}-aria-labels`

## Color Contrast

### WCAG 2.2 AAA Requirements

| Element | Minimum Ratio |
|---------|----------------|
| Normal text | 7:1 |
| Large text (18pt+) | 4.5:1 |
| UI components | 7:1 |
| Graphical elements | 7:1 |

### Checking Contrast

**Use tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Inspect → Styles → Color contrast
- Lighthouse: Built-in contrast audit

**Never rely on color alone:**

```css
/* ❌ Color only indicates error */
input:invalid {
  color: red;
}

/* ✅ Color + icon + text */
.error-message {
  color: #d32f2f;
}

.error-message::before {
  content: "⚠ ";
  font-weight: bold;
}
```

### Button Examples

**Good contrast:**
```css
.button {
  background-color: #0073aa; /* Blue */
  color: #ffffff;            /* White */
  /* Contrast: 8.59:1 ✅ */
}

.button:hover {
  background-color: #005a87; /* Darker blue */
  /* Still maintains 7:1+ contrast with white text */
}
```

**Bad contrast:**
```css
.button {
  background-color: #87ceeb; /* Light blue */
  color: #ffffff;            /* White */
  /* Contrast: 3.2:1 ❌ FAILS */
}
```

**Branch naming:** `a11y/block-{type}-color-contrast`

## Responsive & Motion

### Respects User Preferences

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Respect color scheme */
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #ffffff;
  }
}
```

### Keyboard-Only Testing

**Test your block without a mouse:**
1. Open block in editor
2. Disable mouse (or just don't use it)
3. Tab through all interactive elements
4. Verify focus is visible
5. Verify keyboard shortcuts work

## Accessibility Testing Workflow

### 1. Automated Testing (First Pass)

**Use Axe DevTools or Lighthouse:**
```bash
npm install --save-dev @axe-core/react

// In your test file
import { axe } from 'jest-axe';

it('block has no accessibility violations', async () => {
  const { container } = render(<MyBlock {...defaultProps} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 2. Keyboard Testing

**Checklist:**
- [ ] All interactive elements are tab-accessible
- [ ] Focus order is logical (top-to-bottom, left-to-right)
- [ ] Focus indicators are visible (3px+ outline)
- [ ] No focus traps (can escape with Escape or Tab)
- [ ] Keyboard shortcuts documented

**Test script:**
```bash
# 1. Open block in editor
# 2. Tab through all elements - verify focus visible
# 3. Test all keyboard shortcuts
# 4. Test form submission via keyboard
# 5. Test interactive features (accordions, modals, etc.)
```

### 3. Screen Reader Testing

**Use NVDA (Windows), JAWS (paid), VoiceOver (Mac):**

**Test checklist:**
- [ ] All text is announced
- [ ] Form labels announced with inputs
- [ ] Buttons announced with labels
- [ ] Images have alt text or `aria-hidden="true"`
- [ ] Dynamic changes announced (aria-live)
- [ ] Accordions announce expanded/collapsed state
- [ ] Carousels announce slide position
- [ ] Links announce destination

**Sample test in Playwright:**
```javascript
test('screen reader announces button label', async ({ page }) => {
  await page.goto(blockEditorUrl);
  
  // With screen reader running
  const button = page.locator('button:has-text("Submit")');
  
  // Verify button is announced
  await expect(button).toHaveAttribute('aria-label');
});
```

### 4. Color Contrast Audit

**Use WebAIM Contrast Checker:**
1. Take screenshot of block
2. Identify all text and UI elements
3. Check contrast ratio for each
4. Document results in audit report
5. Update CSS if below WCAG 2.2 AAA

### 5. Responsive Testing

**Test on different screen sizes:**
- [ ] Block works on mobile (320px)
- [ ] Touch targets are 44x44px minimum
- [ ] Text is readable at 200% zoom
- [ ] No horizontal scroll at 320px
- [ ] Focus indicators visible on all sizes

**Test mobile keyboard:**
- [ ] Can use mobile screen reader (VoiceOver on iOS, TalkBack on Android)
- [ ] Touch keyboard doesn't cover critical elements
- [ ] All buttons accessible via touch

## Accessibility Audit Checklist

**Use before releasing a block:**

### Structure & Semantics
- [ ] Proper heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Lists use `<ul>`, `<ol>`, `<li>` elements
- [ ] Buttons use `<button>`, not `<div>` with click handler
- [ ] Links use `<a>` with href attribute
- [ ] Form inputs have associated `<label>` elements

### Keyboard Navigation
- [ ] All interactive elements are focusable (Tab key)
- [ ] Focus order is logical
- [ ] Focus indicators are visible (3px+ outline, 7:1 contrast)
- [ ] No focus traps
- [ ] Escape key works to close modals/menus
- [ ] Skip links present (if applicable)

### ARIA & Labels
- [ ] Icon-only buttons have `aria-label`
- [ ] Forms have proper labels or `aria-label`
- [ ] Dynamic regions use `aria-live`
- [ ] Accordion items use `aria-expanded`
- [ ] Current navigation item uses `aria-current="page"`
- [ ] Decorative elements use `aria-hidden="true"`
- [ ] Images have descriptive alt text or `aria-hidden="true"`

### Color & Contrast
- [ ] Text contrast at least 7:1 (WCAG AAA)
- [ ] Large text contrast at least 4.5:1
- [ ] Color not the only indicator of state/information
- [ ] Focus indicators have 7:1 contrast with background

### Motion & Animations
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No auto-playing videos/animations (must have pause button)
- [ ] Animations are not distracting (no flashing)

### Responsive & Mobile
- [ ] Block works at 200% zoom
- [ ] No horizontal scrolling at 320px width
- [ ] Touch targets are 44x44px minimum
- [ ] Mobile keyboard doesn't cover inputs
- [ ] Readable on small screens

### Testing
- [ ] Automated tests pass (Axe, Lighthouse)
- [ ] Keyboard navigation tested manually
- [ ] Screen reader tested (NVDA, VoiceOver, JAWS)
- [ ] Tested on Windows, Mac, mobile
- [ ] Color contrast verified with WebAIM

**Branch naming:** `a11y/block-{type}-audit-wcag-aaa`

## Resources

- **WCAG 2.2:** https://www.w3.org/WAI/WCAG22/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **WebAIM:** https://webaim.org/
- **A11y Project:** https://www.a11yproject.com/
- **Screen Reader Testing:** https://www.nvaccess.org/ (NVDA), https://www.freedomscientific.com/ (JAWS)

## Quick Accessibility Checklist

- ✅ All interactive elements keyboard-accessible?
- ✅ Focus indicators visible (3px+ outline, 7:1 contrast)?
- ✅ Form inputs have labels?
- ✅ Text contrast at least 7:1?
- ✅ Images have alt text?
- ✅ ARIA labels on icon buttons?
- ✅ Dynamic content announced via aria-live?
- ✅ Respects prefers-reduced-motion?
- ✅ No focus traps?
- ✅ Branch naming follows a11y/block-{type}-{issue} pattern?
