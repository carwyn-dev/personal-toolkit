# Security policy

## Project status

The application is not released yet. There are no supported production versions
or guarantees of a security response time. Security fixes will initially target
the current default branch; a version support policy will accompany releases.

## Reporting a vulnerability

Use **Security > Advisories > Report a vulnerability** on GitHub if private
vulnerability reporting is available. Repository maintainers should enable this
feature before the first public release.

If that private option is unavailable, open a minimal public issue requesting a
private reporting channel. Do not include exploit payloads, credentials, personal
data, or reproduction details that expose users. Wait for a private channel
before sharing sensitive technical details.

A report should describe the affected page/version, impact, and reproducible
steps using synthetic data. Never access another person's data or test against
their device. Do not upload real backups.

## Storage limits

Browser storage and JSON exports are not an encrypted vault. Avoid storing
credentials or other secrets. Content is accessible to code running in the same
origin and potentially to a person with browser-profile access. Separate GitHub
Pages repository paths do not provide storage security isolation.

For the planned controls and their limits, see the
[security requirements](docs/requirements.md#security-and-privacy-requirements).

## Accidentally published credentials

Revoke or rotate the credential immediately. Deleting the latest copy does not
remove it from Git history or existing forks. Follow
[GitHub's sensitive-data removal guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
as needed. Do not repost the credential in an issue.
