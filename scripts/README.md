# Scripts

This skill's tooling is TypeScript, run with [`tsx`](https://tsx.is/). Tests live in `__tests__/` beside the scripts and run on [Vitest](https://vitest.dev/) with an enforced 80% coverage threshold. No shell scripts.

| File | Purpose | Run with |
| --- | --- | --- |
| `validate-branch-name.cjs` | The org branch-name validator. Unmodified copy from `lightspeedwp/.github`; do not edit here. | `node scripts/validate-branch-name.cjs --branch <name>` |
| `sync-canonical.ts` | Refreshes the validator and `references/branch-*.yml` from `lightspeedwp/.github`. Downloads everything first and writes nothing if any download fails or is empty. | `npm run sync` |
| `sync-canonical.ts --check` | Reports drift from `lightspeedwp/.github` without writing. Exits `1` when a file differs. | `npm run sync:check` |
| `__tests__/` | Vitest suites for both scripts. | `npm test` |

## Validator exit codes

`0` valid, `1` invalid or no branch detected. Input precedence: a positional name or `--branch`, then `BRANCH_NAME`, `GITHUB_HEAD_REF` and `GITHUB_REF_NAME`, then the current Git branch.

## Sync options

- `--check`: compare only, write nothing.
- `--ref <git-ref>`: sync from a ref other than `develop`.

After a sync, review `git diff references/ scripts/validate-branch-name.cjs` and `references/CANONICAL_FILES.md` before committing.
