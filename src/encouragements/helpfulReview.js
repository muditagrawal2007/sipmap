// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 💯 Helpful review thanks.

module.exports = {
  name: 'helpfulReview',
  emoji: '💯',
  event: 'pull_request_review_comment.created',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.helpfulReview) return false;
    const comment = context.payload.comment;
    if (!comment) return false;
    return (comment.body || '').length >= 200;
  },
  async run(context) {
    const reviewer = context.payload.comment.user.login;
    try {
      await context.octokit.reactions.createForPullRequestReviewComment({
        ...context.repo(),
        comment_id: context.payload.comment.id,
        content: '100',
      });
    } catch (err) {
      void err; /* reaction may fail; comment below is the main signal */
    }
    await context.octokit.issues.createComment(context.issue({
      body: `💯 Thanks @${reviewer} for the detailed review comment — this kind of feedback makes open source better for everyone.`,
    }));
  },
};
