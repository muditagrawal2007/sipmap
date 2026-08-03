// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Read .sipmap.yml from a repo's default branch and merge with defaults.

const yaml = require('js-yaml');

const DEFAULTS = {
  rateLimits: {
    perUserPerPR: 3,
    perPRPerHour: 20,
    perRepoPerHour: 100,
    debounceSeconds: 600,
    reactionOnlyAfterFirst: true,
  },
  description: {
    enabled: true,
    minLength: 30,
    requiredSections: [],
    autoNudgeOnEmpty: false,
  },
  encouragement: {
    enabled: true,
    firstTimer: true,
    firstIssue: true,
    firstMerged: true,
    milestoneEvery: 5,
    docContributor: true,
    bugHunter: true,
    welcomeBack: true,
    streak: true,
    staleBuster: true,
    topReviewer: true,
    helpfulReview: true,
    staleReopen: true,
  },
  processTesting: {
    requireTemplate: true,
    requireLinkedIssue: false,
    requiredLabels: [],
    branchPattern: '',
    commitPattern: '',
    titleMaxLength: 72,
    maxPRSize: 400,
    secretScan: true,
    conflictScan: true,
    includeDescriptionCheck: true,
  },
  maintainers: {
    useCodeowners: true,
    fallbackHandles: [],
  },
  autoTriage: {
    enabled: false,
    requireMaintainer: false,
    rules: [],
  },
  stale: {
    enabled: false,
    issueDays: 30,
    prDays: 14,
    autoCloseDays: 60,
  },
  weeklyDigest: {
    enabled: false,
    issueNumber: 0,
  },
};

function deepMerge(base, override) {
  if (override == null) return base;
  if (typeof base !== 'object' || typeof override !== 'object' || Array.isArray(override)) {
    return override;
  }
  const result = { ...base };
  for (const key of Object.keys(override)) {
    result[key] = deepMerge(base[key], override[key]);
  }
  return result;
}

async function getRepoConfig(context) {
  const { owner, repo } = context.repo();
  try {
    const { data } = await context.octokit.repos.getContent({
      owner,
      repo,
      path: '.sipmap.yml',
    });
    if (Array.isArray(data) || data.type !== 'file') return { ...DEFAULTS };
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    const parsed = yaml.load(content) || {};
    return deepMerge(DEFAULTS, parsed);
  } catch (err) {
    if (err.status === 404) return { ...DEFAULTS };
    throw err;
  }
}

module.exports = { getRepoConfig, DEFAULTS, deepMerge };
