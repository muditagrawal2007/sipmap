// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /metrics @user — show contributor stats.

module.exports = {
  name: 'metrics',
  description: 'Show contributor stats',
  requiresMaintainer: false,
  async execute(context, args) {
    const user = (args[0] || '').replace(/^@/, '');
    if (!user) {
      await context.octokit.issues.createComment(context.issue({ body: 'Usage: `:sipmap /metrics @username`' }));
      return;
    }
    const { owner, repo } = context.repo();
    const q = `is:pr author:${user} repo:${owner}/${repo}`;
    let total = 0, merged = 0, open = 0, closed = 0;
    try {
      const iter = context.octokit.paginate.iterator(context.octokit.search.issuesAndPullRequests, { q, per_page: 100 });
      for await (const { data } of iter) {
        total += data.length;
        for (const i of data) {
          if (i.pull_request && i.pull_request.merged_at) merged += 1;
          else if (i.state === 'open') open += 1;
          else if (i.state === 'closed') closed += 1;
        }
      }
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ Couldn't fetch metrics: ${err.message}` }));
      return;
    }
    await context.octokit.issues.createComment(context.issue({
      body: [
        `📊 **Metrics for @${user}**`,
        '',
        `- Total PRs: ${total}`,
        `- Merged: ${merged}`,
        `- Open: ${open}`,
        `- Closed (not merged): ${closed}`,
      ].join('\n'),
    }));
  },
};
