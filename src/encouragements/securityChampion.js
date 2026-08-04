// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 🔒 Recognition for first security-related PR.

module.exports = {
  name: 'securityChampion',
  emoji: '🔒',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.securityChampion) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    const author = pr.user?.login;
    if (!author) return false;
    const txt = `${pr.title || ''} ${pr.body || ''}`.toLowerCase();
    if (!/(security|cve-|vuln|exploit|xss|csrf|injection|harden)/i.test(txt)) return false;
    try {
      const q = `is:pr author:${author} repo:${context.repo().owner}/${context.repo().repo} is:merged merged:<${pr.merged_at}`;
      const { data } = await context.octokit.search.issuesAndPullRequests({ q, per_page: 10 });
      return data.total_count === 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `🔒 Security champion @${author} — first merged security PR! These are the changes that protect every user. 🛡️`,
    }));
  },
};
