// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /cleanup-stale — close stale issues with no activity for 60+ days (maintainer only).

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

const DAYS = 60;

module.exports = {
  name: 'cleanup-stale',
  description: 'Close stale issues (>60d no activity, maintainer)',
  requiresMaintainer: true,
  async execute(context) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    if (context.payload.issue?.pull_request) {
      await context.octokit.issues.createComment(context.issue({ body: '❌ Use on an issue, not a PR.' }));
      return;
    }
    const { owner, repo } = context.repo();
    try {
      const issues = await context.octokit.paginate(context.octokit.issues.listForRepo, {
        ...context.repo(), state: 'open', per_page: 100,
      });
      const cutoff = Date.now() - DAYS * 24 * 60 * 60 * 1000;
      let closed = 0;
      for (const iss of issues) {
        if (iss.pull_request) continue;
        const updated = new Date(iss.updated_at).getTime();
        if (updated < cutoff) {
          try {
            await context.octokit.issues.createComment({
              ...context.repo(), issue_number: iss.number,
              body: `🧹 Closing due to ${DAYS}+ days of inactivity. Comment here to reopen.`,
            });
            await context.octokit.issues.update({
              ...context.repo(), issue_number: iss.number, state: 'closed', state_reason: 'not_planned',
            });
            closed += 1;
          } catch { void 0; /* skip individual failures */ }
        }
      }
      await context.octokit.pulls.create
        ? null
        : null;
      await context.octokit.issues.createComment(context.issue({
        body: `✅ Cleanup complete: ${closed} stale issue(s) closed in ${owner}/${repo}.`,
      }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
