# Archived initial candidate — rejected

Historical record · 13 September 2026. The owner rejected this initial green design, sidebar, vague slogan and incomplete Settings/voice coverage. Current directions are defined in [design-brief.md](design-brief.md), with three new versioned candidates linked from [README](../README.md). The remainder of this document records the original proposal. This is a frontend prototype with fictional examples, not production implementation.

## Direction

An editorial workspace with warm paper, deep green navigation, a restrained clay accent for Critic and readable system typography. The conversation has the visual priority. Distinct role initials, English role names, addressed recipients and contextual quotations make the discussion legible without theatrical avatars or procedural stage headings.

This candidate is freshly authored. The short “Consulting Group” wordmark is an interface treatment of the existing name, not a new product-name decision.

Two layout approaches were considered: a dashboard of agent/report cards, and a single conversation with optional context. The conversation approach is proposed because the owner's job is to follow discussion and reach a decision. On a phone, history and preferences open as dialogs; on a larger desktop, history and a quiet participant/context column can remain visible. This is design judgment, not usability-research evidence.

## Primary surfaces and states

| Surface | Content and behavior |
|---|---|
| Sign in | One Google action; brief privacy explanation. First-use processing consent is unchecked. Prototype buttons simulate this path without authentication. |
| Empty conversation | One clear question and composer, image attachment affordance and a sample discussion entry. No setup checklist. |
| Discussion | Complete illustrative role-labelled messages, addressed reply context and citations. Sample replay, Stop and Continue demonstrate state transitions. |
| Outcome | One recommendation, three accountable next actions and an explicit untested assumption. |
| Sources | Reference title, supported claim, limitation and direct external link. No simulated research timestamps. |
| History/options | Open sample, New conversation, export, delete confirmation and sign-out. |
| Preferences | Recorded consultant/Critic values and an example speed preference. Full dynamic model/provider controls are deferred to verified catalog implementation; values in this prototype are not current entitlement claims. |
| Exceptional states | Offline, expired selected-provider authorization, quota limit and failed research each give a distinct concise notice. Recovery is visibly simulated. |

The top preview-state selector belongs to the design-review shell, not the future product UI. It makes recovery and entry states reviewable without filling product Settings with diagnostics.

## Interaction and content rules

Use one semantic reading column on mobile. Keep a reachable composer, native textarea, visible keyboard focus, dialog focus containment and return, keyboard-operable tabs, non-color role labels and no page-level horizontal scrolling. Prefer 44px primary touch targets. Inline citations are secondary targets with spacing. Sources and long text wrap.

Normal progress occupies one quiet status line. Submitted consultant messages are complete and authored concisely; no frontend truncation, rewriting or concealed business discussion. A final recommendation is distinct from the full record. New information changes the subsequent discussion, not historical messages.

Drafts in this prototype stay only in the current page memory. File controls retain filenames only; file content is neither read nor uploaded. There is no backend or persistence across reload. Sending a draft never produces a fake custom AI answer: a visible note states that no AI call occurred. The replay is explicitly scripted sample content. Export includes only the fictional sample; deletion only changes preview state.

The candidate uses system sans-serif and Georgia/Times New Roman serif fallbacks; no downloaded font, remote image, analytics, service worker, browser extension or external script is needed. No generated humans or imagery imply real consultant identities.

## Tokens

| Role | Value |
|---|---|
| Canvas | `#f8f7f3` |
| Text | `#1f302a` |
| Muted text | `#626b65` |
| Navigation | `#edeee7` |
| Primary | `#254c3d` |
| Critic/accent | `#a44428` |
| Border | `#dedfd7` |
| Body typography | System sans-serif, 14–16px by content/viewport |
| Display typography | System serif, responsive 36–57px |
| Touch controls | 44px primary actions |

All colors and layout decisions are proposed, not an established brand kit. Core states honor reduced motion and forced colors. Product conversation locale behavior is preserved in the brief; this candidate demonstrates English. Full Ukrainian localization and assistive-technology testing remain later design/implementation verification work.

## Review and verification

Run `npm start`, then open the localhost address printed by the server. The prototype also works as static files. No install step or external service is required.

Review sign-in/consent, new draft, fictional discussion, addressed Critic response, source detail, outcome, follow-up, history/preferences, export/delete, Stop/Continue and each exceptional state. Compare widths 320, 390, 430, 768, 1280 and 1440 CSS pixels. See [initial verification](archive/verification-initial.md) for this rejected candidate's actual results and limits.

The owner has not approved this design. A later implementation request must identify the accepted direction and resolve the recorded implementation-evidence gaps. This deliverable is an exploratory design candidate, not a completed full SDD pipeline or a production baseline.

Primary references checked 13 September 2026: [W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) and [W3C reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html). These inform the design targets; no WCAG certification is claimed.
