// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Notify maintainers by posting a comment @-tagging them.

function buildMentionList(handles) {
  return handles.map((h) => h.startsWith('@') ? h : `@${h}`).join(' ');
}

async function notifyMaintainers(context, summary, options = {}) {
  const config = options.config || { maintainers: { useCodeowners: true, fallbackHandles: [] } };
  const handlers = options.handlers || {};

  let handles = [];

  if (config.maintainers?.useCodeowners) {
    try {
      const co = await handlers.getCodeowners?.(context);
      if (co) {
        // Pick all owners of the touched paths if available, else top of file.
        handles = co.entries.flatMap((e) => e.owners);
      }
    } catch {
      // ignore
    }
  }

  if (handles.length === 0 && Array.isArray(config.maintainers?.fallbackHandles)) {
    handles = config.maintainers.fallbackHandles;
  }

  handles = [...new Set(handles)];
  const mention = handles.length > 0 ? buildMentionList(handles) : '';

  const body = [
    '👋 sipmap maintainer handoff',
    '',
    summary,
    '',
    mention ? `${mention} — over to you!` : '_No maintainers configured; please add `.sipmap.yml` with `maintainers.fallbackHandles` or a CODEOWNERS file._',
  ].join('\n');

  await context.octokit.issues.createComment({
    ...context.issue({ body }),
  });

  return { notified: handles, body };
}

module.exports = { notifyMaintainers, buildMentionList };
