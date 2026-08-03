// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Draft suggestion — large PRs that aren't draft get a friendly nudge.

module.exports = {
  name: 'draftSuggest',
  events: ['pull_request.opened', 'pull_request.ready_for_review'],
  async run(context) {
    const pr = context.payload.pull_request;
    if (!pr || pr.draft) return;
    let files = [];
    try {
      files = await context.octokit.paginate(context.octokit.pulls.listFiles, {
        ...context.repo(), pull_number: pr.number, per_page: 100,
      });
    } catch { return; }
    if (files.length < 20) return;
    await context.octokit.issues.createComment(context.issue({
      body: `💡 Heads up — this PR touches ${files.length} files. Consider marking it as a **draft** until CI is green and you're ready for review. That helps reviewers focus on finished work first.`,
    }));
  },
};
