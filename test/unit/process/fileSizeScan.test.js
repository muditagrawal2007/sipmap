// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { scan, DEFAULT_MAX_BYTES } from '../../../src/process/fileSizeScan.js';

describe('fileSizeScan', () => {
  it('flags large files', () => {
    const r = scan([{ filename: 'a.bin', size: 2 * 1024 * 1024 }, { filename: 'b.txt', size: 100 }]);
    expect(r.large.length).toBe(1);
    expect(r.large[0].filename).toBe('a.bin');
  });

  it('passes small files', () => {
    const r = scan([{ filename: 'a.txt', size: 100 }]);
    expect(r.large).toEqual([]);
  });

  it('handles empty input', () => {
    expect(scan([]).large).toEqual([]);
    expect(scan(null).large).toEqual([]);
  });

  it('uses default threshold', () => {
    expect(DEFAULT_MAX_BYTES).toBe(500 * 1024);
  });
});
