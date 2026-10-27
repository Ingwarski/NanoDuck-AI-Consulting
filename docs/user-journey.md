# User journey

## Source references

[PRD](prd.md), [project context](project-context.md), [canonical terms](canonical-terms.md), [guardrails](guardrails.md). Requirement and use-case meanings remain in the PRD. The [17 October reconciliation](../forge/runs/sdd-reconciliation-20261017/scope.json) updates this intended journey only; it supplies no new implementation permission or observed user-session evidence.

## Primary user, goal and starting context

The owner wants to reach a useful decision and act with appropriate challenge and evidence. The application runs on a macOS, Linux or Windows computer. The owner may open it on that computer or a phone/tablet on the same Wi-Fi network, have limited typing time, and return on a larger browser after an interruption. First-run setup establishes local credentials and device connection trust; daily sessions reuse that setup. Those conditions are source-informed design assumptions, not observed user sessions. The most costly errors are acting on invented certainty, losing private work or sending something unintentionally.

## Journey stages

| Stage | User action and decision | Friction/trust concern and response | Outcome and trace |
|---|---|---|---|
| J-01 — Enter | Open the trusted local-network address and use the local password through the visible Login button on the desktop or mobile menu bar; give processing consent once for each new authenticated session. Logoff is available once authenticated, including before consent. | Repeated setup breaks the start. An incorrect password gives bounded retry without revealing data; a certificate/trust problem points to local setup instructions. Returning use during the PRD 24-hour session goes directly to work, including after inactivity or browser reopening; cancellation exposes no private content. | Private workspace, UC-001 / JOB-003; FR-01.1–01.2, NFR-10.1–10.3. |
| J-02 — Describe | Type, attach an owner-generated JPEG/PNG/WebP image or choose voice where the browser supports it. Decide whether the draft is ready to send as a new independent request, including within an existing saved conversation. | Typing may be inconvenient; image validation, browser recognition permission, service processing and accidental sending need control. Recognition starts/stops/cancels explicitly, and an editable transcript is reviewed before Send. | Deliberately accepted input, UC-002/UC-006 / JOB-001/JOB-006; FR-02.1–02.2, FR-07.1–07.5, NFR-12.2/NFR-14.2. |
| J-03 — Clarify and discuss | Answer one material question if needed; read Head's distinct tasks, independent specialist positions and Critic exchanges; stop first when new context is needed. | Robotic stage announcements, generic assignments and repeated exchanges obscure the issue. Full addressed replies show what changed and why: Head chooses the actual roles, gives each recipient a considered task tied to the complete request, and sees the Critic's targeted correction before deciding whether another review helps. Specialists address Critic, who can direct a specific stop-and-rework; a consultant revises materially, objects with evidence or acknowledges a gap. Independent work arrives in parallel; Critic assesses the team for the selected depth, and only affected consultants rework. An order remains unresolved until Critic assesses the correction; Head summarizes current reviewed results and any remaining gaps as Consolidated advice without compulsory closing speeches. While work is active, a quiet thought bubble says the team is preparing the next message; the unavailable composer is minimized and a separated Porcelain Stop remains reachable. A saved configured sound may accompany a newly confirmed agent message without first opening Settings; blocked playback offers Enable sound while visual feedback remains. | A meaningful exchange, UC-002/UC-003 / JOB-001/JOB-002; FR-02.3–02.8, FR-03.1–03.3. |
| J-04 — Check a claim | Open an eligible English/Ukrainian cited source and assess its claim/limitation; request a focused follow-up. | Fresh-looking information may be unsupported or prohibited by the language/source policy. A detected prohibited-language sentence or unsuitable link is visibly omitted from generated advice, while the useful remainder continues. A fully unusable answer gets one same-role replacement attempt; source metadata remains subject to rejection. | Evidence-informed judgment, UC-007 / JOB-001/JOB-002; FR-03.2, FR-04.1–04.3, NFR-12.1/NFR-12.3. |
| J-05 — Control the pace | Deliberately Stop, then explicitly Send a new independent request or choose Continue to resume accepted work. Retry resumes failed or missing work within that accepted request. Start a separate consultation using New above the chat or in Conversations. Refresh or return after a lost connection. | Lost or duplicated work undermines trust. Accepted history remains; a single active consultation and late-result rejection preserve control. A refresh stays in the same tab and returns to the active surface, selected discussion tab, open record when applicable and reading position without retaining a draft or record content in browser storage. | Safe continuity, UC-003 / JOB-002; FR-03.4–03.6, FR-06.1, NFR-01.1–01.4. |
| J-06 — Act and revisit | Read the recommendation/uncertainty and next actions. After final synthesis, reopen the decision-named record, export as a directly readable RTF document, or explicitly delete it later. The export carries bold roles, local timestamps, paragraphs and sources without requiring a Markdown viewer. | A neat answer can conceal unresolved disagreement. Keep the full record beside the outcome; cancellation preserves it. | Practical next step and owned history, UC-002/UC-004 / JOB-001/JOB-004; FR-02.7, FR-06.1–06.3, NFR-14.3. |
| J-07 — Adjust when useful | Open Settings; deliberately change model/reasoning, number of specialists, discussion depth, incoming-message sound or the visible encrypted database-stored runtime-instructions Markdown document for future work; preview a sound or review a saved version before explicitly restoring it. Review usage or resolve an actual selected-provider problem. Use Head and specialists Check connection to inspect its current Codex model/reasoning availability; Critic retains its Claude reconnection check even before Claude is selected. Both refresh shared capabilities without saving, generating an answer or losing the latest unsaved edits. For missing Claude authorization, retain official local subscription sign-in on the server computer and then recheck. If Codex auth was absent when the runtime started, follow the existing restart-after-local-setup guidance; checking cannot rediscover that first authorization or restart the server. | Hidden selectors prevent control; an integration maze interrupts it. Defaults work, choices, encrypted instruction versions and actual failure types stay distinct. | Preserved active settings and chosen future preferences, UC-005 / JOB-003/JOB-005; FR-05.1–05.6, FR-08.1–08.2. |

## Value moment and success state

The central value moment is a specific Critic challenge followed by a relevant consultant response or justified agreement, with evidence that changes or supports the recommendation. The owner leaves with a decision or clearly bounded uncertainty, all requested outputs or an explicit account of what could not be supplied, and the necessary actions, while retaining control of the complete record.

## Failure, recovery and safe exits

At any stage the owner can leave without being forced to connect an unused provider. A typed draft remains distinct from accepted work. Voice cancellation aborts browser recognition; NanoDuck never receives audio, and permission/service/language/network errors keep existing typed text. Stop and failure preserve confirmed discussion and restore the composer with its unsent page-memory draft; completion collapses input into reading mode without changing the selected section or reading position. Continue conversation explicitly reopens input. No hidden queue accepts new context during active work. The same bar button becomes Logoff; activating it clears private browser content, terminates the session and restores Login. A failed request keeps the current state and gives retry feedback. If a consultation has paused after persistent provider or validation failure, Retry continues the missing reply in the same record without asking the owner to repeat the question (FR-03.5). Deletion offers a safe cancel before the consequential action. A quota limit, application-session expiry, provider grant expiry and network failure explain different next steps.

Unknown, malicious or prohibited-language sources cannot authorize a private transfer or external action (NFR-12.3). Daily consultation adds no payments, mandatory connection of an unused provider or extra application MFA step. First-run local setup and genuine selected-provider sign-in remain separate, explicitly identified paths.

## Open questions

The local-network phone/desktop scenarios and critical voice/control tasks still need representative-owner validation. The approved Electric A v8 preserves this journey; representative-owner validation is still required before release.

## Parallel review and recovery consequences

J-03 (JOB-001, UC-002; FR-02.9–FR-02.15): the owner sees concise individual Head assignments, including newly named specialists, then results as ready. Internal role instructions and context revisions remain hidden. Fixed 1/3/5 review depth is honored; Auto permits Head-selected closure. The owner can follow an exact Critic finding through correction and resolution without reading repeated background or a technical log. J-05 (JOB-002, UC-003; FR-03.5) retains Stop-first context changes and per-task recovery: completed work survives another worker’s failure, and unresolved findings cannot disappear during Retry. A final evidence gap is an honest limitation, not fabricated completion.

## Critic reliability and model usage — 2026-09-25

J-02/J-03, UC-002/UC-003: multiple Critic defects become one complete correction assignment; a malformed review is repaired once, and a terminal failure explains the stage/cause, preserves work and offers Retry for missing failed work; Continue resumes stopped accepted work. J-06, UC-004: open Usage within Discussion, compare this conversation with all saved conversations, inspect reported counts and coverage, then return to Discussion without affecting the run.

## Reading mode — 2026-09-26

J-03/J-05/J-06, JOB-001/JOB-004, UC-002/UC-003/UC-004: the retained [reading-mode decision](../forge/runs/reading-mode-20260926/scope.json), refined on 8 October, lets the owner continue reading after completion while input collapses, without switching sections or scrolling. Continue conversation reopens input with focus; Hide input collapses it without losing the page-memory draft. Stop and failure restore input and their applicable Continue/Retry actions. When input is open it stays reachable while reading. The owner can reach the current section, status and deliberate Stop on wide and narrow screens; existing tabs or the compact picker retain access to Outcome. The separate Read outcome button is absent under the accepted 8 October correction.

## Isolated request and cache economy — 2026-09-26

J-02/J-03, UC-002/UC-003: Send starts independent work even in an existing record; the composer explains this. To resume interrupted work without creating a request, use Continue/Retry. Older messages remain readable. J-07/UC-005: Usage by activity separates research, answers, reviews, control and finalization so the owner can identify token-heavy work.

## Chat beginning and end controls — 2026-09-26

J-03/J-05/J-06, UC-003/JOB-001: use the beginning/end controls to reach the first or last message while reading. These navigation actions do not send a draft, activate Stop or resume work; current accepted reading-control presentation remains with the design owner.

## U-12 research and evidence economy — 2026-09-26

J-04, UC-007/JOB-001/JOB-002: inspect evidence for each distinct supported claim and request a focused fresh check when existing evidence is inadequate or out of date. Continue/Retry can reuse relevant evidence from the same accepted request; a new Send does not inherit earlier requests or sources. The owner still receives every requested deliverable or a clear evidence gap, without an unmeasured savings promise.

## U-12 Critic cache and usage completeness — 2026-09-26

J-07, UC-005/JOB-005: inspect provider-reported input/output and available cache/reasoning categories, including retried or failed attempts. Partial or unknown coverage stays visible so missing counts are not mistaken for zero and breakdowns are not added twice. Return to the consultation without changing its accepted context, model, effort or review depth.

## U-12 upstream usage verification — 2026-09-26

J-07, UC-005/JOB-005: distinguish upstream-verified usage from retained legacy normalized counters before comparing attempts. An explicit reported zero differs from an unavailable category; optional telemetry failure does not interrupt the consultation or require a new question. Technical collection and validation remain outside this journey.

## U-13 actionable usage dashboard — 2026-09-26

J-07, UC-005/JOB-005: open Usage, compare provider summaries, inspect account-wide allowance separately from NanoDuck totals, then find the largest request, participant or activity and inspect its chronological attempts and retry/correction accounting. Return to the discussion without affecting accepted work.

## U-13 reasoning attribution follow-up — 2026-09-26

J-07, UC-005/JOB-005: compare usage rows and the attempt timeline by provider, exact model and selected reasoning effort. Keep unknown historical effort visible when an older attempt lacks reliable attribution. This supports informed inspection without implying that one effort setting produced better advice or changing the selected configuration.

## U-13 activity counts follow-up — 2026-09-26

J-07, UC-005/JOB-005: choose the current conversation or all saved conversations and inspect specialist assignments excluding Head/Critic, issued review rounds, correction orders, research-call attempts including retries, and reported search/open/find actions. Missing older counts remain partial. These application activities do not represent account-wide allowance or unrelated clients.

## White theme — 2026-10-08

J-07 / UC-005 / JOB-003 additionally lets the owner choose White theme directly from navigation, including before signing in. The appearance changes immediately, its visible state confirms the choice, and switching again restores dark. Returning to that browser restores the choice when storage is available; a storage restriction preserves the current page’s working switch. Continue reading or consulting without losing a draft, leaving the current surface or altering accepted work. Trace: FR-08.1/FR-08.3.
