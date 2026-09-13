# Personal AI Consulting Group — web

A simpler, private, mobile-first browser product for genuine consultant and Critic discussion, live research and practical decisions.

**Current phase: review, product brief and interactive design.** There is no production backend, real authentication, AI integration or database in this repository. No GoDaddy resource has been changed.

- [Product idea](docs/product-idea.md) — the recreated current brief.
-  — findings and all legacy decision dispositions.
- [Proposed architecture](docs/architecture.md) — one Node app, one database, durable consultation work.
- [Models to preserve](docs/model-settings.md) — exact recorded values and evidence limits.
- [Design](docs/design.md) — interaction/content rules and candidate scope.
- [Verification](docs/verification.md) — actual checks and unresolved limits.
- [Source provenance](docs/source-provenance.json) — consumed source hashes and job-to-design mapping.
- [GoDaddy boundary](docs/deployment-boundary.md) — only the existing consulting app and its own verified data.

## Try the design

Requires Node.js 22 or newer. No dependencies or installation step.

```sh
npm start
```

Open the localhost URL shown in the terminal. Alternatively open `prototype/index.html` directly. The review toolbar switches between sign-in, conversation, empty and recovery states. The discussion is a clearly labelled fictional example; typing does not call an AI provider. Drafts and attachment filenames stay in the current tab and disappear on reload.

```sh
npm run check
```

The source repository is public; the intended application remains private to one owner. Do not add private conversation archives, provider grants, secrets or deployment data to Git.
