// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /unclaim — release self-assignment.

module.exports = {
  name: 'unclaim',
  description: 'Release this issue',
  requiresMaintainer: false,
  async execute(context) {
    const user = context.payload.sender?.login;
    const number = context.payload.issue?.number;
    try {
      await context.octokit.issues.removeAssignees({ ...context.repo(), issue_number: number, assignees: [user] });
      await context.octokit.issues.createComment(context.issue({ body: `👋 @${user} released this. Up for grabs!` }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ Couldn't release: ${err.message}` }));
    }
  },
};
