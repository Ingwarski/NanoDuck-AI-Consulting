# Combined sister-repository update after review-fixes-port

Copy the prompt below into each sister repository's own chat. This is one self-contained implementation prompt; the embedded specifications do not require copying other prompt files.

---

Implement the cumulative missing NanoDuck updates in the CURRENT target repository only. The last applied baseline is `docs/review-fixes-port.md`, including its source-metadata persistence addendum. Verify those baseline behaviors before proceeding; repair missing prerequisites rather than assuming a filename proves implementation.

Source reference: `Ingwarski/NanoDuck-AI-Consulting`, final implementation at `2c50cd6`. The update range is `0198d84..2c50cd6`. Use the final source state, not intermediate visual experiments. Source code can be inspected read-only if available; the behavioral requirements below are self-contained. Do not put machine-specific absolute paths, credentials, private conversations, provider grants or source-machine storage into committed files.

Verify the current Git root, remote, branch, instructions and working tree. Preserve unrelated edits. Work on a target-local `codex/` branch. Map source filenames to target equivalents and record that mapping. This applies separately to Neo and the GoDaddy-hosted sister: preserve EACH target's hosting, deployment lifecycle, database, authentication, origin/CSRF checks, provider transport, selected models and reasoning, cancellation, durable checkpoints and accepted runtime snapshots. Do not replace a hosted target with the source's local SQLite launcher or remove its hosting configuration. Do not edit either other repository.

Do not replay real consultations, spend subscription tokens on benchmarks, enable paid fallback, silently substitute a model, truncate answers, restore phone-number blocking, or change user-selected review depth. Head continues to author roles and individual tasks; application code must not invent generic assignments. Keep Critic's direct orders and fulfillment tracking from the baseline. Do not rewrite Git history.

Implement in this order: A (tables), B (reading/navigation), C (request isolation), D (research and provider accounting), E (dashboard), F (final glass). Read the complete prompt before editing: later accounting sections supersede intermediate cache-write labels. In particular, never show fabricated cache-write zero or infer cache writes from uncached input. Skip an item only after verifying equivalent behavior and documenting evidence.

## A. Markdown tables and native RTF tables

Reference commit `2461377`. Files: `src/client/markdown.js`, `src/client/app.js`, `public/styles.css`, `src/server/conversation-export.mjs`.

Extend the shared Markdown parser with a table block: headers, per-column alignment and rows of existing inline tokens. Require a valid matching delimiter row; support escaped literal pipes. Preserve malformed rows as ordinary text rather than dropping cells. Continue using safe text/DOM construction and the existing URL policy; do not insert provider HTML through innerHTML or switch storage to raw HTML.

Render semantic table/thead/tbody/tr/th/td elements in chat and Outcome using the same Markdown path. Use column header scope, a labeled keyboard-focusable horizontal-scroll region and readable borders/padding. Wide tables must scroll within their region rather than expand the viewport. Preserve inline links, emphasis, Unicode and existing source metadata.

Export the same table AST as native RTF rows/cells, with borders, bold repeating header, column alignment and widths within the document text area. Use the existing Unicode, link and RTF escaping. Do not export a screenshot or pipe-delimited text disguised as a table. Preserve discussion, final advice and sources in exports.

Port `test/markdown.test.mjs`, `test/markdown-table-export.test.mjs` and `scripts/browser-markdown-tables.mjs`. Test a three-column Ukrainian table, escaped pipes, malformed rows, unsafe markup/URLs, Unicode and RTF metacharacters. Check browser horizontal scrolling and inspect a generated synthetic RTF in an available real document reader; report untested readers honestly.

## B. Reading mode and boundary-aware chat arrows

Reference commits `19f1294`, `0a2e4f2`, `4ae07a7`, `bbef4bd`. Files: `src/client/app.js`, `public/index.html`, `public/styles.css`; regression helper `scripts/browser-reading-mode.mjs` and existing active-discussion/send-retry/browser-usage helpers.

At desktop widths, place Discussion/Outcome/Sources/Usage and discussion status in a sticky vertical side rail. At narrower widths retain a compact accessible sticky navigation control. All four views remain available; update aria orientation, selected state, tab focus and keyboard navigation with the layout.

Allow the composer to collapse during final-advice reading, with visible Continue conversation/expand and Hide input controls as appropriate. Keep drafts, attachments and voice state when collapsing; restore focus to the input on expansion and to the expansion control when hiding. A completed consultation should not keep a large input panel covering the advice. Preserve active-run Stop access and its approved Porcelain geometry. Reset reading-state bookkeeping across privacy cleanup and conversation changes. Do not auto-scroll or repeatedly reopen the composer on polling updates. Preserve error/retry paths and the ability to start another request.

Add two transparent circular arrow buttons at the horizontal centre of the viewport: one near the top below fixed navigation, one near the bottom. They jump to the beginning/end of the CURRENT visible consultation panel, including Outcome, Sources and Usage; do not silently switch to Discussion. Calculate offsets for the responsive sticky header. Respect reduced motion and provide accessible labels and focus indicators.

Hide the top arrow when already at the panel beginning and the bottom arrow when already at its end. Hide both when the consultation page/panel is not visible or no jump is needed. Recompute on scroll, resize, panel switching and dynamic content size changes, coalesced through animation frames. Test long/short content, both boundaries, all four views, mobile, keyboard, drafts and active-run controls.

## C. Request isolation and context/cache economy

Apply these changes only to the destination repository. Preserve its hosting, database, authentication and provider transport. Do not copy local paths, private storage, credentials, personal conversations or frozen design evidence from another repository.

### Required behavior

Every new Send starts a separate model context, even within the same saved chat. The chat remains a readable/exportable archive. Only Continue/Retry of interrupted accepted work reuses its request, assignments, results and sources. Preserve full current owner text, selected models/efforts, discussion depth and Head-authored roles/tasks. Do not add answer-length limits or disable research. Do not use a global answer cache.

### Changes by file and enforcement seam

1. **`src/server/store.mjs` / destination durable store:** assign `snapshot.requestMessageId = message.id` transactionally when accepting a fresh message. Ignore a caller-supplied ID. Keep it unchanged on Continue/Retry; reject snapshot rebinding. A new parallel work ledger must have exactly that one owner ID. Keep idempotent acceptance, generation fencing and cancellation intact. `src/server/local-state.mjs` or its equivalent validates that the bound message is an owner message in the same chat and agrees with the ledger. Legacy paused ledgers may retain their originally accepted owner IDs; do not silently restart them.
2. **`src/server/consultation-parallel.mjs`:** select the accepted owner ID, not all owner messages in the chat. For legacy ledgers use their accepted owner IDs; absent a ledger/binding, use the latest owner message. Remove the earlier-chat discussion from Head planning. Filter final source aggregation to the current accepted request boundary. `src/server/consultation.mjs` must also scope any retained sequential path and pass the run ID as `contextScope` to each provider call.
3. **New `src/server/provider-context.mjs`:** one builder shared by Codex and Claude. Prompt order: stable provider policy and relevant general guidance; request-scope ID; complete accepted owner message; shared current-request research evidence (once, before consultant-specific text); output contract; individual assignment; selected current evidence/discussion. Keep role-specific guidance outside unrelated calls. Exclude `WORKING_CONTEXT.md` from all prompts, including resumed calls; retain encrypted editor/history as reference-only. Do not read ambient provider memory or other chats. Measure actual UTF-8 prompt/prefix bytes, not guessed tokens. A scope ID is isolation bookkeeping, not a provider cache key.
4. **`src/server/codex-provider.mjs`:** on the pinned app-server schema, pass minimal consultation-specific `baseInstructions` to `thread/start` instead of coding-agent boilerplate. Preserve all disabled tools/features, ephemeral threads, exact model/effort and sanitized live-web-only research. Reuse one empty private temporary cwd within the executing request to avoid changing environment prefixes for each consultant; use separate per-invocation credential homes. Different requests get different workspaces. Expose `releaseScope`; call it only after all request workers drain in the coordinator's `finally`. Stop/retry/restart may recreate the temporary workspace; they retain application context, not provider memory. Verify schema support in each sister repo; do not invent unsupported cache-key parameters.
5. **`src/server/claude-provider.mjs`:** use the same builder while keeping nonpersistent sessions, disabled file/memory tools and exact selected Claude settings. Account for retry prompt bytes separately. Do not enable tools merely to read a context file.
6. **Head control context in `consultation-parallel.mjs`:** Auto continuation decisions get current assignments, result completion states, actual Critic summaries and order assessments; omit full repeated specialist essays. Query planning gets the Critic's specific evidence gap and existing public evidence, not the whole team transcript or unrelated guidance files. Critic and final Head still receive complete necessary current answers, source metadata and unresolved orders. Keep user-selected fixed review depth.
7. **Public research:** send only the sanitized public query plus prior public source metadata from this request. Ask for missing/outdated facts, primary sources, batched independent lookups and a concise evidence digest; stop when the facts are supported or state the precise gap. Do not repeatedly search an already answered gap or forward private owner text. This is task guidance, not a guaranteed reduction in provider tool loops or an arbitrary search cap.
8. **`src/server/usage.mjs`:** record only allowlisted `stage`, `promptBytes`, `prefixBytes`, `webSearchCount` metadata per attempt. Preserve latest cumulative Codex usage for the matching turn; never sum every cumulative notification. Claude input includes uncached + cache-read + cache-write exactly once. A missing Codex cache-write field is unavailable, not fabricated zero. Aggregate stages without adding their totals again to overall totals. Legacy calls remain stage-unavailable.
9. **`src/client/app.js`, `public/styles.css`, `public/index.html`:** in existing Usage, add an expandable task breakdown with attempt count, model input, cache read, uncached input and output. If any required component is missing, show uncached input as unavailable. Explain independent Send versus paused Continue and reference-only WORKING_CONTEXT.md. Preserve existing navigation, Stop appearance and reading mode.
10. Reconcile affected SDD owners through `to-sdd-pipeline` in dependency order, checking before/after each owner. Replace old implicit cross-Send context wording. Keep the destination's deployment and design baseline. Record authorization and verification without inventing historical passes.

### Required verification

- Seed a previous owner request, answer, source and memory marker. Send a new request in the same chat; no provider prompt or new final sources may contain them. Test separate chats too. Current request text must remain complete and appear once.
- Stop/Continue and failed-run Retry retain the same accepted ID and completed work. Attempted rebinding is denied. Exercise durable restart/restore validation.
- Independent consultants share a stable prefix within the request; a different request scope diverges before private owner text. Do not equate prefix bytes with cached tokens.
- Codex workspace reuse is limited to one request; cleanup removes only that workspace after workers drain. Test cancellation, parallel calls and credential/tool isolation.
- Use a long synthetic specialist answer: Head control input must shrink while Critic and final Head retain the full answer. Preserve selected depth and material deliverables.
- Check usage idempotency, failed attempts, unknown fields, stage totals, keyboard access and 320px wrapping in Chromium, Firefox and WebKit. Run the destination's complete checks.
- If testing a live provider, use synthetic text and identical selected model/effort. Record reported input/output/cache separately. Do not claim API discounts equal subscription savings.

### Source implementation evidence, 2026-09-26

Feature branch: `codex/context-cache-isolation`, based on `19f1294`. `npm run check`: 207 passed, 2 skipped. Usage browser checks passed Chromium, Firefox and WebKit. A small live GPT-6 Sol/high comparison used the same synthetic owner request and assignment: original provider input 9,825 tokens; revised input 6,228 tokens (36.6% lower) on two calls. Output varied (61 versus 26/25 tokens). Cache reads were 0 on the baseline and 3,072/0 on revised calls. This demonstrates reduced input in that fixture, **not** a production-wide savings percentage or reliable cache-hit rate. No full production consultation was rerun for this benchmark.

## D. Research execution, reusable evidence and complete provider accounting

Implement this unit in the target sister repository only. Verify its Git root, remote, current branch, instructions and architecture first. Map the files below to equivalent modules; preserve the target's hosting, authentication, storage and provider configuration. Do not copy local runtime data or alter another repository. Reconcile affected SDD documents through their owners and checker. Use a branch, verify, and follow the target's publication authorization.

### Required behavior

Keep the full accepted owner request and corrections, exact selected models/effort, user-selected discussion depth, cancellation and independent-Send isolation. Head remains the orchestrator and authors each assignment. Do not introduce generic assignments, cross-request evidence reuse, automatic model substitution, truncation or arbitrary research limits. A Continue restores only its accepted request.

1. **Preserve distinct claims.** In `src/server/codex-provider.mjs` and `claude-provider.mjs`, deduplicate sources by URL plus claim, not URL alone. Preserve title, claim, retrieval and publication dates. Keep the target's source safety validation. Test two distinct claims from the same URL through both adapters and persistence.
2. **Create `src/server/research-evidence.mjs`.** Derive stable `S-` references from a SHA-256 digest of JSON `[url, claim]`. Build one deduplicated metadata table per invocation. Replace only exact repeated metadata blocks and known Markdown link targets; retain prose, qualifications and dates. Never compact the owner request. Resolve references against the invocation's supplied table before visible storage/export, including nested JSON string values. Reject unknown references; allow one bounded regeneration using the same full context. Do not fabricate links. Keep legacy ordinary links valid.
3. **Integrate in `consultation-parallel.mjs`.** Add the table and relevant research body to the stable shared prefix used by `buildProviderContext`. Consultant-specific instructions follow it. Gather referenced event metadata only inside the current accepted request boundary; do not expose private event context to public research. Apply shared evidence consistently to specialists, Critic, correction assessment, final Head and repair calls. Merge resolved source metadata into the result before normal validation/storage.
4. **Let Head route evidence.** Extend `parseHeadPlan` in `parallel-contract.mjs` with optional `researchFor`, mapping Head's assignment indices to durable IDs. Omission means all assignments for backward compatibility; explicit empty list is valid when only Critic/final needs research. Each specialist gets only Head-selected research. Critic and final Head can inspect all current-request evidence.
5. **Head decides reuse or fresh research.** Parse a structured follow-up plan `{query, reuseRecord, fresh, researchFor}`. Give Head the actual Critic gap, assignment IDs, existing record keys/status/query and available evidence. Record keys are `initial` and `round:N`; assign the key after spreading saved data to prevent inherited key overrides. Reuse must reference completed initial/earlier-round research. Disallow query plus reuse and fresh plus reuse. Validate recipients. A fresh instruction must trigger research. Do not equate an identical query string with adequate evidence.
6. **Checkpoint before execution.** Validate the public query with existing privacy checks, then persist `round.researchPlan` before searching. Continue uses that plan without regenerating it. A cancelled search may run again; a completed reused result must not. Save `assignmentIds` and `reusedFrom` on research records; deduplicate reused bodies when building context. Validate added fields and make committed plans/results immutable in `validateParallelTransition`. Legacy ledgers without optional fields must still load. Never edit private storage files to migrate data.
7. **Content-free diagnostics.** In the Codex adapter, collect completed web-search actions per expected turn, deduplicate item IDs and record action enum, elapsed milliseconds, latest cumulative input/cached-input snapshots and repeated-action ordinal. Fingerprint raw action payloads only in invocation memory. Strip fingerprints, queries, URLs and raw text before persistence. In `usage.mjs`, allowlist numeric/null fields and action enums. Ignore wrong-thread/turn events; handle terminal-only items. Cumulative snapshots may be missing or delayed: never sum them or label their difference as exact tool cost. Existing authoritative token totals remain unchanged.
8. **Measure actual context.** Correct `scripts/measure-consultation-workload.mjs` to invoke the actual shared provider-context builder with current instructions. Cover clean, correction, long request, initial research, follow-up, repeated gap, Stop/Continue and evidence-heavy cases. Report stages, calls, search/query calls, prefix/discussion/total bytes. Bytes are not measured tokens.
9. **Optional live experiment.** Port `scripts/benchmark-research.mjs` as an explicit opt-in command requiring model/effort and an output path. Compare one combined public research request with concurrent focused requests using identical deliverables/settings and isolated workspaces. Record native input/cached/output totals, latency, actions and factual coverage. Do not automatically split production research based on hypothetical savings; preserve existing production timeouts and settings.

### Acceptance and evidence

Port `test/research-evidence.test.mjs` and provider/usage fixtures. Verify stable reference resolution, JSON quoting, unknown/foreign reference repair, multiple claims, target routing, explicit reuse across multiple rounds, explicit fresh search and immutable plans. Exercise Stop, encrypted store close/reopen and Continue: query planning runs once, cancelled search retries, full owner context remains. Seed other-request markers and ensure none enter prompts or sources. Diagnostics must contain no raw query or fingerprint. Run the target's full suite and real browser regression flows (Chromium, Firefox, WebKit), including Usage, Stop, retry and existing reading navigation. Do not restart an active consultation.

Reference result in the source repository: 214 tests passed, two platform-specific tests skipped; three browser engines passed. Evidence-heavy synthetic prompts fell from 111,075 to 97,835 bytes (11.9%). Small cases grew 0.1–1.2% from explicit routing metadata. Repeated-gap searches fell from two to one; recovery query-planning calls from two to one. These are fixtures, not production cost guarantees.

A single nonrandomized GPT-6 Sol/high public experiment used 58,450 input tokens for combined research versus 93,670 for two focused calls; cache and search variability were uncontrolled. Both covered requested facts. Consequently automatic splitting was not enabled. Repeat measurement on the target rather than promising the same savings. Record scoped verification separately from whole-product release readiness.

Deliver a reviewed diff, test evidence, measured tradeoffs and deployment status. Preserve all hosting-specific lifecycle logic of the sister repository. Do not copy this local application's server launcher into a hosted target.

### U-12 follow-up: Critic cache and complete reported usage

In `claude-provider.mjs`, keep one private temporary workspace per accepted request scope and expose `releaseScope`; have `providers.mjs` release both adapters. Continue to disable sessions, memories and tools. A stable directory alone was insufficient in a live test. Extend `provider-context.mjs` to expose the stable policy/owner prefix separately from changing evidence, output contract, assignment and discussion. For scoped Claude calls, pass trusted application policy and JSON-quoted, explicitly untrusted owner context through a private mode-0600 `--system-prompt-file`; send the changing suffix through stdin. Never place owner text in argv, enable file tools, resume CLI history or share request workspaces across Send. Remove the context file after every call, including failure, and release the directory at scope completion. Do not classify the trusted application policy itself as untrusted owner text. Preserve complete owner wording and original application policy. The pinned CLI supports `--system-prompt-file`; verify the target CLI before porting.

In `usage.mjs`, preserve positive per-model counts even from Claude `error_during_execution`; all-zero crash placeholders remain unknown. Keep each provider-reported model, retry, failed and cancelled attempt. Serialize usage callbacks so delayed running updates cannot overwrite terminal totals. In `codex-provider.mjs`, persist the expected turn's latest cumulative usage while running (throttled), then the terminal snapshot; never sum successive cumulative events. Keep wrong-thread/turn rejection.

Expose content-free per-attempt records in the authenticated usage summary. In `src/client/app.js`, add an expandable All call attempts section with stage, model, status, times and all six existing token fields. Clearly label aggregate partial coverage and unavailable counts. Explain that Codex-reported cache-write zero is not proof of no cache creation, Claude input already includes read/write tokens, and reasoning is an output subset. Do not invent counts missing from the provider or claim these are subscription charges. Keep unknown metrics unknown and preserve old saved records.

Port tests for workspace reuse/isolation, private context transport and cleanup, positive failed-call usage, partial multi-model totals, serialized updates, and real-browser rendering at 320px. `scripts/benchmark-critic-cache.mjs` is an explicit opt-in, public synthetic two-call probe with fixed model/effort. Source result on Opus 5.5/high: second call read 8,722 of 9,197 input tokens and wrote 473, versus zero reads with a stable workspace alone. This is not a guaranteed hit rate; changed prefixes, cache expiry and provider routing still matter. Never replay private consultations to benchmark.

### Upstream Codex accounting verification

Pinned Codex 0.155.1 exposes `thread/start.experimentalRawEvents: true` (initialize with experimental API capability). Listen for `rawResponse/completed` and read `params.usageMetadata.metadata`: the pinned SSE parser clones original `response.usage` there before normalizing absent fields to zero. This experimental interface must remain version-bound and cannot be assumed on arbitrary CLI versions.

Extract only numeric `input_tokens`, `output_tokens`, `total_tokens`, `input_tokens_details.cached_tokens`, `input_tokens_details.cache_write_tokens` and `output_tokens_details.reasoning_tokens`. Preserve explicit zero versus omission. Ignore raw item content and all attribution/response metadata outside the allowlist. Use response IDs only in memory to deduplicate per matching thread/turn; never persist raw events or IDs. Sum individual upstream completions and reconcile input/output/total against cumulative Codex totals when available. Never sum these two representations. If telemetry is missing or inconsistent, keep the original normalized accounting with truthful provenance and do not fail the consultation.

Persist `usageSource` and numeric `responseCount` in usage diagnostics; expose them in each attempt. Old records remain normalized and cannot be retroactively verified. Test positive writes, explicit zero, omitted fields, duplicate/foreign events, partial upstream coverage and removal of raw payloads. If explicitly authorized, verify through a real signed-in public synthetic call; otherwise record that live verification was not performed.

Actual subscription probe explicitly contained cache_write_tokens:0 upstream; it was not a parser default. Official Codex credit documentation states there is no separate cache-write charge: https://learn.chatgpt.com/docs/pricing#token-rates . This is an accounting distinction, not evidence of no physical cache storage, and credit rates alone do not determine included subscription usage. Do not apply API-key billing semantics or calculate imaginary cache writes from input minus reads.

If a raw response is available but cumulative totals never arrive (for example, transport failure), retain its measured counts as a partial lower bound. Persist `usageCoverage: partial` and include it in partial-coverage UI counts even when status is failed or cancelled. Matching cumulative totals permit `reconciled`; legacy fallback remains `normalized`. Cover the raw-only failed-turn case separately from partial raw data with complete cumulative counters.

## E. Attributed Usage dashboard, reasoning and activity counts

Apply only to the target sister repository. Preserve its hosting, authentication,
provider choices, SDD owners and private storage. Do not copy local grants or
conversations. This unit changes accounting visibility, not model prompts or
subscription billing.

1. In `src/server/usage.mjs`, normalize optional attribution alongside attempts:
   request ID, participant ID/role, and initial/retry/correction/follow-up research
   purpose. Keep older absent fields null. Include attribution in call details.
   Aggregate by provider, accepted request, participant and stage from the same
   attempt list. Sum repeat-work as a union, never add overlapping categories.
   Rank groups by reported total. Coverage is running if an attempt is active,
   otherwise partial if usage is missing/interrupted/partial, otherwise complete.
   Complete covers base totals, not every optional metric.
2. In `consultation.mjs`, bind callbacks to the accepted request message ID;
   Continue retains that ID. Attach participant metadata before storage. Track
   native attempt IDs per invocation to recognize provider-internal retries.
   In `consultation-parallel.mjs`, pass dynamic assignment role/ID, tag structure
   and policy retries, consultant corrections and follow-up research. Do not
   derive roles from model names or copy the assignment text into telemetry.
3. In `store.mjs`, preserve immutable attempt attribution across updates, include
   conversation identity in summary grouping, and retain deletion filtering.
   Keep backward compatibility with encrypted saved/recovery records. Historical
   records cannot be assigned invented request or participant identities.
4. Add `account-usage.mjs`: sanitize native limit windows and provide single-flight
   refresh with a 60-second TTL, retaining the last successful reading as stale
   on failure. In `codex-provider.mjs`, use authenticated `account/read` then
   `account/rateLimits/read` with a 10-second cancellation deadline and guaranteed
   cleanup. Prefer named limit buckets over the legacy bucket. Return only numeric
   windows, safe bucket names and timestamps; no account identity or raw payload.
   Do not start inference to refresh allowance. Claude's existing noninteractive
   result does not provide the documented interactive status-line percentages:
   link to `https://claude.ai/settings/usage` rather than calling private endpoints
   or estimating a percentage. Recheck the target adapter's supported telemetry.
5. Expose `/api/account-usage` behind the same session/origin protections as Usage.
   Keep it independent of `/api/usage` so unavailable accounts do not hide tokens.
6. Update `src/client/app.js`, `public/index.html`, `public/styles.css`: separate
   Codex/Claude cards, show uncached input, cache reads, cache-hit percentage and
   output immediately. Show Claude creation and supplied reasoning as subsets.
   Keep combined raw total secondary. Show account-wide percentage/reset/checked
   time separately. Add ranked request/participant/activity groups, repeat-work
   explanation, completeness, and timed chronological attempts with a request
   selector. Retain expandable raw accounting provenance. Clear allowance UI on
   logoff and reject stale asynchronous responses after privacy generation changes.
   Missing values differ from zero; input minus cache reads is uncached input,
   never inferred cache writes or subscription consumption.
7. Extend `test/usage.test.mjs`, add `test/account-usage.test.mjs`, test the native
   provider account read, and extend `scripts/browser-usage.mjs`. Cover overlap,
   unknown legacy attribution, running/partial status, cache TTL/stale handling,
   numeric allowlists, responsive layout, refresh errors and privacy cleanup.
   Verify Chromium, Firefox and WebKit and reconcile affected SDD descendants.
   Publish only after checking the final diff. Activate without interrupting runs.

Physical cache storage, exact subscription deductions and missing historical
telemetry cannot be reconstructed from these counters. Provider-reported token
usage stays authoritative. A verified zero cache-write counter means accounting
zero, not proof that nothing was physically cached.

### Reasoning attribution follow-up

Record the selected effort in adapter `beginUsage` diagnostics (`effort` and
`effortSource: request`) for Codex and Claude. Claude records its effective CLI
value after mapping Extra to xhigh. Allowlist these fields in `usage.mjs`, group
model totals by provider/model/effort, and expose the effort in individual calls.
Show it beside each model in provider cards, detailed model rows, activity rows
and the timeline. Do not confuse this setting with reasoning-output token counts.

For older records, a read-only summary enrichment may use the immutable saved
run configuration only when there is exactly one owner request, its ID matches
the snapshot, the attempt follows its timestamp, any recorded request ID matches,
and stage/provider/model identify the route. Preserve an existing recorded effort.
Otherwise show unknown; never use today's settings to label yesterday's calls.
Test mixed efforts on one model, unchanged totals, mismatched snapshots and
multi-request histories. Compare saved runs before spending tokens on new probes;
report consultant count, research actions, corrections, cache use and latency,
and distinguish observed differences from causal or quality claims.

### Activity counts follow-up

Expose a scoped `activity` summary with consultant assignments, issued review
rounds, issued correction orders, research call attempts and web actions.
`store.mjs` supplies counts from the saved parallel ledger (assignments, rounds,
orders). Flag incomplete historical coverage if earlier owner requests are not
in that ledger. `usage.mjs` counts `public_research` attempts and sums their
reported `webSearchCount` values. Unknown stages or missing telemetry remain
unknown/partial; a saved conversation without recorded attempts is not proof of
zero research. Count retries as calls, never as additional consultants or rounds.
Render all five metrics in Usage with labels and coverage; respect its selected
conversation/all-conversations scope. Test exact counts, aggregated ledgers,
legacy gaps, running telemetry and narrow-screen rendering.

## F. Final liquid-glass navigation, including the verified fixes

Use the final implementation at `2c50cd6`: commits `7e08eac`, `3c32839` were intermediate translucency/bevel designs and must not be reproduced as the final result. Relevant final commits: `8b11fd0`, `91bf8c9`, `2c50cd6`. Files: `src/client/navbar-glass.js`, integration in `src/client/app.js`, optical styles in `public/styles.css`, browser fixture `scripts/browser-navbar-glass.mjs`.

Implement actual curved-edge pixel displacement with a clear centre and undistorted native controls. A transparent fill, frosted blur or thick metallic border alone is insufficient. The reference reconstructs only a narrow explicitly selected page strip in local canvases, then applies rounded-rectangle edge displacement with bilinear sampling and alpha taper. Reference tuning: 24px sampling bleed, up to 17px edge band, 15px displacement. Keep the lens decorative, aria-hidden, pointer-transparent, and below controls in an isolated stacking context.

Sample appropriate visible background roots, excluding the bar itself and unrelated private overlays. Render supported text/solid surfaces/same-origin images and control backgrounds/borders. Never read or paint input values, selected options or textarea text. Preserve the same-origin image boundary and fail safely when a canvas cannot be rendered. This is a DOM-derived approximation: gradients, complex clipping, transforms, video and arbitrary browser pixels are not fully reproduced. Do not claim native Apple material or universal screenshot fidelity. Do not rely on SVG backdrop-filter URL displacement being supported in Safari merely because CSS parsing succeeds.

Two mandatory final corrections:

- Content geometry: the source's Conversations and Settings were capped at 950px while Discussion used 1116px, leaving curved bar ends over empty background. They now share the wider content footprint. Adapt the destination layout so visible content actually passes under the curved edges on EVERY page. Do not blindly hard-code source widths or IDs in a different layout. Keep the approved Discussion appearance and responsive fit. A blank background cannot produce visible refraction.
- No clear-before-repaint flicker: ordinary DOM mutations schedule a coalesced replacement frame while retaining the previous rendered frame. Do not blank the canvas before every scheduled update. Logout, lock, disallowed rendering and other privacy transitions still synchronously clear both source/output buffers and cancel queued work. Deferred callbacks must recheck permission so cleared private pixels cannot reappear.

Capture scroll events so nested scrolling refreshes the lens; refresh on relevant mutations, resize, font readiness and visibility changes. Avoid a perpetual render loop and repeated renderer instances. If the destination mounts/unmounts components, implement cleanup for listeners, observers, pending frames and canvas. Respect reduced transparency and forced colours with a readable opaque fallback. Do not persist or transmit sampled pixels.

Verify real Discussion, Conversations AND Settings views while scrolling and receiving background updates, in addition to the synthetic fixture. Test visible refraction, centre transparency, page switching, responsive geometry, pointer/keyboard controls, nested scrolling, mutation refresh without an intervening blank frame, and synchronous privacy clearing. Changing a private field value must not alter sampled pixels; changing its background must. Inspect screenshots with actual content under the edges. Test Chromium, Firefox and WebKit; distinguish native Safari/physical-device evidence from emulation.

## Final verification, documentation and delivery

The historical source test counts and live probes embedded above describe source evidence only; they are not target passes, guaranteed savings or permission for new live calls. Live subscription probes and benchmarks are optional and require explicit authorization. If native telemetry differs by target CLI version, preserve truthful unknown/partial coverage and documented limitations rather than inventing counters or blocking consultation completion.

Run the target's full checks and relevant integration/browser tests in isolated synthetic storage. Include the baseline's cancellation, retries, linked Critic orders, dependency scheduling, recovery and source-persistence regressions. Verify exact accepted request isolation, no previous-chat/memory leakage, authoritative accounting without cumulative double counting, meaningful source resolution, selected effort, activity scopes, reading navigation, native RTF and glass behavior.

Use the installed to-sdd-pipeline ownership contract to reconcile affected product requirements, context/terms, design and descendants through architecture, DoD, QA and development plan. Only the orchestrator writes the target manifest. Preserve target-specific approved evidence; document authorized visual changes rather than copying source hashes or claiming old approval for a changed surface. Run its checker before/after owner invocations. Keep formal release readiness not_evaluated unless its separate criteria are actually verified.

Record an implementation/verification receipt with mapped files, source references, target changes, commands/results, skipped checks and limitations. Review the diff for private data and machine-specific paths. Commit and push only this target's changes following its repository workflow; report the branch and commit. Do not deploy or restart an active consultation. Report separately what is committed, what is running, and any activation still needed. Preserve recoverable storage and credentials before any authorized activation or migration.

Do not modify the separate Custom Agent Skills repository as part of this application port. If liquid-glass is installed, it may guide implementation; this prompt does not require that skill or any source-machine path at runtime.
