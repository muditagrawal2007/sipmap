// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🕰️ Recognition for first PR after a 90+ day contributor gap.

module.exports = {
  name: 'persistencePays',
  emoji: '🕰️',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.persistencePays) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged || !pr.merged_at) return false;
    const author = pr.user?.login;
    if (!author) return false;
    try {
      const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged merged:<${pr.merged_at}`;
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 1, sort: 'created', order: 'desc' });
      if (data.total_count === 0) return false;
      const lastMergedAt = new Date(data.items[0].pull_request?.merged_at || data.items[0].updated_at);
      const days = (new Date(pr.merged_at) - lastMergedAt) / (1000 * 60 * 60 * 24);
      return days >= 90;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `🕰️ Welcome back @${author}! Persistence pays off — your first merged PR in 90+ days. 🎉 Glad you're still here.`,
    }));
  },
};
