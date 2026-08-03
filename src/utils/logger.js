// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// PII-redacting structured logger.
// Logs only: { event, repo_id, command, actor_login }
// Never logs: tokens, emails, comment bodies, file contents.

const pino = require('pino');

const REDACT_PATTERNS = [
  // GitHub personal access tokens
  /ghp_[A-Za-z0-9]{36}/g,
  // GitHub fine-grained PAT
  /github_pat_[A-Za-z0-9_]{82}/g,
  // GitHub App installation tokens
  /ghs_[A-Za-z0-9]{36}/g,
  // AWS access key
  /AKIA[0-9A-Z]{16}/g,
  // Slack tokens
  /xox[baprs]-[A-Za-z0-9-]+/g,
  // Email addresses
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  // PEM private key blocks (full BEGIN...END)
  /-----BEGIN[^-]+-----[\s\S]*?-----END[^-]+-----/g,
  // PEM header alone (in case END block is missing)
  /-----BEGIN[^-]+-----/g,
];

function redact(value) {
  if (typeof value === 'string') {
    let out = value;
    for (const pattern of REDACT_PATTERNS) {
      out = out.replace(pattern, '[REDACTED]');
    }
    return out;
  }
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = redact(v);
    }
    return result;
  }
  return value;
}

const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      '*.token', '*.private_key', '*.privateKey', '*.password', '*.secret',
      '*.authorization', '*.body', '*.comment_body', '*.description',
      '*.email', '*.user_email',
    ],
    censor: '[REDACTED]',
  },
  formatters: {
    log(obj) {
      // Run string-level redaction on top of path-based redaction.
      return redact(obj);
    },
  },
});

function safeLog(level, fields) {
  // Only allow a fixed schema. Drop anything else.
  const allowed = {};
  if (fields && typeof fields === 'object') {
    if ('event' in fields) allowed.event = String(fields.event).slice(0, 64);
    if ('repo_id' in fields) allowed.repo_id = typeof fields.repo_id === 'number' ? fields.repo_id : null;
    if ('command' in fields) allowed.command = String(fields.command).slice(0, 64);
    if ('actor_login' in fields) allowed.actor_login = String(fields.actor_login).slice(0, 64);
    if ('result' in fields) allowed.result = String(fields.result).slice(0, 64);
  }
  baseLogger[level](allowed);
}

module.exports = {
  debug: (f) => safeLog('debug', f),
  info: (f) => safeLog('info', f),
  warn: (f) => safeLog('warn', f),
  error: (f) => safeLog('error', f),
  redact,
  _raw: baseLogger,
};
