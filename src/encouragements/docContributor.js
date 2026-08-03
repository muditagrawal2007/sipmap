// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 📚 Recognition for first doc-only PR.

module.exports = {
  name: 'docContributor',
  emoji: '📚',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.docContributor) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    const author = pr.user?.login;
    if (!author) return false;
    // Check files of this PR
    try {
      const files = await context.octokit.paginate(context.octokit.pulls.listFiles, {
        ...context.repo(), pull_number: pr.number, per_page: 100,
      });
      const allDocs = files.length > 0 && files.every((f) => /\.(md|rst|txt)$/i.test(f.filename) || /^docs?\//.test(f.filename) || f.filename === 'README.md');
      if (!allDocs) return false;
      // Check prior doc-only merged PRs
      const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged merged:<${pr.merged_at}`;
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 10 });
      return data.total_count === 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `📚 Thanks @${author} — your first merged docs-only PR! Documentation contributions are often the most under-appreciated, and they make the biggest difference for new users. 🙌`,
    }));
  },
};
