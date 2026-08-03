# Testing sipmap

This document explains how to run the test suite, add new tests, and use the fixtures.

## Quick start

```bash
npm install
npm test                  # run all tests
npm run test:coverage     # with coverage report
npm run lint              # ESLint
npm run verify:all        # cost + actions verifications
```

## Test layout

```
test/
├── unit/           # mirrors src/ — pure-function tests
├── integration/    # Probot + nock end-to-end webhook tests
├── property/       # fast-check property-based tests
├── security/       # grep-based and runtime security tests
├── snapshots/      # snapshot tests for output messages
└── fixtures/       # sample webhook payloads (.json)
```

## Adding a new test

### Unit test

For `src/utils/foo.js`, create `test/unit/utils/foo.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { myFunc } from '../../../src/utils/foo.js';

describe('myFunc', () => {
  it('does the thing', () => {
    expect(myFunc('input')).toBe('expected');
  });
});
```

### Integration test

```js
import nock from 'nock';
import { Probot } from 'probot';
import appFn from '../../src/index.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const payload = JSON.parse(readFileSync(join(process.cwd(), 'test', 'fixtures', 'my_event.json'), 'utf8'));

it('handles my_event', async () => {
  const probot = new Probot({ id: 1, privateKey: '<PEM>', secret: 'test' });
  probot.load(appFn);
  nock('https://api.github.com').get('/repos/...').reply(200, {});
  await probot.receive({ name: 'my_event', payload });
});
```

### Property-based test

```js
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { parseCommand } from '../../../src/utils/parseCommand.js';

it('never throws on any string', () => {
  fc.assert(fc.property(fc.string(), (s) => {
    parseCommand(s);
    return true;
  }));
});
```

## Coverage thresholds

- 90% lines
- 85% branches
- 90% functions
- 90% statements

CI fails if coverage drops below these thresholds.

## Fixtures

Each `test/fixtures/*.json` is a real-shaped GitHub webhook payload. To add a new one, copy a similar one and edit. Use `probot.receive({ name: '<event>', payload })` to dispatch.

## Running a single test file

```bash
npx vitest run test/unit/utils/parseCommand.test.js
```

## Debugging

Set `LOG_LEVEL=debug` and `DEBUG=true` in `.env`. Logs are PII-redacted automatically.

## End-to-end smoke

`scripts/smoke.sh` runs against a real test repo (requires `gh` CLI auth and an installed copy of sipmap). Not part of CI; run manually.
