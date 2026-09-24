# Project context

22 September 2026 · Source references: [product idea](product-idea.md), [PRD](prd.md). This bundle clarifies those sources; it does not replace them.

## Language and vocabulary

Working language is English, from the owner's latest substantive request. Product conversations and source metadata support English and Ukrainian only; the first substantive request sets the language and an explicit supported-language change wins. Russian and Belarusian language, terminology, sources and URLs are prohibited, including `.ru`, `.by`, `.su` and Cyrillic equivalents. Owner input and saved source metadata reject prohibited content. Generated prose omits the detected guilty fragment and unsuitable URL while keeping usable surrounding advice; an answer with no usable content or a tool transcript receives one same-role, same-task replacement attempt. Valid shared Ukrainian words and English names for the languages do not trigger rejection. Role names and provider/model identifiers remain English. The [canonical terms](canonical-terms.md) distinguish product labels from internal mechanisms.

## Product and user

NanoDuck Consulting Group is a private decision-support and coaching product for one existing owner. The owner is both user and decision maker. They want substantive consultant/Critic exchanges, practical outcomes and inspectable evidence, with little operational effort. The current owner correction removes the unavailable composer during active work and retains a deliberate Stop action; additional context is explicitly sent after stopping (FR-03.3–03.4). Saved sound preferences apply without opening Settings, with visible recovery if browser playback is blocked. During active work the UI reports that the team is thinking; a completed record, not the active discussion, receives its compact decision-derived title. Their rejection of the old UI and request for bold alternatives are direct feedback, not representative-user research.

The seven PRD use cases cover entry, consultation, interruption, history, Settings, dictation and research. No additional persona, audience segment or commercial service is assumed.

## Platforms and constraints

The application runs on macOS, Linux and Windows computers. Browsers on that computer and other devices on the same local network, including Wi-Fi phones and tablets, complete the same core tasks. Local-network access uses local password authentication and protected transport. The design comparison covers 320, 390, 430, 768, 1280 and 1440 CSS px, with WCAG 2.2 AA as a planning target. Current Safari, Chrome, Firefox and Edge remain release targets. Voice input uses the browser-native recognition capability available in Safari and Chrome; ordinary typing remains available where that capability, its service, permission, language or connectivity is unavailable. Ukrainian recognition uses the browser's Ukrainian locale when present, with `uk-UA` as the supported Ukrainian locale.

Private records and keys remain on the computer running the application. First-run local setup and per-device connection trust are operational steps; ordinary daily consultation should not repeat them. The browser is the UI, with no browser extension required. The optional Claude Critic can reuse the server user’s native Claude Code subscription sign-in; the provider CLI owns that credential store, and NanoDuck Settings only rechecks connection status. A separately configured subscription token remains supported. Neither app login nor a successful status refresh creates provider authorization or proves a model response.

Preserve Codex `gpt-6-astra` / `xhigh` for Head/specialists and Critic, independent specialist-count and user-selected review-depth controls, and the subscription constraints in the PRD. Head orchestrates: it inventories requested outputs, chooses actual roles, gives distinct verbatim tasks, directs follow-up and closes after the selected fixed rounds, or earlier in Auto when useful. The server executes and protects that route; it does not choose specialists or substitute task wording. GPT-6 Sol (`gpt-6-sol`) is an additional explicit option for both Codex roles, preserving saved/default Astra/xhigh selections. Supported model/effort choices require the current authenticated catalog; an absent exact model remains unavailable, and existing records or catalog presence are not fresh execution proof. Opus 5.5 is an optional explicit Critic choice alongside the retained Opus 5 / High branch; neither replaces the saved Codex choice. Public research uses a minimized isolated query: a private phone number elsewhere or digits in a public article URL do not disable it.

## Scope and ownership

The PRD is the concise reference for MVP and exclusions: private browser consultation, history/control, live research, Settings, voice and owner-generated raster images; no messenger, public SaaS, billing, generic integration gallery, native app, PDF or automatic external business actions. Local password access replaces any online identity dependency; no public account service or application MFA is introduced. Ordinary processing consent and specific sensitive-transfer permission have different scopes.

Source code is public. Conversation content, attachments, identity data and grants are private. The authenticated owner is the only attachment user and stated that their images will be self-generated; this informs the attachment threat boundary but does not prove image provenance. NanoDuck never receives audio for voice input: speech may be processed by the browser's recognition service after the owner explicitly starts it, and NanoDuck receives only text the owner chooses to insert and send. Use fictional content in public design artifacts; no analytics or required notifications are introduced. The owner controls their submitted content, exports and deletion. AI roles are not claims of human employment or licensure.

## Assumptions, risks and open questions

- Floating navigation means a conventional bar that stays available while scrolling; arbitrary dragging is not required. This is a reversible interpretation of the correction.
- The owner has requested a combined dark layout from Ember and Cobalt, with Electric selected after three agent-colour palettes using the same fictional task and interaction coverage; the latest request adds the NanoDuck name, SVG mark and slightly warmer Head yellow. Normal sign-in lasts 24 hours under the PRD session rule. The owner approved Electric A v8 on 22 September 2026 and authorized Phase 3 implementation.
- Each supported operating system and browser needs actual verification. Desktop browser observations do not prove Wi-Fi access, mobile speech recognition, encrypted local recovery or provider execution. Missing results remain explicit evidence limits.
- High-stakes decision support and voice/privacy flows need representative-owner validation before release. The present work is expert design/review, not user research.

No material intent question blocks the scoped local refactor. Architecture owns unresolved implementation parameters and returns any new product boundary to the PRD owner.

## Parallel consultation context

FR-02.9–FR-02.15 define the accepted correction. Head authors roles and concise tasks; application-managed workers execute independent work concurrently. The role library supplies optional expertise, not a fixed roster. Chat is the sole authoritative record; per-agent context is complete for owner intent and selective for work dependencies. Critic-order resolution is explicit and private bookkeeping is separate from business messages. Fixed depth is user-controlled; Auto permits Head-directed closure. This revised plan is awaiting a separate implementation prompt; earlier repair authorizations do not authorize the new unit.
