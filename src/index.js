// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Probot entry point — wires commands, encouragements, and automations.

const commands = require('./commands');
const encouragements = require('./encouragements');
const automations = require('./automations');
const { parseCommand } = require('./utils/parseCommand');
const { getRepoConfig } = require('./utils/repoConfig');
const { shouldAllow } = require('./utils/rateLimit');
const logger = require('./utils/logger');

module.exports = (app) => {
  // ------ :sipmap /<command> dispatcher ------
  app.on(['issue_comment.created'], async (context) => {
    if (context.payload.action !== 'created') return;
    if (context.payload.comment.user?.type === 'Bot') return; // ignore bot-on-bot

    const parsed = parseCommand(context.payload.comment.body || '');
    if (!parsed) return;

    const handler = commands[parsed.name];
    if (!handler) return;

    const cfg = await getRepoConfig(context);
    const repoId = context.payload.repository?.id;
    const prNumber = context.payload.issue?.number;
    const user = context.payload.comment.user?.login;

    const gate = shouldAllow({
      repoId,
      prNumber,
      user,
      command: parsed.name,
      limits: cfg.rateLimits,
    });
    if (!gate.allow) {
      logger.info({ event: 'rate_limited', repo_id: repoId, command: parsed.name, actor_login: user, result: gate.reason });
      return;
    }

    try {
      await handler.execute(context, parsed.args, cfg);
      logger.info({ event: 'command', repo_id: repoId, command: parsed.name, actor_login: user, result: 'ok' });
    } catch (err) {
      logger.error({
        event: 'command_error',
        repo_id: repoId,
        command: parsed.name,
        actor_login: user,
        error: err && (err.stack || err.message || String(err)),
      });
    }
  });

  // ------ Encouragements ------
  for (const e of Object.values(encouragements)) {
    if (!e.event) continue;
    app.on([e.event], async (context) => {
      try {
        const cfg = await getRepoConfig(context);
        if (!(await e.shouldRun(context, cfg))) return;
        await e.run(context, cfg);
        logger.info({ event: 'encouragement', name: e.name, repo_id: context.payload.repository?.id, result: 'ok' });
      } catch (err) {
        logger.error({
          event: 'encouragement_error',
          name: e.name,
          repo_id: context.payload.repository?.id,
          error: err && (err.stack || err.message || String(err)),
        });
      }
    });
  }

  // ------ Automations ------
  for (const a of Object.values(automations)) {
    if (!a.events || a.events.length === 0) continue;
    app.on(a.events, async (context) => {
      try {
        const cfg = await getRepoConfig(context);
        await a.run(context, cfg);
      } catch (err) {
        logger.error({
          event: 'automation_error',
          name: a.name,
          repo_id: context.payload.repository?.id,
          error: err && (err.stack || err.message || String(err)),
        });
      }
    });
  }
};
