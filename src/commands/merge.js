// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /merge — auto-merge a PR (maintainer only). PRs only.

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

module.exports = {
  name: 'merge',
  description: 'Merge a PR (maintainer only). PRs only.',
  requiresMaintainer: true,
  async execute(context, args) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    if (!context.payload.issue?.pull_request) {
      await context.octokit.issues.createComment(context.issue({ body: '❌ Use on a PR, not an issue.' }));
      return;
    }
    const method = (args[0] || 'merge').toLowerCase();
    if (!['merge', 'squash', 'rebase'].includes(method)) {
      await context.octokit.issues.createComment(context.issue({ body: 'Usage: `:sipmap /merge [merge|squash|rebase]`' }));
      return;
    }
    const number = context.payload.issue.number;
    try {
      await context.octokit.pulls.merge({
        ...context.repo(),
        pull_number: number,
        merge_method: method,
      });
      await context.octokit.issues.createComment(context.issue({ body: `✅ Merged via ${method}.` }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
