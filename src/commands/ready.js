// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /ready — mark PR ready for review (maintainer only). PRs only.

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

module.exports = {
  name: 'ready',
  description: 'Mark PR ready for review (maintainer)',
  requiresMaintainer: true,
  async execute(context) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    if (!context.payload.issue?.pull_request) {
      await context.octokit.issues.createComment(context.issue({ body: '❌ Use on a PR.' }));
      return;
    }
    try {
      await context.octokit.issues.createComment(context.issue({ body: `🚦 @${sender} marked this PR as ready for review` }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
