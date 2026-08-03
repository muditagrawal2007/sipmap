// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it } from 'vitest';
import fc from 'fast-check';
import { parseCommand } from '../../src/utils/parseCommand.js';

describe('parseCommand (property-based)', () => {
  it('never throws on any string input', () => {
    fc.assert(fc.property(fc.string(), (s) => {
      const r = parseCommand(s);
      return r === null || typeof r.name === 'string';
    }));
  });

  it('never throws on arbitrary unicode', () => {
    fc.assert(fc.property(fc.string({ minLength: 0, maxLength: 500 }), (s) => {
      parseCommand(s);
      return true;
    }));
  });
});
