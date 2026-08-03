// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Validate commit messages against a regex (e.g. Conventional Commits).

function validateCommits(commits, pattern) {
  if (!pattern) return { ok: true, invalid: [], total: commits.length };
  let re;
  try { re = new RegExp(pattern); }
  catch { return { ok: false, invalid: [], total: commits.length, error: `Invalid pattern: ${pattern}` }; }

  const invalid = [];
  for (const c of commits) {
    const msg = (c?.message || c?.commit?.message || '').split('\n')[0];
    if (!re.test(msg)) invalid.push(msg);
  }
  return { ok: invalid.length === 0, invalid, total: commits.length };
}

module.exports = { validateCommits };
