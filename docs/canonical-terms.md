# Canonical terms

Working language: English. Product content and source metadata: English and Ukrainian only; role names and model IDs remain English by the product brief. Russian and Belarusian language, terminology, sources and URLs are prohibited. Sources: [product idea](product-idea.md), [PRD](prd.md).

| Term | Meaning and usage | Avoid |
|---|---|---|
| NanoDuck Consulting Group | Exact current product name; NanoDuck and Consulting Group may form two lines of one wordmark. | Implying a human firm |
| Login / Logoff | Exact labels for the always-visible desktop and mobile menu-bar button for starting a local-password session / ending that session. Logoff also applies before that session’s processing consent. | Concurrent Login and Logoff actions; hiding the action in the mobile dropdown |
| Settings | Literal navigation label for models, reasoning, specialist count, discussion depth, optional incoming-message sound, editable runtime instructions and account actions. | Your space; Preferences as the destination name |
| Thinking indicator | A quiet visible thought bubble and text that the team is preparing the next confirmed message. It is active-run feedback, not a claim about a named agent or hidden chain of thought. | A decorative loader with no textual state; a progress claim that names an unverified agent |
| Conversation title | A deterministic, concise decision-question label created in the stored record only after successful final synthesis; it never occupies the active discussion header. | A clipped first message or a generated title model turn |
| Policy replacement | One bounded invocation of the same role and task after its generated draft violates English/Ukrainian or prohibited-source policy. The rejected draft is neither stored nor shown. | Treating the first blocked draft as a successful response or immediate terminal consultation failure |
| Runtime instructions | One owner-visible Markdown behavioral contract encrypted in the private app database for future model prompts. The server validates fixed headings/placeholders, retains encrypted saved versions, snapshots exact Markdown and revision at acceptance, and renders it only through the runtime prompt-contract module. First-run setup validates reusable public defaults or a supplied private initial document; the saved encrypted document is authoritative afterward. | A browser-only prompt, user-submitted instruction or a way to weaken server-enforced topology/security controls |
| Head Consultant | AI orchestrator that creates/reuses specialist roles, authors each individual task/dependency, handles findings and synthesizes reviewed results. Fixed review depth is user-selected; Head controls Auto closure. | A fictional human partner, a passive task receiver, or a server-chosen generic task |
| Consultant / specialist | Separate AI context with a relevant assignment. | Several role labels on one completion |
| Spiritual Consultant | AI specialist using evangelical Protestant doctrine: Jesus Christ as Lord and Saviour, finished work, salvation by faith alone and salvation that cannot be lost. | Esoteric, occult, syncretic, manifestation or therapeutic claims |
| Psychotherapist | AI specialist that may use major classical psychotherapy schools and Internal Family Systems, without diagnosing or replacing clinical/emergency care. | A licensed human clinician or emergency service |
| Prohibited language/source | Russian and Belarusian language, terminology, sources and URLs including `.ru`, `.by`, `.su` and Cyrillic equivalents; reject before storing/displaying. | Treating a source as acceptable because its domain uses another TLD |
| Critic | Separate reviewer that issues material rework orders and assesses their fulfillment. Only its matching assessment resolves an order; repetition stays unresolved. Claude remains tool-free. | Forced opposition, endless repetition, automatic approval or an internal tool transcript |
| Discussion | Complete confirmed, ordered business messages. | Hidden reasoning, tool logs, service announcements |
| Consolidated advice | Head’s final synthesis of current reviewed results and resolved/unresolved Critic findings after the required depth; may be explicitly provisional. | Fresh Head advice or an automatic consensus claim |
| Outcome | Current question’s Consolidated advice, requested deliverables, risks and necessary actions. | Consensus when participants have not agreed |
| Sources | Direct evidence links, claims, freshness and limitations. | Invented research or unsupported certainty |
| RTF export | Rich Text Format document downloaded by Export; bold names, timestamps and formatted paragraphs can be read without a Markdown renderer. Image references do not embed the image files. | Raw JSON as the normal export; renaming plain text to .rtf |
| Conversations | The owner's saved consultation history. | Infrastructure identifiers |
| Model | Selected provider model, kept separately for consultants and Critic. | An invented capability list |
| Reasoning strength | User-facing selection of supported provider effort. Codex exposes its inspected tuple; the verified Claude Code choices are Low, Medium, High, Extra and Max. NanoDuck retains High as its initial choice; Anthropic’s Opus 5.5 default is separately Medium. | Quietly mapping an unsupported value to a default |
| Number of specialists | Owner setting for 1, 2, 3, 5 or Auto relevant specialists. Head selects the actual roles; fixed modes set the size and Auto lets Head choose 1–5. The count excludes Head Consultant and Critic. | Treating Head or Critic as part of the count, or server keyword routing |
| Discussion depth | User-selected 1/3/5 team review rounds; Auto allows Head-selected closure within ten. Only affected consultants reply. Focused resolution assessments do not add a full round. | Silent reduction of fixed rounds, mandatory filler, model reasoning strength, token budget or hidden process messages |
| Voice input | Deliberate browser-native speech recognition, then editable transcript review before Send. A supporting browser may process speech through its recognition service after Start; NanoDuck receives no audio. | Always listening, recording upload, automatic submission |
| Image attachment | Optional owner-generated JPEG, PNG or WebP image, at most 8 MiB. The single-owner statement is a trust boundary, not provenance verification; PDF/SVG/video/audio/archive uploads are excluded. | Generic file upload, PDF attachment, a malware-scanner claim |
| Draft | Content not accepted by the server; prototype drafts exist only in page memory. | Saved conversation or submitted work |
| Send | Explicitly accept the reviewed draft for consultation. Enter sends in the chat composer; Shift+Enter adds a line break. | An accidental send while composing a multiline draft |
| New | Start a separate consultation from above the chat or Conversations; not a global menu destination. | Duplicate New navigation item |
| Review states | Development-only prototype inspection, outside the normal preview and absent from the app. | A production menu or settings control |
| App session | Owner access lasting 24 hours from sign-in under NFR-10.2, with explicit termination exceptions. | Confusing it with a consultation run or provider grant |
| Stop / Continue | Deliberately interrupt current work / resume preserved accepted context. To start a new independent request in the same archive, Stop first and then Send from the restored composer. | An active-run input queue; deleting history or restarting silently |
| Reconnect provider | Contextual recovery for an actual selected-provider grant failure through that provider’s official local sign-in. | A required integration setup panel |
| Check connection | Refresh the selected provider’s actual availability after local sign-in while preserving unsaved Settings. | Creating an authorization grant, saving preferences or claiming a successful model response |
| Floating navigation | Conventional persistent desktop navigation bar; mobile uses a hamburger button and menu. | Arbitrarily draggable toolbars |
| Local application | Runs on a macOS, Linux or Windows computer; private browsers on that computer or its local Wi-Fi network use local password access. | Offline AI promises; public internet service |
| Design preview | Clearly labelled, fictional interactive simulation. | Production-ready application |

Internal-only terms include run generation, process ownership, event cursor, model tuple, SSE, ASVS and SDD. Keep them out of routine app conversation and navigation. Exact IDs, filenames and provider names remain unchanged in technical records. Ukrainian conversations use natural Ukrainian prose, including «лійка продажів»; language-switch testing keeps English role names. No vocabulary question remains unresolved for this comparison.

## Parallel work vocabulary

| Term | Meaning | Boundary |
|---|---|---|
| Role library | Reusable role guidance and a compact index for Head | Not an allowed-name list; new roles remain consultation-private |
| Assignment | Exact Head-authored task, recipient and declared dependencies | Task visible; internal role guidance hidden |
| Context boundary | Last accepted owner-message ID plus run/context revision | Internal, not a second user-facing document |
| Critic order | Specific defect and required correction linked to a result and recipient | A response is not a resolution |
| Resolution assessment | Critic’s decision on a referenced correction or supported objection | Blocked/unresolved is never passed |
| Worker | Application-managed separate model invocation executing Head’s work | No native subagent feature or extra AI orchestrator |

## Critic reliability and model usage — 2026-09-25

**Usage attempt**: one application-dispatched provider inference attempt, including a retry. **Reported tokens**: provider-measured counts, never estimates from characters. **Unavailable usage**: a call/category for which no trustworthy count was returned. **Total input** includes cache reads/writes; cached input and reasoning output are breakdowns, not amounts to add again. **All saved conversations** excludes deleted conversations and unrelated applications.

## Isolated request and cache economy — 2026-09-26

An isolated request is one newly accepted owner message and only its resulting work/evidence, identified internally by immutable requestMessageId and run ID. A saved chat is an archive that may contain several isolated requests. Continue/Retry resumes accepted work; Send creates a fresh scope. Cached input is a reported subset of input, not memory access or an additional total.

## Chat beginning and end controls — 2026-09-26

Chat beginning/end: explicit navigation to the first/last message in Discussion, without sending, stopping or resuming work.

## U-12 research and evidence economy — 2026-09-26

Evidence reference: stable request-scoped identifier for a source and supported claim, resolved to full source metadata before visible storage/export. Evidence gap: a specific Head-directed public fact to establish. Reuse: explicit Head choice of existing current-request evidence, never an inferred identical-query cache hit.

## U-12 Critic cache and usage completeness — 2026-09-26

U-12 follow-up: retain an isolated Claude working context within one accepted request without session history or tools. Verify actual provider cache reuse with public synthetic consecutive calls. Preserve every reported token count including retries and failed calls, label partial/unknown metrics and provider-specific cache semantics, expose per-attempt breakdowns without duplicating totals. Keep full owner input, model/effort, discussion depth and independent-Send isolation. Existing Usage layout and Electric A v8 remain; no prototype reuse. User explicitly authorizes implementation and validation.

## U-12 upstream usage verification — 2026-09-26

U-12 upstream accounting follow-up: opt into the pinned Codex experimental raw completion event, extract only numeric usage from upstream metadata, deduplicate by response within the expected turn and reconcile against cumulative totals. Preserve explicit zero versus missing field; never infer writes from uncached input. Store numeric accounting provenance only, never raw responses, attribution IDs, output or hidden reasoning. Display upstream-verified versus legacy normalized counters in existing Usage. Preserve exact models, private context, authentication and live runs. Experimental telemetry failure must not interrupt consulting. Verify real coordinator Critic cache reuse with synthetic data and document historical limits. User explicitly authorizes this investigation and implementation.

## U-13 actionable usage dashboard — 2026-09-26

U-13: uncached input is input minus reported cache reads; it includes Claude cache creation. Repeat-work is the union of failed attempts, retries and correction attempts, not a claim that all such work was unnecessary. Complete means all base token totals reported, not all optional metrics known.
