# Security automation

This setup belongs to `Ingwarski/NanoDuck-AI-Consulting-Group-Neo`. It does not
connect the original checkout or repository to Neo and has no deployment access.

## Coverage

- GitHub-managed CodeQL default setup uses the Extended security suite for
  JavaScript/TypeScript, Python and GitHub Actions. GitHub manages its push,
  pull-request and weekly triggers. The archived macOS Swift locale probe is
  outside this configuration; no complete audit of every language is claimed.
- Dependabot alerts and security-update PRs are enabled in repository settings.
  The npm configuration permits security PRs while disabling routine version
  PRs. GitHub Actions version updates are checked weekly with a seven-day
  release cooldown; security updates are not delayed by that cooldown.
  No automatic merge is configured, and provider package/model choices are not
  changed by a scan.
- GitHub secret scanning and push protection remain enabled.
- Gitleaks scans all fetched Git history on main pushes, pull requests, manual
  dispatch and the weekly schedule. Its release archive is checksum-verified.
  Findings fail the job. Public logs and summaries contain counts and locations
  only; raw reports and scanner logs stay temporary and are deleted after use.
  `.gitleaksignore` excludes four reviewed historical fingerprints: one in-memory
  unit-test signing key and three source hashes verified against their files at
  the recorded commits. New occurrences are still scanned; no whole-file or
  rule-wide exceptions are configured.
- zizmor audits GitHub Actions on the same triggers and publishes findings to
  GitHub code scanning. A successful SARIF upload can contain findings: a green
  workflow alone does not mean that the audit is clean.

Review CodeQL/zizmor and Dependabot in the repository Security tab. Review
Gitleaks counts and locations in the Security scans workflow summary. Treat
potential secrets as findings requiring validation; never paste their matched
values into an issue, pull request, public log or report artifact.

The scans use standard GitHub-hosted Linux runners, no deployment secrets and
no paid scanner service. Findings need triage; the scanners do not verify live
hosting, provider entitlements, owner authentication flows or recovery behavior.
Application checks run separately against disposable MySQL.

## Maintenance

Actions are pinned to commit SHAs. Review Dependabot PRs before merging. The
Gitleaks version/checksum and the zizmor version are explicit pins in
`workflows/security.yml`; update them together with current upstream evidence.
The 15-minute check requested for the first scan batch is a temporary Codex task
monitor, not a recurring GitHub scan or a service deployed by this repository.
