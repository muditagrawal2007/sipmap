// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🐛 Recognition for first bug-fix PR.

module.exports = {
  name: 'bugHunter',
  emoji: '🐛',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.bugHunter) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    if (!/^fix|^bug|^patch|\b(fixes|closes|resolves)\s+#\d+/i.test(pr.title || '')) return false;
    const author = pr.user?.login;
    if (!author) return false;
    try {
      const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged in:title (fix OR bug OR patch OR closes OR fixes OR resolves)`;
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 10 });
      return data.total_count === 1;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `🐛 Thanks @${author} — first bug-fix merged! Bug hunting requires patience and rigor; thank you for squashing it. 🐛➡️🦋`,
    }));
  },
};
