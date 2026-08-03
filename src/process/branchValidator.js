// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Validate branch names against a regex pattern.

function validateBranchName(branchName, pattern) {
  if (!pattern) return { ok: true, reason: null };
  if (!branchName) return { ok: false, reason: 'Branch name missing' };
  try {
    const re = new RegExp(pattern);
    if (re.test(branchName)) return { ok: true, reason: null };
    return { ok: false, reason: `Branch \`${branchName}\` doesn't match pattern \`${pattern}\`` };
  } catch {
    return { ok: false, reason: `Invalid pattern: ${pattern}` };
  }
}

module.exports = { validateBranchName };
