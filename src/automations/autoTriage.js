// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Auto-triage: apply labels based on title regex.

const { isMaintainer } = require('../utils/permissionGate');

module.exports = {
  name: 'autoTriage',
  events: ['issues.opened', 'pull_request.opened'],
  async run(context, cfg) {
    if (!cfg.autoTriage?.enabled) return;
    if (cfg.autoTriage.requireMaintainer) {
      const sender = context.payload.sender?.login;
      if (!(await isMaintainer(context, sender))) return;
    }
    const rules = cfg.autoTriage.rules || [];
    const title = (context.payload.issue?.title || context.payload.pull_request?.title || '').toLowerCase();
    const number = context.payload.issue?.number || context.payload.pull_request?.number;
    const applied = new Set();
    for (const r of rules) {
      try {
        const re = new RegExp(r.match, 'i');
        if (re.test(title)) {
          for (const l of r.labels || []) {
            if (applied.has(l)) continue;
            try { await context.octokit.issues.addLabels({ ...context.repo(), issue_number: number, labels: [l] }); applied.add(l); }
            catch (err) { void err; /* label may already exist */ }
          }
        }
      } catch (err) {
        void err; /* invalid regex in config; skip */
      }
    }
  },
};
