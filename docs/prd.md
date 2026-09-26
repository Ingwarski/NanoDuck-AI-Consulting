# Product requirements

24 September 2026 · Revision 6 · Authority: current [product-idea.md](product-idea.md) · Working language: English

## Product identity

Use **NanoDuck Consulting Group** as the app name, following the product idea. The SVG brand mark and palette belong to the design brief. Existing IDs are retained; parallel consultation behavior follows the current owner correction, and access and data boundaries are reconciled for local and same-network operation.

## Problem Statement

The single owner needs useful advice, real expert challenge and an inspectable record on phone or desktop. The application should provide substantive agent exchanges, persistent preferences and a clear interface that reduces the effort of reaching a decision; this specification does not claim to identify every production incident cause.

## Solution and Product Boundary

The browser is the sole supported user interface.

Start a private session using the locally configured password on a supported computer or local-network device; describe or dictate a question; follow separate consultants and Critic; inspect fresh sources; stop, continue, export or revisit the record. Normal use begins with owner sign-in and requires no routine integration setup. The public repository contains source and fictional design data; local account content stays private.

The owner’s current request authorizes this existing-application refactor for local operation. The approved Electric A v8 visual composition remains authoritative. Document validation and fictional fixtures do not prove actual browser, provider or durable-data behavior.

Actors are the existing owner, separately invoked AI roles, the local application, selected subscription providers and public research services. There are no public registrants, tenants or billing customers. Each use case records its trust and permission boundaries; shared controls are defined once under Security Requirements.

## Use Cases

### UC-001 — Sign in and return

Jobs: JOB-003. Actors: Owner; local application.
Trigger: Open the local app or its same-network address, including Wi-Fi, or return after expiry. Goal: Reach private work with local credentials.
Preconditions: The application runs on macOS, Linux or Windows; the owner configured local access; ordinary AI-processing consent has not been assumed.
Success path: 1. Owner chooses visible Login. 2. Application validates the local password and creates a private session. 3. First use presents concise AI-processing consent; returning use restores the latest record or a new consultation. 4. The menu shows Logoff, including during consent; it ends the session without deleting saved records.
Alternates/recovery: An incorrect password, cross-origin request or unauthorized local-network device exposes no record. Repeated failed attempts are bounded. Expiry asks for Login without mislabelling provider authorization. Browser reopening and inactivity preserve the existing 24-hour absolute session lifetime; Logoff, revocation and security invalidation end it immediately.
Postconditions: Only a valid local session can access private work; records survive Logoff.
Authority/privacy: Local credentials are independent of subscription authentication. The running computer stores the records; network browsers receive authorized data through protected transport. There is no public registration or online identity provider.
Obligations and acceptance: FR-01.1, FR-01.2, NFR-10.1–NFR-10.3; AC-001

### UC-002 — Consult and decide
Jobs: JOB-001. Actors: Owner; Head; selected specialists; Critic; selected model providers.
Trigger: Owner submits a question. Goal: Receive an evidence-aware decision or an explicitly unresolved issue.
Preconditions: Signed in; ordinary AI processing consent established; selected settings available; no second active consultation.
Success path: 1. Owner submits text and supported attachments. 2. System accepts and saves the request. 3. Head identifies deliverables and creates distinct roles, assignments and dependencies within the selected team count. 4. Ready independent consultants work in parallel; each result appears when committed. 5. Critic assesses the complete current team in the selected review rounds and issues only material targeted orders; affected consultants respond and Critic explicitly assesses fulfillment. Head directs follow-up work and handles remaining gaps without generic substitutions. 6. Head delivers Consolidated advice from reviewed results, preserving every requested output or explicit limitation and every unresolved finding.
Alternates/recovery: A missing material fact gets one bounded question or an explicit assumption. Provider/research failure preserves confirmed work. Sound advice may receive agreement without a manufactured challenge; unresolved disagreement stays provisional.
Postconditions: Full confirmed discussion and conclusion are saved; no external business action is taken automatically.
Authority/privacy: Only selected providers receive permitted content; AI roles never imply human employment. Sensitive transfers and consequential external actions require specific permission.
Obligations and acceptance: FR-02.1–FR-02.15, FR-03.1, FR-03.2, NFR-12.1–NFR-12.3; AC-002, AC-003

### UC-003 — Steer, stop and continue
Jobs: JOB-002. Actors: Owner; active consultation; providers.
Trigger: Owner stops work to add context, returns after interruption, or requests continuation. Goal: Control useful work without losing or duplicating the record.
Preconditions: Signed in with a current consultation; accepted and draft content are distinguishable.
Success path: 1. Owner reads complete ordered contributions. 2. During active work the composer is minimized and the owner can deliberately select the separated Porcelain Stop control. 3. System preserves accepted messages, rejects late visible results and restores the composer with any unsent page-memory draft. 4. Owner explicitly sends new context into the same record, chooses Continue to resume the accepted work, or starts New; the single-active-run rule is enforced.
Alternates/recovery: Offline/restart resumes from the saved position. Stalled work gets an honest compact status. A retry cannot insert another copy of an already confirmed response; continuation never silently exceeds the boundary.
Postconditions: Accepted history remains canonical; at most one consultation is active.
Authority/privacy: Browser commands are authenticated requests, not authority to rewrite past agent messages or active settings.
Obligations and acceptance: FR-03.3–FR-03.6, NFR-01.1–NFR-01.4, NFR-11.2; AC-004

### UC-004 — Inspect and control the record
Jobs: JOB-004. Actors: Owner; private record store.
Trigger: Owner opens history, a source, export or whole-conversation deletion. Goal: Recover complete evidence and control the saved record.
Preconditions: Signed in; a saved consultation exists.
Success path: 1. Owner opens a conversation. 2. System returns its complete confirmed messages, attachments and sources. 3. Owner downloads the conversation as a formatted RTF document or explicitly confirms its deletion. 4. System reports the actual outcome.
Alternates/recovery: Missing/denied identifiers return no protected data. Cancel deletion preserves everything. Failed export/deletion retains truthful recoverable state; retries do not corrupt another conversation.
Postconditions: Export contains the selected record; confirmed deletion removes that conversation and its owned attachments under the deletion policy.
Authority/privacy: Private data never enters the public repository. A guessed resource ID or client-edited field grants no access.
Obligations and acceptance: FR-06.1–FR-06.3, NFR-10.3, NFR-14.1–NFR-14.3; AC-005

### UC-005 — Set preferences and understand limits
Jobs: JOB-003, JOB-005. Actors: Owner; supported model catalog; selected provider.
Trigger: Owner opens Settings or a provider condition pauses work. Goal: Choose model/reasoning deliberately and understand the next available action.
Preconditions: Signed in; saved selections and available catalog evidence are identified.
Success path: 1. Owner opens Settings. 2. Owner changes Head/specialist model and reasoning, Critic provider/model/reasoning, specialist count, discussion depth or incoming-message sound, or reviews and edits the validated runtime-instructions Markdown document. 3. System validates the combination/document and saves it for future runs, showing the active document revision; a direct sound preview remains optional. 4. Usage shows known remaining/reset facts; an actual selected-provider grant failure offers contextual reauthorization.
Alternates/recovery: Unsupported combinations fail visibly without substitution. Unknown usage is labelled unavailable. Quota, outage, app-session expiry and provider authorization remain distinct; inactive Claude causes no warning. Logoff ends the current app session; operator password reset ends all app sessions.
Postconditions: Preferences persist across local application restarts; active work retains its exact earlier snapshot.
Authority/privacy: Provider credentials cannot be displayed or edited through general preference fields; session termination requires a current local session and request protection.
Obligations and acceptance: FR-05.1–FR-05.6, NFR-10.2, NFR-11.1; AC-006

### UC-006 — Dictate and review
Jobs: JOB-006. Actors: Owner; browser-native speech-recognition service.
Trigger: Owner explicitly chooses voice input. Goal: Convert a thought into an editable, deliberately sent message.
Preconditions: Signed in; a draft may already exist; browser recognition has not started.
Success path: 1. Owner explicitly starts browser recognition and grants browser permission if required. 2. System clearly indicates active recognition and discloses that the browser recognition service may process speech. 3. Owner stops recognition. 4. The browser returns an editable transcript. 5. Owner reviews/edits and explicitly sends or cancels.
Alternates/recovery: Permission denial, unavailable browser support or service, unsupported language, network failure and interruption preserve the typed draft and offer retry or typing. Cancel aborts recognition. A background transition ends recognition; no silent background recognition occurs.
Postconditions: Only the reviewed text explicitly sent by the owner becomes accepted conversation input.
Authority/privacy: Browser recognition is an external trust boundary and is disclosed at the point of use. NanoDuck receives only text the owner chooses to insert and later send; it does not receive, store or transcribe audio.
Obligations and acceptance: FR-07.1–FR-07.5, NFR-12.2, NFR-14.2; AC-007

### UC-007 — Research and evaluate a claim
Jobs: JOB-001, JOB-002. Actors: Owner; consultants; Critic; public search/retrieval provider.
Trigger: A current claim, referenced resource or material uncertainty needs evidence. Goal: Use fresh evidence that can change the decision.
Preconditions: Consultation has an identified question; no special research keyword is required.
Success path: 1. A consultant or Critic identifies the claim. 2. Team makes a minimized public query through the supported search path. 3. System records direct source and retrieval metadata. 4. Consultant relates the evidence to the claim; Critic can request a targeted follow-up. 5. Owner inspects the source.
Alternates/recovery: Unavailable or conflicting sources are reported; cached knowledge is not a fresh check. A page requesting secrets or new actions cannot authorize either. Private context requires specific authorization before search transfer.
Postconditions: Supported claims have inspectable evidence; unsupported claims remain qualified.
Authority/privacy: Retrieved content is evidence, never instructions. A tool-free Claude Critic receives team research without a provider switch.
Obligations and acceptance: FR-04.1–FR-04.3, NFR-12.1, NFR-12.3; AC-008

## Functional and Nonfunctional Requirements

### Access

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-01.1 | Login with the locally configured password is the app-entry action from the running computer or the same local network; the app runs on macOS, Linux and Windows and retains the 24-hour session lifetime in NFR-10.2. | UC-001 |
| FR-01.2 | Ordinary AI-processing consent is concise and explicit once per new authenticated session; reuse it throughout that session, including refresh, inactivity and browser reopening, unless its scope changes. | UC-001 |

### Useful consultation

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-02.1 | Text submission receives a distinguishable accepted state; an unsent draft never appears accepted. In the chat composer, Enter submits and Shift+Enter creates a line break. | UC-002 |
| FR-02.2 | The authenticated owner can attach a JPEG, PNG or WebP image of at most 8 MiB. PDF, SVG, video, archives and every other file type are rejected. | UC-002 |
| FR-02.3 | Every accepted question uses the owner-selected specialist count: 1, 2, 3, 5, or a 1–5 count chosen by Head in Auto; Head and Critic are excluded from the count. Head chooses reusable, adapted or new task-specific roles under FR-02.9. Predefined names are not an allowlist. Retain substantive prohibitions on esoteric practice and clinical/emergency misrepresentation; role names cannot bypass them. Spiritual Consultant retains its evangelical Protestant doctrine and Psychotherapist its non-clinical boundary. | UC-002 |
| FR-02.4 | Head, consultants and Critic are separate actual model invocations using accepted settings/instruction snapshots. Head authors tasks and dependencies; the application executes them under FR-02.9–FR-02.14. Each receives complete owner context once and its necessary work context. No single completion impersonates the team, no generic task fallback or wording rejection is permitted, and no direct Head-only answer bypasses specialist/Critic review. | UC-002 |
| FR-02.5 | Critic can directly order a consultant to stop circular, evasive, fabricated or unsupported work and make a specific correction. Consultants must respond substantively or provide a supported objection/evidence gap. The persisted fulfillment and escalation contract is FR-02.13; reply arrival alone is not compliance. | UC-002 |
| FR-02.6 | Consensus is stated only when Head, participating specialists and Critic agree on the same recommendation; otherwise the conclusion names the unresolved issue. | UC-002 |
| FR-02.7 | Head labels its final message Consolidated advice and synthesizes current reviewed specialist results and Critic assessments, including unresolved orders without inventing new evidence. It includes a self-contained recommendation or explicitly provisional uncertainty, every distinct owner-requested deliverable, direct supporting source links where available, an explicit list of missing outputs, actions sufficient for the actual request, the main risk and a revisit condition. An arbitrary answer-length or three-action limit cannot omit requested material. Outcome must not present a Head assignment or a previous question's conclusion as the current answer. | UC-002 |
| FR-02.8 | The optional focused interview asks one question at a time, usually 1–3 and at most five, with a suggested answer or explicit assumption available. | UC-002 |
| FR-02.9 | Head may reuse, adapt or create a task-specific specialist within the selected team count. The reusable role library is guidance, not an allowlist. Head receives a compact role index and only needed detailed entries; each consultant receives only its own role guidance. New role guidance remains private to the consultation and is not automatically added to the library. Role creation never grants additional tools, provider choices or permissions. | UC-002 |
| FR-02.10 | One Head planning invocation can produce separately addressed individual assignments and explicit dependencies. Each assignment is concise, task-specific Head-authored text delivered verbatim, without retelling the complete owner request, generic application replacement, arbitrary word limits or wording-based rejection. Show each assignment separately in chat; hide internal role instructions and routing metadata. | UC-002 |
| FR-02.11 | Execute independent ready assignments concurrently and publish/save each successful result when it arrives. Only Head declares substantive dependencies or changes work; the application schedules and protects execution. A delayed or failed consultant cannot conceal completed work from another. Provider-required queuing is reported truthfully and never causes a silent model or effort change. | UC-002 |
| FR-02.12 | The chat is the canonical record: preserve exact owner messages, corrections, ordering and attachment references. Every participant receives the complete ordered user request through its accepted message boundary exactly once, plus its own role/task and necessary evidence/dependencies. Critic receives all current team results and assignments; Head receives reviewed current results and unresolved findings. Do not indiscriminately resend technical events, unrelated role guidance or obsolete drafts. Context selection uses explicit assignment/result references, not keyword-based omission or lossy replacement of owner text. No separate user-facing request file or file-reading tools are required. | UC-002 |
| FR-02.13 | Persist every material Critic stop-and-rework order with its recipient, defective result, exact issue and required correction. A consultant must correct it, give a specific evidence-based objection or identify unavailable evidence. A submitted reply alone cannot resolve the order: Critic assesses the referenced response and records whether corrected, objection upheld, still unresolved or blocked by evidence. Repetitive replies remain unresolved and are escalated to Head; no hidden retries or automatic pass. | UC-002 |
| FR-02.14 | Critic reviews the team together in each user-selected review round; only affected consultants must answer specific findings. Fixed 1/3/5 depth completes the selected number of substantive team assessments unless stopped or failed; Auto lets Head close when useful, up to ten rounds. No forced objection, ceremonial consultant reply or automatic closing speech. A final-round correction receives a focused Critic resolution assessment before synthesis; it does not authorize another full round or endless rework. Remaining unresolved findings must be carried into provisional advice. | UC-002 |
| FR-02.15 | Measure efficiency using comparable synthetic cases, the same accepted settings and depth, complete deliverable coverage and reported input/output/cached/reasoning token categories where available. Record model-call counts and context bytes when token metrics are unavailable, without calling bytes tokens or API cache discounts subscription savings. No optimization may silently shorten owner context, drop material evidence or reduce chosen depth. | UC-002 |

### Discussion and control

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-03.1 | Full submitted business messages appear in canonical order with role, recipient where relevant and time; routine protocol paragraphs are omitted. While a run is active, the discussion shows a textual thought-bubble state and reachable Stop control. New agent messages receive a polite semantic announcement and may play the owner's selected sound; visual feedback remains when sound is off or unavailable. The discussion has no in-progress title; after the completed final synthesis, the saved record receives a concise deterministic title from the owner decision question. | UC-002 |
| FR-03.2 | The first substantive request sets English or Ukrainian session language; an explicit supported-language change wins and role names remain English. Russian and Belarusian language and terminology are rejected in owner input and saved source metadata. Valid Ukrainian shared words and English names for those languages alone are not prohibited-language evidence. In generated prose, omit a detected prohibited-language fragment visibly while preserving usable surrounding text and continuing the consultation; omit an unsuitable link without claiming it as a source. Never store or render the omitted text or URL. If a provider answer has no usable content after omission, or contains provider tool invocation/transcript material, the same role/task receives one bounded compliant-replacement attempt before the consultation can fail. | UC-002 |
| FR-03.3 | To add context while consultants are working, the owner first selects Stop, then explicitly sends the new context into the same consultation. No active-run input queue or second run is created; prior confirmed messages remain unchanged. | UC-003 |
| FR-03.4 | During active work hide the unavailable composer and keep one deliberately placed Porcelain Stop control with a square stop glyph and visible Stop label away from the former Send position and routine reading taps. It remains labelled and keyboard/touch reachable, gives pending/failure feedback, and prevents late work from becoming a newly visible result. Stop, completion or failure restores the composer without losing an unsent page-memory draft. | UC-003 |
| FR-03.5 | Continue resumes stopped work; Retry retries failed or missing assignments and assessments without repeating successful results. Preserve accepted settings/instructions, message boundaries, exact assignments, directive states and append-only confirmed messages. Dependency and review readiness, not message position alone, determine what can run. Old records remain readable and existing accepted runs retain their contract version. | UC-003 |
| FR-03.6 | New consultation creates a separate record while enforcing only one active consultation. New is available above the chat and in Conversations, and is absent from global desktop/mobile navigation. | UC-003 |

### Research

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-04.1 | Current claims and material uncertainty can trigger live public research without a special owner keyword. Head first forms a minimal public query; only that query reaches the web-enabled provider invocation, separated from the complete private owner request, saved discussion and private guidance. A contact number elsewhere in the conversation or a numeric identifier within a public article URL does not disable safe public research. The actual outgoing query is checked for contacts, credentials and unsafe URLs. A query that cannot be made safe produces a truthful evidence limitation, not a fabricated research claim. | UC-007 |
| FR-04.2 | Each cited source records title, direct URL, supported claim, retrieval time and publication date when available; the owner can inspect it. Only English or Ukrainian sources are eligible. Russian/Belarusian language, terminology and URLs, including `.ru`, `.by`, `.su` and Cyrillic equivalents, are rejected. | UC-007 |
| FR-04.3 | Claude Critic can evaluate targeted evidence already committed by the existing Codex research capability without silently changing the selected provider. It has no direct browsing or tool authority. | UC-007 |

### Settings and limits

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-05.1 | Settings exposes functioning model and reasoning selectors separately for Head/specialists and Critic, including the optional Critic provider, using only the current supported catalog. Include the exact additional `gpt-6-sol` choice for both Codex roles without changing saved/default Astra/xhigh selections; an absent model or unsupported effort remains unavailable. | UC-005 |
| FR-05.2 | Saved changes apply to future runs; each active run retains the exact provider/model/reasoning, specialist-count, discussion-depth and validated runtime-instructions Markdown/revision snapshot used at acceptance. | UC-005 |
| FR-05.3 | Settings provides specialist count 1/2/3/5/Auto and discussion depth 1/3/5/Auto. Count excludes Head and Critic. Fixed depth selects the number of team review rounds; Auto permits Head-directed closure within ten. FR-02.14 governs targeted replies and final-round assessment without mandatory closing speeches. Accepted runs retain their selected depth and contract version. Settings retains Knock, Chime, Ripple and Off with a direct owner-activated Preview. Load the saved sound preference on authenticated entry without requiring Settings, including Off. Use the same sound for Preview and newly confirmed agent-message alerts; initial history/reload, repeated polling, owner messages and System notices do not trigger alerts. Local browser WAV playback never requests notification permission. A browser playback block is reported with an explicit Enable sound action and a visual equivalent; do not claim delivery while the browser, operating system or device suppresses sound. Provider waiting budgets remain separate: Codex renews its nine-minute inactivity budget only on real matching-turn progress and has a thirty-minute absolute ceiling; Claude has a thirty-minute absolute inference deadline. Timeout feedback identifies the cause, preserves confirmed work and points to Retry. | UC-005 |
| FR-05.4 | Usage presents real known quota/reset information or explicitly unavailable information; it never invents a per-session charge. | UC-005 |
| FR-05.5 | Only a genuine authorization failure for the selected provider offers contextual reauthorization; quota and outage show their actual next action. The optional Claude Critic recognizes an ordinary native Claude Code subscription sign-in or an explicit subscription token. Show a precise local sign-in action when required and Check connection to refresh availability without losing unsaved Settings; never accept API/Console/third-party credentials as a subscription or claim login completed before it does. | UC-005 |
| FR-05.6 | Settings shows the complete current runtime-instructions Markdown document encrypted in the app database and the metadata for its encrypted saved versions. First-run local setup validates and stores an initial document; reusable public defaults may initialize an empty store, while the owner’s private document is never a repository file. Once initialized, the encrypted current local document is authoritative. Settings accepts an owner edit only when all required runtime headings and placeholders validate and the submitted revision still matches the current document; it creates an identifiable new version for future runs. The owner can inspect a saved version and restore it only by creating another new current revision. Instruction text never weakens server-enforced authorization, role topology, output bounds or language/source validation. | UC-005 |

The FR-05.6 instruction-editing obligation also preserves these existing settings capabilities: Preserve the four existing consulting guidance editors: AGENTS.md, CONSILIUM.md, CONSULTING_PLAYBOOK.md and WORKING_CONTEXT.md. Only these fixed names are accepted; each document is nonempty Markdown of at most 64 KiB. Keep encrypted append-only saved versions, stale-revision protection, review and explicit restore into a new revision. Accepted runs snapshot all four documents and their revisions; edits affect future runs only. Guidance cannot grant tools, change permissions or weaken code-enforced rules.

### History

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-06.1 | Clicking or keyboard-activating a saved conversation row reopens its complete confirmed conversation content, owned attachments and source records. A same-tab browser refresh restores the authenticated owner to the active surface and reading position; when Discussion had an open record, it reopens that record and selected local tab. The short-lived tab state contains no draft or conversation content and is cleared at Logoff. Export and Delete remain separate row actions. | UC-004 |
| FR-06.2 | Export downloads the selected complete confirmed discussion as an RTF attachment: conversation title, bold speaker/recipient names, date/time stamps in the browser time zone (explicit UTC if absent), paragraphs, supported emphasis/lists/headings and source references. Unicode English/Ukrainian text is preserved; valid emphasis appears formatted instead of raw Markdown markers. Include saved image references; image binaries remain available separately in the conversation. Exclude unsent drafts, credentials, runtime instructions and hidden run metadata. | UC-004 |
| FR-06.3 | Explicit whole-conversation deletion removes its record and owned attachments; cancellation leaves them unchanged. | UC-004 |

### Voice

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-07.1 | Where supported, browser speech recognition begins only after explicit Start and required browser permission; active recognition is visibly indicated and identifies the browser recognition-service boundary. | UC-006 |
| FR-07.2 | Stop ends recognition and exposes editable text; Cancel aborts recognition. NanoDuck does not receive temporary audio. | UC-006 |
| FR-07.3 | The owner receives an editable transcript before any send, with no automatic submission. | UC-006 |
| FR-07.4 | Permission, unavailable browser/service, language, network and interruption failures preserve the typed draft and offer retry or typing. | UC-006 |
| FR-07.5 | Background recognition is prevented and the browser recognition session is stopped or aborted when it ends. | UC-006 |

### Required design behavior

| ID | Observable obligation | Use cases |
|---|---|---|
| FR-08.1 | Desktop navigation is a standard floating bar available while scrolling; mobile navigation uses a labelled hamburger menu. Both expose Discussion, Conversations and Settings. The bar also keeps one directly visible session button: Login when signed out, Logoff when authenticated. At mobile widths it stays beside the hamburger trigger and is never hidden inside the collapsed menu. The action is unavailable while session state or its request is pending. Failed authentication actions show retry feedback without falsely changing the session label; New remains a contextual action. | UC-001, UC-003, UC-005 |
| FR-08.2 | The preference destination is literally labelled Settings; the rejected slogan and Your space label are removed. | UC-005 |
| FR-08.3 | The initial three distinct full-product candidates establish the comparison. The owner-requested next revision combines Ember black styling, message formatting and local tabs with Cobalt chat/composer layout, an icon-only microphone and clearly visible Send. The three expressive agent-colour palettes have been presented with identical coverage; the owner accepted Electric A v8 for implementation fidelity. Solar and Prismatic remain historical comparison references, not a required app palette selector. Review states is absent from the app and normal preview; inspection remains a separate development surface. | UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 |

### Continuity and bounded work

| ID | Observable obligation | Use cases |
|---|---|---|
| NFR-01.1 | An acknowledged message survives browser refresh, network interruption and application restart. A browser refresh remains in the same tab and restores the authenticated owner’s surface, open record where applicable and reading position without persisting draft text or conversation content. | UC-003 |
| NFR-01.2 | Reconnect/retry cannot duplicate a confirmed reply or allow concurrent runs to corrupt the canonical record. | UC-003 |
| NFR-01.3 | Enforce the accepted user-selected depth under FR-02.14: exactly 1, 3 or 5 team assessments on successful fixed-depth runs, or Head-directed Auto closure up to ten. Stop/failure can interrupt, never silently mark unperformed rounds complete. Resolution assessments do not add full rounds or trigger unbounded inference. Retain the ten-minute continuation target as a recovery target, not a provider deadline. | UC-003 |
| NFR-01.4 | Measure the existing 5-second acknowledgment, 30-second first useful contribution and 60-second stalled-work visibility targets without presenting filler as useful output. | UC-003 |

### Accessible browser use

| ID | Observable obligation | Use cases |
|---|---|---|
| NFR-02.1 | Core flows meet the WCAG 2.2 AA planning target, including keyboard, visible/unobscured focus, semantic names/states, errors, contrast and relevant assistive technology interactions. | UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 |
| NFR-02.2 | Core flows reflow from 320 CSS px without page-level horizontal scroll and remain usable at 200% text size; genuine two-dimensional content retains an accessible way to inspect it. | UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 |
| NFR-02.3 | Release evidence covers current Safari, Chrome, Firefox and Edge on relevant mobile/desktop devices; an unavailable microphone has the FR-07.4 fallback. | UC-001, UC-006 |

## Security Requirements

Planning target: **OWASP ASVS 5.0.0 Level 2 controls, with documented local authentication adaptations**. The application handles private business/personal conversations and credentials even though it runs on one computer. This requirements assessment is not compliance, certification or a security test. Covered surfaces are the browser UI/API, password-protected local sessions, encrypted local data, image and optional browser-speech input, subscription providers, public research and local operation. All 17 chapters were considered; unchanged injection/file/AI/data obligations are retained, while identity, session, transport and configuration applicability were reassessed for cross-platform local and Wi-Fi access. Exceptions below are explicit and never described as a full L2 pass.

Assessment rationale: Sensitive single-owner local browser/API application with private LAN access; explicit local single-factor authentication adaptation, not a compliance claim.

### NFR-10.1 — Owner identity

Applies to UC-001. Protect local and same-network entry with a locally configured owner password; reject incorrect credentials, bound repeated failed attempts and document every entry and local recovery path. There is no default password, external identity assertion or undocumented bypass. Store only a salted, one-way, deliberately expensive password verifier in private local storage, never plaintext or a recoverable password. Permit long passphrases, paste and password managers without arbitrary composition rules or routine forced rotation; architecture defines exact accepted lengths, attempt limits and owner-operated reset behavior. Reset requires access to the running computer and invalidates prior sessions. Authentication traffic and same-network private records require protected transport. The local password is a deliberate single-factor scope adaptation to ASVS 6.3.3: network restriction, encrypted transport, bounded attempts, protected local storage and revocable sessions mitigate common attacks; no MFA or full L2 assurance claim is made.
ASVS: v5.0.0-6.1.1, v5.0.0-6.1.3, v5.0.0-6.2.1, v5.0.0-6.2.5, v5.0.0-6.2.6, v5.0.0-6.2.7, v5.0.0-6.2.8, v5.0.0-6.2.9, v5.0.0-6.2.10, v5.0.0-6.3.1, v5.0.0-6.3.2, v5.0.0-6.3.3, v5.0.0-6.3.4, v5.0.0-11.4.2, v5.0.0-11.4.4.

### NFR-10.2 — Session control

Applies to UC-001, UC-005. Use server-verified, unguessable dynamic sessions renewed at local Login, with an absolute lifetime of 24 hours and no shorter inactivity timeout. Browser reopening and inactivity do not reset or shorten that lifetime. Logoff, expiry, revocation and security invalidation invalidate further use immediately; visible Logoff remains reachable on every private surface. Multiple browsers may hold sessions. Logoff terminates the current session; the local operator password-reset command invalidates all sessions. No session-list interface or selective remote-session revocation is required. Invalidated tokens cannot read or mutate private state. The lifetime supports uninterrupted daily use within the private local-network scope; it is not a NIST assurance claim. There is no application federation or separate account-factor lifecycle.
ASVS: v5.0.0-7.1.1, v5.0.0-7.1.2, v5.0.0-7.2.1, v5.0.0-7.2.2, v5.0.0-7.2.3, v5.0.0-7.2.4, v5.0.0-7.3.1, v5.0.0-7.3.2, v5.0.0-7.4.1, v5.0.0-7.4.4, v5.0.0-7.4.5, v5.0.0-7.6.2.

### NFR-10.3 — Private resource authorization
Applies to UC-001, UC-002, UC-003, UC-004, UC-005, UC-006. Enforce documented owner-only function, object and field permissions at the trusted service boundary on every read, attachment fetch, export, deletion, setting and run command. Reject anonymous/non-owner or forged identifiers and immutable-field updates without disclosing protected content or changing state; hiding UI and unpredictable IDs are insufficient.
ASVS: v5.0.0-8.1.1, v5.0.0-8.1.2, v5.0.0-8.2.1, v5.0.0-8.2.2, v5.0.0-8.2.3, v5.0.0-8.3.1, v5.0.0-15.3.1, v5.0.0-15.3.3.

### NFR-11.1 — Untrusted input and execution
Applies to UC-002, UC-004, UC-005, UC-006, UC-007. Document and enforce server-side input structure, related-value rules and type/size constraints. Use context-correct encoding, safe Markdown/text rendering, parameterized database/OS boundaries and safe deserialization; reject executable templates, unsafe URLs, malformed types, prototype pollution and parameter collisions. Resource parsing must handle ranges and release resources safely. Adversarial text, filenames, provider output and source titles must render as inert content and must not execute commands or alter queries.
ASVS: v5.0.0-1.1.1, v5.0.0-1.1.2, v5.0.0-1.2.1, v5.0.0-1.2.2, v5.0.0-1.2.3, v5.0.0-1.2.4, v5.0.0-1.2.5, v5.0.0-1.2.9, v5.0.0-1.3.1, v5.0.0-1.3.2, v5.0.0-1.3.3, v5.0.0-1.3.5, v5.0.0-1.3.7, v5.0.0-1.3.10, v5.0.0-1.4.1, v5.0.0-1.4.2, v5.0.0-1.4.3, v5.0.0-1.5.2, v5.0.0-2.1.1, v5.0.0-2.1.2, v5.0.0-2.2.1, v5.0.0-2.2.2, v5.0.0-2.2.3, v5.0.0-3.2.1, v5.0.0-3.2.2, v5.0.0-15.3.5, v5.0.0-15.3.6, v5.0.0-15.3.7.

### NFR-11.2 — State and resource abuse
Applies to UC-002, UC-003, UC-005, UC-006, UC-007. Enforce valid action order and documented per-owner/application limits at the trusted boundary. Accepted-state transitions are atomic and concurrency protected; duplicate submissions, stale workers and excessive research/provider requests cannot consume unbounded subscriptions, overwrite accepted history or bypass Stop. A browser voice start cannot mutate accepted application state. Architecture owns bounded request/upload/research limits before affected checks are prepared; use the confirmed run ceilings rather than invented latency promises.
ASVS: v5.0.0-2.1.3, v5.0.0-2.3.1, v5.0.0-2.3.2, v5.0.0-2.3.3, v5.0.0-2.3.4, v5.0.0-2.4.1, v5.0.0-15.1.3, v5.0.0-15.2.2.

### NFR-11.3 — Browser and HTTP boundaries

Applies to UC-001, UC-002, UC-003, UC-004, UC-005, UC-006. Support access from the running computer and the same local network without accepting arbitrary public authorities. Validate Host against configured local addresses, and validate a state-changing browser request’s Origin against that request’s authorized scheme and authority. Require CSRF protection for session-authorized mutations. Apply host-only HttpOnly session cookies with strict same-site behavior and Secure, restrictive CSP, correct MIME/nosniff, framing denial and referrer minimization. Validate all API bodies and HTTP boundaries. A forged cross-origin state change or DNS-rebinding request must be denied without disclosing or changing records. All browser access uses HTTPS, including same-computer access.
ASVS: v5.0.0-3.3.1, v5.0.0-3.3.2, v5.0.0-3.3.3, v5.0.0-3.3.4, v5.0.0-3.4.1, v5.0.0-3.4.2, v5.0.0-3.4.4, v5.0.0-3.4.5, v5.0.0-3.4.6, v5.0.0-3.5.1, v5.0.0-3.5.2, v5.0.0-3.5.3, v5.0.0-3.5.4, v5.0.0-3.7.1, v5.0.0-3.7.2, v5.0.0-4.1.1, v5.0.0-4.1.2, v5.0.0-4.1.3, v5.0.0-4.2.1, v5.0.0-15.3.4.

### NFR-12.1 — Restricted research reach
Applies to UC-007. Document permitted outbound communication and prevent server-side fetches from reaching private/link-local/metadata networks or unapproved protocols, destinations and redirects. Public source content cannot expand tool access or authorize disclosure/actions. A malicious URL or page instruction must produce a denied/qualified result with the private record unchanged.
ASVS: v5.0.0-1.3.6, v5.0.0-13.1.1, v5.0.0-13.2.4, v5.0.0-13.2.5, v5.0.0-15.3.2.

### NFR-12.2 — Safe attachments and browser voice
Applies to UC-002, UC-004, UC-006. This is a single-owner image path: the owner stated they will submit only images they generated, but that statement is a trust boundary rather than technical provenance proof. Accept only JPEG, PNG or WebP, with a maximum upload size of 8 MiB enforced before storage and at most four attachments per submitted message. Ignore the client MIME declaration; identify the format from its bytes and validate its bounded container structure, declared lengths, nonzero format-valid dimensions, required image-data elements and terminal boundaries. Reject unsupported formats, mismatched signatures, structurally malformed or truncated containers and oversized content. Acceptance establishes this syntactic envelope only; it does not prove complete pixel-decoder validity or malware safety. Architecture defines supported container variants and their checks. Store an accepted image as encrypted, opaque, non-executable data under an internal name; do not invoke it, transform it, generate a thumbnail or expose a server path. Any owner download requires normal owner authorization, a fixed validated content type, `nosniff` and attachment disposition. Do not decompress pixels, interpret embedded metadata or render the image server-side. No external or local malware scanner is required for this owner-only path. Browser voice is never sent as an application upload. Every rejected image must leave the typed draft intact and disclose no server path. A multiuser scope, externally sourced upload or new file type requires a new PRD security review before implementation.
ASVS: v5.0.0-5.1.1, v5.0.0-5.2.1, v5.0.0-5.2.2, v5.0.0-5.2.3, v5.0.0-5.3.1, v5.0.0-5.3.2, v5.0.0-5.4.1, v5.0.0-5.4.2, v5.0.0-5.4.3.

### NFR-12.3 — Bounded AI authority
Applies to UC-002, UC-005, UC-007. Keep untrusted owner attachments and retrieved pages separate from trusted instructions; restrict each agent/tool to needed data and authorized actions. No API-key/PAYG, automatic credits, Claude Fast Mode or silent provider/model/effort substitution is permitted. Claude Critic has no browsing, shell, file or other tool authority; it receives only the reconstructed consultation context and its text-only role/output contract. Its command-level tool denial and output filter reject internal tool invocation/transcript material before persistence or rendering. Native credential discovery may not load unrelated user/project customizations, enable tools, persist a provider transcript or broaden the selected first-party subscription route. Verify authorization freshly before inference and fail closed on a reported subscription/provider-route mismatch, failed CLI result or exact-model mismatch. The local CLI remains subject to the operator’s trusted administrator policy; user/project customization suppression does not claim isolation from that policy. Specific permission is required for sensitive external transfers and consequential external actions; unchanged ordinary consent is reused within the same authenticated session. Malicious prompt injection cannot reveal secrets, widen data access, spend through fallback or send an external message. Preserve the existing high-stakes advice and coaching boundaries.
Supplemental AI authority and subscription-use constraints come from the product brief and do not map to a specific ASVS control.

### NFR-13.1 — Cryptographic protection
Applies to UC-001, UC-004, UC-005. Maintain a key/certificate/algorithm inventory and key lifecycle with separated storage access, least privilege, rotation and recovery. Use maintained approved primitives with at least 128-bit security, authenticated encryption/integrity, strong randomness and algorithm/key replacement support; reject tampered ciphertext. An exported database alone must not expose conversations, attachments, instruction history, request state, pending work, session state or provider grants, and the restore test must demonstrate recovery using the authorized separated key material.
ASVS: v5.0.0-11.1.1, v5.0.0-11.1.2, v5.0.0-11.2.1, v5.0.0-11.2.2, v5.0.0-11.2.3, v5.0.0-11.3.1, v5.0.0-11.3.2, v5.0.0-11.3.3, v5.0.0-11.4.1, v5.0.0-11.4.3, v5.0.0-11.5.1, v5.0.0-11.6.1, v5.0.0-13.3.1, v5.0.0-13.3.2.

### NFR-13.2 — Protected transport and service identity

Applies to UC-001, UC-002, UC-004, UC-005, UC-006, UC-007. Browser access over the local network and external provider/research connections use protected transport with valid peer identity; external TLS certificate validation cannot be disabled. The local-network certificate setup and client trust steps are documented without claiming that every browser trusts a new certificate automatically. Data storage is local; no network database is required. The application runs with only the local privileges required to read private data and authorized provider configuration, and uses no default shared service credential. Invalid external certificates deny the transfer and preserve records. Architecture must define the exact LAN HTTPS mechanism and prevent accidental unauthenticated public exposure.
ASVS: v5.0.0-12.1.1, v5.0.0-12.1.2, v5.0.0-12.2.1, v5.0.0-12.2.2, v5.0.0-12.3.1, v5.0.0-12.3.2, v5.0.0-12.3.3, v5.0.0-12.3.4, v5.0.0-13.2.2, v5.0.0-13.2.3.

### NFR-14.1 — Private data classification and transfer
Applies to UC-002, UC-004, UC-006, UC-007. Classify conversation text, attachments, browser-recognized transcripts, identity/session data, grants, settings and operational records; define their access, integrity, encryption, logging and retention treatment. Sensitive values must not appear in URLs, third-party trackers or unintended caches. A minimized public query cannot silently include private business content. Verify allowed selected-provider processing and denied unauthorized search transfer separately.
ASVS: v5.0.0-14.1.1, v5.0.0-14.1.2, v5.0.0-14.2.1, v5.0.0-14.2.2, v5.0.0-14.2.3, v5.0.0-14.2.4.

### NFR-14.2 — Client and voice privacy
Applies to UC-001, UC-004, UC-006. Use no-store for sensitive responses; keep private drafts/transcripts out of persistent browser storage and clear authenticated client content on sign-out/termination, including when offline. Cancel, failure, completion or a background transition ends browser recognition; NanoDuck never receives audio. Verify that returning through browser history after sign-out does not disclose private conversation content.
ASVS: v5.0.0-14.3.1, v5.0.0-14.3.2, v5.0.0-14.3.3.

### NFR-14.3 — Retention, deletion and restore
Applies to UC-003, UC-004. Retain confirmed conversations and their owned attachments encrypted indefinitely until explicit owner deletion. Document deletion propagation to local backups and restoration handling so deleted records cannot reappear as active history; do not promise immediate physical backup erasure without evidence. Define and test backup/restore and data-integrity outcomes, with recovery objectives and ownership resolved by architecture before release checks. An isolated restore must recover accepted records and retain confirmed deletion decisions within an isolated local data directory.
Supplemental indefinite retention and deletion-aware recovery constraints come from the product brief and do not map to a specific ASVS control.

### NFR-15.1 — Secure delivery and maintenance

Applies to UC-001, UC-002, UC-004. Maintain dependency provenance/inventory and supported runtime/provider pins; define risk-based vulnerability/update deadlines with a responsible owner. The browser can reach only intended application assets and APIs, never repository metadata, debug surfaces, directory listings, TRACE, private data files or keys. Verify forbidden endpoints and extraneous files are inaccessible. Local updates preserve compatible data, have a tested backup/restore and rollback path, and never discard private records without explicit deletion. Public source contains reusable code and fictional examples only.
ASVS: v5.0.0-15.1.1, v5.0.0-15.1.2, v5.0.0-15.2.1, v5.0.0-15.2.3, v5.0.0-13.4.1, v5.0.0-13.4.2, v5.0.0-13.4.3, v5.0.0-13.4.4, v5.0.0-13.4.5.

### NFR-16.1 — Useful protected evidence
Applies to UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007. Document event inventory, timestamps, format, retention, access and incident ownership. Capture authentication/authorization/validation failures and control/transport errors with correlatable metadata, without credentials, hidden reasoning or unnecessary conversation content. Encode untrusted log fields, protect logs from reading/modification, and retain a logically separate protected analysis copy. Evidence must support a recovery investigation while a crafted log field cannot forge an event.
ASVS: v5.0.0-16.1.1, v5.0.0-16.2.1, v5.0.0-16.2.2, v5.0.0-16.2.3, v5.0.0-16.2.4, v5.0.0-16.2.5, v5.0.0-16.3.1, v5.0.0-16.3.2, v5.0.0-16.3.3, v5.0.0-16.3.4, v5.0.0-16.4.1, v5.0.0-16.4.2, v5.0.0-16.4.3.

### NFR-16.2 — Secure degraded operation
Applies to UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007. Unexpected errors return a concise actionable state without stack traces, queries or secrets. Failed validation, provider/research access, logging dependency or transport never grants access or partially commits invalid work. A provider tool trace is treated as invalid output: one bounded text-only retry may recover it, while a second trace leaves the accepted question intact and exposes neither trace. Recovery retains accepted context and distinguishes an outage from quota/authorization conditions; tests must observe both successful retry and denied unsafe retry.
ASVS: v5.0.0-16.5.1, v5.0.0-16.5.2, v5.0.0-16.5.3.

### ASVS chapter coverage and scoped exclusions

| Chapters | Applicable controls and explicit exclusions |
|---|---|
| V1, V2, V3, V4 | NFR-11.1–NFR-11.3 cover parsing, business state, browser and HTTP boundaries. No LDAP, XPath, LaTeX, JNDI, XML, mail interpreter, GraphQL, WebSocket or postMessage mechanism is required; their mechanism-specific controls are inapplicable. User SVG is excluded. HTTPS-only flags apply to all browser access. |
| V5 | NFR-12.2 covers the limited raster-image path; voice is not an application audio upload. |
| V6 | NFR-10.1 documents locally configured passwords and its single-factor adaptation. Public account enrollment, OTP, online identity assertions and multiple identity providers are absent. The owner-operated local reset is documented and ends prior sessions. |
| V7 | NFR-10.2 covers random sessions, explicit creation, lifetime and termination. Account-factor management and federated lifetime coordination are absent; local Login does not claim fresh identity proof. |
| V8 | NFR-10.3 covers function/object/field authorization. No tenant partition is offered. |
| V9, V10 | NanoDuck consumes no self-contained identity assertions and implements no application OAuth/OIDC flow. Authorized provider CLIs own their subscription authentication; NanoDuck keeps that credential access outside the browser and model prompts. |
| V11 | NFR-13.1 covers authenticated encryption, keys and recovery. No application password-derived key is used. |
| V12, V13 | NFR-12.1, NFR-13.1, NFR-13.2 and NFR-15.1 cover outbound services, configuration, local secrets and exposure. All browser traffic uses HTTPS. No network database or mTLS mechanism is required. |
| V14, V15, V16 | NFR-14.1–NFR-14.3, NFR-15.1 and NFR-16.1–NFR-16.2 retain data, maintenance, protected evidence and safe failure obligations. |
| V17 | No peer calling, WebRTC signaling, TURN or RTP media is used. Optional speech recognition is a browser-managed capability. |

Every mapped ASVS ID appears at its owning clause. Supplemental AI authority and deletion-aware recovery have explicit product sources. Introducing an excluded mechanism or widening local access returns to this security review; no historical control count is a current assurance claim.

The scoped composer/sound correction does not introduce actors, permissions, storage, integrations or external transfers. NFR-10.3, NFR-11.2–11.3 and NFR-14.2 remain unchanged: hiding controls never replaces server authorization, Stop still fences late results, and unsent drafts remain page-memory only. The existing security assessment and mapped IDs are retained. The later date-classification and optional Claude-version correction preserves NFR-12.1, NFR-12.3, NFR-14.1 and NFR-15.1: valid dates are not themselves contacts, actual private-contact/secret controls remain, exact models cannot silently change, and the existing provider dependency remains pinned. No new actor, tool authority, data transfer permission or provider is introduced. The native Claude sign-in repair rechecks NFR-12.3, NFR-13.2, NFR-14.1, NFR-15.1 and NFR-16.2 for access to the existing local provider credential store: no browser credential transfer, metered fallback, unrelated user/project customization or raw authentication diagnostics are permitted. Provider-owned authentication remains separate from the NanoDuck session.

## Product-level Implementation Decisions

Use the reusable specialist guidance library and Head-created roles while preserving high-stakes/external-action boundaries. These are AI roles; no claim of human employment or licensure is allowed. Psychotherapist does not diagnose, replace clinical care or handle emergencies, while Spiritual Consultant follows the specified evangelical Protestant doctrine and excludes esoteric practice. Use the existing Codex live search and the supported browser-native recognition path, without an application transcription provider or invented Claude tool access.

Preserve Head/specialists Codex `gpt-6-astra` / `xhigh` and Critic Codex `gpt-6-astra` / `xhigh`, as recorded in the model-settings source consumed by the product brief. GPT-6 Sol (`gpt-6-sol`) is an additional explicit choice for both Codex roles, with `low`/`medium`/`high`/`xhigh`/`max`/`ultra` as reported by the inspected catalog and `medium` as its provider default. Current catalog validation remains required; `gpt-5.6-sol` is not a substitute. The inactive Claude branch remains absent until selected; first selection retains Opus 5 / High and the confirmed effort vocabulary, with Opus 5.5 as an additional explicit supported choice. Preserve exact selected model IDs and reject an unreported or substituted Claude response identity. Defaults remain 2 specialists and 1 exchange. Verify each exact active tuple before claiming provider readiness, without replacing unavailable choices. Use the verified Codex `0.155.1` package, preserve Claude Code `2.1.280` and the provider waiting budgets in FR-05.3. Architecture owns local mechanisms; this PRD does not select a stack or build order.

All three design candidates cover the same use cases and recovery states, including interactive model/reasoning selection and the complete voice lifecycle. The initial comparison used three substantial design directions. The owner subsequently selected and approved Electric A v8 within that combined layout; its full flow coverage is retained. The floating bar remains available on scroll and is not arbitrarily draggable. A 44 CSS px touch target is the design default; WCAG 2.2 AA minimum-target rules are distinct. Longer calculations are allowed; the proposed 60–140-word ordinary-reply target never permits truncation of an actual message.

## Canonical finding severity and release effect

The SDD verification contract supplies this shared scale. Severity and release effect are separate fields; downstream owners reference this definition.

- **P0:** catastrophic actual or imminent severe harm, or system-wide unusability; blocking.
- **P1:** a broken primary journey, core capability, release invariant or high-impact requirement without an acceptable workaround for material supported scope; blocking.
- **P2:** a localized meaningful defect, gap, regression or drift. Blocking only for a required gate, critical journey, applicable accessibility/security/privacy/legal/payment/data-integrity requirement, supported device/viewport, approved hierarchy or interaction meaning, or combined P1 impact; otherwise advisory. Payment obligations remain excluded from this product.
- **P3:** low-impact polish with no material effect on behavior, comprehension, accessibility, trust or completion; advisory.

Each finding needs applicability, source, evidence and rationale. This scale does not evaluate release or create product scope.

## Testing Decisions and Minimum End-to-End Acceptance Scenarios

Use the highest practical external seam: authenticated browser through the intended service and actual provider/test fixture boundaries. Mark fixture/prototype evidence separately from production evidence. Prepared checks remain not run until executed. No screenshot or document checker proves runtime performance, security, recovery, actual multi-agent exchange or cross-browser release support.

| Scenario | Minimum observable allowed and denied outcomes |
|---|---|
| AC-001 — Owner entry (UC-001) | Correct local credentials start a session and resume; incorrect credentials, exceeded attempt limits, wrong Host, cross-origin entry and forged or replayed session tokens expose no record. Consent is explicit once per new authenticated session; unchanged scope never prompts repeatedly inside that session. Normal sessions remain usable just before 24 hours, including after inactivity/browser reopening; the 24-hour boundary expires them. Sign-out/revocation denies the old session immediately. |
| AC-002 — Useful exchange (UC-002) | Head creates concise individual assignments, including an unlisted specialist, and independent workers overlap. User context remains complete and nonduplicated. Critic orders against an evasive answer remain unresolved after a repeated answer; only a matching Critic assessment can resolve them. Complete the selected review depth, avoid mandatory unaffected replies and closing speeches, and synthesize all requested deliverables or explicit gaps. No generic task substitution or false consensus. |
| AC-003 — Honest outcome (UC-002) | Head's conclusion matches actual agreement or clearly names uncertainty, evidence, risk and no more than three actions. English role names coexist with the established session language. |
| AC-004 — Interruption (UC-003) | Accepted message survives refresh/offline/server restart; duplicate retry yields one confirmed response. Stop rejects a late result; Continue resumes context; New cannot create a concurrent second run. Measure stated timing/continuation targets. |
| AC-005 — Private record (UC-004) | Open/export returns the whole selected record; cancel deletion is inert; confirmed deletion affects only its record/attachments. Guessed identifiers and revoked sessions reveal nothing. Isolated restore respects deletion decisions. |
| AC-006 — Preferences and limits (UC-005) | Head and Critic model/reasoning selectors genuinely change valid future preferences while an active run retains its tuple. Invalid combinations cannot silently substitute. Quota, outage, expired app session and selected-provider reauthorization have distinct truthful recovery; unused Claude causes no warning. |
| AC-007 — Voice (UC-006) | In each browser providing recognition, a Ukrainian browser-recognition session begins only after Start, exposes an active state and disclosure, returns editable text after Stop, and requires explicit Send. Cancel aborts recognition. Permission/service/language/network/interruption failures preserve the typed draft. A background transition never leaves hidden recognition active or sends audio to NanoDuck. |
| AC-008 — Evidence (UC-007) | A time-sensitive question researches without a keyword; the outgoing public query contains no private context, and a separate private phone number or numeric public article ID does not block safe research. Direct source metadata supports the stated claim and reaches the final answer where relevant. Failed/conflicting sources and missing requested links stay explicit; prompt injection and unauthorized private search transfer are denied. |
| AC-009 — Integrated design (all UCs) | Each of three candidates exposes all core and recovery flows, floating desktop navigation, mobile hamburger and literal Settings, using fictional data. Keyboard/touch/reflow and text resizing remain usable; no real-provider claim is inferred from a simulated control. |
| AC-010 — Security/lifecycle (all UCs) | Allowed operations and adversarial denied outcomes cover every NFR security clause. Exact local artifact, dependency/configuration, authorization, file, session, encryption, restore and operational evidence are required later; design review supplies none of these runtime results. |

## Out Of Scope

Public registration or multiuser SaaS; payments; public internet application access; paid research by default; automatic external business actions; required notifications; native apps; PDF/SVG/video/audio/archive and arbitrary file uploads; unrelated visual redesign; private data import from another installation. Local data deletion requires the existing explicit per-conversation confirmation or a separately authorized operator action.

## Open Questions and Resolution Owners

No unresolved product-intent choice blocks the scoped local refactor. Architecture specifies local access/session protections, durable encrypted data, key handling, process concurrency, provider authorization, local update/backup/restore and supported runtime versions. Actual provider entitlement, browser behavior, optional speech and representative-owner outcomes remain verification work; authored requirements never imply those checks passed. macOS/Linux/Windows and same-network Wi-Fi access are confirmed product requirements; speech fallback is explicit in product intent.

## Source Notes

The current product brief is the sole product authority consumed for this PRD. Its current corrections authorize local operation, browser compatibility and the scoped active-composer/Stop and incoming-sound repair while preserving the remaining consultation, model, privacy and visual decisions. Historical code/model evidence is inherited only as qualified by that brief; this owner did not claim a fresh runtime observation. Supplemental security requirements derive from the pinned offline OWASP ASVS 5.0.0 catalog (SHA-256 `bcdbec214d70abcfad9284a31d4f9e5134305831d628aad3aa85d7e26626cb35`) and the skill's security-authoring, accessibility and lifecycle rules. ASVS requirements are copyright OWASP contributors under CC-BY-SA-4.0; this document paraphrases requirements and references their IDs rather than reproducing the catalog. Catalog: [OWASP ASVS v5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0).

## Parallel execution security reassessment

The 24 September correction extends existing UC-002/UC-003/UC-005 within the same owner, providers and data store. NFR-10.3 requires conversation-bound task/result/order references; NFR-11.1 requires safe role-name/task rendering and schema parsing; NFR-11.2 requires atomic per-task commits, dependency ordering, bounded scheduling and Stop fencing; NFR-12.3 prohibits dynamic roles from escalating tools/models or resolving their own Critic orders; NFR-13.1 and NFR-14.1–14.3 protect private role guidance/context and include it in deletion/restore; NFR-16.1 permits content-free usage counts only. Rechecked pinned ASVS 5.0.0 business-flow/transaction controls 2.3.1–2.3.4, authorization 8.2.1 and data protection 14.2.1 under the retained Level 2 planning assessment. Other chapter applicability/exclusions remain unchanged. This is a requirements review, not a security test or provider concurrency claim.

## Critic reliability and model usage — 2026-09-25

FR-02.13 accepts multiple valid material findings for the same consultant and preserves every issue/correction in one order to that consultant. Malformed team-review structure receives one structure-only repair; valid repeated recipients never require repair. FR-02.15 additionally requires an authenticated Usage view with provider/model input, output and total tokens, cache and reasoning categories when reported, current-conversation and all-saved scopes, retries and failed/cancelled calls, and explicit unknown/partial/history coverage. Cache/reasoning subsets must not be double-counted. Metrics persist encrypted, travel with recovery backups, and disappear with deleted conversations (NFR-13.1, NFR-14.3). FR-05.3 permits Claude thirty minutes of total inference time, including long silent Max reasoning; Codex retains its progress-aware nine-minute idle/thirty-minute absolute budgets. NFR-16.1 requires allowlisted phase/code/duration diagnostics without prompts, answers, reasoning, credentials or conversation IDs.

## Режим читання — 2026-09-26

Погоджена [зміна режиму читання](../forge/runs/reading-mode-20260926/scope.json) для JOB-001/JOB-004, UC-002/UC-003/UC-004, S-02: після завершення консультації введення згортається, без автоматичного перемикання розділу або прокручування. «Continue conversation» розгортає введення з фокусом; «Hide input» згортає його без втрати чернетки в пам’яті сторінки. «Read outcome» явно відкриває висновок. Stop і помилка відновлюють введення та чинні Continue/Retry. Відкрите введення займає звичайне місце у потоці документа. На широкому екрані статус, Stop і чотири розділи доступні у лівій вертикальній панелі з горизонтальними назвами; на вузькому — через компактний перемикач розділів та статус/Stop. Ця погоджена зміна замінює попередні вимоги щодо автоматичного розгортання після completion, верхніх вкладок та sticky composer, але не змінює оформлення P5, доступ або дані.
