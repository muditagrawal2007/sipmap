// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Auto-close very stale issues (only after explicit maintainer opt-in).

module.exports = {
  name: 'autoClose',
  events: ['issues.opened'], // re-evaluates each time; safe no-op if not stale enough
  async run(context, cfg) {
    if (!cfg.stale?.enabled || !cfg.stale?.autoCloseDays) return;
    const issue = context.payload.issue;
    if (!issue || issue.state !== 'open') return;
    const ageDays = (Date.now() - new Date(issue.created_at)) / 86400e3;
    if (ageDays < cfg.stale.autoCloseDays) return;
    // Only auto-close issues (not PRs); never close without a prior nudge.
    if (issue.pull_request) return;
    const { data: comments } = await context.octokit.issues.listComments({ ...context.repo(), issue_number: issue.number, per_page: 20 });
    const hadNudge = comments.some((c) => (c.body || '').includes('sipmap-stale-issue'));
    if (!hadNudge) return;
    try {
      await context.octokit.issues.update({ ...context.repo(), issue_number: issue.number, state: 'closed', state_reason: 'not_planned' });
      await context.octokit.issues.createComment(context.issue({
        body: `🤖 Auto-closing after ${Math.round(ageDays)} days of inactivity. If this is still relevant, please reopen and add a comment.`,
      }));
    } catch (err) {
      void err; /* auto-close is best-effort */
    }
  },
};
