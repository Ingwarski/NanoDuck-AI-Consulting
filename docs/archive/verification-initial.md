# Historical verification — rejected initial candidate

13 September 2026. Evidence applies to the reviewed source and this design candidate, not a deployed replacement.

## Design candidate

The candidate was served through the included localhost-only Node server and exercised in the actual Codex in-app browser. The reviewer inspected screenshots, accessibility trees and rendered DOM measurements. This is browser verification, not representative-user research.

| Check | Observed result |
|---|---|
| Responsive discussion at 320, 390, 430, 768, 1280 and 1440 CSS px | Page width matched viewport at all six widths; no horizontal page overflow. |
| Primary mobile controls | Navigation and send/draft controls measured 44 × 44 CSS px. Desktop send was subsequently raised from 38 to 44px. |
| Discussion identity | Eight complete fictional entries, distinct Head/Product/Operations/Critic labels, addressed replies and contextual quotation. |
| Outcome and sources | Outcome tab showed the proposed plan; Sources showed two direct reference links and limitations. |
| Citation detail | W3C detail dialog opened; Escape closed it and focus returned to the originating citation. |
| Sign-in and initial consent | Simulated Google action opened an unchecked processing-consent control; the workspace button stayed disabled until consent. No authentication request occurred. |
| Draft behavior | English/Ukrainian test text stayed in the tab through offline, auth, quota and research-error preview states. Save displayed that no AI call was made. |
| Recovery distinctions | Each of the four states displayed its own reason/action; simulated provider return restored the same sample and draft. |
| Preferences | Recorded Astra/xhigh and Critic Astra/ultra appeared; changing example pace displayed that the current conversation was unchanged. |
| Replay/Stop/Continue | Stop retained the displayed example messages; Continue resumed the example. Stop was moved into the sticky composer and verified within the viewport. |
| Export | The export control was exercised; it generated the fictional-example Markdown payload and showed that the draft was excluded. This is not production archive export. |
| History and deletion | Mobile history opened as a dialog; delete offered Keep/Delete actions. After confirmation, the history showed no saved conversations. Replacement-dialog focus and deleted-row visibility were corrected and verified. |
| Keyboard tabs | Arrow Right selected/focused Outcome; Home returned selection/focus to Discussion. |
| Browser errors | No warning/error entries were observed during the exercised flows. |

Local artifact checks validate JavaScript syntax, local Markdown-link targets, public path hygiene and HTML IDs/ARIA references. They are not a full accessibility or security audit.

## Explicit limits

No actual AI execution, Google/provider sign-in, web-research call, database operation, backend restart, subscription entitlement check, cross-device synchronization or GoDaddy mutation is implemented or claimed by the prototype. Draft persistence is page memory only. Attachments retain filenames only; no file-content upload occurs. Backend behavior and dynamic model/provider catalogs are intentionally deferred to the later implementation phase.

Safari, Firefox, Edge, physical mobile keyboards, VoiceOver/screen-reader behavior, full Ukrainian interface localization, forced-colors rendering and production performance were not verified. Those remain release/design follow-up checks; this review does not claim WCAG conformance or universal browser support.

The historical model snapshot is dated 7 September. Current saved/effective settings, inactive Claude preferences and exact model/effort entitlement still need fresh verification before migration. Voice adoption remains a documented source-authority mismatch. The owner has not approved the candidate yet.
