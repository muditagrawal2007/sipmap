// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Apply `ready-for-review` when a draft becomes ready and CI is green.

module.exports = {
  name: 'readyForReview',
  events: ['pull_request.ready_for_review', 'check_run.completed'],
  async run(context) {
    const pr = context.payload.pull_request;
    if (!pr || pr.draft) return;
    // Only label if all check-runs pass.
    const { data } = await context.octokit.checks.listForRef({ ...context.repo(), ref: pr.head.sha, per_page: 100 });
    const checks = data.check_runs || [];
    if (checks.length === 0) return;
    if (!checks.every((c) => c.conclusion === 'success' || c.conclusion === 'neutral' || c.conclusion === 'skipped')) return;
    // Skip if label already present — avoid wasting API calls on every check_run.
    const { data: issue } = await context.octokit.issues.get({ ...context.repo(), issue_number: pr.number });
    const has = (issue.labels || []).some((l) => (typeof l === 'string' ? l : l.name) === 'ready-for-review');
    if (has) return;
    await context.octokit.issues.addLabels({ ...context.repo(), issue_number: pr.number, labels: ['ready-for-review'] });
  },
};
