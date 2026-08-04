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
    if ((comment.body || '').length < 200) return false;
    // Dedup: one thank-you per comment.
    const marker = `<!-- sipmap-helpful-review:${comment.id} -->`;
    const { data: comments } = await context.octokit.issues.listComments({
      ...context.repo(),
      issue_number: context.payload.pull_request.number,
      per_page: 100,
    });
    return !comments.some((c) => (c.body || '').includes(marker));
  },
  async run(context) {
    const reviewer = context.payload.comment.user.login;
    await context.octokit.reactions.createForPullRequestReviewComment({
      ...context.repo(),
      comment_id: context.payload.comment.id,
      content: '100',
    });
    await context.octokit.issues.createComment(context.issue({
      body: `<!-- sipmap-helpful-review:${context.payload.comment.id} -->\n💯 Thanks @${reviewer} for the detailed review comment — this kind of feedback makes open source better for everyone.`,
    }));
  },
};
