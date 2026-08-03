// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Flag PR files that exceed a size threshold.

const DEFAULT_MAX_BYTES = 500 * 1024; // 500 KB

function scan(files, maxBytes = DEFAULT_MAX_BYTES) {
  if (!Array.isArray(files)) return { large: [] };
  const large = files.filter((f) => (f.size || 0) > maxBytes);
  return { large, threshold: maxBytes };
}

module.exports = { scan, DEFAULT_MAX_BYTES };
