// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { parse, ownersForPath, matchPattern } from '../../../src/maintainers/codeowners.js';

describe('codeowners', () => {
  it('parses a simple CODEOWNERS file', () => {
    const entries = parse(`
# comment
* @alice @bob
/src/ @charlie
*.md @docs-team
`);
    expect(entries.length).toBe(3);
    expect(entries[0].pattern).toBe('*');
    expect(entries[0].owners).toEqual(['alice', 'bob']);
    expect(entries[1].owners).toEqual(['charlie']);
  });

  it('matches glob patterns', () => {
    expect(matchPattern('*', 'src/index.js')).toBe(true);
    expect(matchPattern('*.md', 'README.md')).toBe(true);
    expect(matchPattern('src/', 'src/foo.js')).toBe(true);
    expect(matchPattern('src/', 'lib/foo.js')).toBe(false);
  });

  it('collects owners for a path', () => {
    const entries = parse(`
* @alice
src/ @bob
docs/ @carol
`);
    expect(ownersForPath(entries, 'src/index.js')).toEqual(['alice', 'bob']);
    expect(ownersForPath(entries, 'docs/readme.md')).toEqual(['alice', 'carol']);
  });

  it('skips comments and blanks', () => {
    const entries = parse(`

# header
   # indented comment

* @x
`);
    expect(entries.length).toBe(1);
  });
});
