// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🌐 Recognition for first PR in a new language (by file extension).

module.exports = {
  name: 'polyglot',
  emoji: '🌐',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.polyglot) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    const author = pr.user?.login;
    if (!author) return false;
    try {
      const files = await context.octokit.paginate(context.octokit.pulls.listFiles, {
        ...context.repo(), pull_number: pr.number, per_page: 100,
      });
      const exts = new Set(files.map((f) => (f.filename.split('.').pop() || '').toLowerCase()).filter((e) => e.length <= 5));
      if (exts.size === 0) return false;
      const firstExt = [...exts][0];
      const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged merged:<${pr.merged_at}`;
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 10 });
      return data.total_count === 0 && new Set([firstExt]).size > 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `🌐 Polyglot @${author}! First merged PR — bringing fresh skills to the table. Variety is the spice of open source. 🌮`,
    }));
  },
};
