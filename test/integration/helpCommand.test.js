// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import nock from 'nock';
import { Probot, ProbotOctokit } from 'probot';
import appFn from '../../src/index.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const privateKey = readFileSync(join(process.cwd(), 'test', 'fixtures', 'test-private-key.pem'), 'utf8');

function newProbot() {
  return new Probot({
    appId: 12345,
    privateKey,
    secret: 'test',
    Octokit: ProbotOctokit.defaults({ retry: { enabled: false }, throttle: { enabled: false } }),
  });
}

function fixture(name) {
  return JSON.parse(readFileSync(join(process.cwd(), 'test', 'fixtures', name), 'utf8'));
}

describe('integration: :sipmap /help on an issue comment', () => {
  beforeAll(() => { nock.disableNetConnect(); });
  afterAll(() => { nock.cleanAll(); nock.enableNetConnect(); });

  it('responds to :sipmap /help with a help comment', async () => {
    const probot = newProbot();
    probot.load(appFn);

    // Intercept installation auth (Probot mints a JWT and exchanges for an installation token).
    nock('https://api.github.com')
      .post('/app/installations/999/access_tokens')
      .reply(200, { token: 'fake-installation-token', expires_at: '2099-01-01T00:00:00Z' });

    // /repos/:owner/:repo/contents/.sipmap.yml returns 404 → use defaults
    const configScope = nock('https://api.github.com')
      .get('/repos/alice/sipmap-test/contents/.sipmap.yml')
      .reply(404, { message: 'Not Found' });

    let botComment = null;
    const createCommentScope = nock('https://api.github.com')
      .post('/repos/alice/sipmap-test/issues/42/comments', (body) => {
        botComment = body;
        return true;
      })
      .reply(200, { id: 9001 });

    await probot.receive({ name: 'issue_comment', payload: fixture('issue_comment_help.json') });

    expect(configScope.isDone()).toBe(true);
    expect(createCommentScope.isDone()).toBe(true);
    expect(botComment).toBeTruthy();
    expect(botComment.body).toContain('sipmap');
    expect(botComment.body).toContain('/help');
  });
});
