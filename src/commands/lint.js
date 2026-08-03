// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /lint — lightweight checks (template, conflict markers, secrets, large files).

const { scan: conflictScan } = require('../process/conflictScan');
const { scan: secretScan } = require('../process/secretScan');
const { scan: fileSizeScan } = require('../process/fileSizeScan');

module.exports = {
  name: 'lint',
  description: 'Lightweight PR checks',
  requiresMaintainer: false,
  async execute(context) {
    const number = context.payload.issue?.number;
    if (!number) return;
    try {
      await context.octokit.pulls.get({ ...context.repo(), pull_number: number });
    } catch {
      await context.octokit.issues.createComment(context.issue({ body: '`/lint` only applies to pull requests.' }));
      return;
    }

    const files = [];
    const iter = context.octokit.paginate.iterator(context.octokit.pulls.listFiles, { ...context.repo(), pull_number: number, per_page: 100 });
    for await (const { data } of iter) files.push(...data);

    const diff = files.map((f) => f.patch || '').join('\n');
    const conflicts = conflictScan(diff);
    const secrets = secretScan(diff);
    const large = fileSizeScan(files);

    const lines = ['🔍 **sipmap /lint**', ''];
    lines.push(`- Conflict markers: ${conflicts.hasConflicts ? '❌ found' : '✅ none'}`);
    lines.push(`- Secret patterns: ${secrets.hits.length === 0 ? '✅ none' : `❌ ${secrets.hits.length} suspect`}`);
    lines.push(`- Large files (>500KB): ${large.large.length === 0 ? '✅ none' : `⚠️ ${large.large.length}`}`);
    await context.octokit.issues.createComment(context.issue({ body: lines.join('\n') }));
  },
};
