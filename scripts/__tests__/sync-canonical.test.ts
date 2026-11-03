import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CANONICAL_FILES,
  CanonicalSync,
  type Fetcher,
  REPORT_PATH,
  SyncError,
  parseArgs,
  run,
} from '../sync-canonical.ts';

const FIXED_DATE = new Date('2026-11-03T08:15:30.123Z');

type Reply = { status?: number; body?: string };

/** Builds a fetcher that answers by canonical source path, never touching the network. */
function stubFetcher(replies: Record<string, Reply>): Fetcher & ReturnType<typeof vi.fn> {
  return vi.fn(async (url: string) => {
    const source = CANONICAL_FILES.find((file) => url.endsWith(`/${file.source}`))?.source ?? url;
    const reply = replies[source] ?? { status: 404, body: '' };
    const status = reply.status ?? 200;
    return { ok: status >= 200 && status < 300, status, text: async () => reply.body ?? '' };
  });
}

const allOk = (): Record<string, Reply> =>
  Object.fromEntries(CANONICAL_FILES.map((file) => [file.source, { body: `new ${file.source}\n` }]));

describe('CanonicalSync', () => {
  let skillRoot: string;

  const read = (relative: string) => fs.readFile(path.join(skillRoot, relative), 'utf8');
  const exists = (relative: string) =>
    fs.access(path.join(skillRoot, relative)).then(
      () => true,
      () => false,
    );

  beforeEach(async () => {
    skillRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-canonical-'));
    await fs.mkdir(path.join(skillRoot, 'references'));
    await fs.mkdir(path.join(skillRoot, 'scripts'));
    for (const file of CANONICAL_FILES) {
      await fs.writeFile(path.join(skillRoot, file.destination), `old ${file.source}\n`);
    }
  });

  afterEach(async () => {
    await fs.rm(skillRoot, { recursive: true, force: true });
  });

  it('builds raw GitHub URLs for the requested ref', () => {
    const syncer = new CanonicalSync({ skillRoot, ref: 'main' });
    expect(syncer.sourceUrl(CANONICAL_FILES[0])).toBe(
      'https://raw.githubusercontent.com/lightspeedwp/.github/main/.github/branch-types.yml',
    );
  });

  it('defaults to the develop ref', () => {
    expect(new CanonicalSync({ skillRoot }).sourceUrl(CANONICAL_FILES[2])).toContain('/.github/develop/scripts/');
  });

  it('writes every file and a report with a real UTC timestamp', async () => {
    const fetcher = stubFetcher(allOk());
    const statuses = await new CanonicalSync({ skillRoot, fetcher, now: () => FIXED_DATE }).sync();

    expect(fetcher).toHaveBeenCalledTimes(CANONICAL_FILES.length);
    expect(statuses.every((status) => status.changed)).toBe(true);
    for (const file of CANONICAL_FILES) {
      expect(await read(file.destination)).toBe(`new ${file.source}\n`);
    }

    const report = await read(REPORT_PATH);
    expect(report).toContain('Last synced: 2026-11-03T08:15:30Z (lightspeedwp/.github @ develop)');
    expect(report).not.toContain('$(');
    expect(report).toContain('npm run sync');
  });

  it('reports unchanged files when the content already matches', async () => {
    const replies = Object.fromEntries(CANONICAL_FILES.map((file) => [file.source, { body: `old ${file.source}\n` }]));
    const statuses = await new CanonicalSync({ skillRoot, fetcher: stubFetcher(replies) }).sync();
    expect(statuses.some((status) => status.changed)).toBe(false);
  });

  it('creates missing destination folders', async () => {
    await fs.rm(path.join(skillRoot, 'references'), { recursive: true });
    await new CanonicalSync({ skillRoot, fetcher: stubFetcher(allOk()) }).sync();
    expect(await exists(REPORT_PATH)).toBe(true);
  });

  it.each(CANONICAL_FILES.map((file, index) => [index + 1, file.source]))(
    'leaves every local copy untouched when download %i (%s) fails',
    async (_position, failing) => {
      const replies = allOk();
      replies[failing] = { status: 500 };

      await expect(new CanonicalSync({ skillRoot, fetcher: stubFetcher(replies) }).sync()).rejects.toThrow(
        /HTTP 500/,
      );

      for (const file of CANONICAL_FILES) {
        expect(await read(file.destination)).toBe(`old ${file.source}\n`);
      }
      expect(await exists(REPORT_PATH)).toBe(false);
    },
  );

  it('refuses an empty download and keeps the old copies', async () => {
    const replies = allOk();
    replies[CANONICAL_FILES[1].source] = { body: '   \n' };

    await expect(new CanonicalSync({ skillRoot, fetcher: stubFetcher(replies) }).sync()).rejects.toThrow(/empty/);
    expect(await read(CANONICAL_FILES[0].destination)).toBe(`old ${CANONICAL_FILES[0].source}\n`);
  });

  it('removes staged temp files and renames nothing when a staged write fails', async () => {
    // A directory at the temp path makes the second staged write fail.
    await fs.mkdir(path.join(skillRoot, `${CANONICAL_FILES[1].destination}.sync-tmp`));

    await expect(new CanonicalSync({ skillRoot, fetcher: stubFetcher(allOk()) }).sync()).rejects.toThrow();

    expect(await read(CANONICAL_FILES[0].destination)).toBe(`old ${CANONICAL_FILES[0].source}\n`);
    expect(await exists(`${CANONICAL_FILES[0].destination}.sync-tmp`)).toBe(false);
  });

  it('check reports drift without writing anything', async () => {
    const replies = Object.fromEntries(CANONICAL_FILES.map((file) => [file.source, { body: `old ${file.source}\n` }]));
    replies[CANONICAL_FILES[2].source] = { body: 'changed upstream\n' };

    const statuses = await new CanonicalSync({ skillRoot, fetcher: stubFetcher(replies) }).check();

    expect(statuses.map((status) => status.changed)).toEqual([false, false, true]);
    expect(await read(CANONICAL_FILES[2].destination)).toBe(`old ${CANONICAL_FILES[2].source}\n`);
    expect(await exists(REPORT_PATH)).toBe(false);
  });

  it('treats a missing local copy as drift', async () => {
    await fs.rm(path.join(skillRoot, CANONICAL_FILES[0].destination));
    const statuses = await new CanonicalSync({ skillRoot, fetcher: stubFetcher(allOk()) }).check();
    expect(statuses[0].changed).toBe(true);
  });

  it('uses the global fetch when no fetcher is given', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('body\n', { status: 200 }));
    try {
      await new CanonicalSync({ skillRoot, files: [CANONICAL_FILES[0]] }).check();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('branch-types.yml'));
    } finally {
      spy.mockRestore();
    }
  });
});

describe('parseArgs', () => {
  it('defaults to a write sync from develop', () => {
    expect(parseArgs([])).toEqual({ check: false, ref: 'develop' });
  });

  it('reads --check and --ref', () => {
    expect(parseArgs(['--check', '--ref', 'main'])).toEqual({ check: true, ref: 'main' });
  });

  it.each([[['--ref']], [['--ref', '--check']]])('rejects --ref without a value: %j', (argv) => {
    expect(() => parseArgs(argv)).toThrow(SyncError);
  });

  it('rejects unknown arguments', () => {
    expect(() => parseArgs(['--force'])).toThrow(/Unknown argument/);
  });
});

describe('run', () => {
  let skillRoot: string;
  const io = () => ({ log: vi.fn(), error: vi.fn() });

  beforeEach(async () => {
    skillRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'sync-canonical-run-'));
    for (const file of CANONICAL_FILES) {
      await fs.mkdir(path.dirname(path.join(skillRoot, file.destination)), { recursive: true });
      await fs.writeFile(path.join(skillRoot, file.destination), `old ${file.source}\n`);
    }
  });

  afterEach(async () => {
    await fs.rm(skillRoot, { recursive: true, force: true });
  });

  it('returns 0 and lists updated files after a sync', async () => {
    const out = io();
    expect(await run([], { skillRoot, fetcher: stubFetcher(allOk()) }, out)).toBe(0);
    expect(out.log).toHaveBeenCalledWith(expect.stringContaining('UPDATED'));
    expect(out.error).not.toHaveBeenCalled();
  });

  it('returns 1 from --check when files drift', async () => {
    const out = io();
    expect(await run(['--check'], { skillRoot, fetcher: stubFetcher(allOk()) }, out)).toBe(1);
    expect(out.error).toHaveBeenCalledWith(expect.stringContaining('differ'));
  });

  it('returns 0 from --check when everything matches', async () => {
    const replies = Object.fromEntries(CANONICAL_FILES.map((file) => [file.source, { body: `old ${file.source}\n` }]));
    const out = io();
    expect(await run(['--check'], { skillRoot, fetcher: stubFetcher(replies) }, out)).toBe(0);
    expect(out.log).toHaveBeenCalledWith(expect.stringContaining('All canonical files match'));
  });

  it('returns 1 with a message when the sync fails', async () => {
    const out = io();
    expect(await run([], { skillRoot, fetcher: stubFetcher({}) }, out)).toBe(1);
    expect(out.error).toHaveBeenCalledWith(expect.stringMatching(/^Sync failed: .*HTTP 404/));
  });

  it('returns 1 for bad arguments', async () => {
    const out = io();
    expect(await run(['--nope'], { skillRoot }, out)).toBe(1);
  });

  it('reports non-Error failures', async () => {
    const out = io();
    const fetcher: Fetcher = async () => {
      throw 'offline';
    };
    expect(await run([], { skillRoot, fetcher }, out)).toBe(1);
    expect(out.error).toHaveBeenCalledWith('Sync failed: offline');
  });
});
