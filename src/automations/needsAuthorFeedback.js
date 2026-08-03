// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Label `needs-author-feedback` when a maintainer asks for changes.

module.exports = {
  name: 'needsAuthorFeedback',
  events: ['pull_request_review.submitted'],
  async run(context) {
    const review = context.payload.review;
    if (!review || review.state !== 'changes_requested') return;
    try {
      await context.octokit.issues.addLabels({
        ...context.repo(),
        issue_number: context.payload.pull_request.number,
        labels: ['needs-author-feedback'],
      });
    } catch (err) {
      void err; /* label may already exist */
    }
  },
};
