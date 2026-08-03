// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { count } from '../../../src/process/todoCount.js';

describe('todoCount', () => {
  it('counts TODO and FIXME', () => {
    expect(count('// TODO: refactor\n// FIXME: bug')).toEqual({ todo: 1, fixme: 1 });
  });

  it('returns zeros for clean content', () => {
    expect(count('clean code')).toEqual({ todo: 0, fixme: 0 });
  });

  it('handles non-string', () => {
    expect(count(null)).toEqual({ todo: 0, fixme: 0 });
  });

  it('counts multiple occurrences', () => {
    expect(count('TODO a TODO b FIXME c')).toEqual({ todo: 2, fixme: 1 });
  });
});
