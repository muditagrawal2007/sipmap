// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Detect merge-conflict markers in PR content.

const MARKERS = ['<<<<<<<', '=======', '>>>>>>>'];

function scan(content) {
  if (typeof content !== 'string') return { hasConflicts: false, markers: [] };
  const found = MARKERS.filter((m) => content.includes(m));
  return { hasConflicts: found.length > 0, markers: found };
}

module.exports = { scan };
