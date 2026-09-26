# User journey

## Source references

[PRD](prd.md), [project context](project-context.md), [canonical terms](canonical-terms.md), [guardrails](guardrails.md). Requirement and use-case meanings remain in the PRD.

## Primary user, goal and starting context

The owner wants to reach a useful decision and act with appropriate challenge and evidence. The application runs on a macOS, Linux or Windows computer. The owner may open it on that computer or a phone/tablet on the same Wi-Fi network, have limited typing time, and return on a larger browser after an interruption. First-run setup establishes local credentials and device connection trust; daily sessions reuse that setup. Those conditions are source-informed design assumptions, not observed user sessions. The most costly errors are acting on invented certainty, losing private work or sending something unintentionally.

## Journey stages

| Stage | User action and decision | Friction/trust concern and response | Outcome and trace |
|---|---|---|---|
| J-01 — Enter | Open the trusted local-network address and use the local password through the visible Login button on the desktop or mobile menu bar; give processing consent once for each new authenticated session. Logoff is available once authenticated, including before consent. | Repeated setup breaks the start. An incorrect password gives bounded retry without revealing data; a certificate/trust problem points to local setup instructions. Returning use during the PRD 24-hour session goes directly to work, including after inactivity or browser reopening; cancellation exposes no private content. | Private workspace, UC-001 / JOB-003; FR-01.1–01.2, NFR-10.1–10.3. |
| J-02 — Describe | Type, attach an owner-generated JPEG/PNG/WebP image or choose voice where the browser supports it. Decide whether the draft is ready to send. | Typing may be inconvenient; image validation, browser recognition permission, service processing and accidental sending need control. Recognition starts/stops/cancels explicitly, and an editable transcript is reviewed before Send. | Deliberately accepted input, UC-002/UC-006 / JOB-001/JOB-006; FR-02.1–02.2, FR-07.1–07.5, NFR-12.2/NFR-14.2. |
| J-03 — Clarify and discuss | Answer one material question if needed; read Head's distinct tasks, independent specialist positions and Critic exchanges; stop first when new context is needed. | Robotic stage announcements, generic assignments and repeated exchanges obscure the issue. Full addressed replies show what changed and why: Head chooses the actual roles, gives each recipient a considered task tied to the complete request, and sees the Critic's targeted correction before deciding whether another review helps. Specialists address Critic, who can direct a specific stop-and-rework; a consultant revises materially, objects with evidence or acknowledges a gap. Independent work arrives in parallel; Critic assesses the team for the selected depth, and only affected consultants rework. An order remains unresolved until Critic assesses the correction; Head summarizes current reviewed results and any remaining gaps as Consolidated advice without compulsory closing speeches. While work is active, a quiet thought bubble says the team is preparing the next message; the unavailable composer is minimized and a separated Porcelain Stop remains reachable. A saved configured sound may accompany a newly confirmed agent message without first opening Settings; blocked playback offers Enable sound while visual feedback remains. | A meaningful exchange, UC-002/UC-003 / JOB-001/JOB-002; FR-02.3–02.8, FR-03.1–03.3. |
| J-04 — Check a claim | Open an eligible English/Ukrainian cited source and assess its claim/limitation; request a focused follow-up. | Fresh-looking information may be unsupported or prohibited by the language/source policy. A detected prohibited-language sentence or unsuitable link is visibly omitted from generated advice, while the useful remainder continues. A fully unusable answer gets one same-role replacement attempt; source metadata remains subject to rejection. | Evidence-informed judgment, UC-007 / JOB-001/JOB-002; FR-03.2, FR-04.1–04.3, NFR-12.1/NFR-12.3. |
| J-05 — Control the pace | Deliberately Stop, then explicitly Send additional context or Continue the preserved work; or start a new consultation using New above the chat or in Conversations. Refresh or return after a lost connection. | Lost or duplicated work undermines trust. Accepted history remains; a single active consultation and late-result rejection preserve control. A refresh stays in the same tab and returns to the active surface, selected discussion tab, open record when applicable and reading position without retaining a draft or record content in browser storage. | Safe continuity, UC-003 / JOB-002; FR-03.4–03.6, FR-06.1, NFR-01.1–01.4. |
| J-06 — Act and revisit | Read the recommendation/uncertainty and next actions. After final synthesis, reopen the decision-named record, export as a directly readable RTF document, or explicitly delete it later. The export carries bold roles, local timestamps, paragraphs and sources without requiring a Markdown viewer. | A neat answer can conceal unresolved disagreement. Keep the full record beside the outcome; cancellation preserves it. | Practical next step and owned history, UC-002/UC-004 / JOB-001/JOB-004; FR-02.7, FR-06.1–06.3, NFR-14.3. |
| J-07 — Adjust when useful | Open Settings; deliberately change model/reasoning, number of specialists, discussion depth, incoming-message sound or the visible encrypted database-stored runtime-instructions Markdown document for future work; preview a sound or review a saved version before explicitly restoring it. Review usage or resolve an actual selected-provider problem. For missing Claude authorization, complete official local subscription sign-in on the server computer, then use Check connection; retain unsaved settings throughout. | Hidden selectors prevent control; an integration maze interrupts it. Defaults work, choices, encrypted instruction versions and actual failure types stay distinct. | Preserved active settings and chosen future preferences, UC-005 / JOB-003/JOB-005; FR-05.1–05.6, FR-08.1–08.2. |

## Value moment and success state

The central value moment is a specific Critic challenge followed by a relevant consultant response or justified agreement, with evidence that changes or supports the recommendation. The owner leaves with a decision or clearly bounded uncertainty, all requested outputs or an explicit account of what could not be supplied, and the necessary actions, while retaining control of the complete record.

## Failure, recovery and safe exits

At any stage the owner can leave without being forced to connect an unused provider. A typed draft remains distinct from accepted work. Voice cancellation aborts browser recognition; NanoDuck never receives audio, and permission/service/language/network errors keep existing typed text. Stop preserves confirmed discussion and restores the composer with its unsent page-memory draft; failure and completion also restore it. No hidden queue accepts new context during active work. The same bar button becomes Logoff; activating it clears private browser content, terminates the session and restores Login. A failed request keeps the current state and gives retry feedback. If a consultation has paused after persistent provider or validation failure, Retry continues the missing reply in the same record without asking the owner to repeat the question (FR-03.5). Deletion offers a safe cancel before the consequential action. A quota limit, application-session expiry, provider grant expiry and network failure explain different next steps.

Unknown, malicious or prohibited-language sources cannot authorize a private transfer or external action (NFR-12.3). The default path never introduces payments, native installation, provider setup or an extra app MFA step.

## Open questions

The local-network phone/desktop scenarios and critical voice/control tasks still need representative-owner validation. The approved Electric A v8 preserves this journey; representative-owner validation is still required before release.

## Parallel review and recovery consequences

J-03 (JOB-001, UC-002; FR-02.9–FR-02.15): the owner sees concise individual Head assignments, including newly named specialists, then results as ready. Internal role instructions and context revisions remain hidden. Fixed 1/3/5 review depth is honored; Auto permits Head-selected closure. The owner can follow an exact Critic finding through correction and resolution without reading repeated background or a technical log. J-05 (JOB-002, UC-003; FR-03.5) retains Stop-first context changes and per-task recovery: completed work survives another worker’s failure, and unresolved findings cannot disappear during Retry. A final evidence gap is an honest limitation, not fabricated completion.

## Critic reliability and model usage — 2026-09-25

J-02/J-03, UC-002/UC-003: multiple Critic defects become one complete correction assignment; a malformed review is repaired once, and a terminal failure explains the stage/cause, preserves work and offers Continue. J-06, UC-004: open Usage within Discussion, compare this conversation with all saved conversations, inspect reported counts and coverage, then return to Discussion without affecting the run.

## Режим читання — 2026-09-26

Погоджена [зміна режиму читання](../forge/runs/reading-mode-20260926/scope.json) для JOB-001/JOB-004, UC-002/UC-003/UC-004, S-02: після завершення консультації введення згортається, без автоматичного перемикання розділу або прокручування. «Continue conversation» розгортає введення з фокусом; «Hide input» згортає його без втрати чернетки в пам’яті сторінки. «Read outcome» явно відкриває висновок. Stop і помилка відновлюють введення та чинні Continue/Retry. Відкрите введення займає звичайне місце у потоці документа. На широкому екрані статус, Stop і чотири розділи доступні у лівій вертикальній панелі з горизонтальними назвами; на вузькому — через компактний перемикач розділів та статус/Stop. Ця погоджена зміна замінює попередні вимоги щодо автоматичного розгортання після completion, верхніх вкладок та sticky composer, але не змінює оформлення P5, доступ або дані.

## Isolated request and cache economy — 2026-09-26

J-02/J-03, UC-002/UC-003: Send starts independent work even in an existing record; the composer explains this. To resume interrupted work without creating a request, use Continue/Retry. Older messages remain readable. J-05/UC-005: Usage by task separates research, answers, reviews, control and finalization so the owner can identify token-heavy work.

## Chat beginning and end controls — 2026-09-26

The user explicitly requested two transparent outlined circular arrow buttons to jump to the beginning and end of the chat. This is a scoped addition to existing S-02 navigation under UC-003/JOB-001; preserve Stop, drafts and ongoing work.

## U-12 research and evidence economy — 2026-09-26

U-12 research and evidence economy: preserve every distinct supported claim, full accepted owner input, exact models/effort and user-selected depth. Reuse evidence only inside the accepted request, including Continue/Retry. No cross-Send cache. Measure actual prompt construction and research stages before claiming savings.

## U-12 Critic cache and usage completeness — 2026-09-26

U-12 follow-up: retain an isolated Claude working context within one accepted request without session history or tools. Verify actual provider cache reuse with public synthetic consecutive calls. Preserve every reported token count including retries and failed calls, label partial/unknown metrics and provider-specific cache semantics, expose per-attempt breakdowns without duplicating totals. Keep full owner input, model/effort, discussion depth and independent-Send isolation. Existing Usage layout and Electric A v8 remain; no prototype reuse. User explicitly authorizes implementation and validation.

## U-12 upstream usage verification — 2026-09-26

U-12 upstream accounting follow-up: opt into the pinned Codex experimental raw completion event, extract only numeric usage from upstream metadata, deduplicate by response within the expected turn and reconcile against cumulative totals. Preserve explicit zero versus missing field; never infer writes from uncached input. Store numeric accounting provenance only, never raw responses, attribution IDs, output or hidden reasoning. Display upstream-verified versus legacy normalized counters in existing Usage. Preserve exact models, private context, authentication and live runs. Experimental telemetry failure must not interrupt consulting. Verify real coordinator Critic cache reuse with synthetic data and document historical limits. User explicitly authorizes this investigation and implementation.

## U-13 actionable usage dashboard — 2026-09-26

Open Usage, compare provider summaries, inspect account-wide windows separately, then find the largest request, participant or activity and inspect its chronological attempts and retry/correction accounting.

## U-13 reasoning attribution follow-up — 2026-09-26

U-13 reasoning attribution follow-up: Usage model rows and call timeline show the selected reasoning effort. Aggregate by provider, model and effort so different configurations never collapse together. New adapters record actual requested effort. Older calls may recover the value only from a matching immutable single-request snapshot with a known stage, provider and model; otherwise show unknown. Preserve counters, request isolation and privacy. The user authorizes this change and a read-only comparison of saved high/medium runs, not an unqualified quality claim.
