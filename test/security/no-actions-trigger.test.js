// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Static security scan: prove no forbidden Actions-triggering calls exist in source.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walkJsFiles(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkJsFiles(full, results);
    else if (entry.endsWith('.js')) results.push(full);
  }
  return results;
}

describe('security: no Actions-triggering calls', () => {
  const files = walkJsFiles('src');

  it('has source files to scan', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  const forbidden = [
    'createWorkflowDispatch',
    'reRunWorkflow',
    'reRunJob',
    'cancelWorkflowRun',
  ];

  for (const fn of forbidden) {
    it(`no source file contains "${fn}"`, () => {
      const offenders = [];
      for (const f of files) {
        const content = readFileSync(f, 'utf8');
        // Allow mentions in comments only — but for these APIs, NO mention at all is ideal.
        // We allow only the verify-no-actions-trigger.sh string elsewhere.
        if (content.includes(fn)) offenders.push(f);
      }
      expect(offenders).toEqual([]);
    });
  }

  it('no source file POSTs/PUTs to Actions workflow endpoints', () => {
    const offenders = [];
    for (const f of files) {
      const content = readFileSync(f, 'utf8');
      if (/\/actions\/workflows\/[^/]+\/dispatches/.test(content)) offenders.push(f);
      if (/\/actions\/runs\/[^/]+\/rerun/.test(content)) offenders.push(f);
      if (/\/actions\/jobs\/[^/]+\/rerun/.test(content)) offenders.push(f);
    }
    expect(offenders).toEqual([]);
  });
});
