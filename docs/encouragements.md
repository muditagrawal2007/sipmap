# Encouragements

sipmap posts cheerful comments automatically to motivate contributors. All toggles are in `.sipmap.yml` under `encouragement.*`. Each one is enabled by default.

| Trigger | Emoji | What it does |
|---|---|---|
| First PR by a contributor | 🎉 | Welcome message with friendly tips |
| First issue by a contributor | 👋 | Welcome and template reminder |
| First merged PR | 🚀 | "Welcome to contributors!" |
| Every Nth merged PR | 🏆 | Milestone celebration (5, 10, 25, 50, 100) |
| First doc-only PR | 📚 | Recognition for documentation contributors |
| First bug-fix PR | 🐛 | Recognition for bug hunters |
| Returning after 90+ days | 🌱 | "Welcome back!" |
| 5+ consecutive active weeks | 🔥 | Streak celebration |
| Stale issue closed (>30d) | 🧹 | "Stale-buster" thanks |
| Substantive review comment | 💯 | 100 reaction + thanks |
| Substantive review (≥200 chars) | ⭐ | Top reviewer recognition |
| Stale issue reopened | 👋 | Friendly nudge for context update |
| Stale PR with no activity | 💬 | Conversation-starter nudge |

## Per-repo config

```yaml
encouragement:
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
  conversationStarter: true
```

Set `encouragement.enabled: false` to turn off all auto-comments.
