// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import encouragements from '../../../src/encouragements/index.js';

describe('encouragement registry', () => {
  it('all encouragements have the right shape', () => {
    for (const e of Object.values(encouragements)) {
      expect(e.name).toBeTruthy();
      expect(typeof e.shouldRun).toBe('function');
      expect(typeof e.run).toBe('function');
      expect(e.event).toBeTruthy();
    }
  });

  it('has at least 12 distinct encouragements', () => {
    expect(Object.keys(encouragements).length).toBeGreaterThanOrEqual(12);
  });
});
