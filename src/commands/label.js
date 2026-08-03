// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Maintainer-only label commands.

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

function make(labelAction) {
  return {
    name: labelAction,
    description: `${labelAction} labels (maintainer)`,
    requiresMaintainer: true,
    async execute(context, args) {
      const sender = context.payload.sender?.login;
      if (!(await isMaintainer(context, sender))) {
        await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
        return;
      }
      const labels = args.filter((a) => a && !a.startsWith('@'));
      if (labels.length === 0) {
        await context.octokit.issues.createComment(context.issue({ body: `Usage: \`:sipmap /${labelAction} label1 label2\`` }));
        return;
      }
      const number = context.payload.issue?.number;
      try {
        if (labelAction === 'label') {
          await context.octokit.issues.addLabels({ ...context.repo(), issue_number: number, labels });
        } else         if (labelAction === 'unlabel') {
          await context.octokit.issues.removeLabel({ ...context.repo(), issue_number: number, name: labels[0] });
          for (let i = 1; i < labels.length; i++) {
            try { await context.octokit.issues.removeLabel({ ...context.repo(), issue_number: number, name: labels[i] }); }
            catch (err) { void err; /* some labels may not exist */ }
          }
        } else if (labelAction === 'good-first-issue') {
          await context.octokit.issues.addLabels({ ...context.repo(), issue_number: number, labels: ['good first issue'] });
        } else if (labelAction === 'help-wanted') {
          await context.octokit.issues.addLabels({ ...context.repo(), issue_number: number, labels: ['help wanted'] });
        }
        await context.octokit.issues.createComment(context.issue({ body: `✅ ${labelAction} applied.` }));
      } catch (err) {
        await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
      }
    },
  };
}

module.exports = {
  label: make('label'),
  unlabel: make('unlabel'),
  goodFirstIssue: make('good-first-issue'),
  helpWanted: make('help-wanted'),
};
