// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { validateTitle } from '../../../src/process/titleValidator.js';

describe('validateTitle', () => {
  it('passes a normal title', () => {
    expect(validateTitle('Fix login bug', { maxLength: 72 }).ok).toBe(true);
  });

  it('rejects empty title', () => {
    expect(validateTitle('', {}).ok).toBe(false);
    expect(validateTitle('   ', {}).ok).toBe(false);
  });

  it('rejects too-long title', () => {
    const long = 'x'.repeat(200);
    expect(validateTitle(long, { maxLength: 72 }).ok).toBe(false);
  });

  it('rejects placeholder title', () => {
    expect(validateTitle('No description provided.', {}).ok).toBe(false);
  });
});
