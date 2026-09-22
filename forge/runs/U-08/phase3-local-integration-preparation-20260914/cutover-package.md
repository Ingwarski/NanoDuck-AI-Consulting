# U-08 cutover package — preparation only

**Status:** prepared locally; not deployment authorization; not release evidence.

This package describes the evidence and execution sequence required before any replacement cutover. It does not authorize connecting a live provider, publishing to GoDaddy, migrating a database, resetting tables, or changing another application. It contains no credentials, owner identifiers, conversation data, or database content.

## Bound inputs

| Input | Value |
|---|---|
| Approved visual baseline | `nanoduck-electric-a-v8-20260914` |
| Current development plan hash | `1687bb3f44dfad54074e252bd5b3dc9c19631fe67510e7ceff1aba38407e1843` |
| Candidate tree hash | `1de020dcfe48f3feb80db0e58ba911b821825b48730d32c72d9518ad512eb0d9` |
| Candidate target hash | `93231814431a1bbbf8a0ba07f515eefcfd63193534189898b70766ed45938cbc` |
| Runtime | Node.js 22 or later; package engine is `>=22` |
| Locked production dependencies | `google-auth-library` 11.0.2; `mysql2` 3.24.2; lockfile SHA-256 `987e7047e66f3dd725de77d9233088e6d22e2a04132dea44cee4f1a78e43e084` |

Use the exact committed application revision chosen for cutover, then regenerate a release evidence receipt against that revision. A local health endpoint, source push, or this package does not establish a live release.

## Production artifact and configuration inventory

Build only from the committed public repository using `npm ci`; do not copy a local `node_modules` tree. Keep all values in the hosting secret store and outside Git.

| Required production setting | Required form / control |
|---|---|
| `NODE_ENV` | `production` |
| `APP_ORIGIN` | clean HTTPS origin, no credentials, path, query or fragment |
| `PORT` | positive integer supplied by the host |
| `DATABASE_URL` | replacement database connection string held only as a secret |
| `DATABASE_SSL_CA_PATH` | mounted CA file; MySQL verification remains enabled |
| `DATA_ENCRYPTION_KEY` | base64url 32-byte key |
| `RECOVERY_ENCRYPTION_KEY` | separate base64url 32-byte key, distinct from the data key |
| `SESSION_SIGNING_KEY` | base64url key of at least 32 bytes |
| `OWNER_GOOGLE_SUBJECT` | sole permitted Google owner subject |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | registered for the exact HTTPS origin only |
| `CODEX_APP_SERVER_AUTH_PATH` | mounted, scoped Codex authentication file; never committed or exported |
| `SESSION_ABSOLUTE_SECONDS` | `86400` |
| `MAX_ATTACHMENT_BYTES` | `8388608` or less |
| `CODEX_APP_SERVER_COMMAND` | optional controlled executable path; default `codex`; verify before use |

Before any publication, verify the active provider tuple by an allowed invocation: Head/specialists `gpt-6-astra` / `xhigh` and Critic `gpt-6-astra` / `xhigh`. Do not substitute a different model, reasoning strength, paid fallback, or provider route.

## Required ownership and evidence before a cutover decision

No named operational owner or deadline has been supplied for the following release tasks. They remain explicit blockers rather than inferred assignments.

| Required result | Accountable role | Deadline | Evidence / stop condition |
|---|---|---|---|
| Confirm the exact GoDaddy application and replacement source/revision | user-authorized deployment operator | before cutover authorization | Stop if the selected app, attached repository, domain or runtime differs from the approved scope. |
| Prove exclusive database/table ownership on the live target | database operator | before any migration or reset | Stop if any shared, unknown or non-NanoDuck table/resource appears. A prior dashboard observation is insufficient on its own. |
| Establish backup, recovery rehearsal, RPO/RTO and incident contact | database and incident operator | before any destructive step | Stop if the backup cannot be restored in an isolated target or the owner/deadline is unassigned. |
| Run actual Safari/Chrome, assistive-technology, forced-colors, 200% text and representative-owner tasks | QA owner and sole product owner | before release claim | Stop release if an applicable QA/DoD gate lacks fresh evidence or has a blocking finding. |
| Confirm dependency update and incident response route | deployment operator | before publication | Stop if no responsible operator, monitoring/log-access path or rollback contact is available. |

## Compatible migration and rollback sequence

1. Obtain a separate explicit cutover authorization that names the exact app and target database after the preceding identity and ownership checks. Re-check the scope immediately before acting.
2. Record the exact deployment revision, Node runtime, dependency-lock hash, configuration **names** and masked confirmation that every required secret is mounted. Do not record values.
3. Create and verify an isolated encrypted recovery backup using the separate recovery key. Record the recovery artifact location only in protected operations records, not in this public repository.
4. Run `npm ci`, then `npm run migrate` only against the proven target. The current schema uses `CREATE TABLE IF NOT EXISTS` for the eight `nanoduck_*` tables; it contains no `DROP`, `TRUNCATE`, or `DELETE FROM` statement. This migration only creates its owned tables.
5. Treat any database deletion as a separate destructive action. It may occur only after fresh scope confirmation proves it belongs exclusively to the named consulting app and the backup/recovery check has passed. Do not generate a broad deletion command.
6. Run the post-cutover gates on the live artifact: owner sign-in/consent, 24-hour session behavior, selected provider tuples, real research and source filtering, Safari/Chrome Ukrainian voice, protected JPEG/PNG/WebP path, stop/continue/recovery, logging and restart behavior.
7. On any required-gate failure, revoke the new session/provider route as appropriate, return the app to the prior known-good revision, and restore only through the verified isolated recovery procedure. Do not use a health endpoint alone as a rollback decision.

## Release decision criteria

A release can be claimed only after all 82 canonical QA checks and all six DoD gates have current, scoped results, representative-owner tasks are observed, and the target/rollback evidence is complete. This prepared package deliberately leaves those checks `not_run` until their actual seam and owner are available.
