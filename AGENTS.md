# Agent Definitions for WordPress Block Development

This document defines agent roles that work with the `branch-validation-wordpress` skill ecosystem.

## WordPress Block Branching Agent

**Location:** source at `agents/branch-validation.md` in this repository; install it to `~/.claude/agents/branch-validation.md` (see `agents/README.md`). Claude Code does not load agents from inside a skill folder.

**Purpose:** Autonomous agent for WordPress block development workflows, providing expert guidance on branch strategy, naming conventions, and CI/CD integration specific to block themes and plugins.

**When to Use This Agent:**

- **Complex branching scenarios:** Block architecture decisions, multi-block features, or coordinated releases
- **Release planning:** Planning block version bumps, managing deprecations, coordinating plugin/theme versions
- **Multi-team coordination:** Coordinating block development across multiple developers or teams
- **CI/CD optimization:** Setting up block-specific testing, performance monitoring, or deployment
- **Refactoring at scale:** Planning large refactors affecting multiple blocks or block patterns
- **Troubleshooting:** Diagnosing branch strategy issues, merge conflicts, or release problems

**What the Agent Does:**

- Validates block branch names against WordPress block naming conventions
- Provides step-by-step guidance for block development workflows
- Coordinates multi-block features and dependencies
- Manages release cycles and version bumping for blocks
- Advises on testing strategy (unit/E2E/a11y/performance)
- Helps troubleshoot block-specific issues
- Integrates with CI/CD for block automation

**Agent Capabilities:**

- Analyze block project structure
- Generate branch naming suggestions for blocks
- Plan release coordination for multiple blocks
- Design testing strategies for interactive/display/container blocks
- Recommend performance optimization approaches
- Guide accessibility compliance (WCAG 2.2 AAA)
- Coordinate with theme/plugin development workflows

## When to Use Skill vs Agent

### Use the **branch-validation-wordpress Skill** when:

- Quick validation of a single branch name
- Simple lookup of branch naming conventions
- Understanding which branch type to use
- Reference information on release process
- Documentation/training needs
- Standard one-off questions about branching

### Use the **WordPress Block Branching Agent** when:

- Making architectural decisions for block features
- Planning complex, multi-step block development
- Coordinating releases across multiple blocks
- Troubleshooting non-standard scenarios
- Optimizing CI/CD for block development
- Need ongoing guidance through a multi-step process
- Dealing with version coordination complexity

## Agent Integration Example

### Scenario: Release Coordination for Multiple Blocks

**User Request:**
> "I have 3 blocks (hero, testimonial, pricing-table) in my plugin. Each has breaking changes. How should I manage the release?"

**When to invoke the agent:**
```
Use the WordPress Block Branching Agent to:
1. Understand the breaking changes in each block
2. Plan version bumping (major version for plugin + each block)
3. Coordinate CHANGELOG entries
4. Design migration paths for existing users
5. Plan CI/CD validation for all blocks
6. Create release branch strategy
7. Document upgrade procedure
```

**The agent would:**
- Ask clarifying questions about each block's changes
- Recommend semantic versioning strategy
- Suggest deprecation warnings for old blocks
- Plan testing to ensure blocks still work together
- Generate release branch names and workflow
- Create a step-by-step release checklist

### Scenario: Setting Up Block-Specific CI/CD

**User Request:**
> "How do I set up GitHub Actions to test all blocks in my WordPress theme?"

**When to invoke the agent:**
```
Use the WordPress Block Branching Agent to:
1. Design testing strategy per block type
2. Plan CI/CD pipeline stages
3. Create performance budgets for blocks
4. Set up accessibility testing automation
5. Configure bundle size monitoring
6. Create deployment triggers
7. Plan rollback procedures
```

**The agent would:**
- Recommend test tools (Jest, Playwright, axe-core)
- Design GitHub Actions workflows
- Create performance thresholds
- Plan manual validation gates
- Set up notifications/alerts
- Generate workflow YAML

## Related Agent Documentation

For WordPress development beyond block validation, see:

- **WordPress Block Theme Development Agent** (if created) — Theme-specific guidance
- **WordPress Plugin Development Agent** (if created) — Plugin-specific guidance
- **WordPress CI/CD Agent** (if created) — GitHub Actions and deployment

## Communication with Agents

When invoking the WordPress Block Branching Agent:

1. **Provide context:**
   - What you're building (theme blocks, plugin blocks, mixed)
   - Number of blocks/contributors
   - Release timeline
   - Known constraints

2. **Be specific about the decision:**
   - What decision are you trying to make?
   - What's blocking you?
   - What have you already tried?

3. **Follow the agent's guidance:**
   - The agent will ask clarifying questions
   - Answer thoroughly for better recommendations
   - Implement step-by-step guidance
   - Return for follow-up if blocked

## Example Agent Invocation

```
Claude, invoke the WordPress Block Branching Agent for this:

I'm building a block plugin with 5 custom blocks. We have 2 developers working 
on different blocks simultaneously. I need help setting up a branching strategy 
that:
- Prevents conflicts between developers
- Allows independent block testing
- Supports staged releases (can ship individual blocks)
- Tracks which blocks are stable vs experimental

Current team size: 2 developers
Target launch: 4 weeks
Deployment: WordPress.org plugin repository
```

The agent would return with a complete branching strategy tailored to your needs.

## Agent vs Skill Decision Matrix

| Scenario | Skill | Agent | Reason |
|----------|-------|-------|--------|
| "What's the pattern for a button block fix?" | ✅ | | Simple lookup |
| "How do I name this branch?" | ✅ | | Single validation |
| "I'm planning a major refactor across 10 blocks" | | ✅ | Complex coordination |
| "Release planning for plugin v2.0" | | ✅ | Multi-step planning |
| "What branch types exist?" | ✅ | | Reference information |
| "Should these blocks be 1 or 3 releases?" | | ✅ | Strategic decision |
| "How do I organize block patterns?" | ✅ | | Standard guidance |
| "Our CI/CD is failing on all blocks" | | ✅ | Troubleshooting needed |
| "What's a container block?" | ✅ | | Definition/documentation |
| "Design our testing strategy for blocks" | | ✅ | Complex planning |

## Resources

- [WordPress Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [Branch Validation Main Skill](SKILL.md)
- [WordPress Block Branching Strategy](docs/BRANCHING_STRATEGY_WORDPRESS_BLOCKS.md)
- [Block Theme Development Guide](docs/WORDPRESS_BLOCK_THEME_GUIDE.md)
- [Block Plugin Development Guide](docs/WORDPRESS_BLOCK_PLUGIN_GUIDE.md)
