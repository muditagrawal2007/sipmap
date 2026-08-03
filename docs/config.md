# Configuration (`.sipmap.yml`)

Drop a `.sipmap.yml` in your repo's default branch. All keys are optional; sensible defaults apply if the file is missing.

Full reference (see [`.sipmap.yml.example`](../.sipmap.yml.example) for the live file):

```yaml
rateLimits:           # anti-flood
  perUserPerPR: 3
  perPRPerHour: 20
  perRepoPerHour: 100
  debounceSeconds: 600
  reactionOnlyAfterFirst: true

description:          # /describe + auto-nudge
  enabled: true
  minLength: 30
  requiredSections: []
  autoNudgeOnEmpty: false

encouragement:        # auto-comments
  enabled: true
  firstTimer: true
  firstIssue: true
  firstMerged: true
  milestoneEvery: 5
  docContributor: true
  bugHunter: true
  welcomeBack: true
  streak: true
  staleBuster: true
  topReviewer: true
  helpfulReview: true
  staleReopen: true

processTesting:       # /test
  requireTemplate: true
  requireLinkedIssue: false
  requiredLabels: []
  branchPattern: ""
  commitPattern: ""
  titleMaxLength: 72
  maxPRSize: 400
  secretScan: true
  conflictScan: true
  includeDescriptionCheck: true

maintainers:
  useCodeowners: true
  fallbackHandles: []

autoTriage:
  enabled: false
  requireMaintainer: false
  rules:
    - match: "^bug:"
      labels: ["bug", "needs-triage"]
    - match: "^feat:"
      labels: ["enhancement", "needs-triage"]

stale:
  enabled: false
  issueDays: 30
  prDays: 14
  autoCloseDays: 60

weeklyDigest:
  enabled: false
  issueNumber: 0
```

## Tips

- **Per-section** disable: just set the key to `false` (e.g. `firstTimer: false`).
- **Custom regexes** work for `branchPattern` and `commitPattern`.
- **Required sections** can be a list of strings matched case-insensitively against `## Heading` in PR/issue bodies.
