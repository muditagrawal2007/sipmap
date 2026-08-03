// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Validate PR/issue titles against length / format rules.

function validateTitle(title, opts = {}) {
  const maxLen = opts.maxLength || 72;
  if (!title || !title.trim()) return { ok: false, reason: 'Title is empty' };
  if (title.length > maxLen) return { ok: false, reason: `Title is ${title.length} chars; max is ${maxLen}` };
  if (title.trim().toLowerCase() === 'no description provided.') {
    return { ok: false, reason: 'Title is the placeholder "No description provided."' };
  }
  return { ok: true, reason: null };
}

module.exports = { validateTitle };
