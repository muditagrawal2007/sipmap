// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// ⭐ Top reviewer: weekly callout (not auto-posted; reacts to engagement).

module.exports = {
  name: 'topReviewer',
  emoji: '⭐',
  event: 'pull_request_review.submitted',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.topReviewer) return false;
    const review = context.payload.review;
    if (!review || review.state !== 'commented') return false;
    const reviewer = review.user?.login;
    if (!reviewer) return false;
    // Only react if the comment body is substantive (>200 chars).
    return (review.body || '').length >= 200;
  },
  async run(context) {
    const reviewer = context.payload.review.user.login;
    try {
      await context.octokit.reactions.createForPullRequestReview({
        ...context.repo(),
        pull_number: context.payload.pull_request.number,
        review_id: context.payload.review.id,
        content: '100',
      });
    } catch (err) {
      void err; /* reaction may fail; comment below is the main signal */
    }
    await context.octokit.issues.createComment(context.issue({
      body: `⭐ Thanks @${reviewer} for the substantive review — feedback like this is gold. 💯`,
    }));
  },
};
