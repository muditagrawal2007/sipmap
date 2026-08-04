// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /wontfix [reason] — close as "won't fix" (maintainer only).

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

module.exports = {
  name: 'wontfix',
  description: 'Close as won\'t fix (maintainer)',
  requiresMaintainer: true,
  async execute(context, args) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    const number = context.payload.issue.number;
    const reason = args.join(' ') || 'Won\'t fix';
    try {
      await context.octokit.issues.update({
        ...context.repo(), issue_number: number, state: 'closed', state_reason: 'not_planned',
      });
      await context.octokit.issues.createComment(context.issue({
        body: `🚫 Won't fix: ${reason}`,
      }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
