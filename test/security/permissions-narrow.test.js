// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Verify the GitHub App manifest declares exactly the expected narrow permissions.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

describe('security: narrow app permissions', () => {
  const manifest = yaml.load(readFileSync('app.yml', 'utf8'));
  const perms = manifest.default_permissions || {};

  it('declares exactly the expected permissions', () => {
    const expected = { contents: 'read', issues: 'write', pull_requests: 'write', checks: 'read', metadata: 'read' };
    for (const [k, v] of Object.entries(expected)) {
      expect(perms[k]).toBe(v);
    }
  });

  it('does not request write on actions', () => {
    expect(perms.actions).not.toBe('write');
  });

  it('does not request email permission', () => {
    expect(perms.email).toBeUndefined();
  });

  it('does not request admin permission', () => {
    expect(perms.administration).toBeUndefined();
    expect(perms.admin).toBeUndefined();
  });
});
