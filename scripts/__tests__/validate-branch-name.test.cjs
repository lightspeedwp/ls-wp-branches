'use strict';

// Checks that the bundled validator gives the answers SKILL.md documents.
// The validator is a copy from lightspeedwp/.github, so these tests guard the
// skill's instructions, not the validator's internals.

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const validator = path.resolve(__dirname, '../validate-branch-name.cjs');
const { validateBranchName } = require(validator);

const isValid = (branch) => validateBranchName(branch).valid;

test('accepts the valid examples in SKILL.md', () => {
  for (const branch of [
    'fix/header-sticky-overlap',
    'feat/tsp-27-hero-layout',
    'feat/block-hero-parallax-scroll',
    'feat/block-core-button-outline-style',
    'feat/block-patterns-landing-pages',
    'design/tokens-spacing-scale',
    'feat/concierge-hero-section',
    'feat/block-hero-layout',
  ]) {
    assert.equal(isValid(branch), true, branch);
  }
});

test('rejects the invalid examples in SKILL.md', () => {
  for (const branch of [
    'fix/header',
    'feature/tsp-27-hero-layout',
    'zared/tsp-27-hero-layout',
    '001-concierge-hero',
    'feat/Hero_Block',
    'feat/hero--block',
  ]) {
    assert.equal(isValid(branch), false, branch);
  }
});

test('rejects forbidden AI-agent prefixes', () => {
  for (const prefix of ['claude', 'copilot', 'openai']) {
    assert.equal(isValid(`${prefix}/fix-header`), false, prefix);
  }
});

test('accepts version and standard release branches', () => {
  for (const branch of ['release/v1.2.0', 'release/1.2.0', 'release/go-live-2026-12-01']) {
    assert.equal(isValid(branch), true, branch);
  }
});

test('exempts only main, develop and bot branches', () => {
  for (const branch of ['main', 'develop', 'dependabot/npm/example', 'renovate/example']) {
    assert.equal(isValid(branch), true, branch);
  }
  for (const branch of ['master', 'staging']) {
    assert.equal(isValid(branch), false, branch);
  }
});

test('CLI exits 0 for a valid name and 1 for an invalid one', () => {
  const run = (branch) =>
    spawnSync(process.execPath, [validator, '--branch', branch], { encoding: 'utf8' });

  assert.equal(run('feat/tsp-27-hero-layout').status, 0);

  const invalid = run('feature/tsp-27-hero-layout');
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /does not follow the naming pattern/);
});
