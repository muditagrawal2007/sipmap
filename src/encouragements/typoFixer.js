// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// ✏️ Recognition for first typo-fix PR.

module.exports = {
  name: 'typoFixer',
  emoji: '✏️',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.typoFixer) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    const author = pr.user?.login;
    if (!author) return false;
    try {
      const files = await context.octokit.paginate(context.octokit.pulls.listFiles, {
        ...context.repo(), pull_number: pr.number, per_page: 100,
      });
      const tiny = files.length > 0 && files.length <= 5
        && files.reduce((sum, f) => sum + (f.additions || 0) + (f.deletions || 0), 0) <= 20;
      const docOnly = files.every((f) =>
        /\.(md|rst|txt)$/i.test(f.filename) || /^docs?\//i.test(f.filename) || f.filename === 'README.md'
      );
      if (!(tiny || docOnly)) return false;
      const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged merged:<${pr.merged_at}`;
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 10 });
      return data.total_count === 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `✏️ Thanks @${author} for squashing those typos! Small fixes are the gating factor for polished docs — much appreciated. 👓`,
    }));
  },
};
