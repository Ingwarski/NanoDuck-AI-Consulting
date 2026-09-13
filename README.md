# Personal AI Consulting Group — web

A simpler, private, mobile-first browser product for genuine consultant and Critic discussion, live research and practical decisions.

**Current phase: review, product brief and interactive design.** There is no production backend, real authentication, AI integration or database in this repository. No GoDaddy resource has been changed.

- [Product idea](docs/product-idea.md) — the recreated current brief.
-  — findings and all legacy decision dispositions.
- [Proposed architecture](docs/architecture.md) — one Node app, one database, durable consultation work.
- [Models to preserve](docs/model-settings.md) — exact recorded values and evidence limits.
- [Design brief](docs/design-brief.md) — three directions and shared experience rules.
- [Screen map](docs/screen-map.md) — 9 surfaces and 44 review states.
- [SDD manifest](forge/sdd-manifest.json) — source hashes, traceability and design-stage progress.
- [Verification](docs/verification.md) — actual checks and unresolved limits.
- [Source provenance](docs/source-provenance.json) — consumed source hashes and job-to-design mapping.
- [GoDaddy boundary](docs/deployment-boundary.md) — only the existing consulting app and its own verified data.

## Compare the three designs

Requires Node.js 22 or newer. No dependencies or installation step.

```sh
npm start
```

Open the localhost URL shown in the terminal for the side-by-side interactive comparison.

- [A — Cobalt](http://127.0.0.1:4328/a/v2/): white and electric blue, an open central discussion.
- [B — Ember](http://127.0.0.1:4328/b/v2/): charcoal and orange, with a desktop decision rail.
- [C — Prism](http://127.0.0.1:4328/c/v2/): violet, bold geometry and yellow Critic accents.

Current copies are v2, bound to the corrected SDD and visually identical to preserved v1. The document/ownership audit passes; final Safari revalidation is waiting for the Mac to be unlocked. See the [audit record](docs/sdd-consistency-audit.md).

All three include a floating desktop menu, mobile hamburger, literal Settings, model and reasoning selectors, and an editable simulated voice transcript. The review state selector exposes 44 states. English and Ukrainian discussion fixtures are included. Typing does not call an AI provider; microphone flows use sample data. Drafts and preferences stay in page memory and disappear on reload.

The original green design in `prototype/` is rejected historical evidence. It is not an approved baseline. The pipeline awaits one whole-design choice or revisions before post-approval planning; production implementation still requires a separate explicit prompt.

```sh
npm run check
```

The source repository is public; the intended application remains private to one owner. Do not add private conversation archives, provider grants, secrets or deployment data to Git.
