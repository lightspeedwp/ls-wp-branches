# Agents

`branch-validation.md` is the agent role for this skill. It preloads the `branch-validation-wordpress` skill and adds working rules for choosing, checking and fixing branch names.

Claude Code does not load agents from inside a skill folder. Install it as a user-level agent:

```bash
ln -s ~/.claude/skills/branch-validation-wordpress/agents/branch-validation.md ~/.claude/agents/branch-validation.md
```

A symlink keeps the installed agent in step with this repository. Copy the file instead if you want a fixed version.
