# Definition of done and evaluation gates

## Source references and verification profile

Current PRD, context/terms, guardrails, journey, screen map, wireframes, design brief and architecture define this profile. This document defines gates; it does not execute tests. **Definition status: prepared. Release readiness: not_evaluated.** Visual binding is `nanoduck-electric-a-v8-20260914`, using the target/tree hashes and permitted variance in the design brief. The current QA memberships remain prepared and source-bound; no execution is inferred.

## Definition of done model

Acceptance means an observable requirement holds at its declared seam. Completion additionally requires current source/baseline binding, appropriate evidence, no open blocking findings, protected data and exact authorized scope. A design candidate can pass a local simulation check while application behavior remains unverified. Local implementation checks are evidence only for their named seam.

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

Commit/push reviewed artifacts to the already authorized public repository only after public-content and local checks. The existing artifact checker is limited to links/path hygiene/syntax; it does not prove the gates above. No extra publication or merge policy is invented. Architecture and this DoD are reconciled with the approved design and authorized local refactor; QA and plan reconciliation follow before a release decision.

## Out of scope and open questions

This owner defines gates and runs no product tests. Current provider, cross-platform, actual-browser/local-network, assistive-technology and representative-owner evidence must be supplied by the actual executor. Prepared checks are not results. Missing evidence limits its corresponding readiness claim; the artifact checker cannot create a user observation or close a security check. No additional material product decision is required for the current architecture.

## Scoped browser, research and provider evidence

Apply the existing functional and security gates to the corrected date classification and exact Claude-model boundary. Positive date-only research evidence must accompany negative contact/secret checks. Package installation or authentication status alone cannot prove Opus 5.5 execution. Audio preparation and browser playback events do not establish physical iPhone audibility; that supported-device claim requires an observed listening result. Keep representative-user, accessibility and formal release evaluation separate from scoped regression evidence.

## Parallel consultation evaluation scope

FR-02.9–FR-02.15 belong to `product_functional_requirements`; FR-03.5/NFR-01.2–01.3 also use existing continuity checks. Product security gate retains every mapped security clause and extends its evidence to dynamic-role authority, private guidance, cross-run references, concurrent commits and stale Critic assessments. Lifecycle evidence includes legacy/new contract recovery and cancellation of all workers. Efficiency evidence compares matching synthetic scenarios and complete outcomes; no fixed saving percentage or invented quota metric is required. The existing UI, heuristic and representative-user gates cover changed Discussion/Settings/Outcome behavior within the retained baseline. New definitions are prepared; no execution or release success is implied.

## Critic reliability and model usage — 2026-09-25

Extend existing functional, persistence, product_security_requirements and browser gates for FR-02.13/FR-02.15/FR-05.3. Require multi-finding preservation, one bounded malformed-review repair, finite long-Claude timeout/cancellation, safe failure diagnostics, provider-native token accounting without duplicate totals, encrypted restart/backup/restore/deletion, and authenticated responsive Usage states. Definition status: prepared; execution evidence is recorded separately in QA. This extension does not imply account-wide usage or historical backfill.

## Sticky consultation views — 2026-09-25

For the existing navigation/fidelity/browser gates, verify all four view controls remain visible and reachable after scrolling in active and inactive discussion states, without changing Stop behavior. Keep functional, visual and representative-user evidence distinct.

## Review-repair evaluation scope — 2026-09-26

Existing functional, security and lifecycle gates apply to the architecture's review repairs: immutable linked correction attempts, immediate dependency scheduling, accepted saved instructions, reserved actor identities, secret rejection, end-to-end sources and Critic summaries, isolated bounded follow-up research, and reconnect/slow-usage behavior. Require negative tests for tampered lineage and sensitive transfer plus Stop/retry persistence tests. Browser recovery needs real-engine observations, not only simulated functions. No new gate or product scope is introduced; this owner defines evaluation requirements and runs no tests. Release readiness remains not_evaluated.

## Isolated request and cache economy — 2026-09-26

Existing functional, security and efficiency gates require new-Send isolation, Continue preservation, provider-workspace cleanup, complete current request/results, unchanged model/depth and truthful token subsets. Compare equivalent synthetic inputs/settings; report measured bytes separately from provider tokens. Provider cache hits and subscription savings cannot be inferred from prefix length. Existing browser/accessibility/user-validation evidence classes remain separate; formal release readiness is not_evaluated.

## Chat beginning and end controls — 2026-09-26

The user explicitly requested two transparent outlined circular arrow buttons to jump to the beginning and end of the chat. This is a scoped addition to existing S-02 navigation under UC-003/JOB-001; preserve Stop, drafts and ongoing work.

## Centered chat arrows — 2026-09-26

The explicit user correction replaces grouped navigation placement: the up arrow sits at the horizontal center near the viewport top, below global navigation; the down arrow sits at the horizontal center near the bottom safe area. Both remain fixed while scrolling, 44px transparent outlined circles, with existing accessible labels and reduced-motion behavior. They remain confined to the consultation page. No server/session changes.

## Chat boundary visibility — 2026-09-26

Hide the up arrow when the visible content beginning is reached and hide the down arrow when its end is reached; restore each when scrolling away. Hide both when the content fits. Update on scroll, viewport resize, view changes and incoming content without moving the reading position. Preserve centered 44px transparent controls and reduced motion. Navigation follows the currently selected consultation view rather than switching it. No server/session changes.

## U-12 research and evidence economy — 2026-09-26

U-12 research and evidence economy: preserve every distinct supported claim, full accepted owner input, exact models/effort and user-selected depth. Reuse evidence only inside the accepted request, including Continue/Retry. No cross-Send cache. Measure actual prompt construction and research stages before claiming savings. Require repeated-URL distinct-claim preservation, unknown-reference denial/recovery, no references from another request, immutable research checkpoint, cancellation recovery and full owner/context coverage. Benchmark equal settings and deliverable coverage; separate bytes, cached/uncached tokens and latency. No guaranteed subscription-cost saving. Formal release readiness remains not_evaluated.

## U-12 Critic cache and usage completeness — 2026-09-26

U-12 follow-up: retain an isolated Claude working context within one accepted request without session history or tools. Verify actual provider cache reuse with public synthetic consecutive calls. Preserve every reported token count including retries and failed calls, label partial/unknown metrics and provider-specific cache semantics, expose per-attempt breakdowns without duplicating totals. Keep full owner input, model/effort, discussion depth and independent-Send isolation. Existing Usage layout and Electric A v8 remain; no prototype reuse. User explicitly authorizes implementation and validation.
