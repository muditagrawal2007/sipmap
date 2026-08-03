// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { DEFAULTS, deepMerge } from '../../../src/utils/repoConfig.js';

describe('deepMerge', () => {
  it('overrides primitives', () => {
    expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });

  it('merges nested objects', () => {
    expect(deepMerge({ a: { x: 1 } }, { a: { y: 2 } })).toEqual({ a: { x: 1, y: 2 } });
  });

  it('replaces arrays outright', () => {
    expect(deepMerge({ a: [1, 2, 3] }, { a: [9] })).toEqual({ a: [9] });
  });

  it('handles null override', () => {
    expect(deepMerge({ a: 1 }, null)).toEqual({ a: 1 });
  });

  it('DEFAULTS has the expected top-level keys', () => {
    expect(Object.keys(DEFAULTS).sort()).toEqual([
      'autoTriage', 'description', 'encouragement', 'maintainers',
      'processTesting', 'rateLimits', 'stale', 'weeklyDigest',
    ]);
  });
});
