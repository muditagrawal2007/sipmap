// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /tests — check if test files were modified when source files changed.

module.exports = {
  name: 'tests',
  description: 'Check tests updated for source changes',
  requiresMaintainer: false,
  async execute(context) {
    const number = context.payload.issue?.number;
    if (!number) return;
    try {
      await context.octokit.pulls.get({ ...context.repo(), pull_number: number });
    } catch {
      await context.octokit.issues.createComment(context.issue({ body: '`/tests` only applies to pull requests.' }));
      return;
    }

    const files = [];
    const iter = context.octokit.paginate.iterator(context.octokit.pulls.listFiles, { ...context.repo(), pull_number: number, per_page: 100 });
    for await (const { data } of iter) files.push(...data);

    const sourceChanged = files.some((f) => /^(src|lib)\//.test(f.filename) && !/test/i.test(f.filename));
    const testsChanged = files.some((f) => /test|spec/i.test(f.filename) || /^__tests__\//.test(f.filename));

    if (!sourceChanged) {
      await context.octokit.issues.createComment(context.issue({ body: '🧪 **Tests check:** ✅ no src/lib code changed.' }));
      return;
    }
    if (testsChanged) {
      await context.octokit.issues.createComment(context.issue({ body: '🧪 **Tests check:** ✅ test files included in this PR.' }));
      return;
    }
    await context.octokit.issues.createComment(context.issue({ body: '🧪 **Tests check:** ⚠️ source changed but no tests updated. Consider adding test coverage.' }));
  },
};
