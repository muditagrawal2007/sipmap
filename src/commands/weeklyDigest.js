// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /weekly-digest — post weekly contributor summary to a configured issue.

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');
const { getRepoConfig } = require('../utils/repoConfig');

module.exports = {
  name: 'weekly-digest',
  description: 'Post weekly contributor digest',
  requiresMaintainer: true,
  async execute(context) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    const cfg = await getRepoConfig(context);
    if (!cfg.weeklyDigest?.enabled || !cfg.weeklyDigest?.issueNumber) {
      await context.octokit.issues.createComment(context.issue({ body: '⚠️ Configure `weeklyDigest.enabled: true` and `weeklyDigest.issueNumber` in `.sipmap.yml` first.' }));
      return;
    }
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const q = `is:pr repo:${context.repo().owner}/${context.repo().repo} merged:>=${since}`;
    const merged = [];
    try {
      const iter = context.octokit.paginate.iterator(context.octokit.search.issuesAndPullRequests, { q, per_page: 100 });
      for await (const { data } of iter) merged.push(...data);
    } catch (err) {
      void err; /* search may rate-limit; empty digest is fine */
    }

    const byAuthor = {};
    for (const pr of merged) {
      const a = pr.user?.login || 'unknown';
      byAuthor[a] = (byAuthor[a] || 0) + 1;
    }
    const lines = [
      `📅 **Weekly contributor digest** (since ${since})`,
      '',
      `- Merged PRs: ${merged.length}`,
      '',
      '**Top contributors:**',
      ...Object.entries(byAuthor)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([u, n]) => `- @${u}: ${n} PR(s)`),
    ];

    await context.octokit.issues.createComment({
      ...context.repo({ body: lines.join('\n') }),
      issue_number: cfg.weeklyDigest.issueNumber,
    });
    await context.octokit.issues.createComment(context.issue({ body: '✅ Weekly digest posted.' }));
  },
};
