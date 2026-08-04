// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect, beforeEach } from 'vitest';
import { shouldAllow, _reset } from '../../../src/utils/rateLimit.js';

describe('rateLimit', () => {
  beforeEach(() => _reset());

  const baseLimits = { perUserPerPR: 3, perPRPerHour: 20, perRepoPerHour: 100, debounceSeconds: 30 };

  it('allows the first call', () => {
    const r = shouldAllow({ repoId: 1, prNumber: 10, user: 'alice', command: 'help', limits: baseLimits });
    expect(r.allow).toBe(true);
  });

  it('debounces same user+command+pr within window', () => {
    shouldAllow({ repoId: 1, prNumber: 10, user: 'alice', command: 'help', limits: baseLimits });
    const r = shouldAllow({ repoId: 1, prNumber: 10, user: 'alice', command: 'help', limits: baseLimits });
    expect(r.allow).toBe(false);
    expect(r.reason).toBe('debounce');
  });

  it('enforces per-user-per-PR limit', async () => {
    const limits = { ...baseLimits, debounceSeconds: 0 };
    for (let i = 0; i < 3; i++) {
      const r = shouldAllow({ repoId: 1, prNumber: 10, user: 'alice', command: `cmd${i}`, limits });
      expect(r.allow).toBe(true);
    }
    const r = shouldAllow({ repoId: 1, prNumber: 10, user: 'alice', command: 'cmd4', limits });
    expect(r.allow).toBe(false);
    expect(r.reason).toBe('per-user-pr-limit');
  });

  it('enforces per-PR limit', () => {
    const limits = { ...baseLimits, debounceSeconds: 0, perPRPerHour: 2 };
    expect(shouldAllow({ repoId: 1, prNumber: 10, user: 'a', command: 'c1', limits }).allow).toBe(true);
    expect(shouldAllow({ repoId: 1, prNumber: 10, user: 'b', command: 'c2', limits }).allow).toBe(true);
    const r = shouldAllow({ repoId: 1, prNumber: 10, user: 'c', command: 'c3', limits });
    expect(r.allow).toBe(false);
    expect(r.reason).toBe('per-pr-limit');
  });

  it('enforces per-repo limit', () => {
    const limits = { ...baseLimits, debounceSeconds: 0, perRepoPerHour: 2, perPRPerHour: 100, perUserPerPR: 100 };
    expect(shouldAllow({ repoId: 1, prNumber: 10, user: 'a', command: 'c1', limits }).allow).toBe(true);
    expect(shouldAllow({ repoId: 1, prNumber: 11, user: 'a', command: 'c2', limits }).allow).toBe(true);
    const r = shouldAllow({ repoId: 1, prNumber: 12, user: 'a', command: 'c3', limits });
    expect(r.allow).toBe(false);
    expect(r.reason).toBe('per-repo-limit');
  });
});
