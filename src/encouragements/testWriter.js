// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🧪 Recognition for first PR that adds tests.

module.exports = {
  name: 'testWriter',
  emoji: '🧪',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.testWriter) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    const author = pr.user?.login;
    if (!author) return false;
    try {
      const files = await context.octokit.paginate(context.octokit.pulls.listFiles, {
        ...context.repo(), pull_number: pr.number, per_page: 100,
      });
      const addsTests = files.some((f) =>
        /\.(test|spec)\.[a-z]+$/i.test(f.filename) ||
        /__tests__\//.test(f.filename) ||
        /^tests?\//i.test(f.filename)
      );
      if (!addsTests) return false;
      const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged merged:<${pr.merged_at}`;
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 10 });
      return data.total_count === 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `🧪 Thank you @${author} — your first merged PR adding tests! Tests are the safety net that lets everyone move faster. 🛡️`,
    }));
  },
};
