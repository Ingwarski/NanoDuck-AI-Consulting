# Screen map

## Source references

[PRD](prd.md), [context](project-context.md), [terms](canonical-terms.md), [guardrails](guardrails.md) and [journey](user-journey.md). This inventory owns surfaces and states; visual treatment belongs downstream.

## Screen inventory and journey-to-screen trace

Routes identify canonical user-facing surface locations; overlay states may retain the originating fragment. They are not a claim that every frozen candidate uses an identical hash, nor production API commitments. All entry points retain the candidate base URL. Desktop floating navigation exposes Discussion, Conversations and Settings; mobile exposes those same destinations through a labelled hamburger menu. Both keep Login when signed out and Logoff when authenticated, including S-01 consent, directly on the bar. On mobile this single button remains beside the hamburger trigger even when the menu is closed; activating it closes any open mobile menu. Login starts the local-password entry flow and successful Logoff returns to S-01 signed-out. New is a contextual action above the chat and in Conversations, never a menu destination. Development state inspection is outside the normal preview, available only through an explicit inspection URL; it adds no product surface. Outcome and Sources remain local consultation views.

| Surface | Route | Use cases | Journey | Requirement |
|---|---|---|---|---|
| S-01 — Sign in | `#login` | UC-001 | J-01 | FR-01.1, FR-01.2 |
| S-02 — Discussion and composer | `#discussion` | UC-002, UC-003 | J-02/J-03/J-05 | FR-02.1–02.15, FR-03.1–03.6 |
| S-03 — Conversations | `#history` | UC-004 | J-06 | FR-06.1 |
| S-04 — Settings | `#settings` | UC-005 | J-07 | FR-05.1–05.6, FR-08.2, NFR-10.2 |
| S-05 — Voice input | `#voice` | UC-006 | J-02 | FR-07.1–07.5 |
| S-06 — Sources and detail | `#sources` | UC-007, UC-004 | J-04 | FR-04.2 |
| S-07 — Outcome | `#outcome` | UC-002, UC-004 | J-06 | FR-02.6, FR-02.7 |
| S-08 — Record action confirmation | `#record-action` | UC-004 | J-06 | FR-06.2, FR-06.3 |
| S-09 — Mobile navigation | `#menu` | UC-001, UC-003, UC-005 | J-01/J-05/J-07 | FR-08.1 |

## Screen states

These states apply to the approved Electric A v8 and the retained comparison candidates; the same inventory is required in the implemented app. Cancellation returns to the prior surface and preserves its draft; it is a transition, not another empty screen. Loading/progress is visible only while a relevant operation is pending. Long English and Ukrainian discussion/draft fixtures exercise mixed scripts and wrapping.

| State | Surface | Meaning / fixture key | Route and use cases |
|---|---|---|---|
| ST-01 | S-01 | `signed-out` | `#login` · UC-001 |
| ST-02 | S-01 | `consent` | `#login` · UC-001 |
| ST-03 | S-01 | `denied` — incorrect password or bounded retry after failed attempts | `#login` · UC-001 |
| ST-04 | S-01 | `expired` | `#login` · UC-001 |
| ST-05 | S-02 | `empty` | `#discussion` · UC-002, UC-003 |
| ST-06 | S-02 | `draft` | `#discussion` · UC-002, UC-003 |
| ST-07 | S-02 | `attachment-error` | `#discussion` · UC-002, UC-003 |
| ST-08 | S-02 | `clarification` | `#discussion` · UC-002, UC-003 |
| ST-09 | S-02 | `active` — visible thought bubble/text, minimized composer, separated Porcelain Stop, and no in-progress title | `#discussion` · UC-002, UC-003 |
| ST-10 | S-02 | `complete` | `#discussion` · UC-002, UC-003 |
| ST-11 | S-02 | `stopped` | `#discussion` · UC-002, UC-003 |
| ST-12 | S-02 | `offline` | `#discussion` · UC-002, UC-003 |
| ST-13 | S-02 | `provider-auth` | `#discussion` · UC-002, UC-003 |
| ST-14 | S-02 | `quota` | `#discussion` · UC-002, UC-003 |
| ST-15 | S-02 | `research-error` | `#discussion` · UC-002, UC-003 |
| ST-16 | S-02 | `system-error` | `#discussion` · UC-002, UC-003 |
| ST-17 | S-02 | `long-content` | `#discussion` · UC-002, UC-003 |
| ST-18 | S-03 | `populated` | `#history` · UC-004 |
| ST-19 | S-03 | `empty` | `#history` · UC-004 |
| ST-20 | S-03 | `unavailable` | `#history` · UC-004 |
| ST-21 | S-04 | `saved` (current encrypted instruction revision and saved-version metadata) | `#settings` · UC-005 |
| ST-22 | S-04 | `edited` (including review/restore dialog before a new future-run revision) | `#settings` · UC-005 |
| ST-23 | S-04 | `invalid-settings` (model combination or runtime-instructions document) | `#settings` · UC-005 |
| ST-24 | S-04 | `catalog-unavailable` | `#settings` · UC-005 |
| ST-25 | S-04 | `session-control` | `#settings` · UC-005 |
| ST-26 | S-05 | `ready` | `#voice` · UC-006 |
| ST-27 | S-05 | `recognizing` | `#voice` · UC-006 |
| ST-28 | S-05 | `recognition-complete` | `#voice` · UC-006 |
| ST-29 | S-05 | `transcript` | `#voice` · UC-006 |
| ST-30 | S-05 | `permission-denied` | `#voice` · UC-006 |
| ST-31 | S-05 | `microphone-unavailable` | `#voice` · UC-006 |
| ST-32 | S-05 | `interrupted` | `#voice` · UC-006 |
| ST-33 | S-05 | `recognition-error` | `#voice` · UC-006 |
| ST-34 | S-06 | `list` | `#sources` · UC-007, UC-004 |
| ST-35 | S-06 | `detail` | `#sources` · UC-007, UC-004 |
| ST-36 | S-06 | `unavailable` | `#sources` · UC-007, UC-004 |
| ST-37 | S-07 | `recommendation` | `#outcome` · UC-002, UC-004 |
| ST-38 | S-07 | `provisional` | `#outcome` · UC-002, UC-004 |
| ST-39 | S-08 | `delete-confirmation` | `#record-action` · UC-004 |
| ST-40 | S-08 | `deleted` | `#record-action` · UC-004 |
| ST-41 | S-08 | `export-ready` | `#record-action` · UC-004 |
| ST-42 | S-08 | `export-error` | `#record-action` · UC-004 |
| ST-43 | S-09 | `closed` | `#menu` · UC-001, UC-003, UC-005 |
| ST-44 | S-09 | `open` | `#menu` · UC-001, UC-003, UC-005 |

## Local access boundaries

S-01 accepts only the local application password, never online identity or provider credentials. The same surface supports browsers on the running computer and its local network. Initial command-line setup and certificate trust instructions are operator preparation, not new app screens. A browser certificate warning is a browser-owned surface; installation guidance explains how to establish local trust before entering private credentials. Voice availability on S-05 remains conditional on the actual browser capability.

## Transitions and closure

J-01 resolves through S-01 to S-02; the navigation surface S-09 never grants identity. J-02 enters S-05 only after explicit voice choice; Start discloses browser recognition processing and activates recognition, Stop leads to editable review, Use transcript returns to the composer, and Send remains a separate action. Cancel/denied/interrupted voice returns to the preserved draft. An invalid image attachment stays at S-02 with a removable filename/error; the picker accepts only JPEG, PNG and WebP and the error names the type or 8 MiB limit.

J-03 clarification and substantive exchange remain on S-02; no procedural stage screen is added. Head's role selection, requested-output ledger and progress decisions are internal steps; the owner sees the distinct committed assignments and actual review messages in the existing transcript. Its active state hides the unavailable composer while retaining the quiet thought-bubble text and deliberate Porcelain Stop. Stop, completion or failure restores the composer and its unsent page-memory draft. New context enters this record only through an explicit Send after stopping; Continue resumes accepted work. The saved selected sound applies on authenticated entry and only newly confirmed agent messages can trigger it; initial history, owner/System events and duplicate polls cannot. Playback availability is component feedback in S-02/S-04, independent of the run state: blocked playback offers Enable sound while visual feedback remains, without adding a route or full-screen state. J-04 moves to S-06 and back to the originating claim; unavailable safe public research uses its existing evidence-limitation state. A blocked generated draft is not a user-visible `system-error` on its first language/source-policy rejection: the same role/task makes one bounded replacement attempt. J-05 Stop/Continue preserves the same record; a failed run exposes Retry on S-02 and returns to active work at failed or missing work, while New ends or pauses active work before establishing another. A refresh remains in the same browser tab: S-02 restores its open record, local tab and reading position; S-03 and S-04 restore their surface and reading position. This uses no record content or draft browser storage and does not place a record identifier in the URL. Offline, quota, provider-auth and persistent system/research failure keep distinct recovery transitions. App expiry at the PRD 24-hour boundary goes through S-01; explicit sign-out, revocation and security invalidation remain earlier exits.

J-06 uses S-07 for the conclusion, S-03 to reopen history and S-08 for export/deletion. Export downloads the selected RTF document from the existing record action; there is no new format-selection screen. Delete cancellation is inert; success removes only the selected record and returns to empty history/new discussion. J-07 opens S-04, validates the edited model combination and encrypted database-stored runtime-instructions Markdown document, and saves each for future work only when its loaded revision is still current. The owner may inspect a saved version in a read-only dialog and explicitly restore it only by creating a fresh revision. Cancel restores previous selections. Invalid Markdown or a stale save retains the unsaved edit with a specific requirement message; active runs retain their accepted document snapshot. S-04 also retains a fixed-name selector for the four existing guidance documents, with the same encrypted version/review/restore and future-run-only rules in FR-05.6. ST-25 uses the existing visible Logoff action to end the current session through the protected request boundary. The local operator password-reset command invalidates all sessions; there is no browser session list or selective remote-session manager.

Security boundaries: NFR-10.1–10.3 remain enforced by the later trusted service, not by screen visibility. NFR-12.2/NFR-14.2 protect the owner-only image-attachment and browser-recognition draft exits; NanoDuck receives no voice audio. NFR-14.3 governs record actions. Reflow, keyboard and focus apply to every surface under NFR-02.1–02.3.

## Open questions

No material surface gap remains. The screen-map owner retains user-facing route and navigation-location reconciliation. Architecture owns local API/runtime paths, operating-system and local-network support; it must return any user-facing route change to this owner. Design candidates simulate this inventory and do not prove production behavior.

## Parallel work within existing states

S-02/ST-09 supports concise individual assignments and out-of-order worker completion in canonical commit order (UC-002; FR-02.9–FR-02.14). Reuse current message recipient labels for Critic orders, corrections and assessments; internal role guidance/IDs are not transcript messages. Existing status text distinguishes actual working, waiting for a dependency or provider queue, and completed work without a new dashboard. ST-16 preserves partial successful work and exposes Retry; ST-11 cancels all active workers. S-04/ST-21–ST-24 describes fixed 1/3/5 team-review counts and Auto separately (FR-05.3). S-07/ST-37–ST-38 distinguishes resolved advice from advice carrying unresolved/evidence-blocked orders. These are variants of existing states, not new routes or a new visual composition.

## Critic reliability and model usage — 2026-09-25

S-02 retains its existing discussion/record states and gains a Usage inspection panel alongside Discussion, Outcome and Sources. Panel states: loading, no recorded usage, reported/partial usage, and retryable load failure. A scope selector chooses this conversation or all saved conversations. Viewing counters never stops generation. Existing failure/continue states display the specific review or provider failure.

## Режим читання — 2026-09-26

Погоджена [зміна режиму читання](../forge/runs/reading-mode-20260926/scope.json) для JOB-001/JOB-004, UC-002/UC-003/UC-004, S-02: після завершення консультації введення згортається, без автоматичного перемикання розділу або прокручування. «Continue conversation» розгортає введення з фокусом; «Hide input» згортає його без втрати чернетки в пам’яті сторінки. «Read outcome» явно відкриває висновок. Stop і помилка відновлюють введення та чинні Continue/Retry. Відкрите введення займає звичайне місце у потоці документа. На широкому екрані статус, Stop і чотири розділи доступні у лівій вертикальній панелі з горизонтальними назвами; на вузькому — через компактний перемикач розділів та статус/Stop. Ця погоджена зміна замінює попередні вимоги щодо автоматичного розгортання після completion, верхніх вкладок та sticky composer, але не змінює оформлення P5, доступ або дані.

## Isolated request and cache economy — 2026-09-26

S-02 retains Discussion/Outcome/Sources/Usage and current reading/Stop behavior. Usage adds a native expandable Usage by task group with per-stage attempts and per-model input/cache-read/uncached-input/output. Missing historical stages are labelled unavailable. Composer explains Send isolation versus Continue. S-04 explains that WORKING_CONTEXT.md is reference-only.
