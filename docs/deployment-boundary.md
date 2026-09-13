# Deployment boundary

Design/review only, 13 September 2026. No GoDaddy changes were made.

The user permits erasure of this app and its database to use the replacement. Their later scope answer keeps this task at review, product brief and design. Therefore erasure is deferred until the replacement phase; it is not required to deliver this design.

Before the eventual reset, the implementer must read the current model settings without exporting conversation content, verify the selected provider grants can be recovered or reauthorized, and identify the database and exact tables owned solely by this application. This review did not inspect a database identifier or prove that every attached table belongs to this app. No executable DROP statement or deletion command is provided because that boundary is unverified.

Other GoDaddy apps, their data, shared/unidentified tables, domains and credentials are outside scope. If attachment or ownership is ambiguous, stop that deletion and ask about the exact ambiguous resource. Do not interpret an app attachment as ownership of everything in a database.

Before publishing the replacement, validate the actual Node runtime, persistent jobs and storage, restart/redeploy behavior, authenticated browser streaming or polling, provider access, logs and recovery within this app. A successful build or health endpoint alone is insufficient.
