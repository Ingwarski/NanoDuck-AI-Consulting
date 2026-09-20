# NanoDuck Consulting Group

A simpler, private, mobile-first browser product for genuine consultant and Critic discussion, live research and practical decisions.

**Canonical repository: `Ingwarski/personal-ai-consulting-web`.** Electric A v8 remains the approved design. Repository consolidation and the transferred fixes are documented in [consolidation and recovery](docs/consolidation.md). Repository verification is separate from deployment status; this change does not release a hosted version. Use `NANODUCK_RUNTIME_MODE=production` on hosts that reserve `NODE_ENV` for Preview.

- [Product idea](docs/product-idea.md) — the recreated current brief.
- [Reconciled architecture](docs/architecture.md) — one Node app, one database, durable consultation work.
- [Models to preserve](docs/model-settings.md) — exact recorded values and evidence limits.
- [Development plan](docs/development-plan.md) — 8 implementation units, complete requirement/state coverage and release evidence.
- [Design brief](docs/design-brief.md) — NanoDuck identity, Electric palette and experience rules.
- [Screen map](docs/screen-map.md) — 9 surfaces and 44 review states.
- [SDD manifest](forge/sdd-manifest.json) — source hashes, traceability and design-stage progress.
- [Verification](docs/verification.md) — actual checks and unresolved limits.
- [Source provenance](docs/source-provenance.json) — approved design provenance and job-to-design mapping.
- [GoDaddy boundary](docs/deployment-boundary.md) — only the existing consulting app and its own verified data.

<a id="compare-the-three-designs"></a>

## Run the application locally

Requires Node.js 22. CI uses the same major version as the GoDaddy runtime.

```sh
npm install
npm run dev
```

Open [NanoDuck locally](http://127.0.0.1:3000/). Development mode exposes a local-only owner sign-in. Production mode requires a configured verified Google owner identity, HTTPS origin, a MySQL connection with certificate verification, separate data/recovery/session keys, and protected Codex app-server authentication. GoDaddy supplies the connection as `DB_*` values; other hosts can supply `DATABASE_URL` and an optional private CA file. Use [`.env.example`](.env.example) to see variable names; do not commit values.

### Packaged defaults and private instruction editing

A fresh database is seeded from the public Markdown files in `instructions/`. `RUNTIME_PROMPTS.md` defines the structured runtime contract. `AGENTS.md`, `CONSILIUM.md`, `CONSULTING_PLAYBOOK.md` and `WORKING_CONTEXT.md` provide the four editable consulting documents. Existing owner edits remain authoritative. No bootstrap secret is needed; obsolete bootstrap variables are ignored and may be removed during a separately authorized deployment.

Settings stores encrypted, versioned private copies. Saving checks the current revision and rejects stale edits. History allows review and restoration; a default restore creates a new version. It never modifies the repository files. Each accepted consultation keeps an encrypted snapshot of its original effective instructions. Editable guidance cannot grant process tools, change authentication or choose a paid-provider fallback.

Before connecting a target runtime, supply Codex `auth.json` through `CODEX_APP_SERVER_AUTH_PATH` (a mounted private file), `CODEX_APP_SERVER_AUTH_B64` (the same bytes, base64url-encoded) or `CODEX_APP_SERVER_AUTH_GZIP_B64` (gzip/base64url for a length-bounded secret store); set one. The app creates the file only inside an owned, removed-after-use app-server directory. It performs only the managed Codex account, model-catalog and rate-limit inspection; it does not start a model turn, contact MySQL or change GoDaddy.

The owner selected Electric and requested colours from [HappyPro Academy](https://happypro.academy/): its blue and large-heading gradient, with warmer yellow Head Consultant, raspberry Critic, violet Product and turquoise Operations. The black Ember/Cobalt composition and behavior stay the same.

[Download the SVG logo](forge/design/candidates/a/v8/nanoduck.svg). The dark-interface mark appears in navigation, sign-in and the favicon. [Original charcoal-outline SVG](forge/design/candidates/a/v8/nanoduck-original.svg) is also included.

[The review page](http://127.0.0.1:4328/comparison/) preserves the selected palette and links to the unchosen Solar/Prismatic references. Earlier v1–v7 files and receipts remain unchanged. This revision makes all nine node radii equal and separates the upper coloured segments by a clear gap; the complete Electric A v8 was explicitly approved on 14 September 2026. See [current verification](docs/verification.md).

The implemented app uses a floating desktop menu, mobile hamburger, literal Settings, model and reasoning selectors, icon-only microphone and a visible Send button. New sits above the workspace and remains available in Conversations; it is absent from global menus. Discussion, Outcome and Sources show persisted consultation events rather than fixtures.

The app enforces an absolute 24-hour session from sign-in, including inactivity and browser reopening, with immediate sign-out/revocation/security exceptions. A discussion is accepted durably before orchestration begins. Voice input uses the native recognition API available in Safari and Chrome; Ukrainian uses the browser's Ukrainian locale (`uk-UA`). Speech can be processed by the browser's recognition service only after Start. NanoDuck receives no audio: it inserts only editable text into the local draft, and Send remains separate.

The original green design in `prototype/` is rejected historical evidence. It is not an approved baseline. The canonical baseline and approval receipt are in the design brief.

```sh
npm run check
```

The source repository is public; the intended application remains private to one owner. Do not add private conversation archives, provider grants, secrets or deployment data to Git. Production startup applies the idempotent migration only to `nanoduck_*` tables after the deployment target's database ownership is verified; `npm run migrate` remains available for an explicit operator run.

### GoDaddy Preview and Published

GoDaddy provisions one shared database for Preview and Published. NanoDuck permits only one application process to own that database: its migration, recovery and consultation restart handling must not run concurrently in both environments. Starting both as live applications makes the second fail before opening its HTTP port, which GoDaddy can report as a port or gateway error.

Set `NANODUCK_DEPLOYMENT_ROLE=preview` **only in GoDaddy Preview**. This starts a staging status page on the assigned `PORT`, without importing the database, migrations, authentication or providers. Its `/healthz` reports `status: preview` and `store: disabled`; its application APIs remain unavailable. This is deployment staging, not a functional consultation environment. Keep Preview's `APP_ORIGIN` on the Preview hostname. The role rejects a Published origin to catch accidental environment synchronization.

Leave this variable unset in Published (the application default), keep `NANODUCK_RUNTIME_MODE=production`, and retain its existing origin, database and keys. When publishing, do not synchronize the Preview role or Preview origin into Published. Update Preview first to release its database ownership, then publish the tested revision. A fully functional concurrent Preview requires a separate database; giving both environments different locks on the same database is unsafe.

Backups contain confirmed conversations, linked images, deletion records, settings and all instruction versions. Active provider processes and credentials are excluded. Recovery is an operator-only, explicit command. `npm run recovery -- backup <new-encrypted-file>` creates a new encrypted recovery envelope with the separate recovery key. `npm run recovery -- restore <encrypted-file> --confirm-restore` requires an explicit destructive confirmation and applies deletion tombstones before records, so a deleted conversation cannot return. The application must be stopped for restore. Normal restore preserves current settings and instructions; add `--replace-configuration` only for an intentional full configuration restore. That option revokes existing browser sessions. Backup and restore share a 32 MiB envelope limit and reject larger files. See [recovery details](docs/consolidation.md#recovery). No recovery command in this consolidation was run against a live database.
