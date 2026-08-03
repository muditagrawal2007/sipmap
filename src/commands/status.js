// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /status — summarize CI check-runs.

async function fetchChecks(context, sha) {
  try {
    const { data } = await context.octokit.checks.listForRef({
      ...context.repo(),
      ref: sha,
      per_page: 100,
    });
    return data.check_runs || [];
  } catch { return []; }
}

module.exports = {
  name: 'status',
  description: 'Summarize CI check-runs',
  requiresMaintainer: false,
  async execute(context) {
    const number = context.payload.issue?.number;
    if (!number) return;
    let pr;
    try { pr = (await context.octokit.pulls.get({ ...context.repo(), pull_number: number })).data; }
    catch { await context.octokit.issues.createComment(context.issue({ body: '`/status` only applies to pull requests.' })); return; }

    const checks = await fetchChecks(context, pr.head.sha);
    if (checks.length === 0) {
      await context.octokit.issues.createComment(context.issue({ body: 'No CI checks found yet for this PR.' }));
      return;
    }
    const lines = ['🟢 **CI status**', ''];
    for (const c of checks) {
      const icon = c.conclusion === 'success' ? '✅' : c.conclusion === 'failure' ? '❌' : c.conclusion === 'neutral' ? '⚪' : '🟡';
      lines.push(`${icon} **${c.name}** — ${c.conclusion || c.status} _(${c.app?.name || 'check'})_`);
    }
    const failed = checks.filter((c) => c.conclusion === 'failure').length;
    lines.push('', failed === 0 ? '_All green so far! 🎉_' : `_${failed} failing check(s). See details above._`);
    await context.octokit.issues.createComment(context.issue({ body: lines.join('\n') }));
  },
};
