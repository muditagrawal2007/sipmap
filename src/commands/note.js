// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /note <text> — add a maintainer note (uses a `maintainer-note` label since GitHub has no private comments).

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

module.exports = {
  name: 'note',
  description: 'Add a maintainer note (maintainer)',
  requiresMaintainer: true,
  async execute(context, args) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    const text = args.join(' ').trim();
    if (!text) {
      await context.octokit.issues.createComment(context.issue({ body: 'Usage: `:sipmap /note <text>`' }));
      return;
    }
    const number = context.payload.issue.number;
    try {
      await context.octokit.issues.addLabels({ ...context.repo(), issue_number: number, labels: ['maintainer-note'] });
      await context.octokit.issues.createComment(context.issue({
        body: `📝 Note from @${sender}: ${text}`,
      }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
