// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 💬 Conversation starter on stale PRs (engagement nudge).

module.exports = {
  name: 'conversationStarter',
  emoji: '💬',
  event: 'pull_request.synchronize',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled) return false;
    if (!cfg.encouragement?.conversationStarter) return false;
    const pr = context.payload.pull_request;
    if (!pr) return false;
    // Only trigger if PR is older than 14 days and still open.
    const ageDays = (Date.now() - new Date(pr.created_at)) / 86400e3;
    if (ageDays < 14) return false;
    if (pr.state !== 'open') return false;
    // Avoid being a bot-on-bot: ensure at least one prior comment exists.
    const { data: comments } = await context.octokit.issues.listComments({ ...context.repo(), issue_number: pr.number, per_page: 1 });
    return comments.length > 0;
  },
  async run(context) {
    const pr = context.payload.pull_request;
    await context.octokit.issues.createComment(context.issue({
      body: `💬 Hey friends — this PR has been open for ${Math.round((Date.now() - new Date(pr.created_at)) / 86400e3)} days. @${pr.user.login}, is there anything blocking merge? Maintainers, anything else you need? 🧵`,
    }));
  },
};
