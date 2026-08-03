// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import automations from '../../../src/automations/index.js';

describe('automation registry', () => {
  it('all automations have the right shape', () => {
    for (const a of Object.values(automations)) {
      expect(a.name).toBeTruthy();
      expect(Array.isArray(a.events)).toBe(true);
      expect(a.events.length).toBeGreaterThan(0);
      expect(typeof a.run).toBe('function');
    }
  });
});
