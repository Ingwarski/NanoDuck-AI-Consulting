# Personal AI Consulting Group

Current product brief · 13 September 2026 · Browser replacement

## Purpose

A private web app where one owner works through a business or personal decision with a Head Consultant, relevant specialist consultants and a separate Critic. Open a browser, sign in, describe the situation, follow a substantive discussion and leave with a practical next step.

The product succeeds when the owner makes a better decision with less effort. Operating integrations, reading procedural announcements and troubleshooting the messenger are not part of that job.

## Authority and scope of this reset

The owner's eight-part request on 13 September 2026 replaces the messenger channel, connection-heavy daily workflow and previous visual design. Their follow-up explicitly selects **review, product brief and design first**. This repository contains that work; implementation, deployment and data deletion are not performed in this phase.

The source code repository is public. The deployed product, account, conversations, attachments and provider credentials remain private. Public source availability does not create a multiuser service or authorize publication of the owner's history.

## User, problem and desired outcome

The primary user is the existing single owner, working across phone, tablet and desktop, sometimes returning after an interruption. They need informed advice and constructive challenge without becoming the system operator each time they use it.

## Jobs

| Job | Situation and desired progress | Observable success | Basis |
|---|---|---|---|
| JOB-001 — Reach a decision | When a business or personal question needs judgment, get relevant expertise and challenge so I can choose a practical action. Current alternative: the existing messenger consultation. | A clear recommendation or a clearly bounded unresolved question, with evidence, risks and up to three next actions. | Retained product intent; confirmed. |
| JOB-002 — Follow and steer | When consultants work on my question, see their actual contributions, add context and stop or resume the work. | I can identify the disagreement, see a response or revision, and interrupt without losing accepted messages. | Existing control requirements and current request; confirmed. |
| JOB-003 — Keep my preferences | When I return on any device, use the existing models and settings without reconnecting integrations. | Sign-in leads to a usable conversation; active runs keep their exact settings. | Current request; confirmed. |
| JOB-004 — Return to the record | When I revisit a decision, recover the complete conversation and sources, and control its retention. | Open, export or delete a complete saved conversation; a reconnect does not duplicate replies. | Retained history/control requirements; confirmed. |
| JOB-005 — Understand limits | When a provider limit affects work, know what is available and what action is needed. | Real quota/reset information where available; no invented per-session charge or connection warning for an unused provider. | Retained usage truth and simplified daily workflow; confirmed. |

These jobs map to the start/consult/steer/revisit/account workflow below. Formal use-case and implementation mapping belongs to the later specification phase.

## Everyday workflow

1. **Sign in.** Use the existing Google owner identity. A returning owner opens the latest conversation or starts a new one. No messenger, browser extension, installation or connection checklist.
2. **Describe the situation.** Write naturally and optionally attach an image or PDF. Head asks one material question only if its answer can change the recommendation. Preserve the optional focused interview: usually 1–3 questions, maximum five, one at a time, with a suggested answer or explicit assumption available.
3. **Work through the question.** A simple question gets a direct answer. A substantive consultation uses separate specialist agent contexts, different assignments and a separate Critic. An explicit request for Critic or a team is honored. The owner sees complete, addressed contributions as they are confirmed and can add context or stop.
4. **Check evidence.** The team researches current claims when needed, without requiring the owner to ask for a special research mode. Sources are linked beside relevant claims and available together for inspection.
5. **Act and revisit.** Head gives a self-contained conclusion, up to three practical actions, the main risk and a condition for revisiting the decision. Continue with the same context, start a new consultation or return later through history.

## What real discussion means

- Each participating consultant and Critic is a separately invoked AI agent/context. A single completion labelled with several roles is not a consilium.
- Head chooses relevant specialists from the existing pool, normally 2–5 for a substantive team consultation, and assigns distinct work. Do not launch the entire pool by default.
- Start from independent positions, then exchange specific claims, objections, questions, evidence and revisions. Critic challenges the material weakness; the relevant consultant answers that challenge. Agreement is allowed immediately when warranted. Do not manufacture conflict or praise.
- Each ordinary reply should develop one useful point. A proposed writing target is 60–140 words, with longer calculations or explanations when necessary. This guides generation; it is not permission to truncate or rewrite an actual submitted message.
- Display the full submitted business messages in canonical order, with role, addressed recipient when relevant and time. Hidden model reasoning, credentials and technical tool logs are not conversation content.
- Keep version/approval bookkeeping internal. Use the word **consensus** only when all participating specialists, Critic and Head actually agree on the same current recommendation. If agreement is not reached, deliver an explicitly provisional conclusion with unresolved disagreement and the next evidence needed.
- Retain the existing maximum of seven Critic messages addressed to each specialist and the ten-minute continuation boundary. These are ceilings, not a quota of ceremonial rounds. Preserve Stop and bounded use of subscriptions.
- Role names remain in English. The first substantive request sets the session language; an explicit language request wins. Do not switch language because of a citation or attachment. The owner may explicitly change it.

## Research is part of consulting

Live public-web research is available to the consultation team by default. Use it for time-sensitive facts, cited resources, specialist uncertainty or evidence that can change a recommendation. Do not make every answer browse needlessly.

Record source title, direct URL, the claim it supports, retrieval time and publication date when available. Distinguish retrieved fact, owner-supplied information, assumptions and professional judgment. Sources can disagree or fail; show that honestly. Never invent a citation or describe cached knowledge as a fresh check.

Preserve the existing Codex live-search capability. A selected Claude Critic must be able to request a targeted check and receive the resulting evidence through the team; its current adapter is tool-free, so direct Claude browsing is not assumed. Research does not silently change the selected LLM or enable paid fallback.

Use public, minimized queries. Do not send private business details or attachment contents to search services without specific authorization. Retrieved pages provide evidence, not instructions or permission to act.

## Login and preferences

Normal use requires only owner sign-in. Provider grants are provisioned once for the deployment and refreshed automatically where supported. Model discovery and infrastructure diagnostics are operational responsibilities, outside the everyday settings journey.

App login cannot create a ChatGPT/Claude subscription grant. If the selected provider truly requires reauthorization, show one contextual action beside the paused conversation and return to the same work afterward. A quota limit shows known reset information; a transient outage gets retry behavior. Do not ask the owner to reconnect for an unrelated failure or warn about an inactive Claude route.

## Models and settings to preserve

| Role/setting | Last recorded selection | Evidence status |
|---|---|---|
| Head and specialists | Codex, `gpt-6-astra`, `xhigh` | Existing repository's live-review record dated 7 September 2026. |
| Critic | Codex, `gpt-6-astra`, `ultra` | Same recorded observation; **not** the `xhigh` code default. |
| Speed | Balanced (`збалансовано`) | Same recorded observation. |
| Optional Critic route | Claude Code, preserving its separately saved model/effort if selected | Supported in current system; saved inactive values not established by this review. |

A fresh content-free read of saved settings is required before migration, including inactive branch preferences. Do not replace unknown values with defaults. Independently verify the exact active provider/model/effort combinations; Astra/xhigh evidence alone is not execution proof for Astra/ultra.

Preserve subscription use, no silent model/effort substitution, no API-key/PAYG fallback, no automatic usage credits and no Claude Fast Mode. Current provider package pins are Codex `0.153.1` and Claude Code `2.1.258`; this design phase does not upgrade them. The implemented fast/balanced/thorough policies use 2/3/5 specialist caps/concurrency and a 540,000 ms provider budget. Model settings and orchestration limits are separate concerns.

## V1 boundary

**Included:** a private responsive web app; existing owner Google sign-in without an app-specific MFA step; one active consultation; direct answers and substantive team discussion; retained specialist/coaching pool; text, images and PDF; live research; complete conversation history; export and whole-conversation deletion; Stop, Continue and New consultation; optional model/effort/provider/speed preferences; truthful quota/usage information; recovery across browser interruptions and server restart.

The retained specialist pool covers strategy, finance, operations, entrepreneurship, B2B/B2C sales, marketing, product, leadership, data and risk, plus the existing personal/coaching roles. These are AI roles, not claims of human employment, professional licensure or clinical care. Existing boundaries for high-stakes advice and explicit external-action permission remain.

**Voice reconciliation:** current code contains OGG transcription while the old brief excludes voice. This review does not erase that capability or promise new browser microphone support. The design leaves attachment handling extensible; voice adoption and browser formats must be reconciled before implementation. Video and arbitrary file types are not silently added.

## Privacy, ownership and recovery

Keep one concise initial explanation/consent for ordinary AI processing, existing minimization and specific permission for sensitive transfers. Do not repeatedly ask for unchanged permission. Keep secrets and prohibited sensitive records out of agent messages, logs and the public repository.

An accepted message survives refresh/restart. Unsent drafts remain clearly distinct from accepted work. Reconnecting resumes the saved conversation and does not insert a second copy of an already confirmed reply. Stop prevents late work from becoming a new visible result. A failed research/provider step preserves the record and reports the actual limitation.

## Success and release evidence

| Outcome | Acceptance evidence |
|---|---|
| Sign in and consult | A returning owner on supported mobile and desktop browsers reaches a working consultation without connection setup. |
| Genuine useful exchange | Actual separate agent invocations. A test scenario with a material weakness produces a meaningful Critic challenge and response/revision; a sound scenario permits reasoned agreement. Head accurately reflects resolved and unresolved issues. |
| Current evidence | A time-sensitive question produces verified direct sources through the live research path without an explicit research keyword. |
| Quiet interface | No routine protocol paragraphs in the conversation; states are compact, and actionable exceptions explain the next step. |
| Same intelligence settings | Saved and effective provider/model/effort/preset values match the old system; no silent downgrade. |
| Reliable continuity | Mobile reconnect, server restart and Stop tests preserve accepted work and avoid duplicate confirmed responses. |
| Mobile usability | Essential flows work from 320 CSS px upward, with keyboard/touch access, readable reflow and no page-level horizontal scroll. Current Safari, Chrome, Firefox and Edge are release targets, not a claim of support for every historical browser. |

Retain the existing 5-second acknowledgment, 30-second first useful contribution, 60-second stalled-work visibility and ten-minute continuation targets as targets to measure. Do not manufacture filler to meet them or claim that this prototype proves performance.

## GoDaddy replacement boundary

The existing **Personal AI Consulting Group** app and its own database may be erased to make room for the later replacement, as explicitly allowed by the owner. No other GoDaddy app, database, shared table or credential is authorized for removal. This phase performs no deletion. The deployment phase must confirm the exact app/database ownership boundary and preserve the required model configuration before any reset. [Deployment boundary](deployment-boundary.md) records the current evidence and what remains unknown.

## Design inputs and open evidence

The old Candidate B files and current settings UI are available as evidence of what the owner rejects, not as a visual baseline. No additional design materials are required or assumed. The new [interactive prototype](../prototype/index.html) is an illustrative design candidate with fictional conversation data; it performs no AI calls, authentication or database writes. The proposed editorial visual style remains subject to owner review.

Open evidence is limited to the current saved model snapshot, voice authority reconciliation, supported provider reauthorization and GoDaddy runtime/storage/streaming verification for the later implementation. These do not prevent reviewing this brief and candidate. The simpler architecture is a proposal in [architecture.md](architecture.md), not production readiness.

<!-- Internal SDD scope declaration: not application UI. -->
```json
{"profile":"new_product","capabilities":{"ui":true,"api":true,"persistence":true,"payments":false,"sensitive_data":true}}
```
