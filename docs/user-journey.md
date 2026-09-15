# User journey

## Source references

[PRD](prd.md), [project context](project-context.md), [canonical terms](canonical-terms.md), [guardrails](guardrails.md). Requirement and use-case meanings remain in the PRD.

## Primary user, goal and starting context

The existing owner wants to reach a useful decision and act with appropriate challenge and evidence. They may start on a phone, have limited typing time, and return on a larger browser after an interruption. Those conditions are source-informed design assumptions, not observed user sessions. The most costly errors are acting on invented certainty, losing private work or sending something unintentionally.

## Journey stages

| Stage | User action and decision | Friction/trust concern and response | Outcome and trace |
|---|---|---|---|
| J-01 — Enter | Open the browser and sign in; give first-use processing consent if needed. | Repeated setup breaks the start. Returning use during the PRD 24-hour session goes directly to work, including after inactivity or browser reopening; cancellation exposes no private content. | Private workspace, UC-001 / JOB-003; FR-01.1–01.2, NFR-10.1–10.3. |
| J-02 — Describe | Type, attach an owner-generated JPEG/PNG/WebP image or choose voice. Decide whether the draft is ready to send. | Typing may be inconvenient; image validation, browser recognition permission, service processing and accidental sending need control. Recognition starts/stops/cancels explicitly, and an editable transcript is reviewed before Send. | Deliberately accepted input, UC-002/UC-006 / JOB-001/JOB-006; FR-02.1–02.2, FR-07.1–07.5, NFR-12.2/NFR-14.2. |
| J-03 — Clarify and discuss | Answer one material question if needed; read Head's short tasks, independent specialist positions and Critic exchanges; add context. | Robotic stage announcements and unexplained specialist-to-specialist routing obscure the issue. Full addressed replies show what changed and why: Head gives each recipient an assignment that repeats two details of the decision, specialists address Critic, Critic challenges, then Head synthesizes. | A meaningful exchange, UC-002/UC-003 / JOB-001/JOB-002; FR-02.3–02.8, FR-03.1–03.3. |
| J-04 — Check a claim | Open an eligible English/Ukrainian cited source and assess its claim/limitation; request a focused follow-up. | Fresh-looking information may be unsupported or prohibited by the language/source policy. Show actual source metadata and provisional status when checking fails or is rejected. | Evidence-informed judgment, UC-007 / JOB-001/JOB-002; FR-04.1–04.3, NFR-12.1/NFR-12.3. |
| J-05 — Control the pace | Stop, continue or start a new consultation using New above the chat or in Conversations. Return after a lost connection. | Lost or duplicated work undermines trust. Accepted history remains; a single active consultation and late-result rejection preserve control. | Safe continuity, UC-003 / JOB-002; FR-03.4–03.6, NFR-01.1–01.4. |
| J-06 — Act and revisit | Read the recommendation/uncertainty and next actions. Reopen, export or explicitly delete the record later. | A neat answer can conceal unresolved disagreement. Keep the full record beside the outcome; cancellation preserves it. | Practical next step and owned history, UC-002/UC-004 / JOB-001/JOB-004; FR-02.7, FR-06.1–06.3, NFR-14.3. |
| J-07 — Adjust when useful | Open Settings; deliberately change model/reasoning, number of specialists, discussion depth or the visible runtime-instructions Markdown document for future work. Review usage or resolve an actual selected-provider problem. | Hidden selectors prevent control; an integration maze interrupts it. Defaults work, choices and instruction revision are visible, and actual failure types stay distinct. | Preserved active settings and chosen future preferences, UC-005 / JOB-003/JOB-005; FR-05.1–05.6, FR-08.1–08.2. |

## Value moment and success state

The central value moment is a specific Critic challenge followed by a relevant consultant response or justified agreement, with evidence that changes or supports the recommendation. The owner leaves with a decision or one clearly bounded unanswered question and up to three actions, while retaining control of the complete record.

## Failure, recovery and safe exits

At any stage the owner can leave without being forced to connect an unused provider. A typed draft remains distinct from accepted work. Voice cancellation aborts browser recognition; NanoDuck never receives audio, and permission/service/language/network errors keep existing typed text. Stop preserves confirmed discussion. Sign-out clears private browser content and terminates the session. Deletion offers a safe cancel before the consequential action. A quota limit, application-session expiry, provider grant expiry and network failure explain different next steps.

Unknown, malicious or prohibited-language sources cannot authorize a private transfer or external action (NFR-12.3). The default path never introduces payments, native installation, provider setup or an extra app MFA step.

## Open questions

The assumed phone/desktop scenarios and critical voice/control tasks still need representative-owner validation. The approved Electric A v8 preserves this journey; representative-owner validation is still required before release.
