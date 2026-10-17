# Definition of done and evaluation gates

## Source references and verification profile

Current PRD, context/terms, guardrails, journey, screen map, wireframes, design brief and architecture define this profile. This document defines gates; it does not execute tests. **Definition status: prepared. Release readiness: not_evaluated.** Visual binding is `nanoduck-electric-a-v8-20260914`, using the target/tree hashes and permitted variance in the design brief. The current QA memberships remain prepared and source-bound; no execution is inferred.

## Definition of done model

Acceptance means an observable requirement holds at its declared seam. Completion additionally requires current source/baseline binding, appropriate evidence, no open blocking findings, protected data and exact authorized scope. A design candidate can pass a local simulation check while application behavior remains unverified. Local implementation checks are evidence only for their named seam. A bounded controlled contribution is not acceptance of the whole requirement/state. Every required product clause and state retains required real-consumer integration/release acceptance, allocated by the plan; component/mocked evidence cannot discharge it. Required failed, missing, stale or deferred evidence keeps the corresponding unit/release claim incomplete.

## Gate table

| Gate | Purpose and applicable source | Required evidence and pass/block rule | Rerun and automation |
|---|---|---|---|
| product_functional_requirements | Every FR clause, including FR-02.9–FR-02.15 and user-selected depth. | Source-bound runtime evidence for distinct Head-authored tasks, dynamic roles, complete nonduplicated owner context, parallel independent results, explicit Critic-order fulfillment, fixed/Auto depth and provisional closure. No generic task, silent context loss, missing deliverable or false resolution may pass. Preserve existing access, settings, sound, research and record obligations. | Changed behavior/context/provider/state mapping; synthetic checks plus scoped actual browser/provider observations. A plan or simulation alone cannot establish readiness. |
| product_security_requirements | All PRD security clauses listed below, across their applicable UCs. | Positive and denied/adversarial checks at the actual enforcement boundary, configuration/dependency and protected-data evidence. Verify permitted Markdown renders as content while raw HTML, unsafe links and prohibited hosts remain inert or rejected. A detected prohibited-language sentence or unsuitable URL in generated prose is withheld before persistence while useful surrounding text survives; owner input and source metadata retain their rejection boundary. For Claude Critic, prove command-level tool denial, no direct research and rejection before persistence of an internal tool transcript, including its one bounded text-only retry and safe failure after a second trace. Local credentials, bounded login failures, allowed Host/Origin/CSRF, TLS and per-device trust, private file modes/Windows ACLs, full-state ciphertext and tamper handling require positive and denied tests. All required obligations must pass; a mockup or screenshot cannot satisfy this gate. | Changed trust/data/input/identity/provider/local-network boundary; implementation tests at the trusted boundary plus authorized manual review; neither alone establishes every gate obligation. |
| approved_visual_baseline_fidelity | Whole selected candidate, its scope/targets and NFR-02.1–02.3 / FR-08.1–08.3. | Current Baseline ID, frozen target/tree hashes, route/state/viewport, permitted variance and visual evidence with no unexplained drift. Before selection this is a parameterized definition, not an approval claim. | Any baseline/source/rendering change; browser/visual review plus later comparison tooling. |
| heuristic_usability_review | H1–H10 across J-01–J-07, seven UCs and every applicable state/surface. | Named expert review of desktop/mobile tasks and recovery, with evidence and classified findings. Critical omissions or open blocking findings block; screenshots alone do not prove the review. | Changed navigation, flow, copy, controls or state behavior; manual expert review. |
| representative_user_task_validation | Critical consultation, voice, Settings, interruption and record-control tasks from the design brief. | Observed representative-owner task completion with task/device/success criterion and findings. AI review is not user research. Required deferred/unrun tasks cannot pass release. | Material task/interaction change or resolved blocking finding; manual owner sessions, not yet run. |
| lifecycle_and_continuity | NFR-01.1–01.4 and architecture’s local update/restore/model-preservation boundary. | Actual durable acceptance, restart, Stop, retry and isolated backup/restore evidence; complete private-state encryption, process-lock exclusion/crash recovery and deletion-aware restoration. Verify same-tab surface/record/reading-position recovery without browser-persisted drafts/content. Terminal provider events commit once only after matching successful completion; early/unrelated/failed/closed/cancelled events cannot become replies. Preserve exact settings, classify RPC failures without raw private diagnostics, and resume the missing contribution. Verify clean setup/start/reset/certificate renewal on macOS, Linux and Windows, plus HTTPS browser access from a same-network Wi-Fi device. A document or single-platform check cannot satisfy another platform. | Storage/provider/runtime/setup changes; automated isolated tests and named manual device/OS/network checks. |

### Product security membership

The `product_security_requirements` gate covers NFR-10.1, NFR-10.2, NFR-10.3, NFR-11.1, NFR-11.2, NFR-11.3, NFR-12.1, NFR-12.2, NFR-12.3, NFR-13.1, NFR-13.2, NFR-14.1, NFR-14.2, NFR-14.3, NFR-15.1, NFR-16.1 and NFR-16.2. Each requires its own concrete implementation-level allowed/denied evidence. Unknown technical parameters retain a named prerequisite; they are never silently passed or weakened for a prototype.

### Clause-to-gate allocation

All FR-01.1–01.2, FR-02.1–02.15, FR-03.1–03.6, FR-04.1–04.3, FR-05.1–05.6, FR-06.1–06.3, FR-07.1–07.5 and FR-08.1–08.3 resolve to `product_functional_requirements`. NFR-01.1–01.4 resolve to `lifecycle_and_continuity`; NFR-02.1–02.3 resolve to `approved_visual_baseline_fidelity` and their explicit accessibility/browser checks. Security membership above is exhaustive for the current PRD. Every screen-map state also needs a functional simulation check. H1–H10 and representative-user checks are additional evidence classes, not substitutions for these obligations.

## Eval result format and evidence requirements

Each executed result records gate/check ID, exact evaluated revision or candidate/version, source/baseline hashes, executor, timestamp, route/state/viewport/content fixture, evidence kind/path/hash, observed result, findings and rerun rule. Store definition and execution status separately. Allowed execution statuses are not_run, passed, failed, blocked, deferred and not_applicable with a source-backed reason where applicable. Prepared means the check is specified, not that its runtime prerequisites exist or it has executed.

Binding Status: approved_baseline; `nanoduck-electric-a-v8-20260914` is the actual owner-approved target. Approval does not execute any check. The orchestrator binds concrete QA IDs bidirectionally from the QA owner return; this later index is not a DoD-authoring prerequisite. At release, every applicable required gate and blocking finding must be closed with fresh evidence. Do not relabel an advisory failure as passed.

## Failure and blocker classification

Use the exact [PRD canonical severity and release-effect definition](prd.md#canonical-finding-severity-and-release-effect); this document does not maintain a competing shorthand scale. Every finding states applicability, source, evidence, severity, release effect and rationale. Missing runtime evidence blocks the corresponding release claim, not unrelated design exploration.

## PR, merge and completion rules

[AGENTS.md](../AGENTS.md) owns coding execution, continuation, Git delivery and pause behavior; [guardrails](guardrails.md) owns repository/publication authority and private-content restrictions. The artifact checker proves only its link/path/syntax scope. A merge, push, scoped fixture pass or document validation cannot satisfy the six gates. This definition is reconciled against the retained baseline and current architecture; concrete QA and plan allocation follow without new production authority.

## Out of scope and open questions

This owner defines gates and runs no product tests. Current provider, cross-platform, actual-browser/local-network, assistive-technology and representative-owner evidence must be supplied by the actual executor. Prepared checks are not results. Missing evidence limits its corresponding readiness claim; the artifact checker cannot create a user observation or close a security check. No additional material product decision is required for the current architecture.

## Scoped browser, research and provider evidence

Apply the existing functional and security gates to the corrected date classification and exact Claude-model boundary. Positive date-only research evidence must accompany negative contact/secret checks. Package installation or authentication status alone cannot prove Opus 5.5 execution. Audio preparation and browser playback events do not establish physical iPhone audibility; that supported-device claim requires an observed listening result. Keep representative-user, accessibility and formal release evaluation separate from scoped regression evidence.

## Parallel consultation evaluation scope

FR-02.9–FR-02.15 belong to `product_functional_requirements`; FR-03.5/NFR-01.2–01.3 also use existing continuity checks. Product security gate retains every mapped security clause and extends its evidence to dynamic-role authority, private guidance, cross-run references, concurrent commits and stale Critic assessments. Lifecycle evidence includes legacy/new contract recovery and cancellation of all workers. Efficiency evidence compares matching synthetic scenarios and complete outcomes; no fixed saving percentage or invented quota metric is required. The existing UI, heuristic and representative-user gates cover changed Discussion/Settings/Outcome behavior within the retained baseline. New definitions are prepared; no execution or release success is implied.

## Critic reliability and model usage — 2026-09-25

Extend existing functional, persistence, product_security_requirements and browser gates for FR-02.13/FR-02.15/FR-05.3. Require multi-finding preservation, one bounded malformed-review repair, finite long-Claude timeout/cancellation, safe failure diagnostics, provider-native token accounting without duplicate totals, encrypted restart/backup/restore/deletion, and authenticated responsive Usage states. Definition status: prepared; execution evidence is recorded separately in QA. This extension does not imply account-wide usage or historical backfill.

## Sticky consultation views — 2026-09-25

Current fidelity, functional and usability evidence must show that all four consultation views and status/Stop remain reachable under the accepted desktop rail/narrow-picker layout. Earlier horizontal sticky treatments are historical; current design and wireframes supply the visual/structural criterion.

## Review-repair evaluation scope — 2026-09-26

Existing functional, security and lifecycle gates apply to the architecture's review repairs: immutable linked correction attempts, immediate dependency scheduling, accepted saved instructions, reserved actor identities, secret rejection, end-to-end sources and Critic summaries, isolated bounded follow-up research, and reconnect/slow-usage behavior. Require negative tests for tampered lineage and sensitive transfer plus Stop/retry persistence tests. Browser recovery needs real-engine observations, not only simulated functions. No new gate or product scope is introduced; this owner defines evaluation requirements and runs no tests. Release readiness remains not_evaluated.

## Isolated request and cache economy — 2026-09-26

Existing functional, security and efficiency gates require new-Send isolation, Continue preservation, provider-workspace cleanup, complete current request/results, unchanged model/depth and truthful token subsets. Compare equivalent synthetic inputs/settings; report measured bytes separately from provider tokens. Provider cache hits and subscription savings cannot be inferred from prefix length. Existing browser/accessibility/user-validation evidence classes remain separate; formal release readiness is not_evaluated.

## Chat beginning and end controls — 2026-09-26

Navigation/fidelity/accessibility evidence must cover beginning/end controls without sending, stopping, changing the selected view or losing draft/accepted work.

## Centered chat arrows — 2026-09-26

Verify the current approved centered controls across supported viewports, keyboard/reduced-motion states and the open/collapsed composer variants. Read appearance and placement from the design brief rather than treating older transparent-only styling as current.

## Chat boundary visibility — 2026-09-26

Observe correct beginning/end hiding and readable last content under incoming messages, panel changes, viewport changes and visible bottom controls. Control-state/visual evidence remains distinct from representative-owner task validation.

## U-12 research and evidence economy — 2026-09-26

U-12 research and evidence economy: preserve every distinct supported claim, full accepted owner input, exact models/effort and user-selected depth. Reuse evidence only inside the accepted request, including Continue/Retry. No cross-Send cache. Measure actual prompt construction and research stages before claiming savings. Require repeated-URL distinct-claim preservation, unknown-reference denial/recovery, no references from another request, immutable research checkpoint, cancellation recovery and full owner/context coverage. Benchmark equal settings and deliverable coverage; separate bytes, cached/uncached tokens and latency. No guaranteed subscription-cost saving. Formal release readiness remains not_evaluated.

## U-12 Critic cache and usage completeness — 2026-09-26

Require actual provider evidence before a cache-reuse claim, and controlled negative evidence for zero/missing/partial categories, retries and failed calls. Report all base totals once; preserve exact context/model/effort/depth. A historical synthetic count cannot establish current subscription savings or a completed provider invocation.

## U-12 upstream usage verification — 2026-09-26

Require numeric accounting provenance and expected-turn deduplication/reconciliation evidence, explicit zero versus absent fields, and proof that optional telemetry failure cannot interrupt work. Verify no raw private payload or hidden reasoning persists. Uncached input cannot stand in for a reported cache-write count.

## U-13 actionable usage dashboard — 2026-09-26

U-13 verification requires attribution persistence, no double counting, null-versus-zero and completeness cases, account-window validation, timeout/caching, legacy compatibility and Chromium/Firefox/WebKit responsive Usage checks. No subscription-cost reconstruction. Formal release readiness stays not_evaluated.

## U-13 reasoning attribution follow-up — 2026-09-26

Require distinct provider/model/effort groups and timeline labels, validated immutable historical attribution or explicit unknown values, without changing user settings. A usage difference alone cannot prove a quality difference.

## U-13 activity counts follow-up — 2026-09-26

Require correctly scoped counts for consultants, team review rounds, correction orders, research attempts and reported web actions, including partial historical coverage. Keep application counters distinct from native account-wide allowance and preserve privacy.

## Clear-glass navigation follow-up — 2026-09-26

The earlier plain-transparency treatment is superseded by the approved refraction mechanism. Current acceptance requires the design brief’s optical effect and readable native controls, plus privacy, forced-color and reduced-transparency evidence.

## Glass edge refinement — 2026-09-26

The earlier metallic/masked-bevel treatment is superseded. It cannot satisfy current liquid-glass fidelity. Evaluate the retained canvas refraction, cross-surface stability and privacy-clearing contract instead.

## Navbar refraction renderer — 2026-09-26

User-authorized liquid-glass renderer replaces the rejected metallic bevel. A local canvas paints only the narrow strip from visible application text, solid surfaces and same-origin images, then displaces pixels along a rounded-rectangle optical edge. The centre remains native and clear; controls remain native and sharp. No external capture service, third-party runtime, stored pixels or transmitted content. Ignore inputs and hidden elements. Clear pixels synchronously on privacy lock/logout and on visibility changes; stop rendering for reduced transparency or forced colors. Update on scroll, resize and observed content changes, not a perpetual loop. CSS gradients and arbitrary embedded media are not part of the sampling contract; the application text/solid surface layout is. Verify actual pixel deformation and privacy clearing in all engines, not merely CSS parsing.

## Unit evidence freshness and integration ownership

QA owns canonical per-check acceptance levels, evidence modes and required source paths. The plan owns construction/acceptance dependencies and exactly one acceptance owner per applicable check. A required check in a required gate stays required; no pending integration obligation can disappear into component coverage. Controlled checks must state which external boundaries are fixtures and which local consumers are exercised.

An executed unit check binds the current plan hash, baseline, actual source/configuration/test inventory, executor and time within its real unit run. Real-consumer integration/release also requires inspected integration evidence and the separately required visual, heuristic or representative-user evidence class. Matching old file hashes alone does not create a new execution. Changed shared files invalidate affected evidence; retained older records remain historical and cannot receive new timestamps or source bindings. After a correction, required affected evidence must be rerun against the integrated final revision. No unit run or gate is executed by this documentation reconciliation.
