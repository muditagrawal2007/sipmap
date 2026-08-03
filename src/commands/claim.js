// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /claim — self-assign an issue.

module.exports = {
  name: 'claim',
  description: 'Self-assign this issue',
  requiresMaintainer: false,
  async execute(context) {
    const user = context.payload.sender?.login;
    const number = context.payload.issue?.number;
    try {
      await context.octokit.issues.addAssignees({ ...context.repo(), issue_number: number, assignees: [user] });
      await context.octokit.issues.createComment(context.issue({ body: `🙋 @${user} claimed this. Have at it!` }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ Couldn't claim: ${err.message}` }));
    }
  },
};
