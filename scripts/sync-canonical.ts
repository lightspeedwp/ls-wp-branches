/**
 * Sync canonical files from the lightspeedwp/.github repository.
 *
 * Refreshes this skill's unmodified copies of the org branch rules and
 * validator. All files are downloaded and checked before any of them is
 * written, so a failed or empty download leaves the existing copies untouched.
 *
 * Usage:
 *   npx tsx scripts/sync-canonical.ts            # download and write
 *   npx tsx scripts/sync-canonical.ts --check    # report drift, write nothing
 *   npx tsx scripts/sync-canonical.ts --ref main # sync from another ref
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export interface CanonicalFile {
  /** Path inside lightspeedwp/.github. */
  source: string;
  /** Path inside this skill, relative to the skill root. */
  destination: string;
}

export const CANONICAL_FILES: readonly CanonicalFile[] = [
  { source: '.github/branch-types.yml', destination: 'references/branch-types.yml' },
  { source: '.github/branch-labels.yml', destination: 'references/branch-labels.yml' },
  { source: 'scripts/validation/validate-branch-name.cjs', destination: 'scripts/validate-branch-name.cjs' },
];

export const REPORT_PATH = 'references/CANONICAL_FILES.md';

export type Fetcher = (url: string) => Promise<Pick<Response, 'ok' | 'status' | 'text'>>;

export interface SyncOptions {
  skillRoot: string;
  ref?: string;
  files?: readonly CanonicalFile[];
  fetcher?: Fetcher;
  now?: () => Date;
}

export interface FileStatus {
  destination: string;
  changed: boolean;
}

export class SyncError extends Error {}

export class CanonicalSync {
  private readonly skillRoot: string;
  private readonly ref: string;
  private readonly files: readonly CanonicalFile[];
  private readonly fetcher: Fetcher;
  private readonly now: () => Date;

  constructor(options: SyncOptions) {
    this.skillRoot = options.skillRoot;
    this.ref = options.ref ?? 'develop';
    this.files = options.files ?? CANONICAL_FILES;
    this.fetcher = options.fetcher ?? ((url) => fetch(url));
    this.now = options.now ?? (() => new Date());
  }

  sourceUrl(file: CanonicalFile): string {
    return `https://raw.githubusercontent.com/lightspeedwp/.github/${this.ref}/${file.source}`;
  }

  /** Downloads every file into memory. Throws before anything is written. */
  async downloadAll(): Promise<Map<CanonicalFile, string>> {
    const contents = new Map<CanonicalFile, string>();
    for (const file of this.files) {
      const url = this.sourceUrl(file);
      const response = await this.fetcher(url);
      if (!response.ok) {
        throw new SyncError(`Failed to download ${file.source} (HTTP ${response.status}) from ${url}`);
      }
      const body = await response.text();
      if (body.trim() === '') {
        throw new SyncError(`Downloaded ${file.source} is empty; refusing to overwrite ${file.destination}`);
      }
      contents.set(file, body);
    }
    return contents;
  }

  /** Compares the downloaded files with the local copies without writing. */
  async check(): Promise<FileStatus[]> {
    const contents = await this.downloadAll();
    const statuses: FileStatus[] = [];
    for (const [file, body] of contents) {
      statuses.push({ destination: file.destination, changed: (await this.readLocal(file)) !== body });
    }
    return statuses;
  }

  /**
   * Downloads, then writes every file to a temporary sibling before renaming
   * them into place. Nothing is renamed unless every temporary write succeeds.
   */
  async sync(): Promise<FileStatus[]> {
    const contents = await this.downloadAll();
    const staged: Array<{ temp: string; target: string; status: FileStatus }> = [];

    try {
      for (const [file, body] of contents) {
        const target = this.resolve(file.destination);
        const temp = `${target}.sync-tmp`;
        const changed = (await this.readLocal(file)) !== body;
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(temp, body, 'utf8');
        staged.push({ temp, target, status: { destination: file.destination, changed } });
      }
    } catch (error) {
      await Promise.all(staged.map(({ temp }) => fs.rm(temp, { force: true })));
      throw error;
    }

    for (const { temp, target } of staged) {
      await fs.rename(temp, target);
    }

    await this.writeReport();
    return staged.map(({ status }) => status);
  }

  async writeReport(): Promise<void> {
    const target = this.resolve(REPORT_PATH);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, this.renderReport(), 'utf8');
  }

  renderReport(): string {
    const timestamp = this.now().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const synced = this.files.map((file) => `- \`${file.destination}\` from \`${file.source}\``).join('\n');
    return `# Canonical Files Reference

Last synced: ${timestamp} (lightspeedwp/.github @ ${this.ref})

These files are unmodified copies of canonical configuration from
[lightspeedwp/.github](https://github.com/lightspeedwp/.github).

**Do not edit these files directly.** Instead:

1. Update the files in [lightspeedwp/.github](https://github.com/lightspeedwp/.github).
2. Run \`npm run sync\` in this skill to pull the latest versions.
3. Review the diff and commit the updated files.

## Synced Files

${synced}

## Reference Links

- [Canonical branch-types.yml](https://github.com/lightspeedwp/.github/blob/develop/.github/branch-types.yml)
- [Canonical branch-labels.yml](https://github.com/lightspeedwp/.github/blob/develop/.github/branch-labels.yml)
- [Branching Strategy](https://github.com/lightspeedwp/.github/blob/develop/docs/BRANCHING_STRATEGY.md)
`;
  }

  private resolve(relativePath: string): string {
    return path.join(this.skillRoot, relativePath);
  }

  private async readLocal(file: CanonicalFile): Promise<string | undefined> {
    try {
      return await fs.readFile(this.resolve(file.destination), 'utf8');
    } catch {
      return undefined;
    }
  }
}

export interface CliIO {
  log: (message: string) => void;
  error: (message: string) => void;
}

export interface CliArgs {
  check: boolean;
  ref: string;
}

export function parseArgs(argv: readonly string[]): CliArgs {
  const args: CliArgs = { check: false, ref: 'develop' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--check') {
      args.check = true;
    } else if (arg === '--ref') {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new SyncError('--ref needs a value, for example --ref develop');
      }
      args.ref = value;
      i++;
    } else {
      throw new SyncError(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

/** Runs the CLI and returns the exit code. */
export async function run(
  argv: readonly string[],
  options: Omit<SyncOptions, 'ref'>,
  io: CliIO = { log: console.log, error: console.error },
): Promise<number> {
  try {
    const args = parseArgs(argv);
    const syncer = new CanonicalSync({ ...options, ref: args.ref });

    if (args.check) {
      const statuses = await syncer.check();
      const drifted = statuses.filter((status) => status.changed);
      for (const status of statuses) {
        io.log(`${status.changed ? 'DRIFT' : 'OK   '} ${status.destination}`);
      }
      if (drifted.length > 0) {
        io.error(`${drifted.length} file(s) differ from lightspeedwp/.github@${args.ref}. Run npm run sync.`);
        return 1;
      }
      io.log(`All canonical files match lightspeedwp/.github@${args.ref}.`);
      return 0;
    }

    const statuses = await syncer.sync();
    for (const status of statuses) {
      io.log(`${status.changed ? 'UPDATED ' : 'UNCHANGED'} ${status.destination}`);
    }
    io.log(`Wrote ${REPORT_PATH}. Review the diff before committing.`);
    return 0;
  } catch (error) {
    io.error(`Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

const isEntryPoint = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntryPoint) {
  const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  process.exitCode = await run(process.argv.slice(2), { skillRoot });
}
