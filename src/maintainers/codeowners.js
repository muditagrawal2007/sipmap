// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Parse CODEOWNERS files. Returns a list of { pattern, owners[] }.

async function getCodeowners(context) {
  const { owner, repo } = context.repo();
  const paths = ['CODEOWNERS', '.github/CODEOWNERS', 'docs/CODEOWNERS'];
  for (const path of paths) {
    try {
      const { data } = await context.octokit.repos.getContent({ owner, repo, path });
      if (!Array.isArray(data) && data.type === 'file') {
        const content = Buffer.from(data.content, 'base64').toString('utf8');
        return { path, entries: parse(content) };
      }
    } catch (err) {
      if (err.status === 404) continue;
      throw err;
    }
  }
  return null;
}

function parse(content) {
  const entries = [];
  const lines = content.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    const pattern = parts[0];
    const owners = parts.slice(1).map((o) => o.replace(/^@/, '')).filter(Boolean);
    entries.push({ pattern, owners });
  }
  return entries;
}

function ownersForPath(entries, filePath) {
  if (!entries || !filePath) return [];
  const matches = [];
  for (const e of entries) {
    if (matchPattern(e.pattern, filePath)) {
      matches.push(...e.owners);
    }
  }
  return [...new Set(matches)];
}

function matchPattern(pattern, filePath) {
  // Convert glob-ish to regex.
  // In CODEOWNERS, `*` matches any character (including `/`).
  // A trailing `/` means "directory" — match anything starting with this prefix.
  let p = pattern;
  let suffix = '$';
  if (p.endsWith('/')) {
    p = p.slice(0, -1);
    suffix = '(/.*)?$';
  }
  const re = new RegExp('^' + p
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.') + suffix);
  return re.test(filePath);
}

module.exports = { getCodeowners, parse, ownersForPath, matchPattern };
