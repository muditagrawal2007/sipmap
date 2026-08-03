# Contributing

Thanks for your interest in sipmap! This is a free, open-source GitHub App created by **MUDIT AGRAWAL** ([@muditagrawal2007](https://github.com/muditagrawal2007)).

## Code of conduct

Be kind, be patient, be helpful. Open source is hard.

## Reporting bugs

Use the [Bug report](../../.github/ISSUE_TEMPLATE/bug_report.md) template. Include:
- What happened
- Steps to reproduce
- Expected vs actual behavior
- sipmap version, Node version, hosting provider
- Logs (redact secrets!)

## Suggesting features

Use the [Feature request](../../.github/ISSUE_TEMPLATE/feature_request.md) template. Explain the user problem first, then the proposed solution.

## Submitting PRs

1. Fork the repo
2. Create a branch: `git checkout -b feat/my-feature`
3. Make your change
4. Add tests (unit + integration as needed)
5. Ensure `npm run lint`, `npm test`, `npm run verify:all` all pass
6. Open a PR — `.github/CODEOWNERS` will request review from @muditagrawal2007

### Commit messages

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add /metrics command`
- `fix: handle missing template in describe`
- `docs: update README install steps`
- `chore: bump probot to 13.4`
- `test: add integration tests for /close`

## Adding a new command

1. Create `src/commands/myCommand.js`:

   ```js
   module.exports = {
     name: 'myCommand',
     description: 'What it does',
     requiresMaintainer: false,
     async execute(context, args) {
       // ...
     },
   };
   ```

2. Register it in `src/commands/index.js`

3. Add to help message in `src/commands/help.js`

4. Add a unit test in `test/unit/commands/`

5. (Optional) Add an integration test in `test/integration/`

6. Document in `docs/commands.md`

## Adding a new encouragement

1. Create `src/encouragements/myEncouragement.js`
2. Register in `src/encouragements/index.js`
3. Document in `docs/encouragements.md`

## License

By contributing, you agree your contributions are licensed under MIT.
