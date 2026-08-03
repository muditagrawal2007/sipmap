// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /secrets — heuristic secret scan on PR diff.

const { scan } = require('../process/secretScan');

module.exports = {
  name: 'secrets',
  description: 'Heuristic secret scan',
  requiresMaintainer: false,
  async execute(context) {
    const number = context.payload.issue?.number;
    if (!number) return;
    try {
      await context.octokit.pulls.get({ ...context.repo(), pull_number: number });
    } catch {
      await context.octokit.issues.createComment(context.issue({ body: '`/secrets` only applies to pull requests.' }));
      return;
    }

    const files = [];
    const iter = context.octokit.paginate.iterator(context.octokit.pulls.listFiles, { ...context.repo(), pull_number: number, per_page: 100 });
    for await (const { data } of iter) files.push(...data);
    const diff = files.map((f) => f.patch || '').join('\n');
    const r = scan(diff);

    if (r.hits.length === 0) {
      await context.octokit.issues.createComment(context.issue({ body: '🔐 **Secret scan:** ✅ no common secret patterns detected.' }));
      return;
    }
    const lines = ['🔐 **Secret scan:** ⚠️ suspect patterns found', ''];
    for (const h of r.hits) {
      lines.push(`- \`${h.name}\` (${h.count || 1} match${h.count > 1 ? 'es' : ''})`);
    }
    lines.push('', '_If any of these are real secrets, please **rotate them immediately** and remove from the diff._');
    await context.octokit.issues.createComment(context.issue({ body: lines.join('\n') }));
  },
};
