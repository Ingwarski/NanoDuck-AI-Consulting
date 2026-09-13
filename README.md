# NanoDuck Consulting Group

A simpler, private, mobile-first browser product for genuine consultant and Critic discussion, live research and practical decisions.

**Electric A v8 is approved and production implementation is in progress.** The local application includes browser UI, server routes, Google-owner authentication wiring, encrypted MySQL persistence, consultation orchestration and a controlled Codex app-server adapter. No GoDaddy resource has been changed.

- [Product idea](docs/product-idea.md) — the recreated current brief.
-  — findings and all legacy decision dispositions.
- [Reconciled architecture](docs/architecture.md) — one Node app, one database, durable consultation work.
- [Models to preserve](docs/model-settings.md) — exact recorded values and evidence limits.
- [Development plan](docs/development-plan.md) — 8 implementation units, complete requirement/state coverage and release evidence.
- [Design brief](docs/design-brief.md) — NanoDuck identity, Electric palette and experience rules.
- [Screen map](docs/screen-map.md) — 9 surfaces and 44 review states.
- [SDD manifest](forge/sdd-manifest.json) — source hashes, traceability and design-stage progress.
- [Verification](docs/verification.md) — actual checks and unresolved limits.
- [Source provenance](docs/source-provenance.json) — consumed source hashes and job-to-design mapping.
- [GoDaddy boundary](docs/deployment-boundary.md) — only the existing consulting app and its own verified data.

<a id="compare-the-three-designs"></a>

## Run the application locally

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open [NanoDuck locally](http://127.0.0.1:3000/). Development mode exposes a local-only owner sign-in. Production mode requires a Google owner subject, HTTPS origin, MySQL connection with a mounted TLS CA bundle, data/session keys, and a mounted Codex app-server authentication file. Use [`.env.example`](.env.example) to see variable names; do not commit values.

Before connecting a target runtime, run `node src/server/preflight.mjs`. It performs only the managed Codex account, model-catalog and rate-limit inspection; it does not start a model turn, contact MySQL or change GoDaddy.

The owner selected Electric and requested colours from [HappyPro Academy](https://happypro.academy/): its blue and large-heading gradient, with warmer yellow Head Consultant, raspberry Critic, violet Product and turquoise Operations. The black Ember/Cobalt composition and behavior stay the same.

[Download the SVG logo](forge/design/candidates/a/v8/nanoduck.svg). The dark-interface mark appears in navigation, sign-in and the favicon. [Original charcoal-outline SVG](forge/design/candidates/a/v8/nanoduck-original.svg) is also included.

[The review page](http://127.0.0.1:4328/comparison/) preserves the selected palette and links to the unchosen Solar/Prismatic references. Earlier v1–v7 files and receipts remain unchanged. This revision makes all nine node radii equal and separates the upper coloured segments by a clear gap; the complete Electric A v8 was explicitly approved on 14 September 2026. See [current verification](docs/verification.md).

The implemented app uses a floating desktop menu, mobile hamburger, literal Settings, model and reasoning selectors, icon-only microphone and a visible Send button. New sits above the workspace and remains available in Conversations; it is absent from global menus. Discussion, Outcome and Sources show persisted consultation events rather than fixtures.

The app enforces an absolute 24-hour session from sign-in, including inactivity and browser reopening, with immediate sign-out/revocation/security exceptions. A discussion is accepted durably before orchestration begins. The microphone captures browser audio and preserves the typed draft if its server-side transcription adapter is unavailable; browser speech recognition is not used.

The original green design in `prototype/` is rejected historical evidence. It is not an approved baseline. The canonical baseline and approval receipt are in the design brief.

```sh
npm run check
```

The source repository is public; the intended application remains private to one owner. Do not add private conversation archives, provider grants, secrets or deployment data to Git. The MySQL schema is created only with `npm run migrate` after the deployment target's database ownership is verified.
