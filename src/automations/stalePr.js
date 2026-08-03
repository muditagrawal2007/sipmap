// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Stale PR nudge — fires on schedule-ish (here: on each push/sync) if too old.

module.exports = {
  name: 'stalePr',
  events: ['pull_request.synchronize'],
  async run(context, cfg) {
    if (!cfg.stale?.enabled) return;
    const pr = context.payload.pull_request;
    if (!pr || pr.state !== 'open') return;
    const ageDays = (Date.now() - new Date(pr.updated_at)) / 86400e3;
    if (ageDays < (cfg.stale.prDays || 14)) return;
    // Don't double-post: check for a sipmap marker in the comments.
    const { data: comments } = await context.octokit.issues.listComments({ ...context.repo(), issue_number: pr.number, per_page: 50 });
    const marker = `<!-- sipmap-stale-pr -->`;
    if (comments.some((c) => (c.body || '').includes(marker))) return;
    await context.octokit.issues.createComment(context.issue({
      body: [
        marker,
        `⏰ This PR has been idle for ${Math.round(ageDays)} days.`,
        '',
        `@${pr.user?.login}, anything blocking? Maintainers, please review when possible.`,
      ].join('\n'),
    }));
  },
};
