// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /size — flag oversized PRs.

module.exports = {
  name: 'size',
  description: 'Flag oversized PRs',
  requiresMaintainer: false,
  async execute(context) {
    const number = context.payload.issue?.number;
    if (!number) return;
    try {
      await context.octokit.pulls.get({ ...context.repo(), pull_number: number });
    } catch {
      await context.octokit.issues.createComment(context.issue({ body: '`/size` only applies to pull requests.' }));
      return;
    }

    const files = [];
    const iter = context.octokit.paginate.iterator(context.octokit.pulls.listFiles, { ...context.repo(), pull_number: number, per_page: 100 });
    for await (const { data } of iter) files.push(...data);
    const total = files.reduce((acc, f) => acc + (f.additions || 0) + (f.deletions || 0), 0);

    let label = 'XS';
    if (total > 50) label = 'S';
    if (total > 200) label = 'M';
    if (total > 400) label = 'L';
    if (total > 1000) label = 'XL';

    await context.octokit.issues.createComment(context.issue({
      body: `📏 **PR size: \`${label}\`** — ${total} lines changed across ${files.length} file(s).${label === 'L' || label === 'XL' ? '\n\n💡 _Consider splitting this into smaller PRs to speed up review._' : ''}`,
    }));
  },
};
