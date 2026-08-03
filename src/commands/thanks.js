// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /thanks @user — manual kudos.

module.exports = {
  name: 'thanks',
  description: 'Manual kudos',
  requiresMaintainer: false,
  async execute(context, args) {
    const user = (args[0] || '').replace(/^@/, '');
    if (!user) {
      await context.octokit.issues.createComment(context.issue({ body: 'Usage: `:sipmap /thanks @username`' }));
      return;
    }
    await context.octokit.issues.createComment(context.issue({ body: `🙏 Thanks @${user} — your contribution is appreciated! 🎉` }));
    try { await context.octokit.reactions.createForIssueComment({ ...context.repo(), comment_id: context.payload.comment.id, content: 'hooray' }); }
    catch (err) { void err; /* reaction is optional */ }
  },
};
