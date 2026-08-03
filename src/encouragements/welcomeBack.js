// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🌱 Welcome back after 90+ days of inactivity.

module.exports = {
  name: 'welcomeBack',
  emoji: '🌱',
  event: 'pull_request.opened',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.welcomeBack) return false;
    const pr = context.payload.pull_request;
    if (!pr) return false;
    const author = pr.user?.login;
    if (!author) return false;
    try {
      const { data } = await context.octokit.search.issuesAndPullRequests({
        q: `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} created:<${new Date(Date.now() - 90 * 86400e3).toISOString().split('T')[0]}`,
        per_page: 1,
      });
      return data.total_count > 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `🌱 Welcome back @${author}! It's been a while — glad to see you again. 🌿`,
    }));
  },
};
