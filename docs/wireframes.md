# Structural wireframes

## Source references

[PRD](prd.md), [context](project-context.md), [terms](canonical-terms.md), [guardrails](guardrails.md), [journey](user-journey.md) and [screen map](screen-map.md). The screen map supplies exact state IDs and routes; these blueprints describe their structure without choosing a visual style.

## Wireframe principles

The discussion is the primary reading surface. Navigation stays available, then current topic/context, complete messages and a reachable composer. Group by purpose; do not wrap every sentence in nested cards. The owner must be able to inspect the whole record, steer and use voice with touch or keyboard. Labels persist when fields have values.

At desktop width, use a floating horizontal navigation bar with Discussion, Conversations and Settings. Put New in the upper-right workspace action row above the chat, retaining it in Conversations. The normal view has no Review states control; development inspection stays separate. On mobile, replace its destination links with a hamburger disclosure and retain a clear current destination. The bar stays above scrolling content; safe-area and focus offsets prevent it covering controls. No required action is hover-only.

## Screen blueprints

| Surface, intent and trace | Ordered content zones | Primary / secondary actions | Inputs and state structure |
|---|---|---|---|
| S-01: enter private work. J-01, JOB-003, UC-001 | Product identity → concise purpose → Google entry → first-use processing explanation when applicable | Sign in / cancel; explicit consent then open workspace | Consent starts unchecked; denied/expired state replaces entry feedback without showing history. |
| S-02: describe, discuss and control. J-02/J-03/J-05, JOB-001/JOB-002, UC-002/UC-003 | Persistent navigation → workspace action row with New → actual topic and compact status → local Discussion/Outcome/Sources views → chronological role/recipient/time messages → reachable composer | Send; Stop during work / Continue when paused; New | Labelled text field, image-attachment and icon-only microphone button with an accessible Voice input name; a high-contrast, non-shrinking Send button; no automatic send. The picker accepts JPEG, PNG and WebP only. Empty state puts composer first. Clarification adds one question and an answer field. Long content wraps without truncating submitted text. |
| S-03: revisit. J-06, JOB-004, UC-004 | Heading → saved conversation rows with meaningful titles → record actions | Open conversation / New | Empty and unavailable states provide New/retry respectively, without fabricated records. |
| S-04: change future settings. J-07, JOB-003/JOB-005, UC-005 | Heading → Head/specialists fieldset → Critic fieldset → number of specialists → discussion depth → runtime-instructions document/revision → actual usage → account/security actions | Save settings / Save runtime instructions / Cancel, sign out, session control | Labelled native model and reasoning selects in each fieldset; Critic has provider select. Specialist count excludes Head and Critic. Depth labels explain a complete Critic ↔ specialist exchange and Auto’s 10-exchange cap. The complete editable Markdown document identifies its active revision and required headings/placeholders. Invalid combinations or Markdown show the specific requirement, retain the unsaved edit and do not change the saved future-run value. Unavailable catalog preserves the saved selection. |
| S-05: dictate with control. J-02, JOB-006, UC-006 | Labelled voice surface → browser-recognition disclosure and state → timer paired with status → transcript field when ready | Start/Stop/Use transcript / Cancel, Retry, Type instead | No recognition before Start. The dialog identifies the browser recognition-service boundary; NanoDuck receives no audio. Use transcript returns editable text to S-02 without sending. Retain a preexisting draft; insertion appends at a clear boundary rather than silently replacing it. |
| S-06: inspect evidence. J-04, JOB-001/JOB-002/JOB-004, UC-007/UC-004 | Sources heading → title/direct link → supported claim → freshness/limitation → return | Open original / close detail, retry unavailable source | Unavailable source preserves the claim and states its evidence limit. External opening uses safe links and a clear return path. |
| S-07: act. J-06, JOB-001/JOB-004, UC-002/UC-004 | Recommendation/uncertainty → material reason/evidence → up to three accountable next actions → main risk/revisit condition | Continue discussion / inspect sources/full record | Provisional state names the missing evidence or disagreement; no unsupported consensus badge. |
| S-08: control the record. J-06, JOB-004, UC-004 | Exact record title → effect of export/deletion → safe choice → result | Export / cancel; confirm deletion / Keep conversation | Destructive action has an explicit confirmation. Success returns to correct history/empty state; failure leaves record and retry available. |
| S-09: mobile wayfinding. J-01/J-05/J-07, JOB-002/JOB-003, UC-001/UC-003/UC-005 | Labelled hamburger → Discussion/Conversations/Settings links → close | Choose destination / close or Escape | Expanded state exposes links in normal tab order. Closing returns focus to the trigger; active destination is conveyed by text/state as well as color. |

## State variants and recovery contract

The following are deltas to the blueprints for every matching state in the screen map. Each row resolves cause → preserved content → next action → retry/cancel → observable completion. These are structural obligations, not five required sentences in the UI.

| State family | Recovery structure |
|---|---|
| Signed-out, consent, denied, expired | Explain entry/expiry; retain server history privately; sign in or cancel; retry entry; private workspace appears only after a valid session. |
| Empty, draft, clarification, complete, long-content | Put the appropriate input or record first; maintain draft and full messages; send/answer/read; edit or leave; accepted message or correct outcome is visible. |
| Attachment error | Name invalid image type/8 MiB limit; preserve typed text and valid filenames; remove/replace file; retry picker or type; allowed JPEG/PNG/WebP attachment is indicated. |
| Active and stopped | Pair ongoing state with reachable Stop; retain confirmed messages; Stop/Continue; return or New; no new late result appears after Stop. |
| Offline, provider-auth, quota, system-error | Show the distinct reason; retain draft/record; reconnect network, reauthorize selected provider, check known reset or retry respectively; no unused-provider prompt; recovered state returns to the same work. |
| Research error / unavailable source / provisional outcome | Identify unverified claim; preserve record and known source; retry or proceed with qualified uncertainty; inspect alternatives; no fresh-check claim until evidence exists. |
| History unavailable, export error | Identify operation failure; retain record; Retry or Back; no empty-success replacement; successful retry shows the same record/export. |
| Settings saved/edited/invalid/catalog-unavailable | Show selected values, runtime-instructions revision and precise validity; retain saved/current-run settings and unsaved document text; choose a compatible value, restore a required placeholder or cancel; retry catalog only when needed; saved-for-next-run feedback never rewrites active work. |
| Session control | Show minimal current/other session information; preserve server conversations; confirm/reverify identity before revocation; cancel returns to Settings; revoked sessions lose access. |
| Voice ready/recognizing/recognition-complete/transcript | Label the stage and browser-recognition disclosure, preserve existing draft; Start then Stop then review; Cancel always aborts recognition; Use transcript updates the draft with no send. |
| Voice denied/missing/interrupted/recognition-error | State the specific failure; keep typed draft; Retry or Type instead; Cancel aborts recognition and NanoDuck receives no audio; successful retry reaches editable transcript. |
| Delete confirmation/deleted/export-ready | Name selected record/effect; Keep cancels; confirm once; retry only failed work; successful removal is reflected in history or export completion is explicit. |
| Mobile menu closed/open | Preserve current location; expose destinations through standard disclosure; select or close/Escape; focus and current destination stay clear. |

## Notes for design and open questions

Use one-column reading and stacked fieldsets on phones; larger widths may reveal optional contextual information without duplicating the entire outcome. The current revision keeps Cobalt centered chat/composer geometry and Ember message formatting/local tabs across three role-colour palettes, following the owner feedback. Focus, errors, consent, voice privacy and destructive boundaries remain the same across them. The owner-approved Electric A v8 preserves this structure; representative-owner validation remains pending.
