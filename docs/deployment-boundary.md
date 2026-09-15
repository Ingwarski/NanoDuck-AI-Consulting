# Deployment boundary

Deployment boundary updated 15 September 2026. The only completed target mutation is the GitHub-source switch described below.

The authenticated GoDaddy dashboard identifies **Personal AI Consulting Group**, app ID `wy2v0putg6`, hostname `wy2v0putg6.c35.airoapp.ai`, Node.js 22 and Europe region. On 15 September, its GitHub integration was switched to `Ingwarski/personal-ai-consulting-web` on `main`, replacing only this app's future source. Preview is not yet synchronized. No secret, table, row, preview build or publication changed in that switch.

The user permits erasure of this app and its database to use the replacement, while prohibiting changes to every other GoDaddy app and resource. The startup migration is idempotent and creates or updates only `nanoduck_*` tables plus its encrypted owner-instruction record.

The current saved active Codex model settings have been read without exporting conversation content: Head/specialists and Critic both use `gpt-6-astra` / `xhigh`, with a legacy Balanced preset. The inactive Claude branch remains unknown. This historical GoDaddy observation does not define the replacement’s separate specialist-count and discussion-depth controls. Before the eventual reset, verify selected-provider grants can be recovered or reauthorized and use the approved replacement cutover package to target only the nine recorded tables. No executable DROP statement or deletion command is provided because reset is outside this audit.

Other GoDaddy apps, their data, shared/unidentified tables, domains and credentials are outside scope. If attachment or ownership is ambiguous, stop that deletion and ask about the exact ambiguous resource. Do not interpret an app attachment as ownership of everything in a database.

Before publishing the replacement, validate the actual Node runtime, persistent jobs and storage, restart/redeploy behavior, authenticated browser streaming or polling, provider access, logs and recovery within this app. GoDaddy injects this app's `DB_*` connection values and exposes encrypted environment secrets rather than a mounted-secret facility: NanoDuck builds the MySQL connection from those values, requires certificate verification, and receives the protected Codex `auth.json` only as `CODEX_APP_SERVER_AUTH_B64`, which it writes solely into the temporary owned app-server home for each provider connection. A successful build or health endpoint alone is insufficient.
