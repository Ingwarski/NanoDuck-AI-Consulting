# Development plan

15 September 2026 · Status: **implementation and scoped cutover in progress**. Phase 3 and replacement deployment are authorized only for Personal AI Consulting Group (`wy2v0putg6`) and its verified application tables. The GitHub source switch is complete; live provider connection, preview/publish acceptance and any authorized database deletion remain evidence-gated.

## Source References

Product behavior: [PRD](prd.md), including all 59 distinct FR/NFR clauses, UC-001–UC-007 and AC-001–AC-010. [Context](project-context.md) and [terms](canonical-terms.md) are applied: single owner, browser-first use, literal Settings, separate AI roles and established vocabulary constrain local UI/API decisions. No context conflicts remain. [Guardrails](guardrails.md) supply authority and phase boundaries. [Journey](user-journey.md), [screen map](screen-map.md) and [wireframes](wireframes.md) supply all jobs, transitions, 9 surfaces and 44 states.

[Design brief](design-brief.md#approved-visual-baseline) is the sole visual authority: `nanoduck-electric-a-v8-20260914`, Electric A v8. [Architecture](architecture.md), [DoD](dod-evals.md) and [QA checklist](qa-checklist.md) have been reconciled in that order against this baseline. The plan consumes their full definitions, including shared evidence/scope/severity conventions, H1–H10 and representative-user tasks. [Model settings](model-settings.md), [deployment boundary](deployment-boundary.md) and  provide qualified preserved settings and dated code/host observations, not fresh runtime proof. Exact consumed hashes are recorded by the orchestrator in the manifest.

## Implementation Strategy

Build one Node application with one MySQL database and the existing isolated provider adapters. Keep one canonical transaction-backed event stream, run leases/generation fencing and authenticated replay. Do not add a queue service, Redis, messenger, separate AI host, public registration or paid fallback. Requirements and architecture drive implementation; QA supplies evidence. Write meaningful tests at trust, transaction, provider and browser seams, not tests mirroring trivial CSS.

Sequence high-risk capability evidence first, then a small secure app foundation, approved presentation and settings, durable discussion, research, voice/attachments and record lifecycle. The final unit integrates verification and scoped release preparation. Unit owners below mean the later authorized implementation operator acting at the named layer; the product owner resolves material scope decisions and supplies representative-user observations. They do not imply separate staff, parallel agents or new services.

## Codebase Map

The local implementation has one Node application: `src/server/` contains HTTP, session, storage, coordinator and provider modules; `src/client/` contains browser handlers; `public/` contains the approved presentation assets; and `test/` contains trust, transaction, provider and HTTP seams. Frozen A v8 remains the visual reference. `prototype/` and `docs/design.md` are rejected history, never production seeds.

Proposed implementation destinations below are a work allocation, not claims that files already exist. Keep modules inside this one application: `src/server/` for HTTP/session/storage/coordinator/adapters; `src/client/` for real browser handlers; `public/` for the bounded approved presentation assets; `tests/` for meaningful seam checks. Add dependencies only when the existing native/runtime mechanisms do not meet the specified boundary; pin and inventory them. No framework migration is required by this plan.

## Shared visual and UX contract

Every user-visible unit U-02–U-08 inherits baseline `nanoduck-electric-a-v8-20260914`, target SHA-256 `93231814431a1bbbf8a0ba07f515eefcfd63193534189898b70766ed45938cbc`, source-tree SHA-256 `1de020dcfe48f3feb80db0e58ba911b821825b48730d32c72d9518ad512eb0d9` and the exact scope/permitted variance from the design brief. Scope: S-01–S-09, ST-01–ST-44; 320/390/430/768/1280/1440 CSS px; English/Ukrainian content. The unit trace narrows what is implemented there; the matrix below preserves every state. U-01 is backend/infrastructure evidence that enables these visible states.

Run `approved_visual_baseline_fidelity` (QA-R40–QA-R42 plus each affected QA-S check), `heuristic_usability_review` (QA-H01–QA-H10; all apply to relevant default/recovery paths), and `representative_user_task_validation` for affected tasks. QA-U01 is voice without accidental send; QA-U02 is locating a Critic objection/response/source; QA-U03 is changing future settings without altering the active run; QA-U04 is stop/recover/export/cancel deletion without loss. Use the actual success criteria and phone/desktop evidence requirements in QA, never an AI-generated participant. U-02 uses entry as the prerequisite to these tasks; U-03 integrates all four; U-04 U02/U04; U-05 U02; U-06 U01; U-07 U04; U-08 all four.

Replace fictional content, remove inspection/version scaffolding, wire real services and accommodate accessible focus/errors, content wrapping and browser rasterization. Preserve hierarchy, Electric tokens, corrected logo geometry, control visibility and navigation. Material divergence needs a design-owner revision, not silent implementation discretion. Compare actual screenshots/DOM behavior with the frozen target, report differences and findings; visual scope is not proof all combinations were tested.

## Implementation Units

### U-01 — Verify the runtime and preserved provider capabilities

**Owner/layer:** authorized implementation operator, infrastructure / integration. **Depends on:** None; first Phase 3 work.

**Source trace:** All JOB-001–JOB-006, UC-001–UC-007, J-01–J-07 indirectly; enables every runtime surface. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Use the 14 September content-free saved/effective settings read: Head/specialists Codex gpt-6-astra xhigh, Critic Codex gpt-6-astra xhigh and a legacy Balanced preset. Inactive Claude preferences remain unknown and must not be inferred. Preserve the recorded model/effort values; use replacement defaults of 2 specialists and 1 Critic ↔ specialist exchange. Never substitute, downgrade, buy credits or enable a paid fallback. Verify catalog/usage/renewal capabilities only for the selected route; do not probe unused Claude. Exercise a short allowed subscription call and restricted research capability after authorization. Verify standard and WebKit browser recognition constructors in Safari and Chrome and a real Ukrainian `uk-UA` result, with no NanoDuck audio endpoint or subscription transcription adapter. Inspect the exact GoDaddy app runtime/subprocess, idle/background lifecycle, restart/redeploy storage, stream buffering, TLS, environment and logs only when later authorized, without resetting data. Resolve upload/research limits, the owner-only JPEG/PNG/WebP byte/type policy, session concurrency/federated termination, separated key handling with exact existing 32-byte key encodings or the exact same-name `.env` envelope accepted by architecture, backup retention/RPO/RTO and operator procedures through architecture before dependent release tests. Use isolated fixtures and keep secrets/content out of Git.

**Acceptance:** A dated capability matrix identifies actual supported and unavailable tuples, formats and host mechanisms, with source/runtime evidence. Choose SSE or the already permitted incremental polling using measured host behavior. No missing voice or security capability is labelled optional. An incompatible essential capability returns to architecture/product ownership; it does not authorize another host/provider or weakened requirement.

**Verification:** QA-R20–QA-R24, QA-R28–QA-R32, QA-R38–QA-R39, QA-R43–QA-R44, QA-R49–QA-R50, QA-R52–QA-R53, QA-R56–QA-R58. Capability observations are prerequisites, not complete passes for these checks. Tests remain not_run. Evidence lives under `forge/runs/U-01/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Browser recognition service or device incompatibility. Stop only the affected voice branch before release; typed input and other independent UI work remain available.

### U-02 — Build the private application and durable data foundation

**Owner/layer:** authorized implementation operator, full-stack. **Depends on:** U-01 identity, runtime, data and security decisions.

**Source trace:** JOB-003 → UC-001 → J-01 → S-01/ST-01–ST-04; also S-04/ST-25. Enables protected data for all other UCs. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Create one Node application and one MySQL schema for sessions, consent, preferences, conversations, runs, canonical messages, sources and owned attachment references. Implement shared owner authorization, typed envelopes, transaction helpers, authenticated encryption/key IDs, safe Markdown/URL handling, request-origin/CSRF/header policy and content-free protected operational events. Normalize MySQL JSON fields at the storage adapter so text, buffers and driver-decoded values produce the same validated settings, run snapshots and source arrays. Validate the Google callback and sole owner; implement concise first-use processing consent. Enforce the fixed 86400-second server deadline and persistent cookie through inactivity/browser reopening; sign-out/revocation/security invalidation end access earlier. Reauthenticate session-control actions; clear private client content even offline. Separate private data and keys from public build assets. Wire the approved entry/consent/denied/expired states through the presentation layer delivered by U-03.

**Acceptance:** Valid owner entry and consent reach private work; forged/replayed/non-owner entry and forged resource identifiers reveal nothing. Sessions work immediately before 24 hours and expire at the boundary; activity does not extend them. Parameterized writes and tamper-denying encryption underpin later transactions; database export without keys exposes no protected plaintext. Reopening a persisted GoDaddy record succeeds when its MySQL JSON columns arrive decoded by the driver.

**Verification:** QA-R01–QA-R02, QA-R43–QA-R46, QA-R48, QA-R52–QA-R55, QA-R58–QA-R59; QA-S01/QA-S04; QA-H01–QA-H10; shared visual checks. U-08 completes integrated session/security evidence. Tests remain not_run. Evidence lives under `forge/runs/U-02/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** A mock login or browser-only owner check would bypass the actual trust boundary. Verify at authenticated and denied HTTP/storage seams.

### U-03 — Promote the approved presentation and connect Settings

**Owner/layer:** authorized implementation operator, full-stack. **Depends on:** U-01 catalog evidence and U-02 application/session foundation. Frozen presentation extraction can proceed while capability evidence is collected.

**Source trace:** All JOB-001–JOB-006 → UC-001–UC-007 → J-01–J-07 → S-01–S-09/ST-01–ST-44 for presentation; Settings primary trace JOB-003/JOB-005 → UC-005 → J-07 → S-04; navigation S-09. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Use the bounded path map below to retain the approved black Electric composition, corrected SVGs, Ember messages/tabs, Cobalt composer, mobile hamburger and floating desktop bar. Keep New above the chat and in Conversations; preserve literal Settings, visible Send, a clear inline SVG microphone, and all owner labels as `You` with an `I` avatar on owner messages. Use distinct named role colours for Spiritual Consultant and Psychotherapist, without colour-only identity. Remove comparison/version/inspection scaffolding and fictional successful service behavior from production. Implement page-memory drafts, semantic focus/menu/dialog behavior, restricted DOM Markdown rendering for discussion/outcome content and English/Ukrainian fixtures. Support paragraphs, headings, lists, quotations, bold/italic emphasis, inline code and approved HTTPS links; raw HTML and unsafe/prohibited URLs stay inert or fail validation. Connect actual provider/model/reasoning selectors, number-of-specialists (1/2/3/5/Auto) and discussion-depth (1/3/5/Auto) selectors to U-01-supported catalog and encrypted preferences; provide the full owner-visible runtime-instructions Markdown document from encrypted database storage through the one server runtime prompt-contract module. Bootstrap an empty database only through a one-time deployment-secret migration; do not read an instruction document from the repository. Validate model combinations and every required instruction heading/placeholder server-side; reject stale saves; retain encrypted saved-version metadata; require review before restore; create a fresh revision on restore; and make saves future-run-only. Explain that specialist count excludes Head and Critic, and Auto depth is bounded at 10 exchanges. Show real usage or unavailable information; separate app expiry, selected-provider reauthorization, quota and outage. Connect remaining controls as their owning runtime units arrive; no mock may be labelled functional.

**Acceptance:** Presentation matches exact A v8 within declared variance at every required surface/state. Saved valid settings, encrypted runtime-instructions document and encrypted version history survive reload while the active run retains its accepted tuple and document snapshot. Restore creates a fresh revision and never changes an accepted run. Unsupported choices never silently substitute. The product contains no inspection UI, connection checklist, palette-comparison controls or simulated provider success.

**Verification:** QA-R20, QA-R21, QA-R22, QA-R23, QA-R24, QA-R60, QA-R33, QA-R34, QA-R35, QA-R40, QA-R41, QA-R42; QA-R45–QA-R48, QA-R51, QA-R55; QA-S01–QA-S09; QA-H01–QA-H10; QA-U03. Tests remain not_run. Evidence lives under `forge/runs/U-03/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Copying mock state machinery can create false success. Reimplement handlers; require runtime interface tests and the future promotion receipt.

### U-04 — Implement real discussion, control and recovery

**Owner/layer:** authorized implementation operator, full-stack. **Depends on:** U-01 provider evidence; U-02 authorized transactional store; U-03 shell/settings.

**Source trace:** JOB-001/JOB-002 → UC-002/UC-003 → J-02/J-03/J-05/J-06 → S-02/ST-05–ST-17 and S-07/ST-37–ST-38. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Accept message and run atomically with idempotency; lease work outside HTTP lifetime and commit each separate actual role message with its next step to the canonical stream. Retain exact run settings and runtime-instructions Markdown/revision snapshots. Every accepted question uses the selected specialist team and Critic; there is no direct Head-answer route. Keep Auto team selection as an internal Head routing invocation; then commit only concise Head → specialist tasks, independent specialist → Critic positions, the selected Critic → relevant specialist → Critic exchanges, and one final Head → owner synthesis. Require pre-conclusion Head output to match a strict task-only wrapper that repeats a case anchor and a second owner-decision detail; retry malformed, owner-facing or generic prose once. If that retry fails, commit a concise context-bound task that quotes the stated decision rather than a static role template or preliminary Head opinion. Supply each specialist its exact assigned Head task explicitly and prohibit it from acting on other handoffs. Never route specialists to each other or render a preliminary Head opinion as advice. Render every behavioral role/output/research message contract from the one validated Markdown snapshot through the runtime prompt-contract module, while code—not editable text—enforces role topology, task-only validation/retry, output bounds, authorization and language/source rejection. Migrate the current encrypted runtime-instructions document from `Direct Head Answer` to `Consultation Routing` on startup as a new reviewable encrypted revision; retain legacy versions and apply the routing constraint when one is restored or an accepted legacy snapshot resumes. Give each role a decision-specific message contract and a sentence-preserving maximum length; prompts must prohibit generic textbook exposition and unsupported invented figures, market claims, customer behavior and sources, and require an explicit missing condition where evidence is absent. Select only permitted roles: exclude Leadership Consultant and esoteric roles; apply the Spiritual Consultant doctrine and the Psychotherapist classical-school/IFS, non-clinical/emergency boundary. Preserve only English/Ukrainian messages and reject prohibited-language output before commit. Route material objections to a consultant for a real answer/revision; allow reasoned agreement and provisional outcomes. Preserve whole business messages, role/recipient/time, session language and owner follow-ups without routine protocol prose. Treat both `turn/completed` and the matching `thread/read` terminal turn as completion evidence, so a missing notification cannot strand an active run. Classify an app-server JSON-RPC failure by a bounded recovery category, safe numeric code and request method; never persist or log its raw diagnostic text, prompt or authentication data. Preserve the owner question and show the matching recovery state rather than claiming a subscription failure without evidence. Implement authenticated replay via the U-01-selected transport, Stop generation fencing, Continue and New with one-active-run enforcement. Enforce selected specialist counts of 1/2/3/5 or the Head-chosen 1–5 Auto count, excluding Head and Critic. Enforce 1/3/5 complete Critic ↔ specialist exchanges, or Auto stopping at supported consensus and never exceeding 10 exchanges, plus a 540000 ms provider budget and ten-minute continuation boundary. Surface actual stalls and categorized recoverable failures. Connect sources through U-05; persistent attachments through U-06.

**Acceptance:** Separate provider/context evidence proves every accepted question follows the selected-team discussion, including a simple question. Head gives no owner-facing content before an evidence-consistent final conclusion of at most three actions. A terminal provider turn is committed once whether observed through a completion notification or `thread/read`. Crash-after-acceptance, duplicate retry, restart and Stop/late-result races produce exactly one confirmed visible step; a repeated provider call after an uncommitted result is recorded honestly. New cannot bypass one active run.

**Verification:** QA-R03, QA-R05, QA-R06, QA-R07, QA-R08, QA-R09, QA-R10, QA-R11, QA-R12, QA-R13, QA-R14, QA-R15, QA-R16, QA-R36, QA-R37, QA-R38, QA-R39, QA-R47, QA-R59; QA-R45–QA-R47, QA-R51, QA-R58–QA-R59; QA-S02/QA-S07; QA-H01–QA-H10; QA-U02/QA-U04. Tests remain not_run. Evidence lives under `forge/runs/U-04/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Durability is the central failure seam. Exercise process termination and concurrent commands against real transactions before adding broad end-to-end polish.

### U-05 — Connect live research and inspectable sources

**Owner/layer:** authorized implementation operator, full-stack. **Depends on:** U-01 restricted research capability; U-02 authorization/storage; U-03 source presentation; U-04 coordinator.

**Source trace:** JOB-001/JOB-002 → UC-007 → J-04 → S-06/ST-34–ST-36; contributes to S-02/ST-15 and S-07/ST-38. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Trigger research from time-sensitive claims and material uncertainty without a keyword. Use only restricted Codex search; a tool-free Claude Critic requests evidence through the coordinator. Store actual title/direct URL, supported claim, retrieval/publication data and limitations with the conversation. Enforce English/Ukrainian source language and metadata; deny Russian/Belarusian language or terminology and `.ru`, `.by`, `.su` or Cyrillic-equivalent hosts. Validate schemes, network addresses and redirects; deny private/metadata targets. Treat retrieved text as untrusted, minimize queries and require specific permission for sensitive transfers. Render Sources/detail and source-unavailable states; retain qualified uncertainty when research fails or conflicts.

**Acceptance:** An actual current-topic consultation can trace a claim to fresh primary evidence. Conflicting/unavailable evidence never becomes a fabricated citation or fresh-check claim. Injected content cannot grant tools, exfiltrate private context, switch providers or initiate an external action.

**Verification:** QA-R17, QA-R18, QA-R19, QA-R49, QA-R51, QA-R54; QA-R46, QA-R49, QA-R51, QA-R53–QA-R54, QA-R59; QA-S06 plus QA-S02/QA-S07 recovery; QA-H01–QA-H10; QA-U02. Tests remain not_run. Evidence lives under `forge/runs/U-05/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** A successful public fetch does not prove SSRF or transfer isolation. Include redirects, private address targets and marked private fixtures at the actual egress seam.

### U-06 — Implement voice and safe attachments

**Owner/layer:** authorized implementation operator, full-stack. **Depends on:** U-01 browser/parser capability; U-02 protected storage; U-03 composer; U-04 accepted-input contract.

**Source trace:** JOB-006/JOB-001 → UC-006/UC-002 → J-02 → S-05/ST-26–ST-33 and S-02/ST-06–ST-07. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Implement Start-gated browser `SpeechRecognition`/`webkitSpeechRecognition`, explicit recognition-service disclosure, Stop-to-editable-text, Cancel-to-abort and background interruption. Use the browser language list to select Ukrainian `uk-UA` when available. Return editable text to the existing draft at a clear append boundary; no automatic Send. Distinguish permission, unavailable browser/service, language, network and interruption errors, preserving typing and explicit retry. Do not add `MediaRecorder`, audio blobs, a transcription endpoint, key or provider. Accept only owner-submitted JPEG/PNG/WebP images: enforce an 8 MiB streaming limit, ignore client MIME and validate the matching binary signature before encrypted opaque, non-executable storage. Do not parse, transform, thumbnail, server-render or scan the image. Reject PDF, SVG, video, audio, archives, mismatches and malformed/truncated content while retaining the typed draft. Owner-only retrieval uses the validated type, attachment disposition and `nosniff`.

**Acceptance:** On real Safari and Chrome devices, a spoken Ukrainian request becomes editable unsent text; Cancel/background/failure leaves no active hidden recognition and NanoDuck has received no audio. Valid JPEG/PNG/WebP images persist only as protected opaque records; all invalid type/signature/size cases fail without losing the typed draft. Typing fallback remains usable but cannot waive required voice acceptance.

**Verification:** QA-R04, QA-R28, QA-R29, QA-R30, QA-R31, QA-R32, QA-R50, QA-R55; QA-R40–QA-R42, QA-R45–QA-R47, QA-R50, QA-R53–QA-R55, QA-R59; QA-S05 and QA-S02; QA-H01–QA-H10; QA-U01. Tests remain not_run. Evidence lives under `forge/runs/U-06/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Browser recognition success does not prove mobile service availability or disclosure/privacy handling. The single-owner self-generated-image statement is not technical provenance proof. Exercise the full Start-to-editable-text seam, inspect Stop/Cancel/background behavior, and prove that the image boundary rejects every non-allowed/malformed/oversized fixture without parser or scanner execution.

### U-07 — Finish record ownership, export, deletion and restore

**Owner/layer:** authorized implementation operator, full-stack / operations. **Depends on:** U-02 data foundation; U-03 history UI; U-04 canonical records; U-05 sources; U-06 attachments.

**Source trace:** JOB-004/JOB-001 → UC-004/UC-002 → J-06 → S-03/ST-18–ST-20, S-06, S-07 and S-08/ST-39–ST-42. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Reopen complete confirmed records, sources and owned attachments across browser sessions. Export the whole selected record with safe formatting and no draft/credentials. Confirm deletion of only the selected conversation and its owned content; cancellation is inert. Persist deletion decisions so isolated restores cannot resurrect deleted records. Implement encrypted backup/restore with separated keys and the U-01-reviewed retention/recovery objectives. Preserve indefinite accepted history until explicit deletion; report backup propagation truthfully. Fail closed on unavailable storage/export, retaining recoverable confirmed work.

**Acceptance:** Complete reopen/export matches canonical content. Guessed IDs cannot access private records. Cancel does nothing; confirmed delete changes only that record. Isolated restore recovers accepted history, respects deletion decisions and never accesses another app database.

**Verification:** QA-R25, QA-R26, QA-R27, QA-R56; QA-R45–QA-R46, QA-R52–QA-R56, QA-R59; QA-S03/QA-S06/QA-S07/QA-S08; QA-H01–QA-H10; QA-U04. Tests remain not_run. Evidence lives under `forge/runs/U-07/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Deletion-aware recovery must be proved with marked isolated records and keys before any target reset; do not treat a database dump as a tested restore.

### U-08 — Verify the integrated app and prepare the scoped release

**Owner/layer:** authorized implementation operator, integration / operations. **Depends on:** U-01–U-07 implemented with recorded unit evidence and no unresolved release-blocking capability.

**Source trace:** All JOB-001–JOB-006 → UC-001–UC-007 → J-01–J-07 → S-01–S-09/ST-01–ST-44; cross-cutting release integration. Exact clause allocation appears below; architecture's corresponding boundary controls the mechanism.

**Work:** Execute all 83 canonical QA checks at their required actual seams and all six DoD gates, retaining prior prototype observations as limited history. Cover real supported browsers/devices, keyboard, 320px reflow, 200% text sizing, relevant assistive technology, forced colors and long English/Ukrainian content. Run H1–H10 expert review and actual representative-owner tasks; classify findings and close blocking ones. Record dependency inventory and risk-based update/incident/backup ownership and deadlines. Prepare a production-only artifact, exact configuration inventory, compatible migration and rollback trigger. Before a Preview update, verify the GoDaddy package contract in the Git source: root name/version/main, `build` and `start`, entry-point existence, `process.env.PORT`, `0.0.0.0` binding, runtime imports in `dependencies`, and no tracked or uploaded `node_modules`. Verify the exact Personal AI Consulting Group app and exclusively owned database/table inventory, rehearse isolated restore, then present a concrete cutover package under the later implementation authorization. On an environment-secret-only host, provision the pinned Codex app-server package, exactly one supported auth secret and `NANODUCK_RUNTIME_MODE=production` where GoDaddy reserves `NODE_ENV`; GoDaddy uses `CODEX_APP_SERVER_AUTH_GZIP_B64`. Verify preflight sees the preserved model tuple while the only materialized `auth.json` exists in its removed-after-use private app-server home. Re-check scope and evidence before any reset. After an authorized cutover, inspect the live artifact, sign-in, actual provider tuples, research, voice, restart recovery and protected logs; rollback on required-gate failure. Feed observed incidents and task findings to the owning PRD/architecture/QA documents.

**Acceptance:** Release can be claimed only when required actual results pass, the scoped target/rollback evidence exists and representative-user tasks are observed. A build, health endpoint, pushed repository or owner design acceptance cannot replace release evidence. No other GoDaddy app, table, domain, shared credential or data is changed.

**Verification:** QA-R01–QA-R60, QA-S01–QA-S09, QA-H01–QA-H10, QA-U01–QA-U04; all six DoD gates. Tests remain not_run. Evidence lives under `forge/runs/U-08/{run_id}/` and records actual revision, sources, executor, time and scope.

**Risk/stop condition:** Unknown database ownership or host behavior blocks destructive cutover. Preserve unrelated resources and stop at the exact unresolved scope rather than widening access.

## Dependency Order

U-01 → U-02 → U-03 → U-04 → U-05/U-06 → U-07 → U-08. U-05 and U-06 are independent after U-04 once their U-01 capability evidence is settled. U-03 may prepare static presentation while U-01 runs, but cannot claim working login/settings before U-02 and verified catalogs. A unit is complete only with its source-bound acceptance evidence; a pending capability blocks the affected seam, not unrelated documentation. No calendar duration is invented before the preflight resolves provider/host limits.

## Cross-layer interfaces

These implementation seams instantiate architecture's existing boundaries, not new product APIs or services. Producers own schemas in `src/server/contracts/`; consumers use the same schema version. Route spelling and internal filenames may be resolved during U-02 without changing product meaning. Unknown fields and immutable field overrides fail validation. Incompatible contract changes require affected producer/consumer reconciliation before merge; never silently discard accepted data.

| Interface / producer → consumer | Contract and compatibility | Integration evidence |
|---|---|---|
| C-01 owner session, U-02 → U-03–U-08 | Owner-only principal, consent scope, server-issued absolute expiry and revocation; cookies never expose provider grants. All private HTTP/upload/export/run operations use the same authorization seam. | QA-R01–QA-R02, QA-R43–QA-R45, QA-R48, QA-R55; real denied reads/writes and 24-hour boundary. |
| C-02 preferences/catalog, U-03 → U-04 | Provider/model/reasoning, specialist-count and discussion-depth tuple, compatible catalog choices, saved runtime-instructions Markdown/revision and preference version; U-04 copies an immutable snapshot on acceptance. Auto runtime decisions are recorded with that snapshot. Real quota/reset or unavailable, categorized selected-provider authorization failure. | FR-05.1–FR-05.6 exact QA mappings below; save while active and compare next/current run. |
| C-03 canonical work/events, U-04 → U-03/U-05/U-07 | Conversation/run IDs, client request ID, ordered event cursor, committed step, generation/lease, complete role/recipient/body/time and snapshot; transactional acceptance/step commits. U-03 renders an allowed Markdown subset through DOM nodes and never executes raw event markup. Same cursor semantics for SSE or polling. | QA-R03, QA-R11–QA-R16, QA-R36–QA-R39, QA-R47, QA-R59; restart/Stop/replay races. |
| C-04 role execution, U-04 → U-05 provider operations | Separate permitted role context and assignment, exact tuple, immutable validated runtime-instructions document/revision, scoped operation/tool permissions, English/Ukrainian output policy, bounded cancellation and categorized failure. Research does not acquire general shell/filesystem/computer permissions. | QA-R05–QA-R10, QA-R12, QA-R17–QA-R19, QA-R51; compare to exact clause mapping below. |
| C-05 evidence, U-05 → U-04/U-03/U-07 | Conversation-bound direct URL/title/claim/retrieval/publication/limitations; source text is data. Accept English/Ukrainian evidence only and reject Russian/Belarusian metadata or `.ru`/`.by`/`.su`/Cyrillic-equivalent hosts before it reaches a conversation. No citation is promoted without actual source evidence. | QA-R17–QA-R19, QA-R49, QA-R54, QA-S06, QA-U02. |
| C-06 inputs, U-06 → U-04/U-03/U-07 | Owned, bounded JPEG/PNG/WebP attachment references and an editable unsent browser-recognized transcript; NanoDuck receives no audio. Explicit Send alone creates an accepted event. | FR-02.2/FR-07.1–FR-07.5 exact QA mappings below, QA-R50, QA-R55, QA-U01. |
| C-07 records/restore, U-07 → U-03/U-08 | Complete confirmed record and safe export; owner-scoped delete plus durable deletion decision; isolated restore applies tombstones before records become readable. | FR-06.1–FR-06.3 exact QA mappings below, QA-R52, QA-R56, QA-U04. |
| C-08 delivery/evidence, U-08 consumes all units | Exact production revision/config/dependency inventory, only named app + proven-owned database, actual gate evidence, rollback and post-deploy observations. | QA-R57–QA-R59 and all six gates; no health-only release claim. |

## Clause coverage

One primary implementation owner is assigned per distinct clause. Shared controls from U-02 and integrated verification by U-08 also apply; local consumers test enforcement at their own seam. This table is the authoritative unit-to-clause/QA allocation; no ordinal inference is allowed. Every row is an implementation obligation, not an executed result.

| PRD clause | Primary unit | Exact canonical QA IDs |
|---|---|---|
| FR-01.1 | U-02 | QA-R01 |
| FR-01.2 | U-02 | QA-R02 |
| FR-02.1 | U-04 | QA-R03 |
| FR-02.2 | U-06 | QA-R04 |
| FR-02.3 | U-04 | QA-R05 |
| FR-02.4 | U-04 | QA-R06 |
| FR-02.5 | U-04 | QA-R07 |
| FR-02.6 | U-04 | QA-R08 |
| FR-02.7 | U-04 | QA-R09 |
| FR-02.8 | U-04 | QA-R10 |
| FR-03.1 | U-04 | QA-R11 |
| FR-03.2 | U-04 | QA-R12 |
| FR-03.3 | U-04 | QA-R13 |
| FR-03.4 | U-04 | QA-R14 |
| FR-03.5 | U-04 | QA-R15 |
| FR-03.6 | U-04 | QA-R16 |
| FR-04.1 | U-05 | QA-R17 |
| FR-04.2 | U-05 | QA-R18 |
| FR-04.3 | U-05 | QA-R19 |
| FR-05.1 | U-03 | QA-R20 |
| FR-05.2 | U-03 | QA-R21 |
| FR-05.3 | U-03 | QA-R22 |
| FR-05.4 | U-03 | QA-R23 |
| FR-05.5 | U-03 | QA-R24 |
| FR-05.6 | U-03 | QA-R60 |
| FR-06.1 | U-07 | QA-R25 |
| FR-06.2 | U-07 | QA-R26 |
| FR-06.3 | U-07 | QA-R27 |
| FR-07.1 | U-06 | QA-R28 |
| FR-07.2 | U-06 | QA-R29 |
| FR-07.3 | U-06 | QA-R30 |
| FR-07.4 | U-06 | QA-R31 |
| FR-07.5 | U-06 | QA-R32 |
| FR-08.1 | U-03 | QA-R33 |
| FR-08.2 | U-03 | QA-R34 |
| FR-08.3 | U-03 | QA-R35 |
| NFR-01.1 | U-04 | QA-R36 |
| NFR-01.2 | U-04 | QA-R37 |
| NFR-01.3 | U-04 | QA-R38 |
| NFR-01.4 | U-04 | QA-R39 |
| NFR-02.1 | U-03 | QA-R40 |
| NFR-02.2 | U-03 | QA-R41 |
| NFR-02.3 | U-03 | QA-R42 |
| NFR-10.1 | U-02 | QA-R43 |
| NFR-10.2 | U-02 | QA-R44 |
| NFR-10.3 | U-02 | QA-R45 |
| NFR-11.1 | U-02 | QA-R46 |
| NFR-11.2 | U-04 | QA-R47 |
| NFR-11.3 | U-02 | QA-R48 |
| NFR-12.1 | U-05 | QA-R49 |
| NFR-12.2 | U-06 | QA-R50 |
| NFR-12.3 | U-05 | QA-R51 |
| NFR-13.1 | U-02 | QA-R52 |
| NFR-13.2 | U-02 | QA-R53 |
| NFR-14.1 | U-05 | QA-R54 |
| NFR-14.2 | U-06 | QA-R55 |
| NFR-14.3 | U-07 | QA-R56 |
| NFR-15.1 | U-08 | QA-R57 |
| NFR-16.1 | U-02 | QA-R58 |
| NFR-16.2 | U-04 | QA-R59 |

## Surface and state coverage

U-03 owns the approved presentation for every row; the runtime owner below connects the actual behavior. U-08 verifies the integrated result. IDs refer to the complete states and transitions in the screen map/wireframes; no state is excluded.

| Surface | State IDs | Runtime unit(s) | QA / journey / use case |
|---|---|---|---|
| S-01 | ST-01, ST-02, ST-03, ST-04 | U-02 | QA-S01; J-01; UC-001 |
| S-02 | ST-05, ST-06, ST-07, ST-08, ST-09, ST-10, ST-11, ST-12, ST-13, ST-14, ST-15, ST-16, ST-17 | U-04, U-05, U-06 | QA-S02; J-02/J-03/J-05; UC-002/UC-003 |
| S-03 | ST-18, ST-19, ST-20 | U-07 | QA-S03; J-06; UC-004 |
| S-04 | ST-21, ST-22, ST-23, ST-24, ST-25 | U-03, U-02 | QA-S04; J-07; UC-005 |
| S-05 | ST-26, ST-27, ST-28, ST-29, ST-30, ST-31, ST-32, ST-33 | U-06 | QA-S05; J-02; UC-006 |
| S-06 | ST-34, ST-35, ST-36 | U-05, U-07 | QA-S06; J-04/J-06; UC-007/UC-004 |
| S-07 | ST-37, ST-38 | U-04, U-07 | QA-S07; J-06; UC-002/UC-004 |
| S-08 | ST-39, ST-40, ST-41, ST-42 | U-07 | QA-S08; J-06; UC-004 |
| S-09 | ST-43, ST-44 | U-03 | QA-S09; J-01/J-05/J-07; UC-001/UC-003/UC-005 |

## Prototype Promotion Plan

Only U-03 reuses presentation files from candidate `a`, `v8`, root `forge/design/candidates/a/v8`, tree `1de020dcfe48f3feb80db0e58ba911b821825b48730d32c72d9518ad512eb0d9`, algorithm `sdd-tree-sha256-v1`, no external render dependencies. Baseline and target hash are the Shared visual contract above. Production base commit: `f99744d603b4e27cb7e89eccde2f12b9652e8a01`; this full commit precedes the documentation-only approval/plan commit. The Phase 3 runner must preserve and verify ancestry, frozen bytes and empty destinations before promotion. A changed destination/base requires a source-bound plan amendment, not fabricated history.

| Frozen source path | Production destination | Strategy |
|---|---|---|
| forge/design/candidates/a/v8/index.html | public/index.html | adapt |
| forge/design/candidates/a/v8/styles.css | public/styles.css | adapt |
| forge/design/candidates/a/v8/app.js | src/client/app.js | reimplement |
| forge/design/candidates/a/v8/nanoduck.svg | public/nanoduck.svg | copy |
| forge/design/candidates/a/v8/nanoduck-original.svg | public/nanoduck-original.svg | copy |

Adapt only within the visual variance above: remove candidate/inspection/version code and fictional data; wire real modules and state semantics; preserve approved CSS/geometry/tokens and exact copied SVG bytes. Reimplement the mock handlers with real authorization-aware endpoints and a durable stream consumer. No other prototype path is authorized for promotion by this map. Missing capabilities are all U-02–U-07 backend, consent/session, persistence, encryption/authorization, actual agents/research, voice/upload processing, real catalog/usage and export/deletion/restore behavior. The prototype supplies none of those capabilities.

Required future receipt: `forge/runs/U-03/{run_id}/prototype-promotion.json`. Only the separately authorized Phase 3 runner derives the actual Git diff and receipt, with all five expanded mappings and source/destination hashes, base/head commits, changed paths, patch hash, adaptation/variance list, baseline/plan hash, actual QA IDs, visual evidence and verification status. Required QA: QA-R33–QA-R35, QA-R40–QA-R42, QA-S01–QA-S09, QA-H01–QA-H10 and affected QA-U01–QA-U04. No receipt exists or is fabricated in this planning phase. A destination without the required matching receipt after promotion begins blocks fidelity acceptance.

## Verification Plan

All 83 formal checks remain **prepared / not_run**; six gates remain unevaluated. Run exact acceptance clauses from the QA checklist and AC-001–AC-010, then collect the additional visual, heuristic and representative-owner evidence. Preserve positive and negative security paths for all 17 security clauses in the Clause coverage table. Dependency maintenance, operational diagnosis, deletion propagation and isolated recovery belong to U-01/U-07/U-08 as allocated; they are not a separate service or optional checklist.

Unit evidence must distinguish local fixtures, actual provider results and live host results. Keep credentials, account identifiers and private business content out of public receipts; no NanoDuck audio artifact exists to retain. Use fictional/minimized fixtures with protected detailed logs when necessary. Record check, gate, revision, baseline/target/tree, source hashes, executor/time, route/state/device/viewport, expected/observed outcome and evidence hash, with classified findings. Use PRD severity/release-effect definitions exactly. Missing representative-user or assistive-technology evidence stays missing; a design approval is not that evidence.

Required gates: `product_functional_requirements`, `product_security_requirements`, `approved_visual_baseline_fidelity`, `heuristic_usability_review`, `representative_user_task_validation`, `lifecycle_and_continuity`. Run targeted checks per unit, then integrated cross-boundary checks and actual U-08 release evidence. Re-run only affected checks when source/runtime/baseline changes or findings justify it. `npm run check` remains an artifact/link/JavaScript syntax check and cannot pass production gates.

## Out Of Scope

This document authorizes deployment only to Personal AI Consulting Group (`wy2v0putg6`) and its verified application data; it does not authorize provider credential transfer, publication, database reset or any promotion outside that target. The product excludes messengers, public/multiuser SaaS, payments, extra hosts, paid fallback, automatic external business actions, required notifications, native apps, PDF/SVG/video/audio/archive uploads and arbitrary uploads. Unchosen palette alternatives are historical design references. Do not alter any unrelated GoDaddy resource. Any database reset remains conditional on proven exclusive ownership and recovery/cutover evidence.

## Open Questions

No further aesthetic or product-intent choice is needed to continue this plan. U-01 owns the unresolved current saved settings/entitlements, mobile Safari/Android Chrome recognition evidence, host lifecycle/streaming/storage and configuration/security parameters described in architecture. The product owner resolves any material change of behavior, provider, budget or hosting scope; the implementation operator returns ordinary evidenced mechanism choices to architecture, then revalidates affected downstream artifacts. U-08 requires actual operational ownership, representative-owner availability and exact database/table identity before release. These questions do not make unrun checks pass and cannot be silently waived.

## Handoff and implementation boundary

The approved design, reconciled architecture/DoD/QA and this plan govern the authorized Phase 3 implementation and scoped source cutover. Orchestrator state: `implementation-in-progress`. The gate binds this plan's current hash and `nanoduck-electric-a-v8-20260914`; it does not expand the named GoDaddy boundary or replace production-provider, hosted-data and release evidence. The next release decision requires completed QA and operational evidence.
