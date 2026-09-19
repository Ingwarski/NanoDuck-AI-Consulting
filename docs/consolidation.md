# Repository consolidation — 19 September 2026

The owner authorized `Ingwarski/personal-ai-consulting-web` as the canonical application repository. The GoDaddy-named predecessor is a separate Git repository, not a branch or worktree. The source comparison used web revision `51be196a5dfb83921bf2f4274dbb2c98fe840a7a` and predecessor revision `4daa1f80ec7039b3ac580c319ffadb3517ccc150`.

This change adapts the approved fixes to NanoDuck's existing browser application. It preserves Electric A v8, the selected provider/model vocabulary, complete specialist-and-Critic review, the existing `nanoduck_*` records and the existing data-encryption key interpretation. It does not replace the application with the predecessor's interface or database schema. The predecessor's remote remains a recovery reference.

## Implemented fixes

| Concern | Implementation | Verification |
|---|---|---|
| Instructions required a bootstrap secret | Public defaults in `instructions/`; existing private database revisions win; obsolete bootstrap variables are ignored | Bootstrap preservation and HTTP tests |
| Four consulting documents were unavailable in Settings | Fixed-name allowlist, encrypted append-only versions, 64 KiB document limit, revision checks, history review and default restore | Memory, HTTP, browser and MySQL integration tests |
| Repository-oriented consulting instructions conflicted with the browser workflow | Adapted public guidance for the app's orchestrated roles; removed local chat-server/file instructions; retained practical consulting principles | Manual source review; existing complete-team regression suite |
| Accepted run snapshots stored private instructions as plaintext JSON | Encrypted snapshots with repeat-safe, bounded migration of existing rows using the existing data key | Snapshot authentication tests; MySQL storage inspection |
| Duplicate request could start another provider execution | Idempotency checks include the submitted content; replayed requests cannot start a second execution | HTTP/store regressions and concurrent MySQL acceptance |
| Restart or cancellation could repeat work or leak a process | Restart fences interrupted runs and requires Continue; Stop drains the old execution; initialization failures and cancellation reap provider processes before deleting credentials | Restart/Continue tests and synthetic process failure tests |
| Multiple app processes could share a worker queue | MySQL advisory lease scoped to the database; migrations and restores require the same lease; lost lease stops the app | Two-database and same-database integration tests |
| Incomplete recovery | Encrypted backup includes conversations, linked images, tombstones, settings and complete instruction history; configuration replacement is explicit | Authenticated recovery round trips and MySQL restore |
| Deleted records retained titles and run snapshots | Generic deletion title; all run statuses lose snapshots; restoration preserves tombstones | Memory and MySQL deletion/recovery tests |
| Provider/account and request boundaries | Unsupported API-key, custom-endpoint, paid-fallback and Fast Mode variables rejected; secret-like message gate; same-origin CSRF for mutations including logout; fixed session maximum; development binds loopback | Config, auth and HTTP tests |
| Runtime and test drift | Node 22 requirement, bounded MySQL pool and queue, request limits, graceful shutdown, neutral CI with disposable MySQL 8.4 | `npm run check`; GitHub Application checks |

Managed documents are guidance, not executable authorization. The application still enforces role order, process tool restrictions, authentication, provider selection and immutable accepted snapshots. The content classifier is a conservative check, not proof that all unflagged text is public. Live provider behavior remains outside this consolidation's verification.

## Recovery

1. Verify the exact database and ensure its current encryption keys are available through the deployment secret store. A repository move does not require new keys or re-encrypting existing conversations.
2. Run `npm run recovery -- backup <new-encrypted-file>`. It creates a new mode-0600 file, refuses to overwrite an existing file, and rejects envelopes above 32 MiB. Keep the separate recovery key outside the backup and outside Git.
3. For recovery, stop the application first. Restore requires the database lease and refuses to overlap an active app process. Apply the schema to a verified empty recovery target when needed.
4. Run `npm run recovery -- restore <encrypted-file> --confirm-restore` to recover missing records while preserving current configuration. Deletions take precedence over older backups. Completed messages are restored; provider executions are never restarted by a backup restore.
5. Add `--replace-configuration` only when intentionally restoring the saved settings and instruction histories as well. This atomically replaces current configuration and revokes browser sessions. Without the option, saved configuration remains untouched. Earlier version-1 record-only backups remain readable.
6. Restart, sign in, and verify records, settings and current instruction versions before allowing consultations. Restore does not import provider credentials, encryption keys or active browser sessions.

Backups above the bounded envelope size need a separately designed streaming format. No unbounded or silently truncated backup is produced.

## Verification and deployment boundary

The local test suite uses synthetic owner accounts, temporary credential files, fake provider executables and an in-memory development server. Browser verification covered document selection, saving, reviewing history and restoring a previous version through a new save. On Node 22.23.2, `npm run check` passed 134 tests; the separate MySQL integration test was skipped locally because no disposable MySQL service was installed. MySQL integration runs against newly created disposable loopback databases and verifies encrypted storage, concurrent conflicts, leadership scope, full recovery and deletion.

The GoDaddy integration UI was read on 19 September: it is connected to `personal-ai-consulting-web/main` and says to pull repository changes to update the app. Published still displayed `473d2d8d168161e0a0e5ae738707e37a0d8d7c9c`. No Update Preview, Publish, restart, hosted migration or key change is part of this work. Repository checks are not live-release verification. No security scan was started.

This implementation note supersedes earlier bootstrap-secret and automatic-restart descriptions for the changed behavior only. Frozen design receipts and earlier deployment evidence remain historical records; no new formal SDD validation or release approval is claimed here.
