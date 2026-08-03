// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🏆 Milestone: every Nth merged PR for a contributor.

module.exports = {
  name: 'milestone',
  emoji: '🏆',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled) return false;
    const every = cfg.encouragement?.milestoneEvery || 5;
    if (every <= 0) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    const author = pr.user?.login;
    if (!author) return false;
    const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged`;
    try {
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 1 });
      return data.total_count > 0 && data.total_count % every === 0;
    } catch { return false; }
  },
  async run(context) {
    const pr = context.payload.pull_request;
    const author = pr.user.login;
    const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged`;
    let total = 0;
    try {
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 1 });
      total = data.total_count;
    } catch (err) {
      void err; /* search may rate-limit; defaults to 0 */
    }
    const tier = total >= 100 ? '💯 Century club!' : total >= 50 ? '⭐ Half-century!' : total >= 25 ? '🌟 Quarter-century!' : total >= 10 ? '🥈 Double digits!' : '🏅';
    await context.octokit.issues.createComment(context.issue({
      body: `${tier} @${author} just hit **${total} merged PRs** in this repo. Keep going — you're awesome! 🚀`,
    }));
  },
};
