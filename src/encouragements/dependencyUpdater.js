// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 📦 Recognition for first dependency-bump PR.

module.exports = {
  name: 'dependencyUpdater',
  emoji: '📦',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.dependencyUpdater) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    const author = pr.user?.login;
    if (!author) return false;
    const DEP_FILES = [
      'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
      'requirements.txt', 'Pipfile', 'Pipfile.lock', 'pyproject.toml',
      'Gemfile', 'Gemfile.lock', 'go.mod', 'go.sum', 'Cargo.toml', 'Cargo.lock',
    ];
    try {
      const files = await context.octokit.paginate(context.octokit.pulls.listFiles, {
        ...context.repo(), pull_number: pr.number, per_page: 100,
      });
      const bumps = files.some((f) => DEP_FILES.includes(f.filename));
      if (!bumps) return false;
      const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged merged:<${pr.merged_at}`;
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 10 });
      return data.total_count === 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `📦 Thanks @${author} — first merged dependency bump! Keeping deps fresh is critical for security and stability. You're a maintainer's hero. 🛠️`,
    }));
  },
};
