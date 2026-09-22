# Working in this repository

Canonical source: `Ingwarski/NanoDuck-AI-Consulting`. Verify the Git root and
remote before repository operations. This directory is an independent checkout;
do not change any containing or neighboring repository.

NanoDuck Consulting Group is a private local web application. It runs on macOS,
Linux and Windows and supports browsers on the same computer or private local
network. Preserve password authentication, HTTPS, origin/CSRF checks, encrypted
durable local storage, cancellation and truthful provider availability.

- Read `docs/product-idea.md`, `docs/prd.md` and `docs/architecture.md` for current
  intent, requirements and architecture.
- Follow the installed `to-sdd-pipeline` dependency and ownership contract. Each
  domain skill owns its document; `to-project-context` owns context and terms
  together. Only the orchestrator writes `forge/sdd-manifest.json`. Run its
  checker before and after owner invocations and reconcile affected descendants
  in order. Later evidence references are not creation prerequisites.
- Use `docs/development-plan.md` and the manifest for current implementation
  authority and verification status. User instructions govern this task's scope.
- Electric A v8 is the approved visual foundation in `docs/design-brief.md`.
  Preserve its frozen evidence and distinguish design simulations from working
  authentication, persistence, research, voice and provider integrations.
- Preserve exact model choices in `docs/model-settings.md`. Do not silently
  substitute models or enable metered API routes.
- Keep private state outside the source tree. Do not commit secrets, provider
  grants, personal identifiers, private conversations or local absolute paths.
- Use portable Node entry points and platform-derived data paths. Never assume
  POSIX shell syntax, one browser engine or a particular user's home directory.
- Verify changed flows in real browsers, inspect the final diff, then commit
  and push completed changes to this repository only.
