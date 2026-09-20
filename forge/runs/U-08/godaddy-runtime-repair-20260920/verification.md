# GoDaddy runtime repair — 20 September 2026

Scope: NanoDuck app `wy2v0putg6` only. The owner explicitly requested finding and fixing the reported port failure. No other hosted app was changed.

## Cause

The application already used GoDaddy's `PORT` and bound the production listener to `0.0.0.0`. The port warning was a consequence of application startup/shutdown failures:

1. GoDaddy's Hosted Database settings explicitly identify Preview and Published as sharing one managed database. Both processes attempted to own NanoDuck's exclusive database lock. A controlled Published restart failed before listening with `Stop the application before migrating its database.` Removing exclusivity would allow competing migration and consultation recovery processes.
2. After isolating Preview, Published started and then shut down with `NanoDuck database leadership lost (UNKNOWN_DATABASE_ERROR)`. A Published-only restart, with Preview untouched, reproduced the failure after about one minute. The reserved lock connection received no traffic from ordinary pooled queries. The corrected deployment subsequently reported the live MySQL session's idle timeout as 60 seconds.

## Change and deployment

- `ede3a09d2dcccc9c8165c5d18858941d6721d4d6`: explicit Preview staging role, with no database, authentication, migrations or provider execution. Set `NANODUCK_DEPLOYMENT_ROLE=preview` only in GoDaddy Preview. Published retains its application role and existing origin and credentials.
- `f34942c3c9f9238a3d5d8e74a3b4ea7898165283`: heartbeat on the same reserved MySQL connection, every 15 seconds on this host, verifying that the connection still owns the lock. Probes are bounded and cannot overlap. Loss of ownership shuts down without reacquisition, including during startup. Diagnostics normalize numeric MySQL idle error 4031 without logging connection details.
- Updated Preview from GitHub, verified its exact revision, then published the same revision. Skipped optional environment synchronization so Preview's role and bootstrap setting were not copied into Published.
- Published logs at 15:19:46 UTC reported `session idle timeout=60s, heartbeat=15000ms` and `0.0.0.0:20011 (mode=production)` on Node.js 22.23.2. Preview uses `0.0.0.0:20010` with its backend disabled.

Preview is now a deployment staging/status page, not a second consultation environment. A functional concurrent Preview requires its own isolated database. No database reset, key rotation or unrelated resource change was performed.

## Verification

- Local Node.js 22.23.2 full check: 143 passed, 0 failed, 2 MySQL integration tests skipped because no disposable MySQL service was configured locally.
- [GitHub CI for the deployed revision](https://github.com/Ingwarski/NanoDuck-AI-Consulting-Group/actions/runs/35519137810): 145 passed, 0 failed, 0 skipped, including real MySQL 8.4. The new regression sets a disposable leased session's idle timeout to two seconds, waits 3.2 seconds without application traffic, and proves the original connection retains ownership, a duplicate is rejected, and normal close releases the lock.
- Independent code review covered heartbeat timing, deadlines, cleanup, late completions, ownership loss and startup shutdown handling.
- Live HTTP at 15:20:54 UTC: `/` and `/client/app.js` returned 200; the root served the application rather than the staging page. `/api/session` returned 200 with `authenticated: false` and `development: false`; `/api/conversations` returned 401 `authentication_required`.
- Sustained `/healthz` checks returned 200 with `status: alive` and `store: mysql` from 15:19:47 through 15:25:14 UTC, exceeding five consecutive 60-second idle periods. Response headers confirmed `cache-control: no-store` and `cf-cache-status: DYNAMIC`.
- Restarted Preview at approximately 15:22:15 UTC. GoDaddy confirmed success, Preview logs again showed its backend-disabled staging listener, and Published checks remained successful throughout and for more than two minutes afterward. Published logs showed no additional startup or leadership loss after the 15:19:46 deployment.
- GoDaddy's Published tab showed revision `f34942c`, infrastructure OK and site OK. Local `main` and the live GitHub branch matched the deployed implementation before this evidence-only receipt was added.

## Limits

The authenticated GoDaddy dashboard and runtime logs were inspected in Chrome, and the staging page was checked in a real local browser. Opening the live application in the browser tool returned `net::ERR_BLOCKED_BY_CLIENT`; direct HTTPS was available. This receipt does not claim a new authenticated owner session or provider consultation test. No private conversation, credential, cookie or share token is recorded here.
