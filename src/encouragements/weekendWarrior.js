// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🌙 Celebration for first merged PR on a weekend.

module.exports = {
  name: 'weekendWarrior',
  emoji: '🌙',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.weekendWarrior) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged || !pr.merged_at) return false;
    const author = pr.user?.login;
    if (!author) return false;
    const day = new Date(pr.merged_at).getUTCDay();
    if (day !== 0 && day !== 6) return false;
    try {
      const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged merged:<${pr.merged_at}`;
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 10 });
      return data.total_count === 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `🌙 @${author} — your first merged PR landed on a weekend! That's dedication. Take a coffee break on the maintainers. ☕`,
    }));
  },
};
