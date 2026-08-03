// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /describe — validate description against template.

const { getTemplate, evaluate } = require('../process/descriptionValidator');
const { getRepoConfig } = require('../utils/repoConfig');

module.exports = {
  name: 'describe',
  description: 'Validate description against template',
  requiresMaintainer: false,
  async execute(context) {
    const cfg = await getRepoConfig(context);
    const issue = context.payload.issue;
    if (!issue) return;
    const kind = issue.pull_request ? 'pr' : 'issue';
    const tpl = await getTemplate(context, kind);
    const verdict = evaluate(issue.body || '', tpl, cfg.description);

    const lines = [
      '📝 **sipmap /describe**',
      '',
      `- Verdict: **${verdict.verdict}**`,
      `- Length: ${verdict.length} chars (min ${cfg.description.minLength})`,
    ];

    if (verdict.sections && verdict.sections.length > 0) {
      lines.push('', '**Sections:**');
      for (const s of verdict.sections) {
        lines.push(`- ${s.filled ? '✅' : '❌'} ${s.heading}${s.required ? ' _(required)_' : ''}`);
      }
    }

    if (verdict.missingRequired.length > 0) {
      lines.push('', `Missing required: ${verdict.missingRequired.map((m) => `\`${m}\``).join(', ')}`);
    }

    if (!verdict.ok) {
      lines.push('', '_Edit the description to add the missing pieces and I\'ll re-check on the next comment._');
    } else {
      lines.push('', '_Looks great! 🎉_');
    }

    await context.octokit.issues.createComment(context.issue({ body: lines.join('\n') }));

    if (verdict.ok) {
      try { await context.octokit.reactions.createForIssueComment({ ...context.repo(), comment_id: context.payload.comment.id, content: '+1' }); }
      catch (err) { void err; /* reaction is optional */ }
    } else {
      try { await context.octokit.reactions.createForIssueComment({ ...context.repo(), comment_id: context.payload.comment.id, content: 'eyes' }); }
      catch (err) { void err; /* reaction is optional */ }
    }
  },
};
