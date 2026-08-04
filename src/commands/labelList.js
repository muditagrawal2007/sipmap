// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /label-list — list all repo labels (anyone).

module.exports = {
  name: 'label-list',
  description: 'List all repo labels',
  requiresMaintainer: false,
  async execute(context) {
    try {
      const labels = await context.octokit.paginate(context.octokit.issues.listLabelsForRepo, {
        ...context.repo(), per_page: 100,
      });
      if (labels.length === 0) {
        await context.octokit.issues.createComment(context.issue({ body: 'No labels defined in this repo.' }));
        return;
      }
      const rows = labels.map((l) => `| \`${l.name}\` | ${(l.description || '').replace(/\|/g, '\\|')} |`);
      const body = [
        '**Repo labels**',
        '',
        '| Label | Description |',
        '|---|---|',
        ...rows,
      ].join('\n');
      await context.octokit.issues.createComment(context.issue({ body }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
