# Changelog

All notable changes to the branch-validation project are documented here. This project adheres to [Semantic Versioning](https://semver.org/).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `scripts/__tests__/validate-branch-name.test.ts`: Vitest checks that the bundled validator gives the answers SKILL.md documents, including input precedence (`--branch`, then `BRANCH_NAME`, then Git) against a throwaway repository.
- `scripts/__tests__/sync-canonical.test.ts`: Vitest tests for the sync script with a stubbed fetcher, so no test touches the network.
- `npm run sync:check`: reports drift from `lightspeedwp/.github` without writing anything, and exits `1` if a file differs.
- `npm run typecheck`, `tsconfig.json` and `vitest.config.ts`, which enforces at least 80% statements, branches, functions and lines.
- `agents/branch-validation.md`: an agent role that preloads this skill. Install it to `~/.claude/agents/` (see `agents/README.md`).
- A task routing table in SKILL.md.

### Changed
- SKILL.md now applies the org rules in `lightspeedwp/.github` instead of its own. The `block-` scope is an optional convention, not a requirement.
- SKILL.md runs the repository's own validator when it has one, otherwise the bundled one through `${CLAUDE_SKILL_DIR}`, so it works from any directory.
- The seven nested sub-skills are now reference files in `references/`. Claude Code does not load nested skills, so they were unreachable.
- The canonical sync is now `scripts/sync-canonical.ts` (TypeScript, run with `npm run sync`). It also syncs the validator.
- `npm test` runs Vitest with coverage instead of Jest. Node 22.12 or later is required.
- The package is an ES module (`"type": "module"`). The synced validator stays CommonJS (`.cjs`).

### Fixed
- The bundled validator rejected `release/v1.0.0` and accepted `master`, `staging` and double hyphens. It is now an unmodified copy of the canonical `validate-branch-name.cjs`.
- SKILL.md no longer says CI checks, auto-labelling or WordPress.org deployment run automatically. It tells Claude to check the repository's workflows first.
- The sync wrote a literal `$(date ...)` into `CANONICAL_FILES.md` instead of the sync date.
- A failed or empty download during sync could leave a mix of old and new canonical files. The sync now downloads and stages every file before replacing any of them.
- `CLAUDE.md` and `AGENTS.md` pointed at the old `lightspeedwp/branch-validation` repository and at agent files that did not exist.
- `lefthook.yml` ran branch validation as a commit-msg hook and called an `npm run format` script that did not exist.

### Removed
- `scripts/validate-branch-name.js`, its Jest test and `jest.config.js`.
- `scripts/sync-canonical.sh`, the BATS suites in `tests/` and the `test:bats` and `test:all` scripts. LightSpeed agent tooling is TypeScript only.
- The skill-local `.claude/` folder. Claude Code ignores it, and it held stale commands and repository URLs.
- `security-html-block-xss-guidance.md` from the root; it is an eval output and now lives in `evals/comprehensive-coverage/results/security-html-block-xss/with_skill/outputs/`.

## [1.0.0] - 2026-10-30

### Added

#### Core Skill & Documentation
- ✨ **SKILL.md** — Complete branch-validation skill with 38 branch types
  - Full documentation of branch naming pattern `{type}/{scope}-{title}`
  - All 38 approved branch types with descriptions
  - Naming rules, exemptions, and forbidden prefixes
  - Scope keywords and area label detection
  - Best practices and merge strategy
  - Release and hotfix flow documentation
  - Git hook integration guidelines

- ✨ **README.md** — User-facing project documentation
  - Project overview and purpose
  - Single source of truth reference (BRANCHING_STRATEGY.md)
  - 38 branch types organized by category
  - Naming rules with examples
  - Common errors and fixes
  - Branch renaming procedures
  - Canonical file references

#### Agent Role & Prompts
- ✨ **agents/branch-validation.agent.md** — Complete agent role definition
  - Branch name validation and error correction
  - Type selection and recommendation
  - Label routing explanation
  - CI/CD integration guidance
  - All 38 branch types with categorization
  - Interaction patterns and examples
  - Escalation procedures

- ✨ **prompts/validate-branch-name.md** — Branch validation prompt
  - Input/output specifications
  - Valid and invalid branch examples
  - Validation rules and patterns
  - 38 branch type categories
  - When to use guidance

- ✨ **prompts/ci-branch-validation.md** — CI/CD integration prompt
  - GitHub Actions workflow example
  - Pre-push hook (Lefthook) configuration
  - NPM script validation example
  - Automated label application logic
  - CI failure handling
  - Troubleshooting guide

#### Project Configuration & Tooling
- ✨ **AGENTS.md** — Agents guide
  - Branch validation agent documentation
  - Skill vs agent comparison
  - Example workflows
  - Configuration and maintenance
  - Related skills

- ✨ **CLAUDE.md** — Claude Code project configuration
  - How to work on the repository
  - Key files and their purposes
  - Common tasks and workflows
  - Testing and validation procedures
  - Git workflow and conventions
  - Troubleshooting guide

- ✨ **CHANGELOG.md** — This file
  - Project version history
  - Changes per release
  - Migration and deprecation notes

#### Reference Files & Sync
- ✨ **references/branch-types.yml** — Synced canonical file
  - 38 branch types with full definitions
  - PR template routing per type
  - Example branch names

- ✨ **references/branch-labels.yml** — Synced canonical file
  - Type-to-label mapping
  - Default labels per type
  - Area keywords for auto-detection

- ✨ **scripts/sync-canonical.sh** — Canonical file sync script
  - Automatic fetch from lightspeedwp/.github
  - Error handling and status reporting
  - Next steps guidance

#### Documentation
- ✨ **docs/IMPLEMENTATION.md** — Integration guide
  - Quick start for Claude Code users
  - 4 integration patterns:
    - Claude Code + Git hooks
    - CI/CD validation (GitHub Actions)
    - Pre-commit hooks (Lefthook)
    - NPM script validation
  - Configuration file examples
  - Label application logic
  - PR template routing table
  - Troubleshooting guide

- ✨ **docs/CANONICAL_STRUCTURE.md** — File structure documentation
  - Repository structure overview
  - Canonical file sources and purposes
  - Syncing process (manual and automated)
  - File purpose and usage
  - Handling breaking changes
  - Conflict resolution procedures
  - Version compatibility checking

#### Infrastructure
- ✨ **LICENSE** — Apache 2.0 License
- ✨ **.gitignore** — Standard project exclusions
  - Dependencies
  - Logs and temp files
  - IDE files
  - OS-specific files

### Changed
- (First release, no changes)

### Fixed
- (First release, no fixes)

### Deprecated
- (No deprecations in this release)

### Removed
- (No removals in this release)

### Security
- All documentation reviewed for security patterns
- No credentials or secrets in repository
- Safe examples for CI/CD workflows

## Version History

### 1.0.0 Initial Release
- **Date:** October 30, 2026
- **Status:** Stable
- **Features:** Complete branch validation skill and agent role
- **Integration:** Ready for use in Claude Code and CI/CD
- **Documentation:** Comprehensive with examples
- **Canonical Sync:** Automated sync from lightspeedwp/.github

## Installation & Updates

### Installing the Skill

The skill is automatically available in Claude Code once this repository is added to your skills folder or published.

### Updating from Previous Versions

N/A (first release)

### Syncing Canonical Files

Keep canonical files in sync with the source repository:

```bash
./scripts/sync-canonical.sh
git add references/
git commit -m "chore: sync canonical files from .github"
git push
```

## Breaking Changes

### From Initial Release
- None (first release)

## Migration Guides

### N/A (First Release)

## Known Issues

- None known at this time
- Please report issues via GitHub issues

## Contributing

See **CLAUDE.md** for project-specific contribution guidelines.

All contributions should:
1. Follow the branch naming strategy
2. Update relevant documentation
3. Sync canonical files if changed
4. Include clear commit messages
5. Link to related issues

## Resources

- **Source Repository:** https://github.com/lightspeedwp/branch-validation
- **Canonical Configuration:** https://github.com/lightspeedwp/.github
- **Branching Strategy:** https://github.com/lightspeedwp/.github/blob/develop/docs/BRANCHING_STRATEGY.md

## Roadmap

### Planned Features (v1.1+)

- [ ] Automated weekly sync of canonical files via GitHub Actions
- [ ] Expanded CI/CD examples (GitLab, Bitbucket, CircleCI)
- [ ] Interactive branch name wizard
- [ ] More detailed area keyword mapping
- [ ] Integration with linear/GitHub issues for auto-linking
- [ ] Performance benchmarks and optimization

### Proposed Enhancements

- [ ] VS Code extension for real-time validation
- [ ] JetBrains IDE plugin
- [ ] Pre-commit framework integration
- [ ] GitHub CLI extension
- [ ] Slack integration for team validation

### Research Areas

- [ ] ML-based branch name classification
- [ ] Cross-repository naming consistency
- [ ] Naming pattern analytics
- [ ] Team-specific customization

## Support

For questions or issues:

1. Check the [README.md](./README.md)
2. Review [docs/IMPLEMENTATION.md](./docs/IMPLEMENTATION.md)
3. See [CLAUDE.md](./CLAUDE.md) for project guidance
4. Check [BRANCHING_STRATEGY.md](https://github.com/lightspeedwp/.github/blob/develop/docs/BRANCHING_STRATEGY.md) for strategy
5. Open an issue on GitHub

## License

Licensed under Apache License 2.0. See [LICENSE](./LICENSE) file for details.

## Acknowledgments

- **LightSpeed WP Team** — Strategy and requirements
- **Claude AI** — Skill and agent implementation
- **Open Source Community** — Keep a Changelog format

## Release Notes

### 1.0.0 Highlights

✅ **Complete Skill Implementation**
- 38 branch types fully documented
- Comprehensive validation logic
- Integration with CI/CD and git hooks

✅ **Agent Role Ready**
- Full branch-validation agent
- Educational guidance and examples
- CI/CD integration assistance

✅ **Canonical File Integration**
- Synced from lightspeedwp/.github
- Automated sync capability
- Conflict resolution procedures

✅ **Comprehensive Documentation**
- User guide (README.md)
- Implementation patterns (docs/IMPLEMENTATION.md)
- Project structure (docs/CANONICAL_STRUCTURE.md)
- Claude Code configuration (CLAUDE.md)

✅ **Production Ready**
- Tested validation logic
- CI/CD workflow examples
- Error handling and guidance
- Full documentation

---

**Last Updated:** October 30, 2026  
**Maintained By:** LightSpeed WP Development Team
