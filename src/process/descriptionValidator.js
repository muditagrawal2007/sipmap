// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Validate PR / issue descriptions against the repo's template.
// Returns a structured verdict: { ok, missing, empty, sections, length, verdict }

const yaml = require('js-yaml');

const PLACEHOLDER_STRINGS = [
  'no description provided.',
  '<!--',
  '(empty)',
];

async function getTemplate(context, kind) {
  // kind: 'pr' | 'issue'
  const { owner, repo } = context.repo();
  const candidates = kind === 'pr'
    ? [
        '.github/PULL_REQUEST_TEMPLATE.md',
        '.github/pull_request_template.md',
        'docs/PULL_REQUEST_TEMPLATE.md',
      ]
    : [
        '.github/ISSUE_TEMPLATE/bug.yml',
        '.github/ISSUE_TEMPLATE/bug.md',
        '.github/ISSUE_TEMPLATE/feature_request.yml',
        '.github/ISSUE_TEMPLATE/feature_request.md',
        '.github/ISSUE_TEMPLATE.md',
      ];

  for (const path of candidates) {
    try {
      const { data } = await context.octokit.repos.getContent({ owner, repo, path });
      if (!Array.isArray(data) && data.type === 'file') {
        const content = Buffer.from(data.content, 'base64').toString('utf8');
        return { path, content };
      }
    } catch (err) {
      if (err.status === 404) continue;
      throw err;
    }
  }
  return null;
}

function parseMarkdownSections(md) {
  const sections = [];
  const lines = md.split(/\r?\n/);
  let current = null;
  for (const line of lines) {
    const h = line.match(/^#{2,4}\s+(.+?)\s*$/);
    if (h) {
      if (current) sections.push(current);
      current = { heading: h[1], content: '' };
    } else if (current) {
      current.content += line + '\n';
    }
  }
  if (current) sections.push(current);
  return sections;
}

function parseYamlSections(ymlText) {
  try {
    const parsed = yaml.load(ymlText);
    const body = parsed?.body;
    if (!Array.isArray(body)) return [];
    return body
      .filter((b) => b && (b.type === 'textarea' || b.type === 'input'))
      .map((b) => ({
        heading: b.label || b.id || 'field',
        required: !!b.validations?.required,
        content: '',
      }));
  } catch {
    return [];
  }
}

function isPlaceholder(body) {
  const trimmed = (body || '').trim().toLowerCase();
  if (!trimmed) return true;
  return PLACEHOLDER_STRINGS.some((p) => trimmed.startsWith(p));
}

function evaluate(body, template, opts) {
  const minLength = opts.minLength || 30;
  const requiredSections = opts.requiredSections || [];

  const length = (body || '').trim().length;
  const empty = !body || isPlaceholder(body);
  const tooShort = length < minLength;

  let sections = [];
  let missingRequired = [];

  if (template) {
    if (template.path.endsWith('.yml') || template.path.endsWith('.yaml')) {
      sections = parseYamlSections(template.content);
    } else {
      sections = parseMarkdownSections(template.content);
    }

    // Map description body to sections by heading match
    const bodyLower = (body || '').toLowerCase();
    for (const s of sections) {
      const headingLower = s.heading.toLowerCase();
      // Strip leading "## " from heading text for matching
      const needle = headingLower.replace(/^#+\s*/, '');
      const idx = bodyLower.indexOf(needle);
      if (idx >= 0) {
        const after = bodyLower.slice(idx + needle.length);
        const nextHeading = after.search(/\n#{2,4}\s/);
        s.content = nextHeading >= 0 ? after.slice(0, nextHeading) : after;
        // Strip leading "## " from the heading if present in content, then check
        const cleaned = s.content.replace(/^#+\s*/, '').trim();
        s.filled = cleaned.length >= 3;
      } else {
        s.filled = false;
      }
    }

    // Required-field detection: from template required flags, OR from .sipmap.yml requiredSections.
    const fromTemplate = sections.filter((s) => s.required && !s.filled).map((s) => s.heading);
    const fromConfig = requiredSections.filter((rs) => !bodyLower.includes(rs.toLowerCase()));
    missingRequired = [...new Set([...fromTemplate, ...fromConfig])];
  }

  let verdict = 'good';
  if (empty) verdict = 'empty';
  else if (missingRequired.length > 0) verdict = 'incomplete';
  else if (tooShort) verdict = 'too-short';

  return {
    ok: verdict === 'good',
    verdict,
    length,
    empty,
    tooShort,
    sections,
    missingRequired,
  };
}

module.exports = { getTemplate, evaluate, isPlaceholder };
