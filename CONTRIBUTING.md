# Contributing

Personal Toolkit is a working, unreleased prototype. Feedback on the
[requirements](docs/requirements.md) and [roadmap](docs/roadmap.md) is welcome.

## Before starting

- Check existing issues and pull requests for related work.
- For a large feature or architectural change, open an issue describing the user
  problem and tradeoffs before implementation.
- Keep pull requests focused. Include English and Vietnamese interface text when
  adding user-facing behavior. Translation suggestions in either language are welcome.

## Reporting a bug

Include the tool/page, browser and OS, steps to reproduce, expected behavior, and
actual behavior. Use synthetic examples. Remove personal content from screenshots
and never upload your real backup file.

For security concerns, follow [SECURITY.md](SECURITY.md) instead of posting
exploit details in a public issue.

## Submitting a change

1. Create a branch or fork for your change.
2. Explain what changed and which user problem it solves.
3. Describe verification performed and coverage you could not complete. Add tests
   for behavior where data integrity or security could regress.
4. Include screenshots for visible UI changes using example data only.
5. Check that no secrets, personal exports, or unrelated generated files are included.

Use Node.js 22 or newer. No dependencies need to be installed:

```sh
node scripts/serve.mjs
node --test tests/*.test.mjs
node scripts/check.mjs
node scripts/build.mjs
```

Run checks in another terminal while the server is running; stop it with Ctrl+C.
`/tests/browser.html` checks isolated IndexedDB behavior without modifying toolkit
data. `/tests/layout.html` shows real pages in 360px frames. The build copies only
website files into a fresh `dist/` directory.

Do not add a live-demo link or a passing-check badge before it is real.

## Licensing and communication

Submit only work you have the right to contribute. Contributions are intended
to be distributed under the project's [MIT license](LICENSE); identify any
third-party material and preserve its applicable notices.

Be respectful, describe problems concretely, and give others time to respond.
This is a volunteer project without a guaranteed support response time.
