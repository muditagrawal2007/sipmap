// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🎉 Welcome for first-time PR contributors (no prior merged PRs).

module.exports = {
  name: 'firstTimer',
  emoji: '🎉',
  event: 'pull_request.opened',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.firstTimer) return false;
    const pr = context.payload.pull_request;
    if (!pr || pr.draft) return false;
    const author = pr.user?.login;
    if (!author) return false;
    // Search for any prior merged PR by this author in this repo.
    const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged`;
    try {
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 1 });
      return data.total_count === 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    const body = [
      `🎉 Welcome @${author} — this looks like your first pull request in this repo!`,
      '',
      'A few friendly tips:',
      '- Make sure CI checks pass',
      '- Add tests if you changed source files',
      '- Update docs / CHANGELOG if relevant',
      '- Be patient waiting for review — maintainers are volunteers 💚',
      '',
      'If you get stuck, ask away in the PR comments. Good luck!',
    ].join('\n');
    await context.octokit.issues.createComment(context.issue({ body }));
  },
};
