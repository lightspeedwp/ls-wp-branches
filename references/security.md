# WordPress Block Security

Security hardening patterns, vulnerability prevention, and security audit guidance for WordPress blocks.

## Purpose

Blocks often handle user input, render dynamic content, and interact with APIs. This skill ensures your blocks are secure against common vulnerabilities (XSS, CSRF, injection attacks) and follow WordPress security best practices.

## When to Use

- Building a block that accepts user input
- Creating a block that displays third-party content
- Handling API responses in a block
- Reviewing block code for security issues
- Planning a security audit of a block or theme
- Implementing permission checks in a block

## XSS Prevention

### XSS Vulnerability: Unescaped Output

**❌ VULNERABLE:**
```jsx
const MyBlock = ({ attributes }) => {
  return <div dangerouslySetInnerHTML={{ __html: attributes.content }} />;
};
```

**✅ SAFE:**
```jsx
const MyBlock = ({ attributes }) => {
  return <div>{attributes.content}</div>; // React auto-escapes text
};
```

### Server-Side Output Escaping (PHP)

**❌ VULNERABLE:**
```php
echo $custom_field_value; // Unescaped user input
```

**✅ SAFE:**
```php
echo esc_html($custom_field_value);          // For HTML context
echo esc_attr($custom_attribute);             // For HTML attributes
echo wp_kses_post($allowed_html);             // For safe HTML (like editor output)
echo esc_url($url);                           // For URLs
echo esc_js($javascript_string);              // For JavaScript
```

### Client-Side Output Escaping (JavaScript)

**❌ VULNERABLE:**
```js
document.querySelector('.content').innerHTML = userInput;
```

**✅ SAFE:**
```js
document.querySelector('.content').textContent = userInput;
// or in React: {userInput} (auto-escapes)
```

### Rich HTML Content (Safely)

**When you must allow HTML (WYSIWYG editors, user-supplied content):**

**✅ SAFE:**
```php
// PHP
$allowed_html = [
  'p' => [],
  'strong' => [],
  'em' => [],
  'a' => ['href' => [], 'title' => []],
];
echo wp_kses_post($user_content, $allowed_html);

// JavaScript (in block edit)
const { RichText } = wp.blockEditor;

export const MyBlockEdit = ({ attributes, setAttributes }) => (
  <RichText
    value={attributes.content}
    onChange={(content) => setAttributes({ content })}
    allowedFormats={['core/bold', 'core/italic', 'core/link']}
  />
);
```

**Branch naming:** `security/block-content-xss-escaping`

## Input Sanitization

### Sanitizing User Input

**❌ VULNERABLE:**
```php
$user_value = $_POST['block_setting']; // Directly from $_POST
```

**✅ SAFE:**
```php
$user_value = sanitize_text_field($_POST['block_setting']);
```

### Sanitization Functions by Data Type

| Data Type | Function | Example |
|-----------|----------|---------|
| Text field | `sanitize_text_field()` | User's name, title |
| Text area | `sanitize_textarea_field()` | Block description |
| URL | `esc_url_raw()` | External link |
| Email | `sanitize_email()` | Contact email |
| Number | `intval()` / `floatval()` | Count, price |
| JSON | `json_decode( sanitize_text_field() )` | Block settings |
| HTML | `wp_kses_post()` | Rich text content |

### Sanitizing API Responses

**Always validate responses from external APIs:**

```php
$response = wp_remote_get('https://api.example.com/data');

// Check for errors
if (is_wp_error($response)) {
  return;
}

// Validate HTTP status
$status = wp_remote_retrieve_response_code($response);
if (200 !== $status) {
  return;
}

// Sanitize response body
$body = wp_remote_retrieve_body($response);
$data = json_decode($body, true);

if (!is_array($data)) {
  return;
}

// Validate required fields exist
if (!isset($data['title'], $data['description'])) {
  return;
}

// Sanitize each field
$safe_title = sanitize_text_field($data['title']);
$safe_description = wp_kses_post($data['description']);
```

**Branch naming:** `security/block-api-response-validation`

## Permissions & Capability Checks

### Checking User Permissions

**❌ VULNERABLE:**
```php
// No permission check
register_rest_route('myblock/v1', '/settings', [
  'callback' => 'update_block_settings'
]);
```

**✅ SAFE:**
```php
register_rest_route('myblock/v1', '/settings', [
  'callback' => 'update_block_settings',
  'permission_callback' => function () {
    return current_user_can('edit_posts');
  }
]);

function update_block_settings($request) {
  if (!current_user_can('manage_options')) {
    return new WP_Error('forbidden', 'Insufficient permissions', ['status' => 403]);
  }
  
  // Proceed with update
}
```

### Checking Block-Level Permissions

```jsx
// In block edit component (React)
const MyBlockEdit = (props) => {
  const canEditPost = useSelect((select) => {
    return select('core').canUser('create', 'posts');
  });
  
  if (!canEditPost) {
    return <p>You don't have permission to edit this block.</p>;
  }
  
  return <div>{/* block editor content */}</div>;
};
```

### Nonce Protection for Forms

```php
// Generate nonce
wp_nonce_field('update_block_settings', 'block_nonce');

// Verify nonce
if (!isset($_POST['block_nonce']) || !wp_verify_nonce($_POST['block_nonce'], 'update_block_settings')) {
  wp_die('Security check failed');
}
```

**Branch naming:** `security/block-permission-checks`

## Data Validation

### Validating Block Attributes

**In block.json:**
```json
"attributes": {
  "title": {
    "type": "string",
    "default": ""
  },
  "count": {
    "type": "number",
    "default": 0
  },
  "isActive": {
    "type": "boolean",
    "default": false
  },
  "colors": {
    "type": "array",
    "default": []
  }
}
```

**In PHP (REST API):**
```php
register_rest_route('myblock/v1', '/save', [
  'methods' => 'POST',
  'callback' => 'save_block_data',
  'args' => [
    'title' => [
      'type' => 'string',
      'required' => true,
      'sanitize_callback' => 'sanitize_text_field'
    ],
    'count' => [
      'type' => 'integer',
      'required' => true,
      'validate_callback' => function ($value) {
        return is_numeric($value) && $value >= 0;
      }
    ]
  ]
]);
```

### Validating External Data

```php
// Validate JSON structure
$json = json_decode($response_body, true);
if (!is_array($json)) {
  return new WP_Error('invalid_json', 'Response is not valid JSON');
}

// Validate required fields
$required = ['id', 'name', 'email'];
foreach ($required as $field) {
  if (!isset($json[$field])) {
    return new WP_Error('missing_field', "Missing required field: $field");
  }
}

// Validate data types
if (!is_int($json['id']) || !is_string($json['name']) || !is_string($json['email'])) {
  return new WP_Error('invalid_type', 'One or more fields have invalid types');
}

// Validate email format
if (!is_email($json['email'])) {
  return new WP_Error('invalid_email', 'Email is not valid');
}
```

**Branch naming:** `security/block-data-validation`

## API Security

### Secure REST API Endpoints

```php
register_rest_route('myblock/v1', '/content', [
  'methods' => 'GET',
  'callback' => 'get_block_content',
  'permission_callback' => function () {
    return is_user_logged_in();
  },
  'args' => [
    'id' => [
      'type' => 'integer',
      'required' => true,
      'sanitize_callback' => 'absint'
    ]
  ]
]);

function get_block_content($request) {
  $id = $request->get_param('id');
  
  // Verify post exists and user can read it
  $post = get_post($id);
  if (!$post) {
    return new WP_Error('not_found', 'Post not found', ['status' => 404]);
  }
  
  if (!current_user_can('read_post', $id)) {
    return new WP_Error('forbidden', 'Cannot read this post', ['status' => 403]);
  }
  
  return rest_ensure_response([
    'id' => $post->ID,
    'title' => esc_html($post->post_title),
    'content' => wp_kses_post($post->post_content)
  ]);
}
```

### Secure External API Calls

```php
$args = [
  'timeout' => 5,           // Prevent hanging requests
  'sslverify' => true,      // Always verify SSL
  'headers' => [
    'User-Agent' => 'MyBlock/1.0',
    'Authorization' => 'Bearer ' . sanitize_text_field($api_key)
  ]
];

$response = wp_remote_get('https://api.example.com/data', $args);

// Handle errors
if (is_wp_error($response)) {
  error_log('API error: ' . $response->get_error_message());
  return;
}

// Validate response
$status = wp_remote_retrieve_response_code($response);
if ($status !== 200) {
  error_log('API returned status ' . $status);
  return;
}
```

**Branch naming:** `security/block-api-hardening`

## Security Audit Checklist

Use this before releasing a block or pushing to production:

### Input & Output
- [ ] All user input is sanitized (`sanitize_text_field()`, etc.)
- [ ] All output is escaped (`esc_html()`, `esc_attr()`, etc.)
- [ ] Rich HTML uses `wp_kses_post()` with allowed tags whitelist
- [ ] No `dangerouslySetInnerHTML` in React without validation
- [ ] No `innerHTML` assignments in JavaScript

### Permissions & Authentication
- [ ] All REST endpoints have `permission_callback`
- [ ] Nonces used for form submissions
- [ ] Capability checks before sensitive operations
- [ ] User roles and permissions validated server-side
- [ ] No sensitive data exposed to unauthenticated users

### Data Validation
- [ ] Block attributes have type definitions in block.json
- [ ] REST API args have validation and sanitization
- [ ] External API responses validated before use
- [ ] Required fields checked for existence
- [ ] Data types verified (integer, string, array, etc.)

### API Security
- [ ] External API calls use SSL verification
- [ ] API requests have timeouts
- [ ] HTTP status codes checked
- [ ] API keys stored securely (not in code)
- [ ] Rate limiting considered for API calls

### XSS Prevention
- [ ] No inline event handlers (onclick, onload, etc.)
- [ ] No inline styles with user-provided values
- [ ] JavaScript strings escaped with `esc_js()`
- [ ] URLs validated with `esc_url_raw()`
- [ ] No `eval()` or `Function()` with user input

### CSRF Protection
- [ ] Nonces generated for all forms
- [ ] Nonces verified on form submission
- [ ] POST/PUT/DELETE operations use nonces
- [ ] No sensitive operations via GET requests

### Dependencies & Third-Party Code
- [ ] No unvetted third-party libraries
- [ ] Dependencies checked for vulnerabilities
- [ ] CDN resources have integrity hashes
- [ ] No deprecated WordPress functions used

### Logging & Monitoring
- [ ] Security events logged (failed permissions, validation errors)
- [ ] No sensitive data in logs (passwords, API keys)
- [ ] Error messages safe for public display
- [ ] Admin notices for security-related events

**Branch naming:** `security/block-audit-checklist`

## Security Testing

### Unit Tests for Sanitization

```php
// tests/test-sanitization.php
class Test_Block_Sanitization extends WP_UnitTestCase {
  function test_title_sanitization() {
    $dangerous = '<script>alert("XSS")</script>Title';
    $safe = sanitize_text_field($dangerous);
    $this->assertEquals('alert("XSS")Title', $safe);
  }
}
```

### Testing Permission Checks

```php
function test_permission_denied_for_non_logged_in_user() {
  $response = rest_do_request(
    new WP_REST_Request('POST', '/myblock/v1/settings')
  );
  $this->assertEquals(401, $response->get_status());
}
```

## Resources

- **WordPress Escaping Functions:** https://developer.wordpress.org/apis/security/escaping/
- **WordPress Sanitizing Functions:** https://developer.wordpress.org/apis/security/sanitizing/
- **REST API Security:** https://developer.wordpress.org/rest-api/extending-the-rest-api/
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/

## Quick Security Checklist

- ✅ All user input sanitized?
- ✅ All output escaped?
- ✅ Permissions checked?
- ✅ Nonces verified?
- ✅ External APIs validated?
- ✅ No XSS vulnerabilities?
- ✅ Data types validated?
- ✅ SSL verified for external calls?
- ✅ Security tests written?
- ✅ Branch naming follows security/block-{issue} pattern?
