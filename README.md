# Personal Toolkit

A little more focus. A little less friction.

Seven everyday tools in one lightweight web app: a focus timer, tasks, habits,
bookmarks, text and math utilities, flashcards, and quick notes.

**Status: working local prototype, not yet publicly deployed.** All seven tools
are implemented. Broader browser, accessibility, and production checks remain
before a stable release. [Tiếng Việt](README.vi.md)

![Personal Toolkit overview](docs/images/overview.png)

## The idea

Open the tool you need and get started. Each tool has its own page, with
shared navigation and settings when you need the rest of the toolkit.

- No account required.
- English by default, with Vietnamese available throughout the interface.
- Browser storage for personal content, with manual JSON backup and restore.
- A responsive interface, keyboard support, and light and dark themes.
- Static hosting on GitHub Pages, without a backend in the first release.

## Tools

| Tool          | What it helps with                                              |
| ------------- | --------------------------------------------------------------- |
| Focus Timer   | Focus sessions, breaks, and a simple session history.           |
| Today's Tasks | Tasks, dates, and unfinished work you can return to.            |
| Habits        | Daily check-ins, history, and streaks.                          |
| Bookmarks     | Searchable links organized into groups.                         |
| Quick Tools   | Word counts, text cleanup, percentages, and basic calculations. |
| Flashcards    | Study decks, card review, and saved progress.                   |
| Quick Notes   | Plain-text notes with autosave and search.                      |

## Your data

The app stores personal content in the browser rather
than sending it to an application server. It does not sync between devices or
browser profiles. Loading the website still makes requests to the hosting
provider; opening a bookmark contacts that destination.

Browser storage is not an encrypted vault or a backup. Clearing site data,
private browsing, or browser storage cleanup can remove content. Do not use this
toolkit to store passwords, API keys, or other secrets. Exported JSON backups
will be unencrypted files that you control.

See the [requirements](docs/requirements.md) for the storage and recovery design.

## Project documents

- [Product requirements and release criteria](docs/requirements.md)
- [Development roadmap](docs/roadmap.md)
- [Contribution guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## Run locally

Use Node.js 22 or newer (verified with Node.js 24). There are no package
dependencies to install and no API keys to configure.

```sh
git clone https://github.com/carwyn-dev/personal-toolkit.git
cd personal-toolkit
node scripts/serve.mjs
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173). Keep the terminal open and
press Ctrl+C to stop the server. Use HTTP rather than opening HTML through
`file://`; the app uses JavaScript modules and browser storage.

## Back up your data

Open **Settings & backup**, select all tools or one tool, and choose **Export
backup**. Keep the downloaded JSON somewhere safe. **Choose backup file** checks
the file and shows a preview before you confirm replacement. Restoring a
single-tool backup leaves other tools alone. Merge import is not supported.

The restore limit is 10 MiB per file. Larger exports show a warning; prefer
per-tool exports before your collection reaches this size. Backups exclude
interface preferences and unsaved drafts. Quick Tools text and calculations are
temporary and are not saved.

## Check and build

```sh
node --test tests/*.test.mjs
node scripts/check.mjs
node scripts/build.mjs
```

With npm available, the equivalent commands are `npm test`, `npm run check`, and
`npm run build`. Each build recreates `dist/` and copies only website files.
Tests and project documents are excluded.

With the local server running, open `/tests/browser.html` to run isolated
IndexedDB checks. `/tests/layout.html` provides 360px frames for checking all pages.
See [verification notes](docs/verification.md) for actual results and limitations.

## Deploy to GitHub Pages

1. Push the source to your repository's `main` branch.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. Run **Check and deploy Pages** from the Actions tab, or push a new commit to
   `main`. Pull requests run checks without deploying.
4. Wait for a successful deployment and use the URL reported by GitHub. Enforce
   HTTPS when that setting is available.

The workflow tests, checks, and builds before deployment. Actions are pinned to
specific commits. Links support project paths such as `/personal-toolkit/`.
These are setup instructions; no public demo or GitHub Actions run has been
verified yet. See [GitHub's Pages workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Limits of this prototype

- No cloud sync, accounts, encrypted vault, or offline installation.
- Background timers and completion sound depend on the browser/device. Re-enable
  sound after a reload if the browser requires a new user gesture.
- Browser data may be cleared; keep backups and do not store secrets here.
- Other users of the same device/browser profile can access its stored content.
- Initial testing uses Chromium on Windows. Safari, Firefox, physical phones,
  screen readers, and production HTTPS still need verification.

## Project layout

```text
assets/            Shared UI, translations, model, and storage
assets/tools/      Tool-specific JavaScript, loaded on demand
tools/<tool>/      Independent HTML entry points
scripts/           Local server, checks, and static build
tests/             Logic and isolated browser checks
docs/              Requirements, roadmap, and verification
```

## Contributing

Feedback and bug reports are welcome through
[GitHub Issues](https://github.com/carwyn-dev/personal-toolkit/issues).
Please describe the problem you want to solve and check for an existing issue
first. Read the [contribution guide](CONTRIBUTING.md) before submitting changes.

## License

[MIT](LICENSE) — Copyright (c) 2026 Carwyn.
