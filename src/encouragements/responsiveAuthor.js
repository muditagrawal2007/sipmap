// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// 💬 Recognition for first PR whose author responded to a review comment.

module.exports = {
  name: 'responsiveAuthor',
  emoji: '💬',
  event: 'pull_request.closed',
  async shouldRun(context, cfg) {
    if (!cfg.encouragement?.enabled || !cfg.encouragement?.responsiveAuthor) return false;
    const pr = context.payload.pull_request;
    if (!pr?.merged) return false;
    const author = pr.user?.login;
    if (!author) return false;
    try {
      const comments = await context.octokit.paginate(context.octokit.issues.listComments, {
        ...context.repo(), issue_number: pr.number, per_page: 100,
      });
      // A reviewer asked something (a question mark) and the author replied.
      const reviewerQuestions = comments.filter((c) =>
        c.user?.login !== author && c.user?.type !== 'Bot' && /\?/.test(c.body || '')
      );
      if (reviewerQuestions.length === 0) return false;
      const authorReplies = comments.filter((c) => c.user?.login === author);
      return authorReplies.length > 0;
    } catch { return false; }
  },
  async run(context) {
    const author = context.payload.pull_request.user.login;
    await context.octokit.issues.createComment(context.issue({
      body: `💬 Great collaboration @${author} — you responded to review feedback on this PR. That back-and-forth is what makes open source magical. 🤝`,
    }));
  },
};
