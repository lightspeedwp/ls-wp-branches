# Prompts Directory

LLM prompts for WordPress block branch validation and development workflows.

## Prompt Files

### Main Validation Prompt
- **validate-wordpress-block-branch.md** — Complete specification for branch name validation
  - Input/output formats
  - Valid and invalid examples
  - Error messages and fixes
  - Block-specific validation rules
  - Test cases for LLM-driven validation

### Block Development Prompts
- **wordpress-theme-block-development.md** — Theme block development guidance
- **wordpress-plugin-block-development.md** — Plugin block development guidance

### Testing Prompts
- **block-testing-strategy.md** — Jest, Playwright, accessibility testing prompts
- **block-accessibility-testing.md** — WCAG 2.2 AAA compliance prompts

### Release Prompts
- **block-release-planning.md** — Release coordination prompts
- **block-version-management.md** — Versioning strategy prompts

## Usage

These prompts are designed for:
- Claude Code skill invocation
- LLM-powered automation
- Testing and validation workflows
- Team guidance and documentation

### Example Usage

```bash
# Validate a branch name
cat prompts/validate-wordpress-block-branch.md
# Send to Claude with branch name in prompt
```

## Prompt Format

All prompts follow a standardized format:

```markdown
---
title: Prompt Title
description: Short description
model: claude-opus (recommended)
---

## Input Specification
- Format and structure
- Expected variables
- Examples

## Output Specification
- Format and structure
- Valid responses
- Error handling

## Instructions
- Step-by-step guidance
- Edge cases
- Success criteria
```

## Guidelines

When creating new prompts:

1. **Clarity** — Use clear, specific language
2. **Examples** — Include real WordPress block examples
3. **Structure** — Use consistent formatting
4. **Testability** — Include test cases
5. **Robustness** — Cover edge cases and errors
6. **Documentation** — Explain reasoning, not just rules

## Validation Prompts

Prompts are tested by:
- LLM validation of examples
- Comparison against branch validation script
- Edge case coverage
- Error message quality

## Integration

Prompts are used by:
- `branch-validation-wordpress` main skill
- Sub-skills for specialized contexts
- GitHub Actions CI/CD workflows
- Team development workflows

---

See also:
- [../SKILL.md](../SKILL.md) — Main skill documentation
- [../docs/](../docs/) — Full documentation
- [../scripts/validate-branch-name.cjs](../scripts/validate-branch-name.cjs) — Validation script
