// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 👋 Welcome for first-time issue filers.

module.exports = {
  name: 'firstIssue',
  emoji: '👋',
  event: 'issues.opened',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.firstIssue) return false;
    const issue = context.payload.issue;
    if (!issue) return false;
    const author = issue.user?.login;
    if (!author) return false;
    const q = `is:issue author:${author} repo:${context.repo().owner}/${context.repo().repo}`;
    try {
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 2 });
      return data.total_count === 1; // only this one
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.issue.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `👋 Welcome @${author} — thanks for filing your first issue! If you haven't already, please fill in the template sections (steps to reproduce, expected/actual behavior, environment). That helps maintainers help you faster.`,
    }));
  },
};
