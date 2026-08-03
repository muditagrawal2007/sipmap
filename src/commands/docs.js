// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /docs — check if docs were updated when code in src/ changed.

module.exports = {
  name: 'docs',
  description: 'Check docs updated for code changes',
  requiresMaintainer: false,
  async execute(context) {
    const number = context.payload.issue?.number;
    if (!number) return;
    try {
      await context.octokit.pulls.get({ ...context.repo(), pull_number: number });
    } catch {
      await context.octokit.issues.createComment(context.issue({ body: '`/docs` only applies to pull requests.' }));
      return;
    }

    const files = [];
    const iter = context.octokit.paginate.iterator(context.octokit.pulls.listFiles, { ...context.repo(), pull_number: number, per_page: 100 });
    for await (const { data } of iter) files.push(...data);

    const codeChanged = files.some((f) => /^(src|lib|app|pkg)\//.test(f.filename));
    const docsChanged = files.some((f) => /\.(md|rst|txt)$/i.test(f.filename) || /^docs?\//.test(f.filename) || f.filename === 'README.md');

    if (!codeChanged) {
      await context.octokit.issues.createComment(context.issue({ body: '📚 **Docs check:** ✅ no code in src/lib/app/pkg changed.' }));
      return;
    }
    if (docsChanged) {
      await context.octokit.issues.createComment(context.issue({ body: '📚 **Docs check:** ✅ docs included in this PR.' }));
      return;
    }
    await context.octokit.issues.createComment(context.issue({ body: '📚 **Docs check:** ⚠️ code changed but no docs updated. Consider adding a note to README or `docs/`.' }));
  },
};
