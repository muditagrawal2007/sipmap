// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Heuristic secret scanner for PR diff contents.
// Looks for GitHub PATs, AWS keys, Slack tokens, PEM blocks, and high-entropy strings.

const PATTERNS = [
  { name: 'github_pat', re: /ghp_[A-Za-z0-9]{36}/g },
  { name: 'github_fine_grained', re: /github_pat_[A-Za-z0-9_]{82}/g },
  { name: 'github_app_token', re: /ghs_[A-Za-z0-9]{36}/g },
  { name: 'aws_access_key', re: /AKIA[0-9A-Z]{16}/g },
  { name: 'slack_token', re: /xox[baprs]-[A-Za-z0-9-]+/g },
  { name: 'pem_block', re: /-----BEGIN[^-]+-----/g },
];

function shannonEntropy(str) {
  if (!str) return 0;
  const counts = {};
  for (const ch of str) counts[ch] = (counts[ch] || 0) + 1;
  const len = str.length;
  let h = 0;
  for (const c of Object.values(counts)) {
    const p = c / len;
    h -= p * Math.log2(p);
  }
  return h;
}

function scan(content) {
  if (typeof content !== 'string') return { hits: [] };
  const hits = [];
  for (const { name, re } of PATTERNS) {
    const matches = content.match(re);
    if (matches) hits.push({ name, count: matches.length });
  }
  // High-entropy check: any 40+ char token of mixed case+digits is suspect.
  const tokens = content.match(/[A-Za-z0-9_\-+/=]{40,}/g) || [];
  for (const t of tokens) {
    if (shannonEntropy(t) >= 4.5) {
      hits.push({ name: 'high_entropy', sample: t.slice(0, 8) + '…' });
    }
  }
  return { hits };
}

module.exports = { scan, shannonEntropy };
