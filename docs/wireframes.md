# Structural wireframes

## Source references

[PRD](prd.md), [context](project-context.md), [terms](canonical-terms.md), [guardrails](guardrails.md), [journey](user-journey.md) and [screen map](screen-map.md). The screen map supplies exact state IDs and routes; these blueprints describe their structure without choosing a visual style.

## Wireframe principles

The discussion is the primary reading surface. Navigation stays available, then current topic/context, complete messages and a reachable composer when input is available. Active work hides that composer and reserves a separate Porcelain Stop control in the desktop left consultation rail, or the compact status/Stop group on narrow screens, away from the former Send position and message reading targets. Group by purpose; do not wrap every sentence in nested cards. The owner must be able to inspect the whole record, steer and use voice with touch or keyboard. Labels persist when fields have values.

At desktop width, use a floating horizontal navigation bar with Discussion, Conversations and Settings, followed by Login or Logoff according to the authenticated session. Keep one session button beside the mobile hamburger trigger, outside its collapsed disclosure; pending session/action requests disable it to prevent duplicate submissions. Put New in the upper-right workspace action row above the chat, retaining it in Conversations. The normal view has no Review states control; development inspection stays separate. On mobile, replace its destination links with a hamburger disclosure and retain a clear current destination. The bar stays above scrolling content; safe-area and focus offsets prevent it covering controls. No required action is hover-only.

## Screen blueprints

| Surface, intent and trace | Ordered content zones | Primary / secondary actions | Inputs and state structure |
|---|---|---|---|
| S-01: enter private work. J-01, JOB-003, UC-001 | Product identity → concise purpose → labelled local-password entry → processing explanation once per new authenticated session | Sign in / cancel; explicit consent then open workspace | Password uses a native masked field with password-manager/paste support; it never requests provider credentials. Each new authenticated session starts with unchecked consent; denied/expired/attempt-limit states replace entry feedback without showing history. |
| S-02: describe, discuss and control. J-02/J-03/J-05, JOB-001/JOB-002, UC-002/UC-003 | Persistent navigation → workspace action row with New → desktop consultation rail with status/Stop and Discussion/Outcome/Sources/Usage, or compact narrow-screen view picker/status → selected reading surface with no active-conversation heading → chronological role/recipient/time messages → visible thought-bubble state during work → composer only when input is available | Send; separated Porcelain Stop in the rail or compact status group during work / Continue when stopped / Retry after failure; New | Labelled text field, image-attachment and icon-only microphone button with an accessible Voice input name; a high-contrast, non-shrinking Send button; no automatic send. Enter submits and Shift+Enter makes a line break. The picker accepts JPEG, PNG and WebP only. Empty state puts composer first. Clarification adds one question and an answer field. Long content wraps without truncating submitted text. During active work hide the text/attachment/voice/Send panel as one unit; preserve unsent page-memory input and restore it after Stop or failure. Completion collapses input without changing the selected view or reading position; Continue conversation reopens it. Do not move Stop into the former Send position. Stop remains available across the local consultation views, with pending/error feedback. For a new independent request, Stop then explicitly Send; Continue/Retry resumes the accepted request. Prior archive messages never enter the new request implicitly. A browser refresh remains in this tab and, after the protected record reloads, returns to its selected local tab and reading position. The thought bubble uses text as well as motion; new agent messages retain a visual and screen-reader signal even when sound is off or blocked. |
| S-03: revisit. J-06, JOB-004, UC-004 | Heading → completed saved conversation rows with meaningful titles → record actions | Click row to open / New | A consultation has no generated title while it is active. Its first final completion creates one concise title from the owner’s decision question; the entire summary row is keyboard-operable and opens the record, while Export and Delete remain distinct actions. A refresh of this surface stays in the same tab and returns the owner to its prior reading position. Empty and unavailable states provide New/retry respectively, without fabricated records. |
| S-04: change future settings. J-07, JOB-003/JOB-005, UC-005 | Heading → Head/specialists fieldset → Critic fieldset → number of specialists → discussion depth → message-sound select/preview → runtime-instructions and fixed-name guidance document selector/current revision → saved-version list → actual usage → account/security actions | Save settings / Preview sound / Save runtime instructions / Review version / Restore reviewed version / Cancel, Logoff | Labelled native model and reasoning selects in each fieldset; Critic has provider select. Specialist count excludes Head and Critic. Depth labels explain fixed 1/3/5 team review rounds and Head-controlled Auto up to ten; only affected consultants need correction replies. No mandatory closing speeches are implied. Sound offers Knock, Chime, Ripple or Off; Preview occurs only after the owner activates it. Saved sound applies without visiting this surface; a playback block leaves visual feedback intact and adds a contextual Enable sound action in Discussion or Settings. The fixed-name guidance selector uses the same editor and version controls; guidance documents follow their 64 KiB rule. The separate runtime-contract Markdown document identifies its encrypted current revision and required headings/placeholders. The version list exposes metadata only until the owner opens a read-only review dialog; Restore creates a fresh current revision. Invalid combinations, Markdown or stale revision show the specific requirement, retain the unsaved edit and do not change the saved future-run value. Unavailable catalog preserves the saved selection. Head and specialists exposes Check connection and status for its exact current Codex model/reasoning. Critic keeps the existing Claude reconnection control and feedback even while GPT is selected. Both buttons disable during either shared capability refresh, and every latest unsaved value is retained. A selected Claude authorization failure retains concise official local sign-in guidance; Codex first sign-in after startup shows the existing restart-after-setup limitation. No credential fields or automatic restart are added. Pending refresh prevents repeat checks and retains every unsaved form value, with truthful ready/auth/quota/unavailable feedback. |
| S-05: dictate with control. J-02, JOB-006, UC-006 | Labelled voice surface → browser-recognition disclosure and state → timer paired with status → transcript field when ready | Start/Stop/Use transcript / Cancel, Retry, Type instead | No recognition before Start; unsupported browsers retain Type instead. The dialog identifies the browser recognition-service boundary; NanoDuck receives no audio. Use transcript returns editable text to S-02 without sending. Retain a preexisting draft; insertion appends at a clear boundary rather than silently replacing it. |
| S-06: inspect evidence. J-04, JOB-001/JOB-002/JOB-004, UC-007/UC-004 | Sources heading → title/direct link → supported claim → freshness/limitation → return | Open original / close detail, retry unavailable source | Unavailable source preserves the claim and states its evidence limit. External opening uses safe links and a clear return path. |
| S-07: act. J-06, JOB-001/JOB-004, UC-002/UC-004 | Consolidated advice heading → recommendation/provisional uncertainty → material reason/evidence and direct source links → all requested outputs or explicit gaps → necessary accountable actions → main risk/revisit condition | Continue discussion / inspect sources/full record | Provisional state names the missing evidence or disagreement; no unsupported consensus badge. A pending closing review keeps Outcome empty for the current question; a Head task assignment is never an outcome. |
| S-08: control the record. J-06, JOB-004, UC-004 | Exact record title → effect of export/deletion → safe choice → formatted RTF download or deletion result | Export / cancel; confirm deletion / Keep conversation | Export keeps its existing action and identifies rich text (.rtf) in its tooltip. The document orders title/time-zone context, then each bold speaker/recipient and timestamp above complete formatted paragraphs, source references and any image references. Destructive action has an explicit confirmation. Success returns to correct history/empty state; failure leaves record and retry available. |
| S-09: mobile wayfinding. J-01/J-05/J-07, JOB-002/JOB-003, UC-001/UC-003/UC-005 | Persistent bar with Login or Logoff beside labelled hamburger → expanded Discussion/Conversations/Settings links → close | Choose destination / close or Escape | Expanded state exposes links in normal tab order. Closing returns focus to the trigger; active destination is conveyed by text/state as well as color. |

## State variants and recovery contract

The following are deltas to the blueprints for every matching state in the screen map. Each row resolves cause → preserved content → next action → retry/cancel → observable completion. These are structural obligations, not five required sentences in the UI.

| State family | Recovery structure |
|---|---|
| Signed-out, consent, denied, expired | Explain entry/expiry; retain server history privately; enter the local password or cancel; retry after the stated limit if needed; private workspace appears only after a valid session. |
| Empty, draft, clarification, complete, long-content | Put the appropriate input or record first; maintain draft and full messages; send/answer/read; edit or leave; accepted message or correct outcome is visible. |
| Attachment error | Name invalid image type/8 MiB limit; preserve typed text and valid filenames; remove/replace file; retry picker or type; allowed JPEG/PNG/WebP attachment is indicated. |
| Active and stopped | Pair ongoing state with a labelled thought bubble and separated Porcelain Stop; hide the unavailable composer, retain confirmed messages and unsent page-memory draft; Stop restores input for explicit Send or Continue; return or New; no new late result appears after Stop. A refused Stop retains the active controls and explains the failed request. A single policy-rejected provider draft is withheld and replaced before this recovery state is used. |
| Offline, provider-auth, quota, system-error | Show the distinct reason; retain draft/record; reconnect network, reauthorize selected provider, check known reset or retry respectively; no unused-provider prompt; a failed consultation exposes Retry beside the composer, disables repeat activation while the request is pending, and returns to the same work on success. A refused retry leaves the saved record intact and explains the next action. |
| Research error / unavailable source / provisional outcome | Identify unverified claim; preserve record and known source; retry or proceed with qualified uncertainty; inspect alternatives; no fresh-check claim until evidence exists. |
| History unavailable, export error | Identify operation failure; retain record; Retry or Back; no empty-success replacement; successful retry shows the same record/export. |
| Settings saved/edited/invalid/catalog-unavailable | Show selected values, encrypted runtime-instructions current revision, saved-version metadata and precise validity; retain saved/current-run settings and unsaved document text; choose a compatible value, restore a required placeholder, review a saved version before explicit restore or cancel; retry catalog only when needed; saved-for-next-run feedback never rewrites active work. |
| Session control | Use visible Logoff to end the current session and clear private browser content while preserving server conversations. Local operator password reset invalidates all sessions. No current/other-session list, selective revocation control or extra confirmation screen is introduced. |
| Voice ready/recognizing/recognition-complete/transcript | Label the stage and browser-recognition disclosure, preserve existing draft; Start then Stop then review; Cancel always aborts recognition; Use transcript updates the draft with no send. |
| Voice denied/missing/interrupted/recognition-error | State the specific failure; keep typed draft; Retry or Type instead; Cancel aborts recognition and NanoDuck receives no audio; successful retry reaches editable transcript. |
| Delete confirmation/deleted/export-ready | Name selected record/effect; Keep cancels; confirm once; retry only failed work; successful removal is reflected in history or export completion is explicit. |
| Mobile menu closed/open | Preserve current location; expose destinations through standard disclosure; select or close/Escape; focus and current destination stay clear. |

## Notes for design and open questions

Use one-column reading and stacked fieldsets on phones; larger widths may reveal optional contextual information without duplicating the entire outcome. The current revision keeps Cobalt centered chat/composer geometry and Ember message formatting/local tabs across three role-colour palettes, following the owner feedback. Focus, errors, consent, voice privacy and destructive boundaries remain the same across them. The owner-approved Electric A v8 preserves this structure; representative-owner validation remains pending.

## Parallel transcript and correction variants

S-02/ST-09 retains its ordered message column and P5 Stop. Show one ordinary Head message per assignment, recipient/name followed by task text, with no role-definition card or internal metadata. Append each confirmed result on arrival. Critic identifies the affected consultant and issue in normal message text; the correction and subsequent assessment make resolution understandable without technical IDs. Reuse status text for actual waiting/working/partial completion. For ST-16: a worker failed → retain other results and unresolved orders → Retry failed work → preserve completed messages → resume required review when dependencies are available. For ST-11: Stop all work and restore the composer. Send accepts a new independent request, while Continue/Retry resumes the same accepted request and completed work; no active-input queue or implicit accumulation of corrections. S-07/ST-38 retains explicit unresolved findings in provisional advice. Sources: FR-02.9–FR-02.14, FR-03.5; J-03/J-05; UC-002/UC-003.

## Critic reliability and model usage — 2026-09-25

Within S-02, expose Usage as the fourth local consultation view in the rail/compact picker. Its panel orders content as: title and scope selector; reported-token total; coverage/status note; provider/model rows with input/output/total and expandable cache/reasoning breakdown. At narrow widths rows stack and long model IDs wrap. Preserve the approved P5 geometry and current rail/compact Stop reachability, transcript and composer content hierarchy.

## Sticky consultation views — 2026-09-25

Historical 25 September treatment: a horizontal sticky status/Stop row with four tabs below navigation. The accepted reading-mode correction supersedes this arrangement: a left desktop rail keeps status, Stop and four view choices reachable; narrow screens use a compact view picker and status/Stop group. The selected panel scrolls without duplicating the conclusion.

## Reading mode — 2026-09-26

Current S-02 structure follows the accepted reading correction: desktop rail → selected reading panel → sticky composer only when open, otherwise Continue conversation access. Keep input/draft controls together; reserve bottom reading space for their visible height. Completion collapses input without navigation or scrolling; Hide input preserves the page-memory draft; Stop/failure restores recovery input. Remove Read outcome; Outcome remains in local navigation. Preserve P5 control geometry and safe action separation.

## Isolated request and cache economy — 2026-09-26

S-02 Usage uses one expandable group before existing model cards, with readable text rows and natural wrapping at 320 CSS pixels. Composer has a short isolation hint. S-04 keeps the document editor and adds an explicit reference-only note for WORKING_CONTEXT.md. No change to navigation, Porcelain Stop or reading-mode layout.

## Chat beginning and end controls — 2026-09-26

The user explicitly requested two transparent outlined circular arrow buttons to jump to the beginning and end of the chat. This is a scoped addition to existing S-02 navigation under UC-003/JOB-001; preserve Stop, drafts and ongoing work.

## Centered chat arrows — 2026-09-26

The explicit user correction replaces grouped navigation placement: the up arrow sits at the horizontal center near the viewport top, below global navigation; the down arrow sits at the horizontal center near the bottom safe area. Both remain fixed while scrolling, 44px controls with existing accessible labels and reduced-motion behavior; current liquid-glass appearance belongs to the design brief. They remain confined to the consultation page. No server/session changes.

## Chat boundary visibility — 2026-09-26

Hide the up arrow when the visible content beginning is reached and hide the down arrow when its end is reached; restore each when scrolling away. Hide both when the content fits. Update on scroll, viewport resize, view changes and incoming content without moving the reading position. Preserve centered 44px controls and reduced motion; use the current design brief for their liquid-glass appearance. Navigation follows the currently selected consultation view rather than switching it. No server/session changes.

## U-12 research and evidence economy — 2026-09-26

U-12 preserves S-02 navigation, message layout, Sources, Usage, Stop and current reading controls. Evidence references become normal links before display. No new screen or provider setting.

## U-12 Critic cache and usage completeness — 2026-09-26

Place per-attempt cache/reasoning categories in an expandable detail group below the corresponding model totals. Show coverage beside the counts, preserving unknown/partial values without adding raw provider transcripts or a new screen.

## U-12 upstream usage verification — 2026-09-26

Place numeric accounting provenance beside the attempt detail. Distinguish an explicit zero from a missing category; keep optional telemetry feedback subordinate to the consultation and preserve the current panel during refresh.

## U-13 actionable usage dashboard — 2026-09-26

Usage order: provider summaries with visible input/cache/output; account-wide limits with checked time; combined total secondary; request and participant rankings; activity and repeat-work details; chronological attempts with duration and provenance. Cards stack at narrow widths.

## U-13 reasoning attribution follow-up — 2026-09-26

Keep reasoning effort adjacent to each provider/model heading and attempt row. Separate configurations remain distinct groups; unknown historical effort remains a labelled value. Long identifiers wrap at narrow widths.

## U-13 activity counts follow-up — 2026-09-26

Group five labelled activity counts under the scope selector: consultants, review rounds, correction orders, research calls and web actions. Keep coverage feedback beside the values; stack the group on narrow screens without horizontal page overflow.

## White theme — 2026-10-08

Add one labelled White theme switch after navigation destinations: within horizontal desktop navigation and S-09’s mobile disclosure. Keep Login/Logoff and Menu reachable at narrow widths. The native button exposes role switch and selected state, supports keyboard/touch, and retains focus and the current surface; it does not submit or navigate. Preserve drafts and accepted work. Storage refusal leaves immediate switching available; reload restores a saved valid choice, otherwise dark. ST-43/ST-44 remain the existing disclosure states.

## Glass reading controls and sticky composer — 2026-10-08

Keep the composer’s existing rectangle and content hierarchy, anchored near the viewport bottom only while input is available. Reserve reading space for its visible height. When collapsed, Continue conversation replaces its input access without an adjacent Read outcome action. Keep the up arrow below navigation and away from Stop. Keep the centered down arrow at its original bottom safe-area position while the composer is collapsed or hidden, including active work. Raise it above the visible open composer only. Continue conversation never raises the arrow; reserve responsive row space beside it and wrap the action label on narrow screens. The last content remains readable above the visible bottom controls; keyboard focus, zoom and narrow-screen layouts must retain every action.
