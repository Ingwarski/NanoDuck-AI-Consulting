# Northflank Sandbox deployment

This repository targets one Northflank Sandbox project containing one application service and one TLS-enabled MySQL addon. It is a private single-owner application, and the database, secrets and public endpoint belong only to this deployment.

## Container contract

Northflank builds the root `Dockerfile`. The image contains Node.js 22, the pinned Codex and Claude Code packages, the server, client assets and packaged instruction defaults. It runs as the unprivileged `node` user, writes provider homes only below the container temporary directory, listens on `PORT` (default `3000`) and serves `GET /healthz` after migration, database leadership and restart fencing succeed.

Create one public HTTP port targeting container port `3000`. Configure startup, readiness and liveness HTTP probes for `/healthz`. Allow enough startup time for the idempotent schema migration. Do not attach a persistent application volume: conversations, settings, instructions and encrypted image attachments live in MySQL.

## Database

Create one MySQL addon with TLS enabled before its first deployment. Link its private connection details to the application and expose one complete `DATABASE_URL`. If the addon certificate does not chain to the Debian system trust store, mount the addon CA certificate as a runtime secret file and set `DATABASE_SSL_CA_PATH` to its absolute mount path. Never disable certificate verification or expose MySQL publicly for the application.

NanoDuck holds a MySQL advisory lock for its full lifetime. Configure exactly one application replica and disable autoscaling. The default Northflank single-instance release starts the replacement before terminating the old container; that overlap is incompatible with the lock and startup migration. Keep automatic deployment disabled.

The first deployment is safe because no previous database leader exists. For every later release:

1. Scale the service to zero instances.
2. Wait until Northflank shows no active container.
3. Deploy or select the new successful build while the service remains at zero.
4. Scale the service back to one instance and wait for `/healthz`.

Do not use ordinary **Restart** or a secret group's **restart dependents** action while an instance is running; both can use replacement-first behavior. Pause/Resume is also unsuitable as the primary release sequence because Resume can start the previous build before the new build is selected. If the account exposes the `recreate` rollout strategy, it may replace this manual sequence after a verified restart rehearsal.

## Runtime variables and secrets

Use `.env.example` as the name inventory. Required production values are:

- `NANODUCK_RUNTIME_MODE=production`
- `APP_ORIGIN`, exactly matching the assigned Northflank HTTPS origin or custom domain
- `PORT=3000`
- private TLS `DATABASE_URL` and, only when needed, `DATABASE_SSL_CA_PATH`
- separate `DATA_ENCRYPTION_KEY`, `RECOVERY_ENCRYPTION_KEY` and `SESSION_SIGNING_KEY`
- `OWNER_GOOGLE_SUBJECT` or `OWNER_GOOGLE_EMAIL`, plus `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- exactly one Codex credential source; `CODEX_APP_SERVER_AUTH_GZIP_B64` is preferred on Northflank

`CLAUDE_CODE_OAUTH_TOKEN` and `CLAUDE_CODE_MODEL_CANDIDATES` are optional. Omitting the token keeps Claude unavailable without preventing the Codex-backed application from starting. Keep every credential in Northflank runtime secrets, never build arguments, image layers, repository files or logs.

Register `${APP_ORIGIN}/auth/google/callback` as an exact authorized redirect URI in the Google OAuth client after Northflank assigns the public hostname.

## Release verification

Before calling a release usable, verify the build and container checks, `/healthz`, fresh Google sign-in, Settings provider/catalog status, one real owner consultation, Stop/Continue after restart, encrypted attachment persistence and an isolated encrypted backup/restore rehearsal. Record peak memory during the consultation: source compatibility does not prove that both provider CLIs fit the Sandbox compute allowance.
