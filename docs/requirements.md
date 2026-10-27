# Product requirements

Status: first-release specification. Requirements are not claims about features
already implemented. See the [roadmap](roadmap.md) for development status.

## Purpose and audience

Help students and individuals organize everyday work and study using a small
collection of browser-based tools. A visitor should be able to open a single
tool directly without registration or completing an onboarding flow.

## Scope

- One website and repository; a separate addressable page for each of seven tools.
- A home page that briefly introduces the tools and links to them.
- English as the initial default, a persistent English/Vietnamese switch, and
  translated labels, validation messages, empty states, and storage notices.
- Responsive layouts, light/dark/system themes, and shared navigation.
- Browser-local data, manual export and restore, and no application backend.
- No advertising, analytics, third-party tracking scripts, or remote fonts in
  the first release. Keep required runtime assets in the project.

Excluded from the first release: accounts, cloud sync, collaboration, payments,
AI integrations, attachments, rich-text editing, and offline/PWA installation.

## Functional requirements

| Tool          | First-release behavior                                                                                                                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focus Timer   | Configurable focus/break duration; start, pause, resume, reset; session history; optional task selection. Count a completed focus session once. Persist active state across page navigation and reload. Sound is user-controlled. |
| Today's Tasks | Create, edit, complete, reopen, and delete tasks; assign an optional date; separate today's work from overdue, upcoming, and undated tasks. Never discard unfinished tasks at midnight.                                           |
| Habits        | Create, rename, archive, and delete daily habits; toggle completion for today or a previous date; show calendar history and streaks. Incomplete today must not break a streak until today ends.                                   |
| Bookmarks     | Create, edit, delete, group, and search bookmarks by title or URL. Accept only absolute HTTP/HTTPS URLs. Links open only on explicit user action.                                                                                 |
| Quick Tools   | Word/character counts with documented counting rules; uppercase/lowercase conversion; whitespace cleanup; percentages and basic arithmetic with clear invalid-input and division-by-zero states. No execution of entered code.    |
| Flashcards    | Create, edit, and delete decks/cards; front/back plain text; flip cards; record remembered/not-yet responses; save review progress. No claim to an advanced spaced-repetition algorithm.                                          |
| Quick Notes   | Create, edit, delete, and search plain-text notes with titles and timestamps. Autosave and show saving/saved/error state. Preserve unsaved text when a write fails.                                                               |

Shared settings include language, theme, backup/restore, and data deletion.
Destructive bulk actions require confirmation naming the affected data. Provide
undo for ordinary item deletion where practical.

## Storage architecture

- Use IndexedDB for tasks, habits, bookmarks, decks/cards, notes, and timer data.
- Use localStorage only for small display preferences. Prefix storage names to
  avoid accidental collisions; prefixes are not a security boundary.
- Put storage operations behind a shared module with a versioned schema.
- Stable record IDs, validated fields, and timestamps support data updates and
  restore. Store daily check-ins as local calendar-date strings, not UTC dates.
- Schedule views use the device's local date/time zone; changing the device time
  zone does not relabel historical habit dates.
- Use transaction-safe database upgrades. A failed upgrade must not erase data
  or reset the database automatically.
- Handle quota, permission, and unavailable-storage errors visibly. Do not show
  success until a write completes. Warn before users rely on unavailable storage.
- Multiple tabs must refresh shared state or detect conflicting edits; stale
  edits must not silently overwrite more recent changes.

Browser storage is scoped to an origin, not a repository path. Other projects
under the same `username.github.io` host can share that storage boundary. Use a
dedicated hostname if isolation from unrelated applications becomes necessary.

## Backup and restore

- Export all tools together or one tool at a time as UTF-8 JSON. The envelope
  includes application identifier, schema version, export time, and tool scope.
- Include personal content and progress; exclude transient UI state and caches.
- Exported backups are unencrypted. Explain this before download.
- Validate file size before reading and validate the entire JSON structure,
  record types, lengths, IDs, dates, URLs, references, and schema version.
- First-release import limit: 10 MiB per file. Document this limit in the UI;
  exports exceeding it must warn that the file cannot be restored by this version.
- Reject unsupported versions or malformed records with an actionable message.
  Never execute imported content, render it as HTML, or fetch imported URLs.
- Show a preview with tool names and record counts. Restore replaces only the
  selected tool scope; importing all data replaces all toolkit data. No merge
  behavior in the first release.
- Offer export of existing data before replacement. Require explicit confirmation
  and apply the validated restore atomically. Failure preserves current data.
- Clear affected transient state after restore and notify other open tabs.

## Security and privacy requirements

Threats in scope: script injection through user or imported content, unsafe URLs,
malformed backups, accidental data loss, dependency compromise, and accidental
publication of secrets or personal data.

- Treat all input, including database records, as untrusted. Render user text
  through safe text APIs, never HTML interpolation. Do not use eval, Function
  constructors, or HTML execution to implement calculations or imports.
- Validate URL schemes after parsing. External links use safe new-tab attributes;
  do not load remote bookmark previews or icons automatically.
- Use bounded inputs and documented limits to avoid excessive memory or UI work.
- Serve over enforced HTTPS. Use a tested Content Security Policy compatible with
  static hosting, without unsafe inline scripts or evaluated code. Document any
  header-only controls that GitHub Pages cannot supply directly.
- Keep dependencies minimal, record their licenses, and commit a lockfile if
  package tooling is introduced. Do not put secrets in client code or build-time
  variables that are bundled into public assets.
- Send no personal content to application services. Clipboard actions require an
  explicit user action. Do not request notification permission on page load.
- Provide a plain-language privacy notice and scoped data deletion. Delete only
  toolkit-owned data, never every key/database belonging to the origin.
- Protect the maintainer's GitHub account with two-factor authentication and
  review dependency and workflow changes before deployment.

Limits: local content is not application-encrypted or access-controlled. A person
with browser-profile access or hostile code executing in the origin may access
it. A cosmetic PIN screen is not a security feature. The hosting provider may
receive normal request metadata; browser extensions and compromised devices are
outside this application's protection.

## Usability, performance, and correctness

- Keyboard-operable controls, visible focus, semantic labels, sufficient contrast,
  reduced-motion support, and accessible status announcements. Target WCAG 2.2 AA;
  do not claim conformance without evaluation.
- No horizontal overflow at a 360 CSS-pixel viewport or loss of function at 200%
  zoom. Dialogs manage focus and return it on close.
- Load tool-specific code only on its page. Share CSS and common modules, and keep
  image/media assets small. Basic operation must not depend on an external CDN.
- Timer state uses timestamp-based elapsed-time calculation, not interval tick
  counts. Handle paused state, sleeping devices, reloads, and concurrent tabs
  without duplicate history entries. Background sound delivery is best effort.
- Test midnight changes and local dates. Explain word-count rules for languages
  where whitespace does not reliably separate words.
- A new version must preserve existing data and remain usable with old backups
  through documented migration or explicit rejection without data changes.

## Deployment and release acceptance

Use static HTML, CSS, and JavaScript modules as the initial implementation
direction. Package/build tooling may be introduced when it has a concrete
benefit. It must continue to produce static files for GitHub Pages.

Before the first public release, verify:

- [ ] All seven tools meet the functional requirements; no placeholder controls.
- [ ] Direct links and page reloads work under `/personal-toolkit/` and at a host root.
- [ ] Create/edit/delete and persistence work after reload and browser restart.
- [ ] Full and per-tool export/restore round trips preserve supported data.
- [ ] Invalid, oversized, unsupported, and script-bearing imports do not corrupt
      data, run code, or make unexpected network requests.
- [ ] A failed write/upgrade/restore preserves existing data and displays an error.
- [ ] Multiple tabs do not silently overwrite edits or double-count timer sessions.
- [ ] Timer and habit behavior passes pause/resume, sleep, reload, and date-boundary checks.
- [ ] English/Vietnamese, theme settings, keyboard navigation, zoom, and mobile layout work.
- [ ] Test current stable Chrome, Edge, Firefox, and Safari where available, including
      an Android and iOS browser. Record any unavailable coverage honestly.
- [ ] Network inspection confirms no unexpected third-party requests or personal-data uploads.
- [ ] HTTPS and CSP work in production; generated assets contain no secrets.
- [ ] README includes real screenshots, setup steps, a verified demo link, known
      limitations, and actual verification results.

## References

- [MDN: browser storage limits and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [OWASP: HTML5 security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [GitHub: HTTPS for Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
