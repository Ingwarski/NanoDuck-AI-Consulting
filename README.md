# NanoDuck Consulting Group

A simpler, private, mobile-first browser product for genuine consultant and Critic discussion, live research and practical decisions.

**Current phase: review, product brief and interactive design.** There is no production backend, real authentication, AI integration or database in this repository. No GoDaddy resource has been changed.

- [Product idea](docs/product-idea.md) — the recreated current brief.
-  — findings and all legacy decision dispositions.
- [Proposed architecture](docs/architecture.md) — one Node app, one database, durable consultation work.
- [Models to preserve](docs/model-settings.md) — exact recorded values and evidence limits.
- [Design brief](docs/design-brief.md) — NanoDuck identity, Electric palette and experience rules.
- [Screen map](docs/screen-map.md) — 9 surfaces and 44 review states.
- [SDD manifest](forge/sdd-manifest.json) — source hashes, traceability and design-stage progress.
- [Verification](docs/verification.md) — actual checks and unresolved limits.
- [Source provenance](docs/source-provenance.json) — consumed source hashes and job-to-design mapping.
- [GoDaddy boundary](docs/deployment-boundary.md) — only the existing consulting app and its own verified data.

<a id="compare-the-three-designs"></a>

## Review the selected Electric design

Requires Node.js 22 or newer. No dependencies or installation step.

```sh
npm start
```

The localhost root opens [NanoDuck Electric v5](http://127.0.0.1:4328/a/v5/) directly. The owner selected Electric and requested colours from [HappyPro Academy](https://happypro.academy/): its blue and large-heading gradient, with warmer yellow Head Consultant, raspberry Critic, violet Product and turquoise Operations. The black Ember/Cobalt composition and behavior stay the same.

[Download the SVG logo](forge/design/candidates/a/v5/nanoduck.svg). The same mark appears in navigation, sign-in and the favicon.

[The review page](http://127.0.0.1:4328/comparison/) shows the selected palette and retains links to the unchosen Solar/Prismatic references. Earlier v1–v4 files and receipts remain unchanged. This revision adds the NanoDuck name and original SVG logo; the revised whole-design baseline is still proposed. See [current verification](docs/verification.md).

All three include a floating desktop menu, mobile hamburger, literal Settings, model and reasoning selectors, icon-only microphone, editable simulated voice transcript and a visible Send button. New sits above the workspace and remains available in Conversations; it is absent from global menus. Development inspection is hidden on normal pages; append `?inspect=1` to expose the 44 state fixtures. English and Ukrainian discussion fixtures are included.

The specification requires a fixed 24-hour app session from sign-in, including inactivity and browser reopening, with immediate sign-out/revocation/security exceptions. Authentication is not implemented in this preview. Typing does not call an AI provider; microphone flows use sample data. Drafts and preferences stay in page memory and disappear on reload.

The original green design in `prototype/` is rejected historical evidence. It is not an approved baseline. The pipeline awaits review of the revised Electric design before post-approval planning; production implementation still requires a separate explicit prompt.

```sh
npm run check
```

The source repository is public; the intended application remains private to one owner. Do not add private conversation archives, provider grants, secrets or deployment data to Git.
