// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /config — show effective .sipmap.yml (maintainer only).

const { isMaintainer, FRIENDLY_DENIAL } = require('../utils/permissionGate');
const { getRepoConfig } = require('../utils/repoConfig');
const yaml = require('js-yaml');

module.exports = {
  name: 'config',
  description: 'Show effective config',
  requiresMaintainer: true,
  async execute(context, args) {
    const sender = context.payload.sender?.login;
    if (!(await isMaintainer(context, sender))) {
      await context.octokit.issues.createComment(context.issue({ body: FRIENDLY_DENIAL(sender) }));
      return;
    }
    if (args[0] === 'set') {
      await context.octokit.issues.createComment(context.issue({
        body: 'To change config, edit `.sipmap.yml` in your default branch and open a PR. sipmap never writes directly to your repo.',
      }));
      return;
    }
    const cfg = await getRepoConfig(context);
    const body = [
      '⚙️ **Effective config (merged with defaults)**',
      '',
      '```yaml',
      yaml.dump(cfg).trim(),
      '```',
    ].join('\n');
    await context.octokit.issues.createComment(context.issue({ body }));
  },
};
