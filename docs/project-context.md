# Project context

14 September 2026 · Source references: [product idea](product-idea.md), [PRD](prd.md). This bundle clarifies those sources; it does not replace them.

## Language and vocabulary

Working language is English, from the owner's latest substantive request. Product conversations support English and Ukrainian; the first substantive request sets the language and explicit changes win. Role names and provider/model identifiers remain English. The [canonical terms](canonical-terms.md) distinguish product labels from internal mechanisms.

## Product and user

NanoDuck Consulting Group is a private decision-support and coaching product for one existing owner. The owner is both user and decision maker. They want substantive consultant/Critic exchanges, practical outcomes and inspectable evidence, with little operational effort. Their rejection of the old UI and request for bold alternatives are direct feedback, not representative-user research.

The seven PRD use cases cover entry, consultation, interruption, history, Settings, dictation and research. No additional persona, audience segment or commercial service is assumed.

## Platforms and constraints

Phone browsers are primary; tablet and desktop complete the same tasks. The design comparison covers 320, 390, 430, 768, 1280 and 1440 CSS px, with WCAG 2.2 AA as a planning target. Current Safari, Chrome, Firefox and Edge remain release targets. Voice input uses the browser-native recognition capability available in Safari and Chrome; ordinary typing remains available where that capability, its service, permission, language or connectivity is unavailable. Ukrainian recognition uses the browser's Ukrainian locale when present, with `uk-UA` as the supported Ukrainian locale.

Only the existing named GoDaddy consulting app is a possible later deployment target. Its exact storage/lifecycle and provider compatibility remain technical verification work. Phase 3 implements and tests the local browser application; it does not deploy, connect to live providers or change a GoDaddy database.

Preserve recorded Astra/xhigh for Head/specialists and Astra/ultra for Critic, Balanced speed and the existing subscription constraints. The historical values are not fresh deployed settings. Supported choices are catalog-driven; a prototype may use a clearly identified catalog fixture.

## Scope and ownership

The PRD is the concise reference for MVP and exclusions: private browser consultation, history/control, live research, Settings and voice; no messenger, public SaaS, billing, generic integration gallery, native app or automatic external business actions. Google remains the identity provider; an app-specific MFA step is excluded. Ordinary processing consent and specific sensitive-transfer permission have different scopes.

Source code is public. Conversation content, attachments, identity data and grants are private. NanoDuck never receives audio for voice input: speech may be processed by the browser's recognition service after the owner explicitly starts it, and NanoDuck receives only text the owner chooses to insert and send. Use fictional content in public design artifacts; no analytics or required notifications are introduced. The owner controls their submitted content, exports and deletion. AI roles are not claims of human employment or licensure.

## Assumptions, risks and open questions

- Floating navigation means a conventional bar that stays available while scrolling; arbitrary dragging is not required. This is a reversible interpretation of the correction.
- The owner has requested a combined dark layout from Ember and Cobalt, with Electric selected after three agent-colour palettes using the same fictional task and interaction coverage; the latest request adds the NanoDuck name, SVG mark and slightly warmer Head yellow. Normal sign-in lasts 24 hours under the PRD session rule. The owner approved Electric A v8 on 14 September 2026 and authorized Phase 3 implementation.
- Browser capability checks and owner-confirmed Ukrainian probing covered Safari and Chrome on the current Mac. Mobile Safari and Android Chrome recognition, current saved settings, identity assurance and hosting recovery still need release evidence. Their absence blocks production claims, not local implementation.
- High-stakes decision support and voice/privacy flows need representative-owner validation before release. The present work is expert design/review, not user research.

No material intent question blocks the selected design refinement. Architecture owns unresolved implementation parameters and returns any new product boundary to the PRD owner.
