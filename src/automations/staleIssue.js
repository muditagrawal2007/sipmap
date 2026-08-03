// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Stale issue nudge on issue open (just opened a stale-style issue won't trigger; we use this
// as a hook for issue activity checks on issue reopen).

module.exports = {
  name: 'staleIssue',
  events: ['issues.opened', 'issues.reopened'],
  async run(context, cfg) {
    if (!cfg.stale?.enabled) return;
    const issue = context.payload.issue;
    if (!issue || issue.state !== 'open') return;
    const ageDays = (Date.now() - new Date(issue.created_at)) / 86400e3;
    if (ageDays < (cfg.stale.issueDays || 30)) return;
    const { data: comments } = await context.octokit.issues.listComments({ ...context.repo(), issue_number: issue.number, per_page: 50 });
    const marker = `<!-- sipmap-stale-issue -->`;
    if (comments.some((c) => (c.body || '').includes(marker))) return;
    await context.octokit.issues.createComment(context.issue({
      body: [
        marker,
        `⏰ This issue has been open for ${Math.round(ageDays)} days. Still relevant?`,
        '',
        `@${issue.user?.login}, please confirm the issue is still reproducible, or close it if resolved.`,
      ].join('\n'),
    }));
  },
};
