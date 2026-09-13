# Verification record

13 September 2026 · Combined Ember/Cobalt design and agent palettes · Design review only

The current A/B/C v3 candidates are Electric, Solar and Prismatic. Each has a black theme, Ember message formatting and Discussion/Outcome/Sources tabs, Cobalt centered chat/composer geometry, an icon-only microphone, contextual New and a visible Send button. The user explicitly requested this combination and palette iteration after the original three distinct designs. No design approval or production implementation is inferred.

## Current v3 observations

| Scope | Actual result |
|---|---|
| Separate Safari review | Each final v3 URL opened in its own existing Safari design tab. Discussion and Settings screenshots inspected after the Safari select-size correction. The previous Mac-lock blocker no longer applies to the current revision. |
| Responsive coverage | All 44 state fixtures rendered in each palette at 320px. Discussion and Settings checked at 320, 390, 430, 768, 1280 and 1440px in each palette. All 168 final observations had no horizontal page overflow. |
| Main controls | Electric mobile menu contains only Discussion, Conversations and Settings; destination selection closes it. Workspace New and Conversations New both open the empty composer. No inspection controls appear on normal pages. |
| Send and voice | Send has an explicit orange fill and dark text; measured about 102 × 48px on mobile and visibly present in all Safari screenshots. Electric microphone has no visible Voice text, retains its accessible name, and its sample transcript appends to an existing draft and returns focus without sending. Send explicitly adds to the sample only. |
| Model settings | Original Head Astra/xhigh, Critic Codex Astra/ultra and Balanced defaults observed in all Safari candidates. Electric rejects unsupported GPT-5.5/ultra until a supported strength is explicitly chosen. Saving affects the next sample; the active example remains unchanged. |
| Safari correction | Native selects initially rendered too small. Explicit appearance and CSS chevrons preserve native selection semantics while enforcing comfortable height. Final Safari Settings screenshots inspected in all candidates; Chromium measured about 47px. |
| Tabs, consent and recovery | Electric ArrowRight selects/focuses Outcome; Solar Outcome and Sources inspected. Electric consent starts unchecked/entry disabled; explicit checking enables simulated entry. Five failure fixtures preserve the exact typed draft. |
| Palettes and comparison | Role names/avatar initials preserve identity without colour alone. Agent colours differ; body text stays neutral. Three current iframe routes and swatches inspected, including 320px comparison reflow. |
| 24-hour session rule | Product intent, PRD, architecture, journey and QA now require a fixed 24-hour session from sign-in, including inactivity and browser reopening. Immediate sign-out/revocation/security exceptions remain. The Settings copy describes the intention; no real session or elapsed-time test exists. |
| Console | No warnings or errors in the final in-app-browser walkthrough. |

Functional regression interactions were concentrated on Electric's shared behavior. All three received independent state rendering, responsive and Safari visual checks. English/Ukrainian discussion fixtures are available; Electric's Ukrainian rendering was inspected in this revision. This is not full interface localization or a representative-user session.

| Candidate | Safari receipt | Visual/interaction evidence |
|---|---|---|
| A — Electric v3 | [Browser](../forge/design/evidence/a-v3-browser.json) | [Visual QA](../forge/design/evidence/a-v3-visual-qa.json) |
| B — Solar v3 | [Browser](../forge/design/evidence/b-v3-browser.json) | [Visual QA](../forge/design/evidence/b-v3-visual-qa.json) |
| C — Prismatic v3 | [Browser](../forge/design/evidence/c-v3-browser.json) | [Visual QA](../forge/design/evidence/c-v3-visual-qa.json) |

The current [H1–H10 review](../forge/design/evidence/hybrid-v3-heuristic-review.json) is an explicit rule-based review, separate from browser and visual evidence. It records the closed Safari finding and the deferred representative-user validation. Final candidate tree, target, source and receipt hashes are frozen in [the manifest](../forge/sdd-manifest.json).

The canonical SDD audit and candidate-stage checks pass. All 12 pre-design artifacts retain their required owners, dependency edges and exact consumed-source bindings. The coupled context/terms invocation remains intact. The 82 formal QA definitions remain **prepared / not_run**; this prototype walkthrough does not claim production security, accessibility conformance, performance or release acceptance.

## Historical v2 reconciliation

V2 was an exact rendering copy of v1 bound to corrected SDD inputs. Its in-app checks passed, but its required Safari check was blocked while the Mac was locked. Those receipts and frozen files remain unchanged historical evidence. V3 supersedes v2 through new files and fresh observations; it does not rewrite the blocked v2 results.

## Historical v1 browser observations

| Scope | Result |
|---|---|
| Separate live review pages | A — Cobalt, B — Ember and C — Prism opened as independent Safari tabs. Safari was verified as the current default browser. Discussion screenshots and Settings interactions were inspected. |
| Complete state inventory | All 44 states in each candidate were selected in the actual Codex in-app browser. Every state rendered without horizontal page overflow at 320px. |
| Responsive discussion and Settings | Both surfaces measured `scrollWidth == innerWidth` at 320, 390, 430, 768, 1280 and 1440px for each final candidate. |
| Short desktop viewport | A/B headers were compacted after a visual finding. At 1280×720 the first complete user message fits above the composer; final Safari screenshots confirm the improvement. |
| Mobile navigation | Each hamburger opened its menu; choosing Settings displayed the settings surface and closed the menu. |
| Model/reasoning controls | Initial Head Astra/xhigh, Critic Codex Astra/ultra and Balanced pace. Selecting GPT-5.5 for the Critic invalidated ultra, required an explicit supported effort and disabled Save until resolved. Save and Cancel were exercised; active sample settings stayed unchanged. |
| Voice flow | Start recording → Stop → transcribing → editable sample transcript → Use transcript. The edited transcript appended to an existing draft without sending. Prism’s focus-return defect was corrected and rechecked. No microphone was accessed. |
| Recovery | Offline, provider authorization, usage, research and system-error states showed distinct notices and retained the typed draft in all candidates. Voice denial/unavailable/interrupted/failed states were rendered through review controls. |
| Entry/consent | Consent was initially unchecked and Open workspace disabled; checking consent allowed simulated entry. No authentication or provider request occurred. |
| Source detail | Source title, claim, limitation and direct W3C reference appeared; Escape closed the dialog and returned focus to its source control in all three. |
| Discussion control | Stop retained the example contributions and exposed Continue. The full eight-entry scenario includes an addressed Critic challenge and a revised recommendation. |
| Record actions | Confirmation/empty/deleted/export-ready/export-failure states were rendered. Keep/Delete actions were exercised in Ember and Prism; Cobalt’s record-specific confirmation and Escape cancellation were inspected. Export generation was reviewed in source, not claimed as a production archive round trip. |
| Locales | Full English and representative Ukrainian discussion/transcript fixtures rendered; role names remain English. This is not full Ukrainian interface localization. |
| Console | No warnings or errors in the final active-tab walkthrough of all three candidates. |

## Historical v1 evidence

| Candidate | Visible Safari receipt | Visual/interaction QA |
|---|---|---|
| A — Cobalt v1 | [Browser](../forge/design/evidence/a-v1-browser.json) | [Visual QA](../forge/design/evidence/a-v1-visual-qa.json) |
| B — Ember v1 | [Browser](../forge/design/evidence/b-v1-browser.json) | [Visual QA](../forge/design/evidence/b-v1-visual-qa.json) |
| C — Prism v1 | [Browser](../forge/design/evidence/c-v1-browser.json) | [Visual QA](../forge/design/evidence/c-v1-visual-qa.json) |

The [H1–H10 rule-based review](../forge/design/evidence/heuristic-review.json) is separate from visual/browser evidence. Representative-user validation has **not run**; its explicit risk, owner and timing remain in the [design brief](design-brief.md). Screenshots were inspected through inline CUA tool output; no raster file is represented as an exported artifact. The frozen interactive HTML/CSS/JS mockup is the durable visual target.

`npm run check` checks JavaScript syntax, local Markdown links, public path hygiene and static HTML references. The localhost server serves only named preview assets, rejects unrelated repository paths/POST requests, blocks outbound connections through CSP and denies microphone/camera/geolocation through Permissions Policy. These are prototype-serving observations, not a production security audit.

For v1, the SDD checker passed after all pre-design documents and after `prototype-candidates`. The historical v2 candidate-stage check stopped at missing Safari receipts. Current v3 checks are recorded above. The checker guarantees declared source/metadata/stage integrity, not semantic correctness or production readiness.

## Limits and next boundary

No real AI execution, online research, audio recording/transcription, Google/provider authentication, database operation, synchronization, live entitlement check, hosting mutation or production release is implemented or claimed. Firefox/Edge, physical mobile keyboards, VoiceOver, forced-colors rendering and production performance remain unverified.

The preserved model defaults come from the 7 September historical report. The selector catalog comes from a read-only local desktop `model/list` observation on 13 September; it is not a deployed settings or entitlement read. See [model preservation](model-settings.md).

One whole-design choice or a revision request is next. Post-approval architecture/DoD/QA reconciliation and a development plan follow the accepted design. A separate later implementation prompt remains required.

## Earlier review

Initial prototype verification is retained in [the initial verification record](archive/verification-initial.md). The initial green prototype is rejected historical evidence; its earlier gaps are not current approval or release claims.
