// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Conflict detection — post a heads-up when PR has conflicts.

module.exports = {
  name: 'conflictDetect',
  events: ['pull_request.synchronize'],
  async run(context) {
    const pr = context.payload.pull_request;
    if (!pr) return;
    const { data } = await context.octokit.pulls.get({ ...context.repo(), pull_number: pr.number });
    if (data.mergeable_state !== 'dirty') return;
    const { data: comments } = await context.octokit.issues.listComments({
      ...context.repo(),
      issue_number: pr.number,
      per_page: 50,
    });
    const recentMarker = comments.some((c) => (c.body || '').includes('<!-- sipmap-conflict-detect:'));
    if (recentMarker) return;
    const marker = `<!-- sipmap-conflict-detect:${pr.head.sha.slice(0, 7)} -->`;
    await context.octokit.issues.createComment(context.issue({
      body: `${marker}\n⚠️ This PR has merge conflicts. Please resolve them before requesting review.`,
    }));
  },
};
