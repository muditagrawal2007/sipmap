// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /title — validate PR/issue title.

const { validateTitle } = require('../process/titleValidator');
const { getRepoConfig } = require('../utils/repoConfig');

module.exports = {
  name: 'title',
  description: 'Validate title',
  requiresMaintainer: false,
  async execute(context) {
    const cfg = await getRepoConfig(context);
    const issue = context.payload.issue;
    if (!issue) return;
    const r = validateTitle(issue.title, { maxLength: cfg.processTesting.titleMaxLength });
    const body = r.ok
      ? `🏷️ **Title:** ✅ \`${issue.title}\` (${issue.title.length} chars)`
      : `🏷️ **Title:** ❌ ${r.reason}`;
    await context.octokit.issues.createComment(context.issue({ body }));
  },
};
