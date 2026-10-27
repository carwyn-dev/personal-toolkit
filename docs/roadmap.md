# Roadmap

Status: working local prototype, not a stable release. No dates are promised.
Unchecked items remain planned work. See [requirements.md](requirements.md)
for release gates and [verification.md](verification.md) for checks performed.

## 0. Define the project

- [x] Establish the seven-tool scope, English/Vietnamese interface, and static hosting direction.
- [x] Document storage, backup, privacy, and security requirements.
- [x] Add contribution guidance and MIT licensing information.
- [ ] Collect remaining feedback as actionable implementation issues.

## 1. Build the shared foundation

- [x] Create the home page and seven addressable tool pages.
- [x] Implement shared navigation, responsive styles, themes, and translations.
- [x] Implement versioned storage and visible error handling.
- [x] Implement validated backup/restore before relying on stored personal data.
- [x] Add tests for transactions, stale edits, restore, and unsafe input.
- [ ] Verify data migrations when a second schema version is introduced.

## 2. Deliver working tools

- [x] Today's Tasks and Focus Timer, including optional task selection.
- [x] Quick Notes and Bookmarks.
- [x] Habits, including local-date and streak handling.
- [x] Quick Tools with bounded, non-executing calculations.
- [x] Flashcards with saved review progress.

Complete a usable tool and verify its data behavior before moving to the next.

## 3. Prepare the first release

- [ ] Meet the acceptance criteria and record browser/accessibility coverage.
- [x] Add a privacy notice, usage help, and known limitations.
- [x] Add local setup, a static build, and a GitHub Pages workflow.
- [ ] Verify the workflow and production HTTPS on an actual deployment.
- [ ] Complete Firefox, Safari, physical phone, and accessibility verification.
- [x] Add a real interface screenshot to the English and Vietnamese README.
- [ ] Add a social preview and update repository topics.
- [ ] Publish a working demo, verify it, and then add the demo link to README.
- [ ] Publish version 0.1.0 with release notes.

## Later, based on feedback

Consider offline installation, richer study scheduling, recurring tasks, and
additional utilities only after the first release works reliably. Accounts and
cloud sync require a separate storage, privacy, and security design.
