// Checks that the bundled validator gives the answers SKILL.md documents.
// The validator is an unmodified copy from lightspeedwp/.github, so these
// tests guard the skill's instructions, not the validator's internals.

import { spawnSync, type SpawnSyncOptions } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const validator = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../validate-branch-name.cjs');
const { validateBranchName } = require(validator) as {
  validateBranchName: (branch: string) => { valid: boolean };
};

const isValid = (branch: string) => validateBranchName(branch).valid;

/** Environment without any CI branch variables, so tests control the input. */
const cleanEnv = (): NodeJS.ProcessEnv => {
  const env = { ...process.env };
  delete env.BRANCH_NAME;
  delete env.GITHUB_HEAD_REF;
  delete env.GITHUB_REF_NAME;
  return env;
};

const cli = (args: string[], options: SpawnSyncOptions = {}) =>
  spawnSync(process.execPath, [validator, ...args], { encoding: 'utf8', env: cleanEnv(), ...options });

describe('documented examples', () => {
  it.each([
    'fix/header-sticky-overlap',
    'feat/tsp-27-hero-layout',
    'feat/block-hero-parallax-scroll',
    'feat/block-core-button-outline-style',
    'feat/block-patterns-landing-pages',
    'design/tokens-spacing-scale',
    'feat/concierge-hero-section',
    'feat/block-hero-layout',
  ])('accepts %s', (branch) => {
    expect(isValid(branch)).toBe(true);
  });

  it.each([
    'fix/header',
    'feature/tsp-27-hero-layout',
    'zared/tsp-27-hero-layout',
    '001-concierge-hero',
    'feat/Hero_Block',
    'feat/hero--block',
  ])('rejects %s', (branch) => {
    expect(isValid(branch)).toBe(false);
  });

  it.each(['claude', 'copilot', 'openai'])('rejects the forbidden %s/ prefix', (prefix) => {
    expect(isValid(`${prefix}/fix-header`)).toBe(false);
  });

  it.each(['release/v1.2.0', 'release/1.2.0', 'release/go-live-2026-12-01'])('accepts release branch %s', (branch) => {
    expect(isValid(branch)).toBe(true);
  });

  it.each(['main', 'develop', 'dependabot/npm/example', 'renovate/example'])('exempts %s', (branch) => {
    expect(isValid(branch)).toBe(true);
  });

  it.each(['master', 'staging'])('does not exempt %s', (branch) => {
    expect(isValid(branch)).toBe(false);
  });
});

describe('CLI', () => {
  let repo: string;

  beforeAll(async () => {
    // A throwaway repository whose HEAD is main, to prove explicit input wins over git.
    repo = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-branch-'));
    const git = (...args: string[]) => spawnSync('git', args, { cwd: repo, encoding: 'utf8' });
    git('init', '-q', '-b', 'main');
    git('-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-q', '--allow-empty', '-m', 'init');
  });

  afterAll(async () => {
    await fs.rm(repo, { recursive: true, force: true });
  });

  it('exits 0 for a valid --branch value', () => {
    expect(cli(['--branch', 'feat/tsp-27-hero-layout']).status).toBe(0);
  });

  it('exits 1 with a reason for an invalid --branch value', () => {
    const result = cli(['--branch', 'feature/tsp-27-hero-layout']);
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/does not follow the naming pattern/);
  });

  it('validates an explicit invalid candidate even when HEAD is main', () => {
    expect(cli(['--branch', 'feature/bad-name'], { cwd: repo }).status).toBe(1);
  });

  it('falls back to git HEAD when no input is given', () => {
    expect(cli([], { cwd: repo }).status).toBe(0);
  });

  it('prefers BRANCH_NAME over git HEAD', () => {
    const result = cli([], { cwd: repo, env: { ...cleanEnv(), BRANCH_NAME: 'feature/from-env' } });
    expect(result.status).toBe(1);
  });

  it('prefers --branch over BRANCH_NAME', () => {
    const result = cli(['--branch', 'feat/explicit-wins'], {
      cwd: repo,
      env: { ...cleanEnv(), BRANCH_NAME: 'feature/from-env' },
    });
    expect(result.status).toBe(0);
  });

  it('prints the patterns with --show-pattern', () => {
    const result = cli(['--show-pattern']);
    expect(result.status).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);
  });
});
