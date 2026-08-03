// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 👋 Friendly nudge when a stale issue is reopened.

module.exports = {
  name: 'staleReopen',
  emoji: '👋',
  event: 'issues.reopened',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.staleReopen) return false;
    const issue = context.payload.issue;
    if (!issue) return false;
    // If created more than 30 days ago, it's "stale".
    const ageDays = (Date.now() - new Date(issue.created_at)) / 86400e3;
    return ageDays > 30;
  },
  async run(context) {
    const opener = context.payload.sender?.login;
    const issue = context.payload.issue;
    await context.octokit.issues.createComment(context.issue({
      body: `👋 Hey @${opener} — this issue was opened ${Math.round((Date.now() - new Date(issue.created_at)) / 86400e3)} days ago. Are you still hitting this? A quick update on reproduction details or current behavior would help maintainers pick this back up. 🌱`,
    }));
  },
};
