// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /branch — validate branch name against .sipmap.yml pattern.

const { validateBranchName } = require('../process/branchValidator');
const { getRepoConfig } = require('../utils/repoConfig');

module.exports = {
  name: 'branch',
  description: 'Validate branch name',
  requiresMaintainer: false,
  async execute(context) {
    const cfg = await getRepoConfig(context);
    const number = context.payload.issue?.number;
    if (!number) return;
    let pr;
    try { pr = (await context.octokit.pulls.get({ ...context.repo(), pull_number: number })).data; }
    catch { await context.octokit.issues.createComment(context.issue({ body: '`/branch` only applies to pull requests.' })); return; }

    const r = validateBranchName(pr.head.ref, cfg.processTesting.branchPattern);
    const body = r.ok
      ? `🌿 **Branch name:** ✅ \`${pr.head.ref}\` matches \`${cfg.processTesting.branchPattern || '(no pattern configured)'}\``
      : `🌿 **Branch name:** ❌ \`${pr.head.ref}\` — ${r.reason}`;
    await context.octokit.issues.createComment(context.issue({ body }));
  },
};
