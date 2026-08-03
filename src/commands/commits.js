// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /commits — validate commit messages against pattern.

const { validateCommits } = require('../process/commitValidator');
const { getRepoConfig } = require('../utils/repoConfig');

module.exports = {
  name: 'commits',
  description: 'Validate commit messages',
  requiresMaintainer: false,
  async execute(context) {
    const cfg = await getRepoConfig(context);
    const number = context.payload.issue?.number;
    if (!number) return;
    try {
      await context.octokit.pulls.get({ ...context.repo(), pull_number: number });
    } catch {
      await context.octokit.issues.createComment(context.issue({ body: '`/commits` only applies to pull requests.' }));
      return;
    }

    const commits = [];
    const iter = context.octokit.paginate.iterator(context.octokit.pulls.listCommits, { ...context.repo(), pull_number: number, per_page: 100 });
    for await (const { data } of iter) commits.push(...data);

    const r = validateCommits(commits, cfg.processTesting.commitPattern);
    if (r.error) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${r.error}` }));
      return;
    }
    if (r.invalid.length === 0) {
      await context.octokit.issues.createComment(context.issue({ body: `📜 **Commits:** ✅ all ${r.total} message(s) match \`${cfg.processTesting.commitPattern || '(no pattern configured)'}\`` }));
      return;
    }
    const lines = [`📜 **Commits:** ⚠️ ${r.invalid.length}/${r.total} don't match pattern`, ''];
    for (const m of r.invalid.slice(0, 10)) lines.push(`- \`${m}\``);
    if (r.invalid.length > 10) lines.push(`- …and ${r.invalid.length - 10} more`);
    await context.octokit.issues.createComment(context.issue({ body: lines.join('\n') }));
  },
};
