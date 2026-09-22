# Neo source import

22 September 2026. The owner explicitly chose to import Neo into the new public
[`Ingwarski/NanoDuck-AI-Consulting`](https://github.com/Ingwarski/NanoDuck-AI-Consulting)
repository.

## Source and repository identity

- Source: [`Ingwarski/NanoDuck-AI-Consulting-Group-Neo`](https://github.com/Ingwarski/NanoDuck-AI-Consulting-Group-Neo).
- Source branch: `main`.
- Source commit: [`a6f5d47303a7fa785a588e036ad39636b99a5dff`](https://github.com/Ingwarski/NanoDuck-AI-Consulting-Group-Neo/commit/a6f5d47303a7fa785a588e036ad39636b99a5dff).
- Source Git tree: `508fcc6ac5742d9e7fd0d76c0ea43b20b443dd3a`.
- Destination's initial commit: `4f9e23bc52204d431dd7a9ba191def1c8a2163c4`.

The source head matched the handoff when checked on the import date. The import
preserves Neo's commit history and the destination's initial commit. Only the
destination repository is configured as a remote; no source synchronization is
configured, and no changes are pushed to either predecessor repository.

The application, dependency pins, runtime instructions, model settings, `docs/`,
SDD manifest, frozen design versions and receipts retain their source bytes.
Import-specific edits are limited to repository guidance, README, this record,
GitHub security-automation documentation and ignoring local Wrangler state.
The product name remains NanoDuck Consulting Group.

## Verification and inherited limits

Neo's Application checks, Security scans and CodeQL succeeded at the exact source
commit. A fresh GitHub read on the import date found zero open code-scanning and
Dependabot alerts in Neo. Those results belong to the source repository; the
destination's own runs and settings require separate verification. Neo's open
Dependabot PR #1 is not part of this import and was not merged.

Local verification used Node.js `22.23.2`: `npm ci` reported zero dependency
vulnerabilities, and `npm run check` passed the artifact checks and 157 tests.
Two optional real-MySQL tests were skipped because no test database was supplied.
No live database or provider was used. The destination's SDD audit returned the
same 42 issues as the source audit; the import introduced no additional issue.

The installed SDD checker found 42 `stale_source` bindings in the unmodified
source checkout, affecting `dod-evals`, `qa-checklist` and `development-plan`.
This is an inherited consistency gap, not a successful SDD audit. Preserve the
records and reconcile those owners in dependency order before new implementation;
do not merely replace hashes or mark unexecuted release checks as passed.

The imported documents contain dated GoDaddy and early implementation statements.
They remain historical evidence with their original scope. Current repository
identity is defined above and in `AGENTS.md`; historical deployment permissions
do not authorize actions from this import.

## Deployment boundary

No live deployment, real-provider call, production credential read or live
database migration is part of this import. The existing Northflank Sandbox
service/database and OAuth-compatible `nanoduck-neo` Worker remain Neo resources.
`wrangler.jsonc` still names that Worker, so `npm run edge:deploy` is a live
infrastructure action requiring explicit current authorization and exact-target
verification. Do not connect the new repository to a host automatically.

For a later authorized release, follow `docs/northflank-deployment.md`: keep MySQL
private, keep the shared origin key only in provider secret stores, use the
public Worker origin for `APP_ORIGIN`, and scale the application to zero before
selecting a new build and returning to one instance. Repository tests and scans
do not prove live sign-in, provider execution, consultation quality, persistence,
recovery, backup/restore or memory capacity. The GoDaddy predecessor remains
outside scope.
