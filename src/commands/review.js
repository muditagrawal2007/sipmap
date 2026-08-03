// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /review — ping maintainers with summary (maintainer gated).

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');
const { notifyMaintainers } = require('../maintainers/notify');
const { getRepoConfig } = require('../utils/repoConfig');
const { getCodeowners } = require('../maintainers/codeowners');

module.exports = {
  name: 'review',
  description: 'Ping maintainers',
  requiresMaintainer: true,
  async execute(context) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    const cfg = await getRepoConfig(context);
    const issue = context.payload.issue;
    const summary = `📌 ${issue.pull_request ? 'PR' : 'Issue'} #${issue.number}: **${issue.title}**\nLink: ${issue.html_url}`;
    await notifyMaintainers(context, summary, { config: cfg, handlers: { getCodeowners } });
  },
};
