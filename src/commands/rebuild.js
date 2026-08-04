// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /rebuild — re-run failed CI checks on a PR (maintainer only). PRs only.

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

module.exports = {
  name: 'rebuild',
  description: 'Re-run failed CI checks (maintainer)',
  requiresMaintainer: true,
  async execute(context) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    if (!context.payload.issue?.pull_request) {
      await context.octokit.issues.createComment(context.issue({ body: '❌ Use on a PR.' }));
      return;
    }
    try {
      const runs = await context.octokit.paginate(context.octokit.checks.listForRef, {
        ...context.repo(), ref: context.payload.issue.pull_request?.head?.sha, per_page: 100,
      });
      const failed = runs.filter((r) => r.conclusion === 'failure' || r.conclusion === 'timed_out' || r.conclusion === 'cancelled');
      if (failed.length === 0) {
        await context.octokit.issues.createComment(context.issue({ body: 'Nothing failed to re-run.' }));
        return;
      }
      let n = 0;
      for (const r of failed) {
        try {
          await context.octokit.checks.rerequest({ ...context.repo(), check_run_id: r.id });
          n += 1;
        } catch { void 0; /* some checks don't support rerequest */ }
      }
      await context.octokit.issues.createComment(context.issue({
        body: `🔁 Re-requested ${n}/${failed.length} failed check(s).`,
      }));
    } catch (err) {
      await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
    }
  },
};
