// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// /deps — detect dependency changes in PR.

const MANIFEST_FILES = ['package.json', 'requirements.txt', 'go.mod', 'Cargo.toml', 'pom.xml', 'build.gradle', 'Gemfile'];

async function fetchPackageJson(context, ref) {
  const { owner, repo } = context.repo();
  try {
    const { data } = await context.octokit.repos.getContent({ owner, repo, path: 'package.json', ref });
    if (Array.isArray(data) || data.type !== 'file') return null;
    return JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
  } catch { return null; }
}

module.exports = {
  name: 'deps',
  description: 'Detect dependency changes',
  requiresMaintainer: false,
  async execute(context) {
    const number = context.payload.issue?.number;
    if (!number) return;
    let pr;
    try { pr = (await context.octokit.pulls.get({ ...context.repo(), pull_number: number })).data; }
    catch { await context.octokit.issues.createComment(context.issue({ body: '`/deps` only applies to pull requests.' })); return; }

    const files = [];
    const iter = context.octokit.paginate.iterator(context.octokit.pulls.listFiles, { ...context.repo(), pull_number: number, per_page: 100 });
    for await (const { data } of iter) files.push(...data);
    const touched = files.filter((f) => MANIFEST_FILES.includes(f.filename));

    if (touched.length === 0) {
      await context.octokit.issues.createComment(context.issue({ body: '📦 **Deps:** no manifest files changed in this PR.' }));
      return;
    }

    const lines = ['📦 **Dependency changes**', ''];
    for (const f of touched) lines.push(`- \`${f.filename}\` (+${f.additions} / -${f.deletions})`);

    // Try to detect major version bumps in package.json.
    const pkgHead = await fetchPackageJson(context, pr.head.sha);
    const pkgBase = await fetchPackageJson(context, pr.base.sha);
    if (pkgHead && pkgBase) {
      const before = { ...(pkgBase.dependencies || {}), ...(pkgBase.devDependencies || {}) };
      const after = { ...(pkgHead.dependencies || {}), ...(pkgHead.devDependencies || {}) };
      const added = Object.keys(after).filter((k) => !before[k]);
      const updated = Object.keys(after).filter((k) => before[k] && before[k] !== after[k]);
      if (added.length === 0 && updated.length === 0) {
        lines.push('', '_No semantic differences in package.json deps between base and head._');
      } else {
        lines.push('', '**package.json diff:**');
        for (const a of added) lines.push(`- ➕ \`${a}@${after[a]}\``);
        for (const u of updated) lines.push(`- 🔄 \`${u}\`: \`${before[u]}\` → \`${after[u]}\``);
      }
    }

    await context.octokit.issues.createComment(context.issue({ body: lines.join('\n') }));
  },
};
