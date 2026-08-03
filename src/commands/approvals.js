// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /approvals — show approval status of a PR.

module.exports = {
  name: 'approvals',
  description: 'Show PR approval status',
  requiresMaintainer: false,
  async execute(context) {
    const number = context.payload.issue?.number;
    if (!number) return;
    let pr;
    try { pr = (await context.octokit.pulls.get({ ...context.repo(), pull_number: number })).data; }
    catch { await context.octokit.issues.createComment(context.issue({ body: '`/approvals` only applies to pull requests.' })); return; }

    const reviews = [];
    const iter = context.octokit.paginate.iterator(context.octokit.pulls.listReviews, { ...context.repo(), pull_number: number, per_page: 100 });
    for await (const { data } of iter) reviews.push(...data);

    const approved = reviews.filter((r) => r.state === 'APPROVED');
    const changesRequested = reviews.filter((r) => r.state === 'CHANGES_REQUESTED');
    const commented = reviews.filter((r) => r.state === 'COMMENTED');

    const lines = [
      '👀 **Approval status**',
      '',
      `- ✅ Approved: ${approved.length}`,
      `- ❌ Changes requested: ${changesRequested.length}`,
      `- 💬 Comments only: ${commented.length}`,
      `- Mergeable: ${pr.mergeable ? '✅' : pr.mergeable === false ? '❌' : '⚠️ unknown'}`,
      `- Draft: ${pr.draft ? 'yes' : 'no'}`,
    ];
    if (changesRequested.length > 0) {
      lines.push('', '**Changes requested by:**');
      for (const r of changesRequested) lines.push(`- @${r.user?.login}`);
    }
    await context.octokit.issues.createComment(context.issue({ body: lines.join('\n') }));
  },
};
