// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /draft — convert PR to draft (maintainer only). PRs only.

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

module.exports = {
  name: 'draft',
  description: 'Convert PR to draft (maintainer)',
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
    const number = context.payload.issue.number;
    try {
      await context.octokit.pulls.update({ ...context.repo(), pull_number: number, draft: true });
      await context.octokit.issues.createComment(context.issue({ body: '📝 Converted to draft.' }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
