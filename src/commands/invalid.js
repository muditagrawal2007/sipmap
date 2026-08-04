// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /invalid [reason] — close as invalid (maintainer only).

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

module.exports = {
  name: 'invalid',
  description: 'Close as invalid (maintainer)',
  requiresMaintainer: true,
  async execute(context, args) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    const number = context.payload.issue.number;
    const reason = args.join(' ') || 'Invalid';
    try {
      await context.octokit.issues.update({
        ...context.repo(), issue_number: number, state: 'closed', state_reason: 'not_planned',
      });
      await context.octokit.issues.createComment(context.issue({
        body: `❌ Invalid: ${reason}`,
      }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
