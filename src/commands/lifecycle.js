// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Maintainer-only close / reopen / lock / pin.

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');

function make(action) {
  return {
    name: action,
    description: `${action} (maintainer)`,
    requiresMaintainer: true,
    async execute(context, args) {
      const sender = context.payload.sender?.login;
      if (!(await isMaintainer(context, sender))) {
        await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
        return;
      }
      const number = context.payload.issue?.number;
      const reason = args.join(' ') || (action === 'close' ? 'Closed via sipmap' : `${action} via sipmap`);
      try {
        if (action === 'close') {
          await context.octokit.issues.update({ ...context.repo(), issue_number: number, state: 'closed', state_reason: 'completed' });
        } else if (action === 'reopen') {
          await context.octokit.issues.update({ ...context.repo(), issue_number: number, state: 'open' });
        } else if (action === 'lock') {
          await context.octokit.issues.lock({ ...context.repo(), issue_number: number, lock_reason: 'resolved' });
        } else if (action === 'pin') {
          // Pinning requires different endpoints; placeholder.
          await context.octokit.issues.update({ ...context.repo(), issue_number: number, labels: ['pinned'] });
        }
        await context.octokit.issues.createComment(context.issue({ body: `✅ ${action}: ${reason}` }));
      } catch (err) {
        await context.octokit.issues.createComment(context.issue({ body: `❌ ${err.message}` }));
      }
    },
  };
}

module.exports = {
  close: make('close'),
  reopen: make('reopen'),
  lock: make('lock'),
  pin: make('pin'),
};
