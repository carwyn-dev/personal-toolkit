# Verification notes

Checked on 26 October 2026. This is prototype verification, not a security audit
or a claim of WCAG conformance. No production deployment has been verified.

## Automated logic checks

Run `node --test tests/*.test.mjs` (12 tests) and `node scripts/check.mjs`.
They cover backup round trips, Unicode, script-like plain text, invalid imports,
unsafe URLs, duplicate IDs, invalid dates, bounded calculations, local-date
streaks, timestamp-based timers, idempotent completion, and stale-edit rejection.
The source checks cover JavaScript syntax, HTML asset paths, CSP presence, and
literal translation keys.

## Real IndexedDB checks

Open `/tests/browser.html` with the server running and click **Run checks**.
Eleven checks use a uniquely named temporary database and delete only that test
database afterward. They verify persistence, concurrent writes, stale-edit
rejection, rollback, invalid-restore preservation, scoped restore, revision
invalidation, plain-text rendering, false ARIA states, cross-client notifications, and one history
entry for concurrent timer completion.

## Browser interaction checks performed

Environment: Chromium-based in-app browser on Windows, using synthetic data.

| Area              | Observed result                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Tasks             | Created a dated task, reloaded, completed it, and found it in Completed.                                   |
| Focus             | Started, reloaded with elapsed time preserved, paused, and switched to a short break through confirmation. |
| Habits            | Created a habit, marked today complete, and saw a one-day streak.                                          |
| Bookmarks         | Rejected a `javascript:` URL, then saved an HTTPS bookmark with a group.                                   |
| Quick Tools       | Cleaned whitespace and calculated 15% of 200 as 30.                                                        |
| Flashcards        | Created a deck/card, revealed the answer, recorded Remembered, and saw saved progress.                     |
| Notes             | Saved Unicode and script-like text without executing it.                                                   |
| Backup            | Downloaded JSON, selected it through the file chooser, reviewed counts, and restored it.                   |
| Language/theme    | Switched Vietnamese/English and used dark/light appearance.                                                |
| Project path      | Followed a tool link under `/personal-toolkit/` and reloaded successfully.                                 |
| Mobile navigation | Closed navigation is inert; opening the menu reveals usable links.                                         |

At 360px iframe widths, all eight pages had no measured horizontal overflow.
Frames use real application pages via `/tests/layout.html`; this does not replace
physical phone testing. Desktop and narrower layouts were inspected visually.
Browser logs showed no application/CSP errors during the checked flows.

The final home page was also checked directly at a 360px viewport (345px content
area after the scrollbar), with no horizontal overflow. Real screenshots are
available for [desktop](images/overview.png) and [mobile](images/overview-mobile.png).
An unsupported backup was rejected with a visible error inside the settings
dialog, leaving current data unchanged.

## Still to verify

- Firefox, Safari, physical Android/iOS, and full browser restart persistence.
- Storage quota/permission failures and interrupted schema upgrades.
- Screen readers, comprehensive keyboard/zoom/contrast evaluation.
- Sound delivery after a full timed session, sleep, and backgrounding.
- A full network trace, production HTTPS/CSP, and the GitHub Actions workflow.

The CSP blocks app network connections; source uses no runtime CDN, analytics,
remote font, or automatic bookmark preview. These controls do not replace a
production network inspection. Backups are unencrypted. Storage is accessible to
scripts in the same origin and users with browser-profile access.
