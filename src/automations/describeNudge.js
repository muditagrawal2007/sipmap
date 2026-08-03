// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Auto-nudge on empty description for newly opened issues/PRs.

const { getTemplate, evaluate } = require('../process/descriptionValidator');

module.exports = {
  name: 'describeNudge',
  events: ['issues.opened', 'pull_request.opened'],
  async run(context, cfg) {
    if (!cfg.description?.enabled || !cfg.description?.autoNudgeOnEmpty) return;
    const issue = context.payload.issue || context.payload.pull_request;
    if (!issue) return;
    const kind = issue.pull_request ? 'pr' : 'issue';
    const tpl = await getTemplate(context, kind);
    const verdict = evaluate(issue.body || '', tpl, cfg.description);
    if (verdict.ok) return;
    const lines = [
      '👋 Hi! I noticed the description is missing some pieces:',
      '',
      verdict.empty ? '- The description is empty.' : `- Length: ${verdict.length} chars (recommended ≥ ${cfg.description.minLength}).`,
    ];
    if (verdict.missingRequired.length > 0) {
      lines.push('', '**Missing required sections:**');
      for (const m of verdict.missingRequired) lines.push(`- ${m}`);
    }
    lines.push('', 'Filling these in will speed up review and reduce back-and-forth. 🙏');
    await context.octokit.issues.createComment(context.issue({ body: lines.join('\n') }));
  },
};
