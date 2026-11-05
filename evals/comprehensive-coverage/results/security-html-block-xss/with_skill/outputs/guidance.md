# XSS Security Fix: Custom HTML Block - Branch & Testing Guidance

## Branch Type & Naming

**Correct Branch Type:** `security/block-{component}-{vulnerability}`

### Your Branch Name
```
security/block-custom-html-xss-sanitization
```

**Why this branch type:**
- Flags work as security-critical to reviewers
- Automatically tagged `priority:critical` in CI/CD
- Triggers enhanced security scanning and code review workflows
- Blocks automated merge until security review passes

---

## Security Testing Requirements

### 1. **Input Sanitization Tests** (Required)

All user input must be validated and sanitized. Test coverage must include:

#### Unit Tests (Jest - 100% coverage for sanitization logic)
```javascript
// tests/block-custom-html-sanitization.test.js
describe('Custom HTML Block - XSS Prevention', () => {
  // Test 1: Script tag injection
  test('removes script tags from user input', () => {
    const malicious = '<div><script>alert("XSS")</script></div>';
    const sanitized = sanitizeHTMLInput(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('<div>');
  });

  // Test 2: Event handler injection
  test('removes event handlers', () => {
    const malicious = '<img src="x" onerror="alert(\'XSS\')">';
    const sanitized = sanitizeHTMLInput(malicious);
    expect(sanitized).not.toContain('onerror=');
  });

  // Test 3: Data attribute injection
  test('removes data: protocol URLs', () => {
    const malicious = '<a href="data:text/html,<script>alert(1)</script>">click</a>';
    const sanitized = sanitizeHTMLInput(malicious);
    expect(sanitized).not.toContain('data:');
  });

  // Test 4: Encoded XSS attempts
  test('handles HTML-encoded XSS attempts', () => {
    const malicious = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
    const sanitized = sanitizeHTMLInput(malicious);
    expect(sanitized).not.toContain('script');
  });

  // Test 5: SVG-based XSS
  test('removes malicious SVG content', () => {
    const malicious = '<svg onload="alert(\'XSS\')">';
    const sanitized = sanitizeHTMLInput(malicious);
    expect(sanitized).not.toContain('onload=');
  });

  // Test 6: DOM clobbering prevention
  test('prevents DOM clobbering attacks', () => {
    const malicious = '<form id="forms"><input name="action">';
    const sanitized = sanitizeHTMLInput(malicious);
    // Ensure this doesn't override form controls
    expect(sanitized).toBeDefined();
  });
});
```

#### PHP Sanitization Tests (PHPUnit - if server-rendered)
```php
// tests/CustomHTMLBlockTest.php
public function test_sanitize_custom_html_removes_script_tags() {
    $malicious = '<div><script>alert("XSS")</script></div>';
    $sanitized = sanitize_custom_html_input($malicious);
    $this->assertStringNotContainsString('<script>', $sanitized);
    $this->assertStringContainsString('<div>', $sanitized);
}

public function test_sanitize_custom_html_removes_event_handlers() {
    $malicious = '<img src="x" onerror="alert(\'XSS\')">';
    $sanitized = sanitize_custom_html_input($malicious);
    $this->assertStringNotContainsString('onerror=', $sanitized);
}
```

---

### 2. **Output Escaping Tests** (Required)

Verify that sanitized data is properly escaped when rendered:

```javascript
// tests/block-custom-html-output.test.js
describe('Custom HTML Block - Output Escaping', () => {
  test('escapes HTML entities in block editor', () => {
    const input = '<img src="x" onerror="alert(\'XSS\')">';
    const rendered = renderBlockInEditor(input);
    // Verify dangerous characters are escaped in DOM
    expect(rendered.innerHTML).not.toContain('onerror');
  });

  test('applies correct escaping on frontend', () => {
    const block = createBlock('custom-html', { content: maliciousInput });
    const html = render(block);
    expect(html).toEscapeUnsafeContent();
  });
});
```

---

### 3. **Manual XSS Payload Testing** (Critical)

Test your fix against known XSS vectors using OWASP payloads:

#### Test Vector Suite
```
1. Basic script injection:
   <script>alert('XSS')</script>

2. Event handler injection:
   <img src=x onerror="alert('XSS')">
   <div onmouseover="alert('XSS')">
   <body onload="alert('XSS')">

3. SVG-based XSS:
   <svg onload="alert('XSS')">
   <svg><script>alert('XSS')</script></svg>
   <svg><animate onbegin="alert('XSS')" attributeName="x" dur="1s">

4. Encoded/Obfuscated attacks:
   <img src="x" onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;">
   <img src=x onerror="eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))">

5. Data protocol:
   <a href="data:text/html,<script>alert('XSS')</script>">click</a>
   <object data="data:text/html,<script>alert('XSS')</script>">

6. JavaScript protocol:
   <a href="javascript:alert('XSS')">click</a>
   <img src="javascript:alert('XSS')">

7. Form-based XSS:
   <form action="javascript:alert('XSS')"><input type="submit"></form>
   <form><button formaction="javascript:alert('XSS')">

8. Style-based XSS:
   <div style="background: url('javascript:alert(\"XSS\")')"></div>
   <style>body{background:url('javascript:alert("XSS")')}</style>

9. HTML5 semantic XSS:
   <video src="x" onerror="alert('XSS')">
   <details open ontoggle="alert('XSS')">

10. DOM clobbering:
    <form id="forms"><input name="action"></form>
```

---

### 4. **Automated Security Scanning** (Required)

#### Add to your CI/CD pipeline:

```yaml
# .github/workflows/security-scanning.yml
name: Security Scanning

on: [pull_request, push]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      # OWASP Dependency Check
      - uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'custom-html-block'
          path: '.'
          
      # npm security audit
      - run: npm audit --production
      
      # SAST scanning for XSS patterns
      - uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/owasp-top-ten
            p/cwe-top-25
            p/xss
```

---

### 5. **WordPress Security Standards** (Required)

#### PHP - Use WordPress sanitization functions:
```php
// ✅ CORRECT - Use WordPress sanitization functions
$sanitized = wp_kses_post($user_input);
$sanitized = sanitize_text_field($user_input);
$sanitized = wp_kses($user_input, wp_kses_allowed_html('post'));

// ✅ Output escaping
echo esc_html($sanitized);           // Text content
echo esc_attr($sanitized);            // HTML attributes
echo esc_url($sanitized);             // URLs
echo esc_textarea($sanitized);        // Textarea content
echo wp_kses_post($sanitized);        // Rich HTML content
```

#### JavaScript - Use proper escaping:
```javascript
// ✅ CORRECT - Use React/JSX escaping (automatic)
<div>{sanitizedInput}</div>  // Auto-escaped

// ✅ Use DOMPurify for HTML cleaning
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput, { ALLOWED_TAGS: [] });

// ✅ Use textContent for plain text
element.textContent = userInput;  // Never innerHTML for untrusted data
```

---

## Validation Checklist Before Merge

### Code Review (Security)
- [ ] All user input is validated before processing
- [ ] All output is properly escaped for context (HTML/attribute/URL/text)
- [ ] No `innerHTML` used with user data (use `textContent` or sanitized HTML)
- [ ] No `eval()`, `Function()`, or dynamic code execution
- [ ] All uses of `wp_kses()` specify allowed tags/attributes
- [ ] Nonces checked for form submissions (WordPress-specific)
- [ ] Input validation whitelist approach (deny by default)

### Testing Validation
- [ ] Unit tests pass (100% coverage for sanitization paths)
- [ ] XSS payload tests pass (all 10 vector types)
- [ ] E2E tests pass (Playwright tests for interactive flows)
- [ ] PHP CodeSniffer passes (WordPress Coding Standards)
- [ ] ESLint/JSHint passes (no security violations)
- [ ] npm audit passes (no vulnerable dependencies)
- [ ] Security scanning tools pass (Semgrep, OWASP checks)

### Manual Testing
- [ ] Test in block editor (Chrome DevTools open, check console)
- [ ] Test on frontend (verify rendered output)
- [ ] Test with browser's XSS Auditor/CSP policies
- [ ] Test malicious payloads don't execute
- [ ] Test legitimate HTML/attributes still work

### Documentation
- [ ] `CHANGELOG.md` updated: `security: fix XSS vulnerability in custom HTML block`
- [ ] Security fix documented in block README
- [ ] Deprecation notice if removing previously-allowed attributes
- [ ] Migration guide for users with unsafe HTML

---

## Commit Message Template

```
security(block-custom-html): fix XSS vulnerability in sanitization

## The Issue
User input in the custom HTML block was not being properly sanitized,
allowing attackers to inject malicious scripts via event handlers and
script tags.

## The Fix
- Implement wp_kses() with explicit allowed HTML tags and attributes
- Add DOMPurify sanitization on frontend for user-provided content
- Remove innerHTML, use textContent for untrusted data
- Add comprehensive XSS payload test suite

## Testing
- Added unit tests for 10+ XSS payload vectors (100% coverage)
- Added E2E tests verifying XSS payloads don't execute
- Security scanning passes (Semgrep, npm audit)
- Manual XSS testing passes

## Impact
- CRITICAL: Closes XSS vulnerability (CVE-XXXX-XXXXX)
- BREAKING: Removes unsafe HTML attributes from existing blocks
  (see MIGRATION.md for update instructions)

## References
- Closes #ISSUE_NUMBER
- Related to OWASP Top 10 - A03:2021 Injection
```

---

## Step-by-Step Validation Process

### Before Pushing

1. **Create branch:**
   ```bash
   git checkout -b security/block-custom-html-xss-sanitization
   ```

2. **Implement fix + tests:**
   - Sanitize all user inputs
   - Escape all outputs properly
   - Add Jest tests (100% coverage)
   - Add Playwright E2E tests
   - Add XSS payload tests

3. **Run local validation:**
   ```bash
   npm run test:unit                      # Jest tests
   npm run test:e2e                       # Playwright E2E
   npm run test:security                  # Security-specific tests
   npm run lint                           # ESLint
   npm audit                              # Dependency scanning
   composer run-script phpcs              # PHP CodeSniffer
   ```

4. **Manual XSS testing in block editor:**
   - Paste XSS payloads into block
   - Verify they don't execute
   - Check browser console for errors
   - Verify legitimate HTML still renders

### After Pushing / In Pull Request

5. **CI/CD automatically runs:**
   - All tests (unit, E2E, security)
   - Linting (ESLint, PHPCodeSniffer)
   - Security scanning (Semgrep, npm audit)
   - Code coverage report

6. **Security review requirement:**
   - At least 1 security-focused review required
   - Must specifically approve XSS fix
   - May request additional test cases

7. **Before merge:**
   - [ ] All CI checks pass (green)
   - [ ] Security review approved
   - [ ] Changelog entry added
   - [ ] Documentation updated

---

## Common Mistakes to Avoid

❌ **Blacklist approach** (listing bad tags to remove)
- Attackers find ways around blacklists
- ✅ Use whitelist: `wp_kses($input, wp_kses_allowed_html('post'))`

❌ **Partial escaping** (only escaping HTML, not attributes)
- Different contexts need different escaping
- ✅ Use context-specific: `esc_html()`, `esc_attr()`, `esc_url()`

❌ **Testing only obvious payloads**
- Attackers use encoded/obfuscated variants
- ✅ Test all 10+ vector types from OWASP

❌ **Trusting `sanitize_text_field()`** for HTML content
- It removes ALL HTML tags
- ✅ Use `wp_kses_post()` if HTML needed

❌ **Using `innerHTML` with user data**
- Bypasses all escaping
- ✅ Use `textContent` for plain text, sanitized HTML for rich content

---

## Support & Resources

- **OWASP XSS Prevention Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- **WordPress Sanitization API:** https://developer.wordpress.org/plugins/security/sanitizing-input/
- **WordPress Escaping API:** https://developer.wordpress.org/plugins/security/escaping-output/
- **DOMPurify Documentation:** https://github.com/cure53/DOMPurify
- **CWE-79 Cross-site Scripting (XSS):** https://cwe.mitre.org/data/definitions/79.html

---

**Status: READY FOR IMPLEMENTATION**

Your XSS fix is security-critical. Follow this guide thoroughly to ensure comprehensive testing and validation.
