// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { validateCommits } from '../../../src/process/commitValidator.js';

describe('validateCommits', () => {
  it('passes when no pattern', () => {
    expect(validateCommits([{ message: 'whatever' }], '').ok).toBe(true);
  });

  it('passes all matching', () => {
    const r = validateCommits(
      [{ message: 'feat: add login' }, { message: 'fix: typo' }],
      '^(feat|fix):.+'
    );
    expect(r.ok).toBe(true);
    expect(r.invalid).toEqual([]);
  });

  it('reports invalid ones', () => {
    const r = validateCommits(
      [{ message: 'feat: add' }, { message: 'wip stuff' }],
      '^(feat|fix):.+'
    );
    expect(r.ok).toBe(false);
    expect(r.invalid.length).toBe(1);
  });

  it('handles invalid regex', () => {
    const r = validateCommits([{ message: 'x' }], '[bad');
    expect(r.ok).toBe(false);
    expect(r.error).toBeDefined();
  });

  it('only checks first line', () => {
    const r = validateCommits([{ message: 'feat: x\n\nbody details' }], '^(feat|fix):.+');
    expect(r.ok).toBe(true);
  });
});
