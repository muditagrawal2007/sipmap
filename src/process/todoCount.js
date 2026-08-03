// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Count TODO/FIXME markers in changed content.

function count(content) {
  if (typeof content !== 'string') return { todo: 0, fixme: 0 };
  const todo = (content.match(/\bTODO\b/g) || []).length;
  const fixme = (content.match(/\bFIXME\b/g) || []).length;
  return { todo, fixme };
}

module.exports = { count };
