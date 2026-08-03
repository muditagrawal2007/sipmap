// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🔥 Streak: celebrated when a contributor has activity 5+ consecutive weeks.

module.exports = {
  name: 'streak',
  emoji: '🔥',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.streak) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    const author = pr.user?.login;
    if (!author) return false;
    try {
      // Count merged PRs in the last 5 weeks, group by ISO week.
      const { data } = await context.octokit.search.issuesAndPullRequests({
        q: `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged merged:>=${new Date(Date.now() - 35 * 86400e3).toISOString().split('T')[0]}`,
        per_page: 50,
      });
      const weeks = new Set();
      for (const item of data.items) {
        const d = new Date(item.pull_request?.merged_at || item.closed_at);
        const yr = d.getUTCFullYear();
        const wk = Math.floor(((d - new Date(Date.UTC(yr, 0, 1))) / 86400e3 + new Date(Date.UTC(yr, 0, 1)).getUTCDay() + 1) / 7);
        weeks.add(`${yr}-${wk}`);
      }
      return weeks.size >= 5;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `🔥 @${author} is on a streak — 5+ consecutive weeks with merged PRs. Unstoppable!`,
    }));
  },
};
