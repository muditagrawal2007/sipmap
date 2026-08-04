// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /contributors — top 10 contributors by merged PRs (anyone).

module.exports = {
  name: 'contributors',
  description: 'Top 10 contributors by merged PRs',
  requiresMaintainer: false,
  async execute(context) {
    const { owner, repo } = context.repo();
    try {
      const q = `is:pr repo:${owner}/${repo} is:merged`;
      const { data } = await context.octokit.search.issuesAndPullRequests({
        q, per_page: 100, sort: 'created', order: 'desc',
      });
      const counts = new Map();
      for (const item of data.items) {
        const author = item.user?.login;
        if (!author || author.endsWith('[bot]')) continue;
        counts.set(author, (counts.get(author) || 0) + 1);
      }
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      if (top.length === 0) {
        await context.octokit.issues.createComment(context.issue({ body: 'No merged PRs yet.' }));
        return;
      }
      const rows = top.map(([u, n], i) => `| ${i + 1} | @${u} | ${n} |`);
      const body = [
        '**Top contributors** (last ~100 merged PRs)',
        '',
        '| # | Contributor | Merged PRs |',
        '|---|---|---|',
        ...rows,
      ].join('\n');
      await context.octokit.issues.createComment(context.issue({ body }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
