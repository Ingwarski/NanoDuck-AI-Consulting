# Working in this repository

This repository is the separate browser replacement for Personal AI Consulting Group.

- Use the installed `to-sdd-pipeline` contract for dependencies and ownership. Each named domain skill owns its document; `to-project-context` owns the context/terms bundle together. Only the orchestrator writes `forge/sdd-manifest.json`. Run the pipeline checker before and after each owner invocation, declare all consumed sources, and revalidate affected downstream owners in order. Later evidence references never become creation prerequisites.
- Current phase: review, product brief and interactive design only. The owner explicitly selected this scope. Do not implement or deploy the backend, connect live services or delete GoDaddy resources without a later implementation request.
- Current candidates are the three active versioned entries in `forge/sdd-manifest.json`, under `forge/design/candidates/`; the README links their comparison. `prototype/` and `docs/design.md` are rejected historical material. Preserve frozen versions and receipts; revisions receive new versions. Never present simulated conversation, login, research, voice or recovery as live backend evidence.
- Preserve the exact saved models and settings; see `docs/model-settings.md`. Historical snapshots are not current entitlement evidence.
- Public repository: do not commit secrets, provider grants, private conversations, owner identifiers, financial/medical details or local absolute paths. Local review transcripts remain ignored.
- Keep changes small and usable. Prefer one app, one server, one database; retain durability, cancellation, privacy and truthful state.
- Only the named GoDaddy app and its verified own data may be replaced in the later authorized phase; no other app is in scope.
- Verify changed prototype flows in a real browser. Commit and push completed repository changes after inspection.
