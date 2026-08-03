// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🚀 Celebration on first merged PR.

module.exports = {
  name: 'firstMerged',
  emoji: '🚀',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.firstMerged) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    const author = pr.user?.login;
    if (!author) return false;
    // Was this the first merged PR for this author? Look for earlier merges.
    const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged merged:<${pr.merged_at}`;
    try {
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 1 });
      return data.total_count === 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `🚀 @${author} — your first merged PR in this repo! Welcome to the contributors club 🎊`,
    }));
  },
};
