// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /assign @user — assign a reviewer (maintainer only).

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

module.exports = {
  name: 'assign',
  description: 'Assign a reviewer',
  requiresMaintainer: true,
  async execute(context, args) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    const user = (args[0] || '').replace(/^@/, '');
    if (!user) {
      await context.octokit.issues.createComment(context.issue({ body: 'Usage: `:sipmap /assign @username`' }));
      return;
    }
    const number = context.payload.issue?.number;
    try {
      await context.octokit.issues.addAssignees({ ...context.repo(), issue_number: number, assignees: [user] });
      await context.octokit.issues.createComment(context.issue({ body: `✅ Assigned @${user}.` }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ Failed to assign: ${err.message}` }));
    }
  },
};
