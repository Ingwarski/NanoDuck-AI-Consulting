# Security automation

This configuration belongs to `Ingwarski/NanoDuck-AI-Consulting`.

- GitHub CodeQL uses its Extended security suite for JavaScript/TypeScript,
  Python and GitHub Actions. GitHub manages push, pull-request and weekly runs.
- Dependabot alerts and security updates are enabled. Routine npm version PRs
  are disabled to preserve reviewed provider pins; security PRs remain enabled.
  GitHub Actions updates are checked weekly. Nothing is merged automatically.
- GitHub secret scanning and push protection are enabled.
- Gitleaks scans complete reachable Git history. Its executable is pinned and
  checksum verified. Findings fail the job; public summaries contain counts and
  locations only. Raw reports and logs are temporary, redacted and deleted.
- zizmor reviews workflows and uploads findings to GitHub code scanning.
  A successful upload does not mean a report contains no findings.

Application CI checks Node.js 22 and 24 on macOS, Linux and Windows. Browser
checks exercise Chromium, Firefox and WebKit against disposable local data and
synthetic provider responses. These are separate from real subscription access
and physical-device acceptance.

Review the repository Security tab and workflow summaries. Never publish
matched secret values, private records, credentials or local configuration.
Actions are pinned to commit SHAs. Review dependency changes before merging.
