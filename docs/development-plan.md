# Development plan

17 October 2026 · Owner-reviewed unit-contract migration · U-14 and U-15 pending · Documentation-only handoff awaiting a separate implementation prompt

## Source References

The current [PRD](prd.md) owns all 67 requirement clauses, seven use cases and ten acceptance scenarios. [Project context](project-context.md) and [canonical terms](canonical-terms.md) are applied to the single-owner local/LAN scope, exact role/model vocabulary, independent Send and accepted-request continuation; no conflict remains. [Guardrails](guardrails.md) owns product authority. [Journey](user-journey.md), [screen map](screen-map.md) and [wireframes](wireframes.md) supply JOB-001–JOB-006, J-01–J-07, S-01–S-09 and ST-01–ST-44. The [product idea](product-idea.md) preserves confirmed intent rather than adding work.

The [design brief](design-brief.md#approved-visual-baseline) supplies the retained Electric A v8 baseline and accepted scoped variance. [Architecture](architecture.md), [DoD](dod-evals.md) and [QA](qa-checklist.md), reconciled in that order, define mechanisms, all six required gates, all 91 prepared/not_run checks and canonical acceptance at QA’s Acceptance definitions. This plan consumes those complete definitions, evidence/severity/recovery conventions, H1–H10 and representative-owner tasks. [Model settings](model-settings.md) preserves exact selected tuples and provider pins. The [current scope](../forge/runs/sdd-reconciliation-20261017/scope.json) authorizes documentation reconciliation and narrow root-instruction setup only.

The exact [legacy plan](../forge/runs/sdd-reconciliation-20261017/legacy-development-plan.md.txt), SHA-256 `59106bb01bd0df2d4f5290134abb1668e4c188eb0f267e3072d9d2dd24dda9b0`, and [prior bindings](../forge/runs/sdd-reconciliation-20261017/prior-bindings.json) preserve every U-01–U-13 scope, allocation, dated authorization and historical result. The [reviewed advisory source inventory](../forge/runs/sdd-reconciliation-20261017/source-inventory.json) and [QA owner projection](../forge/runs/sdd-reconciliation-20261017/qa-owner-projection.json) were checked against actual files and canonical QA definitions; neither creates product scope or execution evidence. Current content hashes are returned to the orchestrator.

## Implementation Strategy

Retain one existing Node HTTPS application, its encrypted SQLite state, isolated subscription adapters, exact settings and accepted records. Inspect and correct discrepancies against the current specification; no rewrite, new service, feature, provider or visual direction is proposed. Requirements, approved design and architecture drive construction; QA defines observable acceptance. Project [AGENTS.md](../AGENTS.md) owns coding execution, continuation, worker ownership, checkpoints and pauses.

A unit remains incomplete until its scoped work, integration, required checks and acceptance evidence meet the referenced DoD and QA requirements.

U-14 integrates the heavily shared existing application and completes the bounded controlled QA-C01 lifecycle. U-15 then performs all original 90 full checks through actual consumers, including required external/device/user observations, and evaluates the six gates. U-14 contributes to all 111 clauses/states; its component evidence supports only the 12 declared clauses and cannot fully accept any requirement/state. U-15 owns full required acceptance for all 111. No check is excluded, made advisory, shortened or inferred passed. Both units are pending; historical scoped implementation is retained evidence, not a current unit run.

Consolidation removes legacy forward acceptance edges: U-04 deferred orchestration to U-09, while U-09 consumed earlier coordinator/store/UI seams; U-07/U-08 accepted their integrated consumers. Later U-10–U-13 and appearance follow-ups edit those same modules. Reordering labels would not resolve these dependencies. One coherent correction unit for the existing app followed by verification-only release acceptance gives each unit a boundary that can be met without a later unit’s implementation.

## Codebase Map

Static source review confirms `package.json` starts `src/server/start.mjs`, which imports `src/server/index.mjs`; the HTTPS router accepts new `parallel-v1` snapshots and dispatches through `src/server/consultation.mjs` to `src/server/consultation-parallel.mjs`. The server owns authentication, validated mutations, encrypted store and isolated providers. `public/index.html` loads `src/client/theme.js`, `src/client/app.js`, `public/styles.css` and `public/conversation-list.css`; the app imports the existing Markdown, notification-audio, refresh-state and navbar-glass helpers. This is a file/consumer observation, not runtime acceptance.

Use the explicit arrays in the Unit execution contract as the unit-wide source/configuration/test footprint. They include the actual QA claim paths and import/test consumers, not invented contracts directories or `tests/` paths. The advisory inventory contained 121 files; canonical QA separately names additional CI, README/model and frozen reference inputs. Actual `test/` files, browser runners, current Knock-v5 asset and portable handoff documents resolve. Unused older sound variants are not current implementation destinations; frozen candidate files are immutable QA comparison inputs. The arrays identify freshness scope, not permission to alter every listed file.

The packaged `instructions/AGENTS.md` still tells consultants to consult WORKING_CONTEXT.md, while `src/server/provider-context.mjs` and the parallel coordinator exclude it under the current reference-only contract. U-14 corrects that shipped-guidance discrepancy in future authorized work. Inspect `instruction-bootstrap.mjs` and `instruction-documents.mjs`: only an exact identified shipped default may receive a new migrated revision. Preserve owner edits, the reference editor, encrypted history and immutable accepted snapshots; startup must never overwrite an edited current document. No packaged or private instruction is changed by this planning run.

## Shared visual and UX contract

Both units bind baseline `nanoduck-electric-a-v8-20260914`, Electric A v8, target SHA-256 `93231814431a1bbbf8a0ba07f515eefcfd63193534189898b70766ed45938cbc`, frozen tree `1de020dcfe48f3feb80db0e58ba911b821825b48730d32c72d9518ad512eb0d9`, algorithm `sdd-tree-sha256-v1`, root `forge/design/candidates/a/v8`, and the unchanged [approval receipt](../forge/design/evidence/electric-v8-approval-20260914.json). Scope is all six jobs, seven UCs/journeys, nine surfaces/44 states, English/Ukrainian and 320/390/430/768/1280/1440 CSS px; per-check scope remains canonical in QA.

Apply only the design brief’s accepted local-entry, P5, Usage, reading, white-theme, glass/matte and connection-feedback overrides. Retain desktop left rail/narrow picker, current Stop geometry/separation, completion collapse, Stop/failure restoration, sticky theme-matched matte input, centered liquid-glass arrows and no Read outcome. Do not restore superseded horizontal/metallic/plain-transparent treatments or change frozen bytes. All H1–H10 and QA-H01–QA-H10 remain applicable. QA-U01–QA-U04 retain their actual phone/desktop owner tasks and success criteria; expert review, visual evidence, accessibility, controlled interaction and representative-owner research stay distinct.

## Implementation Units

### U-14 — Integrated existing-application correction and controlled reverification

Status: pending. Owner/layer: authorized lead implementation operator, full-stack integration. Construction dependencies: none. Required acceptance: QA-C01 only, under its unchanged unit/component definition. The complete explicit implementation footprint is in the canonical JSON. Source trace: all JOB-001–JOB-006 → UC-001–UC-007 → J-01–J-07 → S-01–S-09/ST-01–ST-44; the Clause coverage table records contributions without claiming full acceptance.

Preserve and, only where discrepant, correct local setup/HTTPS/session enforcement, bounded image and optional browser-voice intake, safe Markdown/RTF, record ownership/deletion/restore, current presentation/Settings/audio, full request context, isolated public research, account/usage privacy and exact subscription routes. Retain Node `^22.13.0 || ^24.0.0`, Codex `0.159.2`, Claude Code `2.1.280`, saved Head/specialist and Critic Codex `gpt-6-astra` / `xhigh`, all supported explicit Sol/Claude choices, accepted count/depth and provider deadlines from model settings/architecture. Catalog or fixture evidence never establishes entitlement or execution; no API/PAYG fallback, automatic credits, Fast Mode or silent substitution is allowed.

All ten former U-09 duties remain visible within this one integrated unit:

1. **Bind sources and compatibility.** Review the final source/baseline and actual consumer inventory, accepted settings, instruction revisions and legacy/new contract boundaries. Keep existing app/records; use isolated synthetic state for construction evidence. Preserve platform paths, key separation, session/CSRF/Origin protections and source-bound dependency inventory.
2. **Retain Head-created specialists and guidance.** Separate reusable role guidance from protocol validation in existing prompt/default modules. Head may reuse, adapt or create within the selected count; each participant receives only needed guidance. Keep faith/coaching limits and private role definitions. Correct the packaged WORKING_CONTEXT.md discrepancy by exact-default migration only, preserving owner edits and accepted snapshots; add no guidance editor or tool permission.
3. **Keep one concise coordinated Head plan.** Persist exact recipient/task/dependency records and publish individual assignments verbatim. Structural/ownership/acyclic validation and bounded metadata repair cannot invent generic tasks, enforce a profession allowlist or reject valid prose by arbitrary length/style.
4. **Build complete isolated request context.** Every new Send, including a correction in the same archive, starts an independent request with its immutable accepted message once; previous requests/results/sources/personal memory stay excluded. Continue/Retry retains that request and completed work. Use own guidance/task and explicit current evidence/results, preserve source claims/attachment disclosure/language/tuple, and introduce no duplicate request document or Claude file tools. Retain evidence references, distinct same-URL claims and checkpointed Head reuse/fresh decisions.
5. **Schedule and persist ready parallel work.** Use the existing coordinator/store/contract/adapters for ready independent workers, immediate once-only result commits, dependency-driven launch, successful-sibling preservation and exact attempt/generation identity. Keep bounded provider progress/deadlines, truthful queue status, isolated workspaces/credentials and cleanup. Stop aborts every worker and fences late commits; no whole-state race or silent model/effort change is permitted.
6. **Preserve the full Critic directive lifecycle.** Bind each exact issue/correction to assignment/result revision, response and current Critic assessment. A reply or self-declared fix never resolves it. Preserve repeated-recipient findings, one malformed-structure repair, immutable linked correction attempts, explicit corrected/objection-upheld/blocked/open outcomes, and stale/wrong-recipient/cross-run denial. Escalate repeated noncompliance to Head without hidden inference loops; carry unresolved findings into provisional synthesis.
7. **Honor chosen review depth and complete advice.** Fixed 1/3/5 means that many substantive team assessments; Auto alone allows Head closure within ten. Only affected specialists rework; batch appropriate resolution assessments, with a focused final correction check rather than an extra full round or endless loop. Remove compulsory closing speeches. Head synthesizes current reviewed results and all requested deliverables or explicit gaps, with sufficient actions, direct evidence, risk/revisit conditions and truthful consensus.
8. **Integrate real consumers and safe recovery.** Render committed business messages/dynamic names safely, retain private guidance/IDs outside transcript/export, and use current rail/picker/P5/reading/glass/theme controls. Preserve page-memory drafts, saved sound versus Preview, once-only alerts, native speech disclosure/review/cancel and full typing fallback. Continue/Retry only missing accepted work across Stop/failure/restart; legacy active runs keep their accepted contract until terminal. Retain safe complete RTF, tables, sources/Usage, owner-scoped history/deletion and isolated deletion-aware restore.
9. **Reverify the controlled lifecycle and inspect efficiency.** Execute the four canonical QA-C01 stages through actual local browser/HTTPS/coordinator/encrypted-store/source/usage/export/recovery consumers with explicitly controlled external boundaries. Preserve complete owner input, fixed settings/depth and deliverables. Keep numeric reported usage, zero/missing/partial/provenance, retry/failed attempts and provider/model/effort attribution truthful, with no double counting, raw private telemetry or subscription-saving inference. Existing meaningful Node/browser/recovery tests supplement C01; they do not pass the original 90 full checks or establish provider cache/concurrency, OS/LAN/audio/recognition/native-reader/accessibility/owner evidence.
10. **Deliver the integrated portable handoff.** Inspect the integrated diff, source inventory and recorded C01 boundaries/results; update the existing source-relative portable handoff documents with current behavior, compatibility and evidence limits. Other repositories remain untouched. Apply project Git policy and normal local update procedures only within later granted authority; no active owner run is reloaded/restarted, no private data migrated and no deployment or new prototype promotion follows from this plan.

The integration owner owns existing shared schema/prompt/store/API/client contracts and compatibility across all ten duties. Proposed concurrent work may separate the stable client rendering files, provider transport files and coordinator/store files only after their existing interfaces and ready dependencies are agreed; shared contracts, configuration, lockfiles and final integration retain one owner. Actual assignments, ports, disposable data/browser resources and progress belong to execution records under AGENTS.md, not this plan.

QA-C01’s four stages, its 12 supported clauses, source/controlled-boundary evidence and exact pass predicate remain at QA → Controlled integration regression. It requires real local consumers, not a passing mock function, while controlled provider/research/recognition/account boundaries make it independent of U-15’s external evidence. With U-15 absent, the complete C01 lifecycle is achievable from existing application files and U-14 corrections; none of its checks depends on later construction. No full requirement, state, gate or release pass is claimed by that bounded result.

### U-15 — Full real-consumer verification and release evaluation

Status: pending. Owner/layer: authorized lead verification operator, integration/release; actual expert reviewers, device/operator access and representative owner provide their respective observations. Construction prerequisite: completed current U-14. Required checks: every original QA-R01–QA-R67, QA-S01–QA-S09, QA-H01–QA-H10 and QA-U01–QA-U04, exactly as allocated in JSON. Each also requires current U-14/QA-C01 evidence; there is no later unit prerequisite.

Run the full canonical criteria and all dated extensions against one final integrated revision using actual local consumers. Supply the real exact-provider/research/auth/cache observations each task requires under existing subscription/access and spending boundaries; verify clean macOS/Linux/Windows setup/start/reset/renewal/permissions, trusted second-device Wi-Fi/LAN, native Safari/other supported browsers, physical audio/recognition where applicable, real RTF readers, keyboard/reflow/200% text/assistive technology, all H1–H10 expert findings and the four observed representative-owner tasks. Exercise all 17 security obligations with allowed/denied actual-boundary evidence and complete encryption/tamper/lock/restart/backup/deletion-aware recovery. An unavailable required device/account/user observation remains a named evidence gap.

Use the explicit existing verification-consumer array and each QA required-source inventory, together with U-14’s entire final footprint and immutable visual references, when binding evaluated hashes. Record actual commands, executor/environment, timezone-aware times, revision/plan/baseline, complete evidence kinds and findings; real-consumer checks require execution_mode `real_consumers` and integration evidence alongside their required security/visual/heuristic/user classes. Preserve protected diagnostics and public-safe summaries. A controlled C01, old scoped pass, test count, screenshot, catalog, health check, commit or push cannot replace these results.

This unit is verification-only: do not mutate shared application/configuration/tests while treating stale U-14 completion as current. If a finding requires an in-scope correction under the same unchanged plan, preserve/supersede actual runs and findings, return to a fresh U-14 correction/reverification run, then start a fresh U-15 against its final revision. Do not add new timestamps/hashes to old observations. An ordinary same-plan correction needs no invented approval; a changed product/source decision or plan bytes requires owning-source reconciliation and the later prompt for that new plan. The lead owns serialized operational record changes.

U-15 evaluates release readiness under all six DoD gates; it grants no deployment, public exposure, provider purchase or private-state migration authority. With all later units absent, its construction is complete in U-14 and its remaining dependencies are the actual source-defined evidence/access conditions. Missing real-consumer or owner evidence cannot be replaced by fixtures or excluded to make the graph pass.

## Dependency Order

`U-14 → U-15` is strict sequential order. U-14 owns only QA-C01; U-15 owns each original full check exactly once. All original full checks depend on U-14 and its required QA-C01. The combined construction, acceptance-owner and check graph has no forward edge or cycle. There is no hidden U-01–U-13 active prerequisite, early completion from legacy history or sequencing exception. Same-plan correction/reverification creates fresh actual runs of the same units and invalidates affected old evidence; it is not a dependency waiver.

## Cross-layer interfaces

| Retained interface | Producer → actual consumers; accountable integration | Compatibility / required verification |
|---|---|---|
| C-01 private session/consent | auth/local setup/index → all private API/client operations; U-14 integrates, U-15 fully accepts | Same owner, absolute lifetime, protected Host/Origin/CSRF and denied access; QA-R01/R02/R43–R45/R48/R55. |
| C-02 settings/instructions/catalog | instruction/default/provider modules → accepted store snapshot/coordinator/client; U-14 → U-15 | Future-only edits/restores, exact models/count/depth, reference-only personal document, unchanged accepted revisions; QA-R20–R24/R60. |
| C-03 canonical assignments/events | coordinator/parallel-contract/store → polling client/history/export/recovery; U-14 → U-15 | Immutable request/assignment/attempt/generation, atomic commits and no lost/duplicate/late results; QA-R03/R11–R16/R36–R39/R47/R59/R67. |
| C-04 role/review execution | prompt/provider/context/parallel coordinator → exact participant inputs and Critic assessment; U-14 → U-15 | Complete current owner input once, real separate contexts, bounded tools/subscriptions/deadlines, Critic-owned resolution; QA-R05–R10/R12/R51/R61–R67. |
| C-05 public evidence | isolated research/evidence/adapters → specialists/Critic/Head/Sources/export; U-14 → U-15 | Minimized query, request-bound distinct claims/references/checkpoints, no private transfer or invented freshness; QA-R17–R19/R49/R54/R63/R66. |
| C-06 input/voice/attachments | browser recognition/draft and bounded image parser → protected accepted message/store/record consumers; U-14 → U-15 | Explicit Send, no NanoDuck audio, protected opaque accepted raster bytes and complete typing fallback; QA-R04/R28–R32/R50/R55. |
| C-07 records/restore/usage | encrypted store/recovery/export/numeric attempts → authenticated record/Usage/client/native reader; U-14 → U-15 | Full confirmed content, deletion-aware isolated restore, truthful counts/coverage/account scope; QA-R23/R25–R27/R52/R56/R58/R66/QA-U04. |
| C-08 delivery/evidence | U-14 final source/configuration/test footprint → U-15 actual verification consumers and six gates | Current source/plan/baseline evidence and protected rollback/maintenance procedure; QA-R57–R59 plus every full check. |

These are references to architecture’s existing boundaries, not invented APIs or a new contracts folder. Keep unknown/incompatible versions fail-closed and preserve accepted legacy records; changes that affect product/security authority return to their owner.

## Legacy-to-current migration

The following 13 rows map retained work/obligations to current owners. U-01–U-09 historical typed allocations and exact verification prose are preserved in prior bindings/archive; U-10–U-13 existed as dated appendix scopes, so this migration does not invent old typed units or completed runs. The archive retains every full old allocation and receipt, including cross-cutting check lists and superseded wording. The table’s full-check column uses current QA verifies links for the listed retained obligations; Clause coverage and the canonical JSON preserve the full 111-obligation/91-check inventory. Current confirmed sources govern superseded context, depth, reading, glass and authority wording.

| Retained legacy unit/work | Retained obligation/state allocation | Current work/check allocation and prerequisite |
|---|---|---|
| U-01 — Runtime, cross-platform setup and exact subscription capabilities | Capability enabler; no invented historical typed clause allocation | U-14 retained/corrected work; U-15 full acceptance: all original 90 at U-15. Required predecessor: U-14 / QA-C01. |
| U-02 — Private HTTPS/password/session and encrypted durable foundation | FR-01.1–FR-01.2, NFR-10.1–NFR-10.3, NFR-11.1, NFR-11.3, NFR-13.1–NFR-13.2, NFR-16.1, ST-01–ST-04 | U-14 retained/corrected work; U-15 full acceptance: QA-R01–QA-R02, QA-R43–QA-R46, QA-R48, QA-R52–QA-R53, QA-R58, QA-S01. Required predecessor: U-14 / QA-C01. |
| U-03 — Retained presentation, Settings, instructions, theme and sound | FR-05.1–FR-05.6, FR-08.1–FR-08.3, NFR-02.1–NFR-02.3, ST-21–ST-25, ST-43–ST-44 | U-14 retained/corrected work; U-15 full acceptance: QA-R20–QA-R24, QA-R33–QA-R35, QA-R40–QA-R42, QA-R60, QA-R65, QA-S04, QA-S09. Required predecessor: U-14 / QA-C01. |
| U-04 — Canonical accepted work, discussion, Stop/Continue/Retry and recovery | FR-02.1, FR-02.8, FR-03.1–FR-03.4, FR-03.6, NFR-01.1, NFR-01.4, NFR-11.2, NFR-16.2, ST-05–ST-17, ST-37–ST-38 | U-14 retained/corrected work; U-15 full acceptance: QA-R03, QA-R10–QA-R14, QA-R16, QA-R36, QA-R39, QA-R47, QA-R59, QA-S02, QA-S07. Required predecessor: U-14 / QA-C01. |
| U-05 — Isolated public research and inspectable complete source records | FR-04.1–FR-04.3, NFR-12.1, NFR-12.3, NFR-14.1, ST-34–ST-36 | U-14 retained/corrected work; U-15 full acceptance: QA-R17–QA-R19, QA-R49, QA-R51, QA-R54, QA-S06. Required predecessor: U-14 / QA-C01. |
| U-06 — Browser-supported voice and bounded protected raster attachments | FR-02.2, FR-07.1–FR-07.5, NFR-12.2, NFR-14.2, ST-26–ST-33 | U-14 retained/corrected work; U-15 full acceptance: QA-R04, QA-R28–QA-R32, QA-R50, QA-R55, QA-S05. Required predecessor: U-14 / QA-C01. |
| U-07 — Owned history, rich-text export, deletion-aware backup/restore | FR-06.1–FR-06.3, NFR-14.3, ST-18–ST-20, ST-39–ST-42 | U-14 retained/corrected work; U-15 full acceptance: QA-R25–QA-R27, QA-R56, QA-S03, QA-S08. Required predecessor: U-14 / QA-C01. |
| U-08 — Full integrated app, operational evidence and release preparation | NFR-15.1 | U-14 retained/corrected work; U-15 full acceptance: QA-R57. Required predecessor: U-14 / QA-C01. |
| U-09 — All ten Head-led parallel consultation and Critic lifecycle duties | FR-02.3–FR-02.7, FR-02.9–FR-02.15, FR-03.5, FR-05.3, NFR-01.2–NFR-01.3, ST-09, ST-11, ST-16, ST-21, ST-37–ST-38 | U-14 retained/corrected work; U-15 full acceptance: QA-R05–QA-R09, QA-R15, QA-R22, QA-R37–QA-R38, QA-R61–QA-R67, QA-S02, QA-S04, QA-S07. Required predecessor: U-14 / QA-C01. |
| U-10 — Independent Send, accepted-request context/cache economy and telemetry | Appendix trace: FR-02.12, FR-02.15 (no historical typed unit record) | U-14 retained/corrected work; U-15 full acceptance: QA-R63, QA-R66. Required predecessor: U-14 / QA-C01. |
| U-11 — Centered beginning/end controls, boundaries and current reading behavior | Appendix trace: FR-03.4, FR-08.3, NFR-02.1–NFR-02.2, ST-05–ST-17 (no historical typed unit record) | U-14 retained/corrected work; U-15 full acceptance: QA-R14, QA-R35, QA-R40–QA-R41, QA-S02. Required predecessor: U-14 / QA-C01. |
| U-12 — Distinct evidence claims/references, research checkpoints, cache/usage completeness | Appendix trace: FR-02.12, FR-02.15, FR-04.1–FR-04.2 (no historical typed unit record) | U-14 retained/corrected work; U-15 full acceptance: QA-R17–QA-R18, QA-R63, QA-R66. Required predecessor: U-14 / QA-C01. |
| U-13 — Provider/request/participant/activity usage, reasoning attribution and account allowance | Appendix trace: FR-02.15, FR-05.4, NFR-14.1 (no historical typed unit record) | U-14 retained/corrected work; U-15 full acceptance: QA-R23, QA-R54, QA-R66. Required predecessor: U-14 / QA-C01. |

## Clause coverage

U-14 contributes construction and controlled reverification to every row; U-15 owns implementation of the full acceptance evidence for every row. This is contribution plus accountable real-consumer integration/release acceptance, not double counting completion. The exact QA verifies links below preserve all 67 clauses and 44 states; QA-C01 supports only its 12 named contribution clauses. All 17 security clauses retain their PRD mechanisms, positive/negative work and product_security_requirements gate through the U-14 integration work and U-15 full checks. No row is excluded or silently deferred.

| Required clause/state | Construction contribution / accountable full owner | Required full QA at U-15 | Bounded QA-C01 scope |
|---|---|---|---|
| FR-01.1 | U-14 contribution → U-15 full acceptance | QA-R01 | No QA-C01 acceptance claim |
| FR-01.2 | U-14 contribution → U-15 full acceptance | QA-R02 | No QA-C01 acceptance claim |
| FR-02.1 | U-14 contribution → U-15 full acceptance | QA-R03 | QA-C01 contribution only |
| FR-02.2 | U-14 contribution → U-15 full acceptance | QA-R04 | No QA-C01 acceptance claim |
| FR-02.3 | U-14 contribution → U-15 full acceptance | QA-R05 | No QA-C01 acceptance claim |
| FR-02.4 | U-14 contribution → U-15 full acceptance | QA-R06 | No QA-C01 acceptance claim |
| FR-02.5 | U-14 contribution → U-15 full acceptance | QA-R07 | No QA-C01 acceptance claim |
| FR-02.6 | U-14 contribution → U-15 full acceptance | QA-R08 | No QA-C01 acceptance claim |
| FR-02.7 | U-14 contribution → U-15 full acceptance | QA-R09 | No QA-C01 acceptance claim |
| FR-02.8 | U-14 contribution → U-15 full acceptance | QA-R10 | No QA-C01 acceptance claim |
| FR-02.9 | U-14 contribution → U-15 full acceptance | QA-R61 | No QA-C01 acceptance claim |
| FR-02.10 | U-14 contribution → U-15 full acceptance | QA-R61 | No QA-C01 acceptance claim |
| FR-02.11 | U-14 contribution → U-15 full acceptance | QA-R62 | QA-C01 contribution only |
| FR-02.12 | U-14 contribution → U-15 full acceptance | QA-R63 | QA-C01 contribution only |
| FR-02.13 | U-14 contribution → U-15 full acceptance | QA-R64, QA-R67 | QA-C01 contribution only |
| FR-02.14 | U-14 contribution → U-15 full acceptance | QA-R65 | No QA-C01 acceptance claim |
| FR-02.15 | U-14 contribution → U-15 full acceptance | QA-R66 | No QA-C01 acceptance claim |
| FR-03.1 | U-14 contribution → U-15 full acceptance | QA-R11 | No QA-C01 acceptance claim |
| FR-03.2 | U-14 contribution → U-15 full acceptance | QA-R12 | No QA-C01 acceptance claim |
| FR-03.3 | U-14 contribution → U-15 full acceptance | QA-R13 | No QA-C01 acceptance claim |
| FR-03.4 | U-14 contribution → U-15 full acceptance | QA-R14 | QA-C01 contribution only |
| FR-03.5 | U-14 contribution → U-15 full acceptance | QA-R15, QA-R67 | QA-C01 contribution only |
| FR-03.6 | U-14 contribution → U-15 full acceptance | QA-R16 | No QA-C01 acceptance claim |
| FR-04.1 | U-14 contribution → U-15 full acceptance | QA-R17 | No QA-C01 acceptance claim |
| FR-04.2 | U-14 contribution → U-15 full acceptance | QA-R18 | No QA-C01 acceptance claim |
| FR-04.3 | U-14 contribution → U-15 full acceptance | QA-R19 | No QA-C01 acceptance claim |
| FR-05.1 | U-14 contribution → U-15 full acceptance | QA-R20 | No QA-C01 acceptance claim |
| FR-05.2 | U-14 contribution → U-15 full acceptance | QA-R21 | QA-C01 contribution only |
| FR-05.3 | U-14 contribution → U-15 full acceptance | QA-R22, QA-R65 | No QA-C01 acceptance claim |
| FR-05.4 | U-14 contribution → U-15 full acceptance | QA-R23 | No QA-C01 acceptance claim |
| FR-05.5 | U-14 contribution → U-15 full acceptance | QA-R24 | No QA-C01 acceptance claim |
| FR-05.6 | U-14 contribution → U-15 full acceptance | QA-R60 | No QA-C01 acceptance claim |
| FR-06.1 | U-14 contribution → U-15 full acceptance | QA-R25 | QA-C01 contribution only |
| FR-06.2 | U-14 contribution → U-15 full acceptance | QA-R26 | QA-C01 contribution only |
| FR-06.3 | U-14 contribution → U-15 full acceptance | QA-R27 | QA-C01 contribution only |
| FR-07.1 | U-14 contribution → U-15 full acceptance | QA-R28 | No QA-C01 acceptance claim |
| FR-07.2 | U-14 contribution → U-15 full acceptance | QA-R29 | No QA-C01 acceptance claim |
| FR-07.3 | U-14 contribution → U-15 full acceptance | QA-R30 | No QA-C01 acceptance claim |
| FR-07.4 | U-14 contribution → U-15 full acceptance | QA-R31 | No QA-C01 acceptance claim |
| FR-07.5 | U-14 contribution → U-15 full acceptance | QA-R32 | No QA-C01 acceptance claim |
| FR-08.1 | U-14 contribution → U-15 full acceptance | QA-R33 | No QA-C01 acceptance claim |
| FR-08.2 | U-14 contribution → U-15 full acceptance | QA-R34 | No QA-C01 acceptance claim |
| FR-08.3 | U-14 contribution → U-15 full acceptance | QA-R35 | No QA-C01 acceptance claim |
| NFR-01.1 | U-14 contribution → U-15 full acceptance | QA-R36 | QA-C01 contribution only |
| NFR-01.2 | U-14 contribution → U-15 full acceptance | QA-R37, QA-R67 | QA-C01 contribution only |
| NFR-01.3 | U-14 contribution → U-15 full acceptance | QA-R38, QA-R65 | No QA-C01 acceptance claim |
| NFR-01.4 | U-14 contribution → U-15 full acceptance | QA-R39 | No QA-C01 acceptance claim |
| NFR-02.1 | U-14 contribution → U-15 full acceptance | QA-R40 | No QA-C01 acceptance claim |
| NFR-02.2 | U-14 contribution → U-15 full acceptance | QA-R41 | No QA-C01 acceptance claim |
| NFR-02.3 | U-14 contribution → U-15 full acceptance | QA-R42 | No QA-C01 acceptance claim |
| NFR-10.1 | U-14 contribution → U-15 full acceptance | QA-R43 | No QA-C01 acceptance claim |
| NFR-10.2 | U-14 contribution → U-15 full acceptance | QA-R44 | No QA-C01 acceptance claim |
| NFR-10.3 | U-14 contribution → U-15 full acceptance | QA-R45 | No QA-C01 acceptance claim |
| NFR-11.1 | U-14 contribution → U-15 full acceptance | QA-R46 | No QA-C01 acceptance claim |
| NFR-11.2 | U-14 contribution → U-15 full acceptance | QA-R47 | No QA-C01 acceptance claim |
| NFR-11.3 | U-14 contribution → U-15 full acceptance | QA-R48 | No QA-C01 acceptance claim |
| NFR-12.1 | U-14 contribution → U-15 full acceptance | QA-R49 | No QA-C01 acceptance claim |
| NFR-12.2 | U-14 contribution → U-15 full acceptance | QA-R50 | No QA-C01 acceptance claim |
| NFR-12.3 | U-14 contribution → U-15 full acceptance | QA-R51 | No QA-C01 acceptance claim |
| NFR-13.1 | U-14 contribution → U-15 full acceptance | QA-R52 | No QA-C01 acceptance claim |
| NFR-13.2 | U-14 contribution → U-15 full acceptance | QA-R53 | No QA-C01 acceptance claim |
| NFR-14.1 | U-14 contribution → U-15 full acceptance | QA-R54 | No QA-C01 acceptance claim |
| NFR-14.2 | U-14 contribution → U-15 full acceptance | QA-R55 | No QA-C01 acceptance claim |
| NFR-14.3 | U-14 contribution → U-15 full acceptance | QA-R56 | No QA-C01 acceptance claim |
| NFR-15.1 | U-14 contribution → U-15 full acceptance | QA-R57 | No QA-C01 acceptance claim |
| NFR-16.1 | U-14 contribution → U-15 full acceptance | QA-R58 | No QA-C01 acceptance claim |
| NFR-16.2 | U-14 contribution → U-15 full acceptance | QA-R59 | No QA-C01 acceptance claim |
| ST-01 | U-14 contribution → U-15 full acceptance | QA-S01 | No QA-C01 acceptance claim |
| ST-02 | U-14 contribution → U-15 full acceptance | QA-S01 | No QA-C01 acceptance claim |
| ST-03 | U-14 contribution → U-15 full acceptance | QA-S01 | No QA-C01 acceptance claim |
| ST-04 | U-14 contribution → U-15 full acceptance | QA-S01 | No QA-C01 acceptance claim |
| ST-05 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-06 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-07 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-08 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-09 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-10 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-11 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-12 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-13 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-14 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-15 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-16 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-17 | U-14 contribution → U-15 full acceptance | QA-S02 | No QA-C01 acceptance claim |
| ST-18 | U-14 contribution → U-15 full acceptance | QA-S03 | No QA-C01 acceptance claim |
| ST-19 | U-14 contribution → U-15 full acceptance | QA-S03 | No QA-C01 acceptance claim |
| ST-20 | U-14 contribution → U-15 full acceptance | QA-S03 | No QA-C01 acceptance claim |
| ST-21 | U-14 contribution → U-15 full acceptance | QA-S04 | No QA-C01 acceptance claim |
| ST-22 | U-14 contribution → U-15 full acceptance | QA-S04 | No QA-C01 acceptance claim |
| ST-23 | U-14 contribution → U-15 full acceptance | QA-S04 | No QA-C01 acceptance claim |
| ST-24 | U-14 contribution → U-15 full acceptance | QA-S04 | No QA-C01 acceptance claim |
| ST-25 | U-14 contribution → U-15 full acceptance | QA-S04 | No QA-C01 acceptance claim |
| ST-26 | U-14 contribution → U-15 full acceptance | QA-S05 | No QA-C01 acceptance claim |
| ST-27 | U-14 contribution → U-15 full acceptance | QA-S05 | No QA-C01 acceptance claim |
| ST-28 | U-14 contribution → U-15 full acceptance | QA-S05 | No QA-C01 acceptance claim |
| ST-29 | U-14 contribution → U-15 full acceptance | QA-S05 | No QA-C01 acceptance claim |
| ST-30 | U-14 contribution → U-15 full acceptance | QA-S05 | No QA-C01 acceptance claim |
| ST-31 | U-14 contribution → U-15 full acceptance | QA-S05 | No QA-C01 acceptance claim |
| ST-32 | U-14 contribution → U-15 full acceptance | QA-S05 | No QA-C01 acceptance claim |
| ST-33 | U-14 contribution → U-15 full acceptance | QA-S05 | No QA-C01 acceptance claim |
| ST-34 | U-14 contribution → U-15 full acceptance | QA-S06 | No QA-C01 acceptance claim |
| ST-35 | U-14 contribution → U-15 full acceptance | QA-S06 | No QA-C01 acceptance claim |
| ST-36 | U-14 contribution → U-15 full acceptance | QA-S06 | No QA-C01 acceptance claim |
| ST-37 | U-14 contribution → U-15 full acceptance | QA-S07 | No QA-C01 acceptance claim |
| ST-38 | U-14 contribution → U-15 full acceptance | QA-S07 | No QA-C01 acceptance claim |
| ST-39 | U-14 contribution → U-15 full acceptance | QA-S08 | No QA-C01 acceptance claim |
| ST-40 | U-14 contribution → U-15 full acceptance | QA-S08 | No QA-C01 acceptance claim |
| ST-41 | U-14 contribution → U-15 full acceptance | QA-S08 | No QA-C01 acceptance claim |
| ST-42 | U-14 contribution → U-15 full acceptance | QA-S08 | No QA-C01 acceptance claim |
| ST-43 | U-14 contribution → U-15 full acceptance | QA-S09 | No QA-C01 acceptance claim |
| ST-44 | U-14 contribution → U-15 full acceptance | QA-S09 | No QA-C01 acceptance claim |

## Prototype Promotion Plan

No new prototype code is copied or promoted. Retain the existing public/client implementation and compare it with frozen A v8 and accepted overrides. `docs/source-provenance.json` is a dated source record, not a new approval, current runtime result or invented promotion receipt. Frozen A/B/C and original receipts remain unchanged. Any later proposal for additional prototype reuse needs its own source-bound promotion plan before that work; none is assumed here.

## Verification Plan

All original 90 full checks plus bounded QA-C01 are required/applicable, prepared and not_run. Release readiness is not_evaluated. Canonical acceptance levels, evidence modes and per-check source inventories remain QA-owned; the Unit execution contract allocates exactly one acceptance owner per eligible implementation/both check. The original 90 include 70 integration and 20 release real-consumer definitions; QA-C01 is the sole unit/component definition. All six required gates remain: product_functional_requirements, product_security_requirements, approved_visual_baseline_fidelity, heuristic_usability_review, representative_user_task_validation and lifecycle_and_continuity.

Execute canonical procedures only after implementation authorization and current start preflight. Existing surfaces include `npm run check` (artifact/JavaScript checks plus the Node suite), `node scripts/browser-check.mjs` and its reading/Usage/theme/provider/recovery fixtures; their names are not evidence that every canonical task ran. U-14 supplies C01’s actual controlled local lifecycle evidence. U-15 supplies the full real-consumer observations and all required evidence classes under the retained baseline; controlled fixtures may supplement a canonical check but cannot replace required live provider, device, OS, LAN, native-reader, accessibility or representative-owner outcomes. The four owner tasks remain voice/typed review without accidental Send, Critic/source understanding, future-versus-active settings and Stop/recover/export/cancel deletion.

Before each actual start/resume, the authorized lead applies the installed unit-execution contract and effective AGENTS.md, current authorization and source/baseline/checkpoint prerequisites. The orchestrator alone records version-1 unit/gate/run transitions after actual checker results. Check execution times and source hashes must belong to the real owning run and final integrated revision. Preserve older failed/passed/scoped records, causes and limits; changed shared files make affected results stale. U-15 findings return to fresh U-14 and fresh U-15 as specified above. No old record is rebound or automatically accepted. This document runs no checks and changes no run/gate state.

## Unit execution contract

This is the sole canonical unit_plan JSON fence. The orchestrator records the identical object with unit_contract_version 1; definitions/required_check_ids and acceptance ownership agree exactly. Explicit implementation_paths are the source/configuration/test freshness footprint. Frozen inputs and per-check QA paths remain required even when not writable. Human/device/access prerequisites live in canonical QA rather than invented source files.

```json
{
  "definition_ref": {
    "path": "docs/development-plan.md",
    "heading": "## Unit execution contract"
  },
  "policy": "strict_sequential",
  "order": [
    "U-14",
    "U-15"
  ],
  "units": {
    "U-14": {
      "scope": "Retain the existing local application, reconcile any discrepancy against all current clauses/states and complete one controlled local accepted-request lifecycle; this contributes to all 111 obligations but fully accepts none through component evidence.",
      "owner": "Authorized lead implementation operator; full-stack integration owner",
      "kind": "implementation",
      "construction_dependencies": [],
      "implementation_paths": [
        ".github/dependabot.yml",
        ".github/workflows/ci.yml",
        ".github/workflows/runtime-checks.yml",
        ".github/workflows/security.yml",
        "README.md",
        "docs/combined-updates-after-review-port.md",
        "docs/consultation-orchestration-port.md",
        "docs/context-cache-isolation-port.md",
        "docs/head-first-response-port.md",
        "docs/model-settings.md",
        "docs/porcelain-stop-port.md",
        "docs/research-evidence-economy-port.md",
        "docs/review-fixes-port.md",
        "docs/source-provenance.json",
        "docs/usage-dashboard-port.md",
        "instructions/AGENTS.md",
        "instructions/CONSILIUM.md",
        "instructions/CONSULTING_PLAYBOOK.md",
        "instructions/RUNTIME_PROMPTS.md",
        "instructions/WORKING_CONTEXT.md",
        "package-lock.json",
        "package.json",
        "public/conversation-list.css",
        "public/index.html",
        "public/nanoduck-original.svg",
        "public/nanoduck.svg",
        "public/sounds/table-taps-250ms-v5.wav",
        "public/styles.css",
        "scripts/benchmark-critic-cache.mjs",
        "scripts/benchmark-research.mjs",
        "scripts/browser-active-discussion.mjs",
        "scripts/browser-check.mjs",
        "scripts/browser-floating-glass.mjs",
        "scripts/browser-local-entry.mjs",
        "scripts/browser-logoff.mjs",
        "scripts/browser-markdown-tables.mjs",
        "scripts/browser-model-settings.mjs",
        "scripts/browser-navbar-glass.mjs",
        "scripts/browser-notification-audio.mjs",
        "scripts/browser-progress-recovery.mjs",
        "scripts/browser-provider-connection.mjs",
        "scripts/browser-reading-mode.mjs",
        "scripts/browser-send-retry.mjs",
        "scripts/browser-theme.mjs",
        "scripts/browser-usage.mjs",
        "scripts/check-artifacts.mjs",
        "scripts/claude-login.mjs",
        "scripts/measure-consultation-workload.mjs",
        "scripts/test.mjs",
        "src/client/app.js",
        "src/client/markdown.js",
        "src/client/navbar-glass.js",
        "src/client/notification-audio.js",
        "src/client/refresh-state.js",
        "src/client/theme.js",
        "src/server/account-usage.mjs",
        "src/server/attachments.mjs",
        "src/server/auth.mjs",
        "src/server/child-process.mjs",
        "src/server/claude-provider.mjs",
        "src/server/claude-runtime.mjs",
        "src/server/codex-provider.mjs",
        "src/server/config.mjs",
        "src/server/configuration-recovery.mjs",
        "src/server/consultation-parallel.mjs",
        "src/server/consultation.mjs",
        "src/server/content-policy.mjs",
        "src/server/conversation-export.mjs",
        "src/server/conversation-title.mjs",
        "src/server/crypto.mjs",
        "src/server/forbidden-environment.mjs",
        "src/server/image-structure.mjs",
        "src/server/index.mjs",
        "src/server/instruction-bootstrap.mjs",
        "src/server/instruction-documents.mjs",
        "src/server/local-request.mjs",
        "src/server/local-setup.mjs",
        "src/server/local-state.mjs",
        "src/server/local-store.mjs",
        "src/server/output-safety.mjs",
        "src/server/parallel-contract.mjs",
        "src/server/password.mjs",
        "src/server/preflight.mjs",
        "src/server/private-files.mjs",
        "src/server/prompt-contracts.mjs",
        "src/server/provider-context.mjs",
        "src/server/providers.mjs",
        "src/server/read-regular-file.mjs",
        "src/server/recovery-cli.mjs",
        "src/server/recovery.mjs",
        "src/server/research-evidence.mjs",
        "src/server/setup.mjs",
        "src/server/start.mjs",
        "src/server/store.mjs",
        "src/server/turn-deadline.mjs",
        "src/server/usage.mjs",
        "src/server/validation.mjs",
        "test/account-usage.test.mjs",
        "test/claude-process.test.mjs",
        "test/claude-provider.test.mjs",
        "test/codex-provider.test.mjs",
        "test/consolidation.test.mjs",
        "test/consultation.test.mjs",
        "test/context-economy.test.mjs",
        "test/conversation-export.test.mjs",
        "test/conversation-title.test.mjs",
        "test/core.test.mjs",
        "test/fixtures/auth-file-codex.mjs",
        "test/fixtures/fake-codex.mjs",
        "test/fixtures/images.mjs",
        "test/fixtures/local-runtime.mjs",
        "test/fixtures/local-store-owner.mjs",
        "test/fixtures/private-permissions-child.mjs",
        "test/fixtures/runtime-instructions.mjs",
        "test/http.test.mjs",
        "test/image-structure.test.mjs",
        "test/local-config-auth.test.mjs",
        "test/local-store.test.mjs",
        "test/markdown-table-export.test.mjs",
        "test/markdown.test.mjs",
        "test/notification-audio.test.mjs",
        "test/parallel-consultation.test.mjs",
        "test/preflight.test.mjs",
        "test/private-files.test.mjs",
        "test/project-consolidation.test.mjs",
        "test/prompt-contracts.test.mjs",
        "test/read-regular-file.test.mjs",
        "test/recovery-cli.test.mjs",
        "test/refresh-state.test.mjs",
        "test/research-evidence.test.mjs",
        "test/review-fixes.test.mjs",
        "test/source-persistence.test.mjs",
        "test/turn-deadline.test.mjs",
        "test/usage.test.mjs"
      ],
      "required_check_ids": [
        "QA-C01"
      ]
    },
    "U-15": {
      "scope": "Verification-only real-consumer acceptance of all 111 clauses/states through the original 90 full checks and six required gates; evaluate release without mutating shared implementation sources or authorizing deployment.",
      "owner": "Authorized lead verification operator, with actual expert, device/operator and representative-owner participants for their named evidence",
      "kind": "release",
      "construction_dependencies": [
        "U-14"
      ],
      "implementation_paths": [
        ".github/dependabot.yml",
        ".github/workflows/ci.yml",
        ".github/workflows/runtime-checks.yml",
        ".github/workflows/security.yml",
        "README.md",
        "package-lock.json",
        "package.json",
        "scripts/browser-active-discussion.mjs",
        "scripts/browser-check.mjs",
        "scripts/browser-floating-glass.mjs",
        "scripts/browser-local-entry.mjs",
        "scripts/browser-logoff.mjs",
        "scripts/browser-markdown-tables.mjs",
        "scripts/browser-model-settings.mjs",
        "scripts/browser-navbar-glass.mjs",
        "scripts/browser-notification-audio.mjs",
        "scripts/browser-progress-recovery.mjs",
        "scripts/browser-provider-connection.mjs",
        "scripts/browser-reading-mode.mjs",
        "scripts/browser-send-retry.mjs",
        "scripts/browser-theme.mjs",
        "scripts/browser-usage.mjs",
        "scripts/check-artifacts.mjs",
        "scripts/test.mjs",
        "test/account-usage.test.mjs",
        "test/claude-process.test.mjs",
        "test/claude-provider.test.mjs",
        "test/codex-provider.test.mjs",
        "test/consolidation.test.mjs",
        "test/consultation.test.mjs",
        "test/context-economy.test.mjs",
        "test/conversation-export.test.mjs",
        "test/conversation-title.test.mjs",
        "test/core.test.mjs",
        "test/fixtures/auth-file-codex.mjs",
        "test/fixtures/fake-codex.mjs",
        "test/fixtures/images.mjs",
        "test/fixtures/local-runtime.mjs",
        "test/fixtures/local-store-owner.mjs",
        "test/fixtures/private-permissions-child.mjs",
        "test/fixtures/runtime-instructions.mjs",
        "test/http.test.mjs",
        "test/image-structure.test.mjs",
        "test/local-config-auth.test.mjs",
        "test/local-store.test.mjs",
        "test/markdown-table-export.test.mjs",
        "test/markdown.test.mjs",
        "test/notification-audio.test.mjs",
        "test/parallel-consultation.test.mjs",
        "test/preflight.test.mjs",
        "test/private-files.test.mjs",
        "test/project-consolidation.test.mjs",
        "test/prompt-contracts.test.mjs",
        "test/read-regular-file.test.mjs",
        "test/recovery-cli.test.mjs",
        "test/refresh-state.test.mjs",
        "test/research-evidence.test.mjs",
        "test/review-fixes.test.mjs",
        "test/source-persistence.test.mjs",
        "test/turn-deadline.test.mjs",
        "test/usage.test.mjs"
      ],
      "required_check_ids": [
        "QA-R01",
        "QA-R02",
        "QA-R03",
        "QA-R04",
        "QA-R05",
        "QA-R06",
        "QA-R07",
        "QA-R08",
        "QA-R09",
        "QA-R10",
        "QA-R11",
        "QA-R12",
        "QA-R13",
        "QA-R14",
        "QA-R15",
        "QA-R16",
        "QA-R17",
        "QA-R18",
        "QA-R19",
        "QA-R20",
        "QA-R21",
        "QA-R22",
        "QA-R23",
        "QA-R24",
        "QA-R25",
        "QA-R26",
        "QA-R27",
        "QA-R28",
        "QA-R29",
        "QA-R30",
        "QA-R31",
        "QA-R32",
        "QA-R33",
        "QA-R34",
        "QA-R35",
        "QA-R36",
        "QA-R37",
        "QA-R38",
        "QA-R39",
        "QA-R40",
        "QA-R41",
        "QA-R42",
        "QA-R43",
        "QA-R44",
        "QA-R45",
        "QA-R46",
        "QA-R47",
        "QA-R48",
        "QA-R49",
        "QA-R50",
        "QA-R51",
        "QA-R52",
        "QA-R53",
        "QA-R54",
        "QA-R55",
        "QA-R56",
        "QA-R57",
        "QA-R58",
        "QA-R59",
        "QA-R60",
        "QA-R61",
        "QA-R62",
        "QA-R63",
        "QA-R64",
        "QA-R65",
        "QA-R66",
        "QA-R67",
        "QA-S01",
        "QA-S02",
        "QA-S03",
        "QA-S04",
        "QA-S05",
        "QA-S06",
        "QA-S07",
        "QA-S08",
        "QA-S09",
        "QA-H01",
        "QA-H02",
        "QA-H03",
        "QA-H04",
        "QA-H05",
        "QA-H06",
        "QA-H07",
        "QA-H08",
        "QA-H09",
        "QA-H10",
        "QA-U01",
        "QA-U02",
        "QA-U03",
        "QA-U04"
      ]
    }
  },
  "acceptance": {
    "QA-C01": {
      "owner_unit": "U-14",
      "prerequisite_units": [],
      "prerequisite_checks": [],
      "obligation_ids": [
        "FR-02.1",
        "FR-02.11",
        "FR-02.12",
        "FR-02.13",
        "FR-03.4",
        "FR-03.5",
        "FR-05.2",
        "FR-06.1",
        "FR-06.2",
        "FR-06.3",
        "NFR-01.1",
        "NFR-01.2"
      ]
    },
    "QA-H01": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-H02": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-H03": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-H04": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-H05": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-H06": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-H07": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-H08": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-H09": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-H10": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-R01": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-01.1"
      ]
    },
    "QA-R02": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-01.2"
      ]
    },
    "QA-R03": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.1"
      ]
    },
    "QA-R04": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.2"
      ]
    },
    "QA-R05": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.3"
      ]
    },
    "QA-R06": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.4"
      ]
    },
    "QA-R07": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.5"
      ]
    },
    "QA-R08": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.6"
      ]
    },
    "QA-R09": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.7"
      ]
    },
    "QA-R10": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.8"
      ]
    },
    "QA-R11": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-03.1"
      ]
    },
    "QA-R12": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-03.2"
      ]
    },
    "QA-R13": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-03.3"
      ]
    },
    "QA-R14": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-03.4"
      ]
    },
    "QA-R15": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-03.5"
      ]
    },
    "QA-R16": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-03.6"
      ]
    },
    "QA-R17": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-04.1"
      ]
    },
    "QA-R18": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-04.2"
      ]
    },
    "QA-R19": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-04.3"
      ]
    },
    "QA-R20": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-05.1"
      ]
    },
    "QA-R21": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-05.2"
      ]
    },
    "QA-R22": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-05.3"
      ]
    },
    "QA-R23": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-05.4"
      ]
    },
    "QA-R24": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-05.5"
      ]
    },
    "QA-R25": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-06.1"
      ]
    },
    "QA-R26": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-06.2"
      ]
    },
    "QA-R27": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-06.3"
      ]
    },
    "QA-R28": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-07.1"
      ]
    },
    "QA-R29": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-07.2"
      ]
    },
    "QA-R30": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-07.3"
      ]
    },
    "QA-R31": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-07.4"
      ]
    },
    "QA-R32": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-07.5"
      ]
    },
    "QA-R33": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-08.1"
      ]
    },
    "QA-R34": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-08.2"
      ]
    },
    "QA-R35": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-08.3"
      ]
    },
    "QA-R36": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-01.1"
      ]
    },
    "QA-R37": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-01.2"
      ]
    },
    "QA-R38": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-01.3"
      ]
    },
    "QA-R39": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-01.4"
      ]
    },
    "QA-R40": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-02.1"
      ]
    },
    "QA-R41": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-02.2"
      ]
    },
    "QA-R42": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-02.3"
      ]
    },
    "QA-R43": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-10.1"
      ]
    },
    "QA-R44": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-10.2"
      ]
    },
    "QA-R45": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-10.3"
      ]
    },
    "QA-R46": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-11.1"
      ]
    },
    "QA-R47": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-11.2"
      ]
    },
    "QA-R48": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-11.3"
      ]
    },
    "QA-R49": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-12.1"
      ]
    },
    "QA-R50": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-12.2"
      ]
    },
    "QA-R51": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-12.3"
      ]
    },
    "QA-R52": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-13.1"
      ]
    },
    "QA-R53": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-13.2"
      ]
    },
    "QA-R54": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-14.1"
      ]
    },
    "QA-R55": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-14.2"
      ]
    },
    "QA-R56": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-14.3"
      ]
    },
    "QA-R57": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-15.1"
      ]
    },
    "QA-R58": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-16.1"
      ]
    },
    "QA-R59": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "NFR-16.2"
      ]
    },
    "QA-R60": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-05.6"
      ]
    },
    "QA-R61": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.10",
        "FR-02.9"
      ]
    },
    "QA-R62": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.11"
      ]
    },
    "QA-R63": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.12"
      ]
    },
    "QA-R64": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.13"
      ]
    },
    "QA-R65": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.14",
        "FR-05.3",
        "NFR-01.3"
      ]
    },
    "QA-R66": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.15"
      ]
    },
    "QA-R67": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "FR-02.13",
        "FR-03.5",
        "NFR-01.2"
      ]
    },
    "QA-S01": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "ST-01",
        "ST-02",
        "ST-03",
        "ST-04"
      ]
    },
    "QA-S02": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "ST-05",
        "ST-06",
        "ST-07",
        "ST-08",
        "ST-09",
        "ST-10",
        "ST-11",
        "ST-12",
        "ST-13",
        "ST-14",
        "ST-15",
        "ST-16",
        "ST-17"
      ]
    },
    "QA-S03": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "ST-18",
        "ST-19",
        "ST-20"
      ]
    },
    "QA-S04": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "ST-21",
        "ST-22",
        "ST-23",
        "ST-24",
        "ST-25"
      ]
    },
    "QA-S05": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "ST-26",
        "ST-27",
        "ST-28",
        "ST-29",
        "ST-30",
        "ST-31",
        "ST-32",
        "ST-33"
      ]
    },
    "QA-S06": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "ST-34",
        "ST-35",
        "ST-36"
      ]
    },
    "QA-S07": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "ST-37",
        "ST-38"
      ]
    },
    "QA-S08": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "ST-39",
        "ST-40",
        "ST-41",
        "ST-42"
      ]
    },
    "QA-S09": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": [
        "ST-43",
        "ST-44"
      ]
    },
    "QA-U01": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-U02": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-U03": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    },
    "QA-U04": {
      "owner_unit": "U-15",
      "prerequisite_units": [
        "U-14"
      ],
      "prerequisite_checks": [
        "QA-C01"
      ],
      "obligation_ids": []
    }
  }
}
```

## Out Of Scope

No new feature, visual redesign, prototype promotion, public internet service, registration/multiuser SaaS, payment/API billing fallback, extra-credit spending, native client, arbitrary upload, automatic external business action or sister-repository change. This documentation task authorizes no production code, service/browser/provider execution, restart, private-state migration, credential/trust-store mutation or deployment. Portable handoffs are instructions for later separately authorized repository work, not authority to perform it here.

## Open Questions

No material product/design choice remains for this plan. Actual exact-model entitlement/execution, provider capacity/cache behavior, cross-platform/trusted LAN/native browser and reader availability, physical audio/recognition, assistive-technology and representative-owner evidence remain named execution dependencies. Unavailable required evidence limits the corresponding full acceptance claim; it cannot be inferred from static inspection or historical successes. The packaged WORKING_CONTEXT guidance discrepancy is known U-14 correction work, not an unresolved new product decision.

## Handoff and implementation boundary

The current scope is documentation-only. This final plan changes the implementation binding: after validated adoption, the orchestrator leaves it at awaiting-implementation-prompt with the retained baseline and current plan hash. A later explicit implementation prompt for that final plan is required before U-14 or U-15 starts. Existing scoped requests/results remain historical at their exact scope, timestamps and bindings. Neither this plan, document checker, preserved design approval nor prior implementation authorizes current production work or claims unit/release completion.
