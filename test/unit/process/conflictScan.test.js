// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { scan } from '../../../src/process/conflictScan.js';

describe('conflictScan', () => {
  it('detects all three markers', () => {
    const r = scan('<<<<<<<\nfoo\n=======\nbar\n>>>>>>>');
    expect(r.hasConflicts).toBe(true);
    expect(r.markers).toEqual(['<<<<<<<', '=======', '>>>>>>>']);
  });

  it('returns no markers in clean diff', () => {
    const r = scan('+ added line\n- removed line');
    expect(r.hasConflicts).toBe(false);
  });

  it('handles non-string', () => {
    expect(scan(null).hasConflicts).toBe(false);
  });
});
