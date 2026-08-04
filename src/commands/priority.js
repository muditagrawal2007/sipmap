// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /priority <low|med|high> — apply priority label (maintainer only).

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

module.exports = {
  name: 'priority',
  description: 'Set priority label (maintainer)',
  requiresMaintainer: true,
  async execute(context, args) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    const raw = (args[0] || '').toLowerCase();
    const map = { low: 'priority: low', med: 'priority: medium', medium: 'priority: medium', high: 'priority: high' };
    const label = map[raw];
    if (!label) {
      await context.octokit.issues.createComment(context.issue({
        body: 'Usage: `:sipmap /priority low|med|high`',
      }));
      return;
    }
    const number = context.payload.issue.number;
    try {
      await context.octokit.issues.addLabels({ ...context.repo(), issue_number: number, labels: [label] });
      await context.octokit.issues.createComment(context.issue({ body: `✅ Priority set: ${label}` }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
