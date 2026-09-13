# Verification record

13 September 2026 · SDD reconciliation and A/B/C version history · Design review only

The active A/B/C v2 copies are frozen in [the SDD manifest](../forge/sdd-manifest.json) against the corrected SDD. Their HTML/CSS/JavaScript bytes and render-tree hashes exactly equal v1. Original v1 receipts remain historical and unchanged. No design has been approved and no production implementation or GoDaddy change has occurred.

## Current v2 revalidation

All three new URLs rendered in the Codex in-app browser; Settings navigation and preserved Astra/xhigh, Astra/ultra and Balanced selections were checked, with no warning/error console entries. The comparison links and embedded views resolve to v2. The existing v1 visual/interaction and heuristic observations are reused only through recorded exact render equality; the full walkthrough was not repeated or relabelled.

The separate Safari review required by the selected external-default review surface is **blocked because the Mac is locked**. The v2 browser receipts record that blocker, not a successful open. Whole-design review readiness remains blocked until the Mac is unlocked and those exact URLs are visibly checked. See the [consistency audit](sdd-consistency-audit.md).

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

For v1, the SDD checker passed after all pre-design documents and after `prototype-candidates`. The current canonical document audit also passes; the v2 candidate-stage check remains blocked by the missing successful Safari receipts. Its guarantee is source/metadata/stage integrity, not semantic correctness or production readiness. The 82 formal QA definitions remain prepared; this browser review does not mark the complete implementation/release suite as passed.

## Limits and next boundary

No real AI execution, online research, audio recording/transcription, Google/provider authentication, database operation, synchronization, live entitlement check, hosting mutation or production release is implemented or claimed. Firefox/Edge, physical mobile keyboards, VoiceOver, forced-colors rendering and production performance remain unverified.

The preserved model defaults come from the 7 September historical report. The selector catalog comes from a read-only local desktop `model/list` observation on 13 September; it is not a deployed settings or entitlement read. See [model preservation](model-settings.md).

One whole-design choice or a revision request is next. Post-approval architecture/DoD/QA reconciliation and a development plan follow the accepted design. A separate later implementation prompt remains required.

## Earlier review

Initial prototype verification is retained in [the initial verification record](archive/verification-initial.md). The initial green prototype is rejected historical evidence; its earlier gaps are not current approval or release claims.
