// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /test — process-testing digest: template, branch, commits, secrets, conflicts, description.

const { getRepoConfig } = require('../utils/repoConfig');
const { validateBranchName } = require('../process/branchValidator');
const { validateCommits } = require('../process/commitValidator');
const { validateTitle } = require('../process/titleValidator');
const { scan: secretScan } = require('../process/secretScan');
const { scan: conflictScan } = require('../process/conflictScan');
const { scan: fileSizeScan } = require('../process/fileSizeScan');
const { evaluate: evalDescription } = require('../process/descriptionValidator');

async function fetchPR(context, number) {
  const { data } = await context.octokit.pulls.get({ ...context.repo(), pull_number: number });
  return data;
}

async function fetchPRFiles(context, number) {
  const files = [];
  const iter = context.octokit.paginate.iterator(context.octokit.pulls.listFiles, {
    ...context.repo(),
    pull_number: number,
    per_page: 100,
  });
  for await (const { data } of iter) files.push(...data);
  return files;
}

async function fetchCommits(context, number) {
  const out = [];
  const iter = context.octokit.paginate.iterator(context.octokit.pulls.listCommits, {
    ...context.repo(),
    pull_number: number,
    per_page: 100,
  });
  for await (const { data } of iter) out.push(...data);
  return out;
}

async function fetchChecks(context, sha) {
  try {
    const { data } = await context.octokit.checks.listForRef({
      ...context.repo(),
      ref: sha,
      per_page: 100,
    });
    return data.check_runs || [];
  } catch {
    return [];
  }
}

module.exports = {
  name: 'test',
  description: 'Run process-testing digest',
  requiresMaintainer: false,
  async execute(context) {
    const cfg = await getRepoConfig(context);
    const number = context.payload.issue?.number || context.payload.pull_request?.number;
    if (!number) return;

    // Determine if this is a PR by trying to fetch it.
    let pr = null;
    try { pr = await fetchPR(context, number); } catch { /* not a PR */ }

    const lines = ['🧪 **sipmap /test — process digest**', ''];

    if (!pr) {
      // Issue-mode: just validate description + title.
      const issue = context.payload.issue;
      const titleCheck = validateTitle(issue.title, { maxLength: cfg.processTesting.titleMaxLength });
      lines.push(`- Title: ${titleCheck.ok ? '✅' : '❌'} ${titleCheck.reason || 'looks good'}`);
      if (cfg.processTesting.includeDescriptionCheck) {
        const tpl = await (require('../process/descriptionValidator').getTemplate)(context, 'issue');
        const bodyEval = evalDescription(issue.body || '', tpl, cfg.description);
        lines.push(`- Description: ${bodyEval.ok ? '✅' : '⚠️'} ${bodyEval.verdict}${bodyEval.missingRequired.length ? ` — missing: ${bodyEval.missingRequired.join(', ')}` : ''}`);
      }
      await context.octokit.issues.createComment(context.issue({ body: lines.join('\n') }));
      return;
    }

    // PR-mode: full digest.
    const files = await fetchPRFiles(context, number);
    const commits = await fetchCommits(context, number);
    const checks = await fetchChecks(context, pr.head.sha);

    // Branch
    if (cfg.processTesting.branchPattern) {
      const r = validateBranchName(pr.head.ref, cfg.processTesting.branchPattern);
      lines.push(`- Branch name: ${r.ok ? '✅' : '❌'} ${r.reason || 'matches pattern'}`);
    }

    // Commits
    if (cfg.processTesting.commitPattern) {
      const c = validateCommits(commits, cfg.processTesting.commitPattern);
      lines.push(`- Commit messages: ${c.ok ? '✅' : `❌ ${c.invalid.length}/${c.total} don't match`}`);
    }

    // Title
    const t = validateTitle(pr.title, { maxLength: cfg.processTesting.titleMaxLength });
    lines.push(`- PR title: ${t.ok ? '✅' : '❌'} ${t.reason || 'looks good'}`);

    // Description
    if (cfg.processTesting.includeDescriptionCheck) {
      const tpl = await (require('../process/descriptionValidator').getTemplate)(context, 'pr');
      const d = evalDescription(pr.body || '', tpl, cfg.description);
      lines.push(`- Description: ${d.ok ? '✅' : '⚠️'} ${d.verdict}${d.missingRequired.length ? ` — missing: ${d.missingRequired.join(', ')}` : ''}`);
    }

    // Size
    const totalChanges = files.reduce((acc, f) => acc + (f.additions || 0) + (f.deletions || 0), 0);
    lines.push(`- Size: ${totalChanges > cfg.processTesting.maxPRSize ? '⚠️' : '✅'} ${totalChanges} lines changed (max ${cfg.processTesting.maxPRSize})`);

    // Secrets
    if (cfg.processTesting.secretScan) {
      const joined = files.map((f) => f.patch || '').join('\n');
      const s = secretScan(joined);
      lines.push(`- Secret scan: ${s.hits.length === 0 ? '✅' : `❌ ${s.hits.length} suspect pattern(s)`}`);
    }

    // Conflicts
    if (cfg.processTesting.conflictScan) {
      const joined = files.map((f) => f.patch || '').join('\n');
      const c = conflictScan(joined);
      lines.push(`- Conflict markers: ${c.hasConflicts ? '❌ found' : '✅ none'}`);
    }

    // File size
    const fs = fileSizeScan(files);
    lines.push(`- Large files: ${fs.large.length === 0 ? '✅ none' : `⚠️ ${fs.large.length} file(s) > ${fs.threshold / 1024}KB`}`);

    // Required labels
    if (cfg.processTesting.requiredLabels.length > 0) {
      const labelNames = (pr.labels || []).map((l) => (typeof l === 'string' ? l : l.name));
      const missing = cfg.processTesting.requiredLabels.filter((rl) => !labelNames.includes(rl));
      lines.push(`- Required labels: ${missing.length === 0 ? '✅' : `❌ missing ${missing.join(', ')}`}`);
    }

    // CI checks
    const checksByState = checks.reduce((acc, c) => {
      acc[c.conclusion || c.status] = (acc[c.conclusion || c.status] || 0) + 1;
      return acc;
    }, {});
    const checksLine = Object.entries(checksByState).map(([k, v]) => `${v} ${k}`).join(', ') || 'no checks';
    lines.push(`- CI checks: ${checks.length === 0 ? '⚠️ none yet' : `✅ ${checksLine}`}`);

    // Linked issue
    if (cfg.processTesting.requireLinkedIssue) {
      const hasLinked = /\b(?:fixes|closes|resolves)\s+#\d+/i.test(pr.body || '');
      lines.push(`- Linked issue: ${hasLinked ? '✅' : '❌ missing "Fixes #N" / "Closes #N" reference'}`);
    }

    lines.push('', '_Run `:sipmap /status` for a deeper CI breakdown, or `:sipmap /describe` for description details._');

    await context.octokit.issues.createComment(context.issue({ body: lines.join('\n') }));
  },
};
