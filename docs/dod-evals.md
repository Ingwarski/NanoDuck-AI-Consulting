# Definition of done and evaluation gates

## Source references and verification profile

Current PRD, context/terms, guardrails, journey, screen map, wireframes, design brief and architecture define this profile. This document defines gates; it does not execute tests. **Definition status: prepared. Release readiness: not_evaluated.** Visual binding is pending an approved baseline; concrete QA memberships are bound only after the QA owner creates them.

## Definition of done model

Acceptance means an observable requirement holds at its declared seam. Completion additionally requires current source/baseline binding, appropriate evidence, no open blocking findings, protected data and exact authorized scope. A design candidate can pass a local simulation check while production behavior remains unimplemented and unverified.

## Gate matrix

| Gate | Purpose and applicable source | Required evidence and pass/block rule | Rerun and automation |
|---|---|---|---|
| product_functional_requirements | PRD functional clauses, all UCs, complete surface/state coverage and preserved models. | Actual browser/service/provider results for production; separately labelled simulation evidence for design checks. Every applicable clause must have a concrete check; false success, missing required flow or silent model substitution blocks. | Changed behavior, provider/catalog or state mapping; automation not available yet for production, manual simulation review available. |
| product_security_requirements | All PRD security clauses listed below, across their applicable UCs. | Positive and denied/adversarial checks at the actual enforcement boundary, configuration/dependency and protected-data evidence. All required obligations must pass; a mockup or screenshot cannot satisfy this gate. | Changed trust/data/input/identity/provider/hosting boundary; implementation test runner and authorized manual review, not available until implementation exists. |
| approved_visual_baseline_fidelity | Whole selected candidate, its scope/targets and NFR-02.1–02.3 / FR-08.1–08.3. | Current Baseline ID, frozen target/tree hashes, route/state/viewport, permitted variance and visual evidence with no unexplained drift. Before selection this is a parameterized definition, not an approval claim. | Any baseline/source/rendering change; browser/visual review plus later comparison tooling. |
| heuristic_usability_review | H1–H10 across J-01–J-07, seven UCs and every applicable state/surface. | Named expert review of desktop/mobile tasks and recovery, with evidence and classified findings. Critical omissions or open blocking findings block; screenshots alone do not prove the review. | Changed navigation, flow, copy, controls or state behavior; manual expert review. |
| representative_user_task_validation | Critical consultation, voice, Settings, interruption and record-control tasks from the design brief. | Observed representative-owner task completion with task/device/success criterion and findings. AI review is not user research. Required deferred/unrun tasks cannot pass release. | Material task/interaction change or resolved blocking finding; manual owner sessions, not yet run. |
| lifecycle_and_continuity | NFR-01.1–01.4 and architecture's deployment/restore/model-preservation boundary. | Actual acceptance/restart/Stop/retry evidence, isolated restore/deletion behavior, exact app/database ownership, runtime/configuration and post-deploy/rollback observations. No broad GoDaddy changes; absence of required host evidence blocks release. | State/storage/provider/runtime/deployment changes; production harness and scoped host inspection unavailable until later authorization. |

### Product security membership

The `product_security_requirements` gate covers NFR-10.1, NFR-10.2, NFR-10.3, NFR-11.1, NFR-11.2, NFR-11.3, NFR-12.1, NFR-12.2, NFR-12.3, NFR-13.1, NFR-13.2, NFR-14.1, NFR-14.2, NFR-14.3, NFR-15.1, NFR-16.1 and NFR-16.2. Each requires its own concrete implementation-level allowed/denied evidence. Unknown technical parameters retain a named prerequisite; they are never silently passed or weakened for a prototype.

### Clause-to-gate allocation

All FR-01.1–01.2, FR-02.1–02.8, FR-03.1–03.6, FR-04.1–04.3, FR-05.1–05.5, FR-06.1–06.3, FR-07.1–07.5 and FR-08.1–08.3 resolve to `product_functional_requirements`. NFR-01.1–01.4 resolve to `lifecycle_and_continuity`; NFR-02.1–02.3 resolve to `approved_visual_baseline_fidelity` and their explicit accessibility/browser checks. Security membership above is exhaustive for the current PRD. Every screen-map state also needs a functional simulation check. H1–H10 and representative-user checks are additional evidence classes, not substitutions for these obligations.

## Eval result format and evidence requirements

Each executed result records gate/check ID, exact evaluated revision or candidate/version, source/baseline hashes, executor, timestamp, route/state/viewport/content fixture, evidence kind/path/hash, observed result, findings and rerun rule. Store definition and execution status separately. Allowed execution statuses are not_run, passed, failed, blocked, deferred and not_applicable with a source-backed reason where applicable. Prepared means the check is specified, not that its runtime prerequisites exist or it has executed.

Before approval, record Binding Status: pending_baseline; do not invent a Baseline ID, target or approval. The orchestrator binds concrete QA IDs bidirectionally from the QA owner return; this later index is not a DoD-authoring prerequisite. At release, every applicable required gate and blocking finding must be closed with fresh evidence. Do not relabel an advisory failure as passed.

## Failure and blocker classification

Use the exact [PRD canonical severity and release-effect definition](prd.md#canonical-finding-severity-and-release-effect); this document does not maintain a competing shorthand scale. Every finding states applicability, source, evidence, severity, release effect and rationale. Missing runtime evidence blocks the corresponding release claim, not unrelated design exploration.

## PR, merge and completion rules

Commit/push reviewed design artifacts to the already authorized public repository only after public-content and local checks. The existing artifact checker is limited to links/path hygiene/syntax; it does not prove the gates above. No production merge or deployment policy is invented. The approved design must later reconcile architecture/DoD/QA before the development plan; a separate later user prompt authorizes implementation.

## Out of scope and open questions

No tests, security scan, provider generation, microphone capture, deployment or data deletion is executed by this owner. Real provider/host evidence, technical parameter values and representative-user sessions remain named future prerequisites. Prototype comparison evidence is a later evaluation lookup; whole-design approval remains pending. These gate definitions do not claim that a prototype walkthrough passes production checks.
