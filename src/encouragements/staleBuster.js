// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🧹 Stale-buster: thanked when closing an issue that was open > 30 days.

module.exports = {
  name: 'staleBuster',
  emoji: '🧹',
  event: 'issues.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.staleBuster) return false;
    const issue = context.payload.issue;
    if (!issue || !issue.closed_at || !issue.created_at) return false;
    const ageDays = (new Date(issue.closed_at) - new Date(issue.created_at)) / 86400e3;
    return ageDays > 30;
  },
  async run(context) {
    const closer = context.payload.sender?.login;
    const issue = context.payload.issue;
    await context.octokit.issues.createComment(context.issue({
      body: `🧹 Stale-buster alert! @${closer} just closed an issue that had been hanging around for ${Math.round((new Date(issue.closed_at) - new Date(issue.created_at)) / 86400e3)} days. Thanks for the cleanup! ✨`,
    }));
  },
};
