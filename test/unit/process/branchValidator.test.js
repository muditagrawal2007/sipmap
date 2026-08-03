// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { validateBranchName } from '../../../src/process/branchValidator.js';

describe('validateBranchName', () => {
  it('passes when no pattern configured', () => {
    expect(validateBranchName('feature/x', '').ok).toBe(true);
    expect(validateBranchName('feature/x', undefined).ok).toBe(true);
  });

  it('passes matching branch', () => {
    expect(validateBranchName('feat/login', '^(feat|fix)/.+').ok).toBe(true);
  });

  it('fails non-matching branch', () => {
    expect(validateBranchName('login', '^(feat|fix)/.+').ok).toBe(false);
  });

  it('handles invalid regex gracefully', () => {
    expect(validateBranchName('x', '[unclosed').ok).toBe(false);
  });

  it('handles empty branch', () => {
    expect(validateBranchName('', '^.+$').ok).toBe(false);
  });
});
