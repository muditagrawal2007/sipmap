// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Conflict detection — post a heads-up when PR has conflicts.

module.exports = {
  name: 'conflictDetect',
  events: ['pull_request.synchronize'],
  async run(context) {
    const pr = context.payload.pull_request;
    if (!pr) return;
    try {
      const { data } = await context.octokit.pulls.get({ ...context.repo(), pull_number: pr.number });
      if (data.mergeable_state === 'dirty') {
        await context.octokit.issues.createComment(context.issue({
          body: '⚠️ This PR has merge conflicts. Please resolve them before requesting review.',
        }));
      }
    } catch (err) {
      void err; /* GitHub may report unknown mergeable state; safe to skip */
    }
  },
};
