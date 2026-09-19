# Working in this repository

Canonical source: `Ingwarski/personal-ai-consulting-web`. Verify the checkout root and remote before repository operations. The retired local GoDaddy-named repository is a separate predecessor, not a branch or worktree of this one. The owner authorized consolidation on 19 September 2026; see `docs/consolidation.md`. Do not change repositories implicitly.

This repository contains NanoDuck Consulting Group, a private browser application for the owner’s consultant and Critic discussions.

- Read `docs/product-idea.md` as current intent and `docs/prd.md` as its specification. `docs/architecture.md` defines the application architecture.
- Use the installed `to-sdd-pipeline` contract for dependencies and ownership. Each named domain skill owns its document; `to-project-context` owns the context/terms bundle together. Only the orchestrator writes `forge/sdd-manifest.json`. Run the pipeline checker before and after each owner invocation, declare all consumed sources, and revalidate affected downstream owners in order. Later evidence references never become creation prerequisites.
- Current phase: Electric A v8 approved and Phase 3 implementation is authorized by `forge/runs/implementation-prompt-20260914.json`. Read `docs/development-plan.md` for the source-bound implementation handoff. Do not deploy, connect a live provider, run database migrations against a target, or delete GoDaddy resources without separately verified target scope and authorization.
- Electric A v8 is the approved baseline in `docs/design-brief.md`; B/C are unchosen comparison references. Current candidates are the three active versioned entries in `forge/sdd-manifest.json`, under `forge/design/candidates/`; the README links their comparison. `prototype/` and `docs/design.md` are rejected historical material. Preserve frozen versions and receipts; revisions receive new versions. Never present simulated conversation, login, research, voice or recovery as live backend evidence.
- Preserve the exact saved models and settings; see `docs/model-settings.md`. Historical snapshots are not current entitlement evidence.
- Public repository: do not commit secrets, provider grants, private conversations, owner identifiers, financial/medical details or local absolute paths. Local review transcripts remain ignored.
- Keep changes small and usable. Prefer one app, one server, one database; retain durability, cancellation, privacy and truthful state.
- Only the named GoDaddy app and its verified own data are in deployment scope; no other app is in scope.
- Verify changed prototype flows in a real browser. Commit and push completed repository changes after inspection.
