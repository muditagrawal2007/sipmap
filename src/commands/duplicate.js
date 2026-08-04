// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /duplicate <#issue> — close as duplicate of another issue (maintainer only).

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

module.exports = {
  name: 'duplicate',
  description: 'Close as duplicate of #N (maintainer)',
  requiresMaintainer: true,
  async execute(context, args) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    const ref = args[0] || '';
    const m = ref.match(/^#?(\d+)$/);
    if (!m) {
      await context.octokit.issues.createComment(context.issue({ body: 'Usage: `:sipmap /duplicate #123`' }));
      return;
    }
    const number = context.payload.issue.number;
    try {
      await context.octokit.issues.createComment(context.issue({
        body: `🔁 Closing as duplicate of #${m[1]}.`,
      }));
      await context.octokit.issues.update({
        ...context.repo(), issue_number: number, state: 'closed', state_reason: 'not_planned',
      });
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
