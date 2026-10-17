# QA checklist

## Source references and execution status

The current [PRD](prd.md), [context](project-context.md), [terms](canonical-terms.md), [guardrails](guardrails.md), [journey](user-journey.md), [screen map](screen-map.md), [wireframes](wireframes.md), [design brief](design-brief.md), [architecture](architecture.md) and [DoD](dod-evals.md) supply these definitions. Exact provider selections remain in [model settings](model-settings.md). The [17 October scope](../forge/runs/sdd-reconciliation-20261017/scope.json) authorizes documentation reconciliation only; dated implementation requests below are historical and grant no new runtime authority. **All 90 original formal checks and the additional bounded QA-C01 are prepared; all 91 indexed executions remain not_run. Release readiness: not_evaluated.** Frozen visual observations have only their recorded scope; authoring this checklist does not execute the formal suite. Visual binding: `nanoduck-electric-a-v8-20260914`, the exact target/tree and permitted variance in the design brief. Runtime prerequisites and parameters named in architecture must be supplied before implementation execution. A prepared check does not imply those prerequisites already exist.

All 91 current checks are required/applicable; none is excluded or advisory. The six existing DoD gates remain required. QA defines acceptance below; the development-plan owner separately allocates checks to units. Component acceptance never discharges the original full integration/release obligations. User group: the sole owner. Default viewport coverage: 320/390/430/768/1280/1440 CSS px; supported-browser release checks use Safari/Chrome/Firefox/Edge. Each check identifies its narrower scope. Findings, severity, release effect, recommendation, executor and actual evidence are unassessed until a run is recorded. Every failure uses the wireframe recovery sequence.

## Product acceptance

| Check | Source and use cases | Task / expected outcome | Gate and phase |
|---|---|---|---|
| QA-R01 | FR-01.1; UC-001 | After local setup on macOS, Linux and Windows, open the app on the running computer and another device on the same Wi-Fi/LAN. A local password is the sole entry credential; Login, returning sessions and consent lead to work without a provider connection checklist. | `product_functional_requirements` · implementation |
| QA-R02 | FR-01.2; UC-001 | Exercise the referenced use-case path and verify: Ordinary AI-processing consent is concise and explicit once per new authenticated session; reuse it throughout that session, including refresh, inactivity and browser reopening, unless its scope changes. Verify a new Login requests consent, while reload and reopening an unexpired consented session do not. | `product_functional_requirements` · implementation |
| QA-R03 | FR-02.1; UC-002 | Exercise the referenced use-case path and verify: Text submission receives a distinguishable accepted state; an unsent draft never appears accepted. Enter submits in the chat composer and Shift+Enter retains a line break. | `product_functional_requirements` · implementation |
| QA-R04 | FR-02.2; UC-002 | Exercise the referenced use-case path and verify: The authenticated owner can attach a JPEG, PNG or WebP image at most 8 MiB; PDF, SVG, video, audio, archives and other types are rejected. | `product_functional_requirements` · implementation |
| QA-R05 | FR-02.3; UC-002 | For fixed and Auto team sizes, Head selects the exact accepted count excluding Head/Critic, using reusable, adapted or new roles. Preserve substantive faith/coaching boundaries without a profession allowlist. Verify role names confer no tool/provider authority. | `product_functional_requirements` · implementation |
| QA-R06 | FR-02.4; UC-002 | Verify separate participant invocations, exact Head task delivery without prose rejection or generic fallback, complete owner text once, accepted instruction/model snapshots, and current result references. Compare out-of-order worker completion with canonical commit order. Head synthesis waits for the selected review depth and current Critic assessments. Retain image limitation and complete UTF-8 stdin transport tests; overflow never trims context or substitutes a model. | `product_functional_requirements` · implementation |
| QA-R07 | FR-02.5; UC-002 | Critic identifies a real circular/evasive/unsupported claim and issues a specific correction; the recipient materially corrects it, objects with evidence or records an evidence gap. Persist and assess fulfillment under QA-R64; a reply alone never resolves the issue. Sound work receives no invented defect. | `product_functional_requirements` · implementation |
| QA-R08 | FR-02.6; UC-002 | Permit consensus only when current specialist results, Critic assessments and Head agree, with no open/evidence-blocked findings or unreviewed material revision. Otherwise preserve provisional advice and explicit disagreements. | `product_functional_requirements` · implementation |
| QA-R09 | FR-02.7; UC-002 | Head synthesizes current reviewed results without obligatory closing speeches; all requested outputs, direct supporting links, risks and necessary actions remain complete. Outcome/history/export show only the current final advice and preserve unresolved Critic findings. | `product_functional_requirements` · implementation |
| QA-R10 | FR-02.8; UC-002 | Exercise the referenced use-case path and verify: The optional focused interview asks one question at a time, usually 1–3 and at most five, with a suggested answer or explicit assumption available. | `product_functional_requirements` · implementation |
| QA-R11 | FR-03.1; UC-002 | Exercise the referenced use-case path and verify: Full submitted business messages appear in canonical order with role, recipient where relevant and time; routine protocol paragraphs are omitted. During work, a labelled thought-bubble state and reachable Stop appear without an oversized conversation title; screen readers receive only newly arrived messages. The completed final synthesis creates the concise history/export title. | `product_functional_requirements` · implementation |
| QA-R12 | FR-03.2; UC-002 | Exercise the referenced use-case path and verify: The first substantive request sets English/Ukrainian session language; explicit supported changes win and role names remain English. Russian/Belarusian owner input and source metadata are rejected. Valid Ukrainian containing `які` and English descriptors such as “Russian” pass owner input, both provider adapters and source-title/claim validation; distinctive prohibited words/letters and forbidden hosts still fail. Supply mixed generated prose to both providers: only the guilty sentence is replaced by an omission marker, useful English/Ukrainian advice remains and the run continues without a System error. Supply an unsuitable link: omit only the URL and do not add it as a source. A wholly unusable answer gets one same-role/task replacement attempt; neither the omitted text nor URL reaches the record or logs. | `product_functional_requirements` · implementation |
| QA-R13 | FR-03.3; UC-003 | Exercise the referenced use-case path and verify: While a run is active, the composer is hidden and no second context submission is silently queued. Stop, explicitly Send new context, and verify it enters the same record without rewriting confirmed messages; Continue instead resumes the preserved accepted context. | `product_functional_requirements` · implementation |
| QA-R14 | FR-03.4; UC-003 | Exercise the referenced use-case path and verify: At 320/390/430/768/1280/1440 CSS px, verify the unavailable composer is hidden during active work and a labelled P5 Porcelain Stop matches the actual consultant avatar height (38px desktop, 32px mobile) and 7px radius, with a 44px-high effective hit area, and stays reachable in the desktop left consultation rail or narrow-screen status/Stop group while scrolling and across Discussion/Outcome/Sources/Usage, separated from New and the former Send/reading positions. Keyboard focus is visible; Send does not auto-focus Stop. A pending/refused Stop shows truthful feedback without making input available prematurely; confirmed Stop prevents late visible results. Stop and failure restore the composer with its unsent page-memory draft; completion collapses input without changing the selected view or reading position, and Continue conversation deliberately reopens the same draft. Check touch/keyboard and forced-colors behavior; device observation is separate from automated layout assertions. | `product_functional_requirements` · implementation |
| QA-R15 | FR-03.5; UC-003 | Stop/Continue and Retry use durable assignment/directive checkpoints, exact accepted settings and context; successful siblings are not invoked again. Fail a correction assessment and a worker independently, resume only missing work, and prevent stale results or System notices satisfying readiness. | `product_functional_requirements` · implementation |
| QA-R16 | FR-03.6; UC-003 | Exercise the referenced use-case path and verify: New consultation creates a separate record while enforcing only one active consultation; start it above the chat and from Conversations, with no New item in either global menu. | `product_functional_requirements` · implementation |
| QA-R17 | FR-04.1; UC-007 | Exercise the referenced use-case path and verify: Current claims can trigger live public research without a keyword. Include a private contact in the full owner request and a public article URL with a long numeric ID; Head can still form a minimal safe public query. Inspect the actual web-enabled provider prompt: it contains only that validated query, no private discussion, contact, attachment, private guidance or credential. A query containing a real phone/email, secret or unsafe URL is withheld and reported as unavailable without fabricating research. Confirm the first recipient-bound Head assignment is visible before a deliberately delayed public search resolves. A timed-out or failed search records an evidence limitation, leaves confirmed tasks intact and lets the consultation continue without claiming a fresh check; cancellation still stops it. Confirm direct URLs/claims from more than eight valid sources survive and reach the final context. Record a real completed public search/open action separately from fixtures. | `product_functional_requirements` · implementation |
| QA-R18 | FR-04.2; UC-007 | Exercise the referenced use-case path and verify: Each cited source records title, direct URL, supported claim, retrieval time and publication date when available; the owner can inspect it. English/Ukrainian sources are retained; Russian/Belarusian language, terminology and `.ru`/`.by`/`.su` or Cyrillic-equivalent URLs are rejected. | `product_functional_requirements` · implementation |
| QA-R19 | FR-04.3; UC-007 | Exercise the referenced use-case path and verify: Claude Critic can identify a targeted evidence gap in the shared discussion. Head or a Codex consultant can obtain a follow-up through the isolated public-research route without giving Claude direct browsing/tool authority or silently changing its selected provider. Preserve the request, sources and any unavailable-evidence qualification. | `product_functional_requirements` · implementation |
| QA-R20 | FR-05.1; UC-005 | Exercise the referenced use-case path and verify: Settings exposes functioning model and reasoning selectors separately for Head/specialists and Critic, including the optional Critic provider, using only the current supported catalog. Verify exact `gpt-6-sol` in both Codex selectors with its catalog-reported `low`/`medium`/`high`/`xhigh`/`max`/`ultra` efforts, independent save/reload and accepted-run snapshots, while preserving Astra/xhigh defaults and existing saved choices. Also verify exact `gpt-6.1-sol` in both selectors, with only the intersection of `low`/`medium`/`high`/`xhigh`/`max` and the authenticated Codex catalog; test an absent catalog row as unavailable and a present exact row as selectable. Test independent save/reload, accepted-run snapshots, exact provider forwarding and rejection of `ultra` for GPT-6.1 Sol. A missing exact catalog row or unsupported effort stays unavailable; `gpt-5.6-sol` is never substituted. Verify optional Opus 5.5 selection across all five efforts without modifying the existing Opus 5 or Codex preferences. Inspect exact CLI model IDs and reject absent, substituted or mixed modelUsage identities. | `product_functional_requirements` · implementation |
| QA-R21 | FR-05.2; UC-005 | Exercise the referenced use-case path and verify: Saved changes apply to future runs; each active run retains the exact provider/model/reasoning, specialist-count, discussion-depth and runtime-instructions Markdown/revision snapshot used at acceptance. The independent message-sound preference applies to incoming browser feedback and never changes an active consultation’s logic. | `product_functional_requirements` · implementation |
| QA-R22 | FR-05.3; UC-005 | Exercise the referenced use-case path and verify: Settings accepts specialist counts 1/2/3/5/Auto and discussion depth 1/3/5/Auto. It also exposes Knock, Chime, Ripple and Off with an owner-activated local browser WAV preview; load the saved choice on authenticated entry before opening Settings, including Off. Preview an unsaved choice and verify incoming alerts still use the saved choice. Stage the actual saved asset on one persistent HTMLAudioElement and test cold loading, trusted-gesture playback of a finite 50 ms all-zero WAV, natural ended before readiness, subsequent saved-source staging on the same element, asynchronous completion/error/eight-second timeout and blocked paths. Reuse the element for delayed alerts and unsaved Preview, restore its saved source afterward, and never change the saved preference. Verify cancellation/generation fencing, Off/source/Blob cleanup and logout disposal; no AudioContext or AudioSession override remains. Delay a confirmed agent message beyond the sending gesture and verify the reused audio player starts it; initial history, owner/System notices and repeated polling produce no sound, and one polling batch yields one alert. Simulate a browser playback rejection, verify visible Enable sound recovery, activate it deliberately and retry; visual/semantic feedback remains. In disposable fixture sessions, reload and repeat in Chromium, Firefox and WebKit under restrictive autoplay settings. Record native Safari playback and actual device audibility separately; a play promise, moving clock, ended event or success toast cannot prove sound was heard. The owner’s running consultation must not be interrupted, reloaded or restarted for this repair; record any recovery in that tab as separate evidence. Knock must use the same bundled recording for Preview and incoming alerts, with the exact owner-accepted v5 bytes: three blended sharp/woody table-ball impacts exactly 250 ms apart, preserved pitch, no clipping, quiet reflections at 28 ms and 47 ms, and silence after each 92 ms impact-and-reflection window. Verify the versioned URL avoids an older cached sound. Check HTTP `audio/wav` and browser playback separately from the owner listening verdict, which accepted v5 with a tiny echo. Verify fixed-depth versus Auto copy and round behavior using QA-R65; retain accepted-run settings snapshots. | `product_functional_requirements` · implementation |
| QA-R23 | FR-05.4; UC-005 | Exercise the referenced use-case path and verify: Usage presents real known quota/reset information or explicitly unavailable information; it never invents a per-session charge. | `product_functional_requirements` · implementation |
| QA-R24 | FR-05.5; UC-005 | Exercise the referenced use-case path and verify: Only a genuine authorization failure for the selected provider offers contextual reauthorization; quota and outage show their actual next action. Verify native first-party Claude subscription sign-in without an environment token, the separate explicit-token route, logged-out/expired/Console/API-key/third-party rejection and fresh auth-status validation before invocation. Run the portable official login command on the server computer; Verify both role checks refresh the shared settings/capability snapshot with both buttons disabled during either pending request. Head feedback validates the exact current Codex model/reasoning; Critic retains Claude reconnection feedback even while GPT is selected. Test latest unsaved Settings and document edits made during a delayed refresh, saved choices and accepted-run snapshots. Cover available/unavailable and Head transport failure, retaining prior capabilities with unknown-failure feedback rather than inferred sign-in status. Assert zero inference calls, no substitution or billing fallback, and preserved managed-sign-in behavior. Verify the existing startup-auth limitation is explained without automatic restart or a claim of first-auth rediscovery. Inspection results do not prove a model invocation or entitlement. The inactive Claude branch causes no warning; no browser credential field appears. Fixtures do not count as actual completed sign-in. | `product_functional_requirements` · implementation |
| QA-R60 | FR-05.6; UC-005 | Exercise the referenced use-case path and verify: An empty local data directory receives the validated reusable runtime-instructions defaults exactly once. After an owner edit, restart retains the encrypted authoritative revision and never replaces it with defaults. Database export without the data key exposes no instruction plaintext. Settings loads the encrypted current document, rejects a missing required heading or placeholder without replacing its revision, accepts a valid edit, rejects a stale-browser save, lists saved-version metadata, retrieves a version only for the authenticated owner, and restores it by creating a fresh revision. Start a consultation, save or restore a later valid version, and verify the active run/provider still receives only the accepted Markdown/revision snapshot. Exercise each of the four fixed-name guidance editors, reject unknown names/empty/NUL/over-64-KiB text and stale revisions, inspect encrypted version history, restore as a new revision, and verify an active run retains all accepted document snapshots. Attempt to use document text to change authorization, role routing, output bounds or language/source restrictions; server invariants remain effective. | `product_functional_requirements` · implementation |
| QA-R25 | FR-06.1; UC-004 | Exercise the referenced use-case path and verify: Clicking and keyboard-activating the saved conversation row reopens complete confirmed conversation content, owned attachments and source records; Export and Delete do not open the record. Reload the record, Conversations and Settings surfaces and verify each stays in the same tab and restores its selected surface/reading position; Discussion also restores its selected local tab and record. Inspect tab storage to confirm it contains neither draft text nor conversation content and is cleared at Logoff. Restart the local server and repeat each read from the encrypted durable store; the browser receives the complete canonical record. | `product_functional_requirements` · implementation |
| QA-R26 | FR-06.2; UC-004 | Exercise the referenced use-case path and verify: Export returns a downloadable .rtf with application/rtf and no-store headers. Open it with a real rich-text reader and verify title, bold speaker/recipient names, all messages in canonical order, date/time with explicit browser time zone, paragraphs, supported Markdown emphasis/lists/headings, Ukrainian text and emoji, sources and saved image references. Confirm valid bold text has no raw Markdown delimiters. RTF control text from messages/titles must remain inert; no embedded executable objects/fields, drafts, credentials or runtime instructions appear. Test absent/invalid time zone (UTC/422), anonymous and deleted-record requests (401/404). Native-reader rendering is distinct from browser/API or full-release evidence. | `product_functional_requirements` · implementation |
| QA-R27 | FR-06.3; UC-004 | Exercise the referenced use-case path and verify: Explicit whole-conversation deletion removes its record and owned attachments; cancellation leaves them unchanged. | `product_functional_requirements` · implementation |
| QA-R28 | FR-07.1; UC-006 | Where the browser offers speech recognition, it starts only after explicit Start and required permission; recognition and browser-service disclosure are visible. Verify Ukrainian uk-UA when supported. On every supported browser without this capability, typing and the full core workflow remain available. | `product_functional_requirements` · implementation |
| QA-R29 | FR-07.2; UC-006 | Exercise the referenced use-case path and verify: Stop ends browser recognition and exposes editable text; Cancel aborts recognition. Verify that NanoDuck sends no voice audio or transcription request. | `product_functional_requirements` · implementation |
| QA-R30 | FR-07.3; UC-006 | Exercise the referenced use-case path and verify: The owner receives an editable transcript before any send, with no automatic submission. | `product_functional_requirements` · implementation |
| QA-R31 | FR-07.4; UC-006 | Exercise the referenced use-case path and verify: Permission, unavailable browser/service, language, network and interruption failures preserve the typed draft and offer retry or typing. | `product_functional_requirements` · implementation |
| QA-R32 | FR-07.5; UC-006 | Exercise the referenced use-case path and verify: Background recognition is prevented and the recognition session is stopped or aborted when it ends. | `product_functional_requirements` · implementation |
| QA-R33 | FR-08.1; UC-001, UC-003, UC-005 | Exercise the referenced use-case path and verify: Desktop navigation is a standard floating bar available while scrolling; mobile uses a labelled hamburger for Discussion, Conversations and Settings while a separate, directly visible bar button shows Login while anonymous or Logoff while authenticated (also before consent). Verify this button stays visible with the mobile menu closed at 320px and at the actual narrow in-app preview width; there is no duplicate dropdown action. Verify both entry and exit, labels after reload, disabled pending requests, retry feedback on failure, closed mobile menu after action and no crowded bar at its breakpoint. New remains above the chat and in Conversations. | `product_functional_requirements` · implementation |
| QA-R34 | FR-08.2; UC-005 | Exercise the referenced use-case path and verify: The preference destination is literally labelled Settings; the rejected slogan and Your space label are removed. | `product_functional_requirements` · implementation |
| QA-R35 | FR-08.3; UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 | Exercise the referenced use-case path and verify: The owner-requested combined black design uses Ember messages/local tabs and Cobalt chat/composer geometry, a recognizable icon-only SVG microphone, `You` for every visible owner label with an `I` avatar on owner messages, a visible filled Send button and the approved Electric palette after the three-palette comparison; all required flows remain available and Review states is absent from the normal view. | `product_functional_requirements` · both |
| QA-R36 | NFR-01.1; UC-003 | Exercise the referenced use-case path and verify: An acknowledged message survives browser refresh, network interruption and application restart. Reload an authenticated active discussion after scrolling and verify the same browser tab returns to its prior local tab, record and reading position with no stored draft or content. Simulate a slow ephemeral provider turn whose terminal notification has no message items; combine its matching completed message item with successful terminal completion and commit exactly one response without requesting saved history. Verify early notifications are retained, unrelated thread/turn events are ignored, and failed turns, cancelled waits or connection closure never commit partial output. Restart during an unresolved provider turn and verify the saved run resumes from its last confirmed message. | `lifecycle_and_continuity` · implementation |
| QA-R37 | NFR-01.2; UC-003 | Reconnect/retry cannot duplicate a confirmed reply or permit competing runs. Concurrent mutations serialize and persist before acknowledgement. A second process targeting the same data directory refuses startup; after a crash the released ownership lock allows restart. An oversized 128 MiB state is refused without replacing the prior durable state. | `lifecycle_and_continuity` · implementation |
| QA-R38 | NFR-01.3; UC-003 | Verify fixed 1/3/5 team review rounds and Head-controlled Auto up to ten under QA-R65. Distinguish provider timeouts from recovery targets. No filler objections, obligatory unaffected replies or extra full rounds from resolution checks. | `lifecycle_and_continuity` · implementation |
| QA-R39 | NFR-01.4; UC-003 | Exercise the referenced use-case path and verify: Measure the existing 5-second acknowledgment, 30-second first useful contribution and 60-second stalled-work visibility targets without presenting filler as useful output. | `lifecycle_and_continuity` · implementation |
| QA-R40 | NFR-02.1; UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 | Exercise the referenced use-case path and verify: Core flows meet the WCAG 2.2 AA planning target, including keyboard, visible/unobscured focus, semantic names/states, errors, contrast and relevant assistive technology interactions. | `approved_visual_baseline_fidelity` · implementation |
| QA-R41 | NFR-02.2; UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 | Exercise the referenced use-case path and verify: Core flows reflow from 320 CSS px without page-level horizontal scroll and remain usable at 200% text size; genuine two-dimensional content retains an accessible way to inspect it. | `approved_visual_baseline_fidelity` · implementation |
| QA-R42 | NFR-02.3; UC-001, UC-006 | Record actual operating-system and browser versions for macOS, Linux and Windows plus Safari, Chrome, Firefox and Edge where available. Run core workflows on the computer and from a separate Wi-Fi/LAN device using trusted HTTPS. Unavailable microphone or recognition preserves the FR-07.4 typing fallback. Browser-engine automation and simulated devices do not substitute for actual device evidence. | `approved_visual_baseline_fidelity` · implementation |
| QA-R43 | NFR-10.1; UC-001 | Set a local password through hidden setup prompts, rejecting mismatch or fewer than 12 characters. Verify only a salted scrypt verifier is stored. Correct password succeeds, wrong password fails generically and repeated attempts are bounded. Paste and long passphrases work. Password reset requires local OS access and invalidates old sessions without deleting data. | `product_security_requirements` · implementation |
| QA-R44 | NFR-10.2; UC-001, UC-005 | Sign in and verify access just before 24 hours, after inactivity and browser reopening; expire at 24 hours. Logoff invalidates the current session and local password reset invalidates every existing session; activity cannot extend absolute expiry. Anonymous or cross-origin requests cannot revoke an authenticated session. | `product_security_requirements` · implementation |
| QA-R45 | NFR-10.3; UC-001, UC-002, UC-003, UC-004, UC-005, UC-006 | Exercise the referenced use-case path and verify: Attempt each private read/mutation anonymously, as a non-owner and with forged object/field identifiers; no protected content or state changes. | `product_security_requirements` · implementation |
| QA-R46 | NFR-11.1; UC-002, UC-004, UC-005, UC-006, UC-007 | Exercise the referenced use-case path and verify: allowed Markdown emphasis, lists, quotations, inline code and approved HTTPS links render as content. Submit executable markup, unsafe URLs, malformed envelopes, prohibited Russian/Belarusian language and injection strings through text/files/provider output; they remain inert, are rejected at owner/source boundaries, or are omitted from generated prose while safe surrounding advice remains. | `product_security_requirements` · implementation |
| QA-R47 | NFR-11.2; UC-002, UC-003, UC-005, UC-006, UC-007 | Exercise the referenced use-case path and verify: Repeat acceptance, race Stop with late responses and exceed declared resource limits; accepted history stays atomic and bounded. | `product_security_requirements` · implementation |
| QA-R48 | NFR-11.3; UC-001, UC-002, UC-003, UC-004, UC-005, UC-006 | Deny unexpected Host values, unapproved certificate SAN names, missing or mismatched Origin, and missing/incorrect CSRF tokens on mutations. Use each valid local browser address to verify exact per-request HTTPS origin matching. Cookies are Secure, HttpOnly and SameSite=Strict. Forged forwarded headers confer no trust. Separately verify the architecture’s public-shell exception: cross-site top-level GET navigation to `/` or `/index.html` may reach only the public shell after TLS/private-peer/pinned-Host and supplied-Origin validation; cross-site private API/subresource requests remain denied and every mutation still requires exact Origin and applicable session/CSRF. | `product_security_requirements` · implementation |
| QA-R49 | NFR-12.1; UC-007 | Exercise the referenced use-case path and verify: Fetch public, private/metadata, redirecting and prohibited `.ru`/`.by`/`.su` or Cyrillic-equivalent targets; only permitted English/Ukrainian public evidence is returned, with no secret disclosure. | `product_security_requirements` · implementation |
| QA-R50 | NFR-12.2; UC-002, UC-004, UC-006 | Exercise the referenced use-case path and verify: Upload supported JPEG/PNG/WebP fixtures, including progressive JPEG and WebP animation, and exercise client-MIME mismatch, wrong signature, declared-length overrun, truncation, missing required image-data/terminal elements, invalid/zero dimensions, PNG CRC/type-depth/indexed-palette errors, malformed JPEG segments/scans, malformed WebP nested chunks, over-8-MiB files and more than four message attachments. Reject unsupported formats, including PDF, SVG, video, audio and archives, and unsupported JPEG deferred-height DNL. Only structurally accepted bounded originals persist as encrypted opaque blobs; owner-only retrieval uses the identified fixed type, attachment disposition and nosniff. Verify no pixel decompression, metadata interpretation, rendering or malware scan occurs and do not infer complete decoder validity from structural acceptance. Every rejection retains the typed draft and exposes no server path. Browser voice creates no NanoDuck upload. | `product_security_requirements` · implementation |
| QA-R51 | NFR-12.3; UC-002, UC-005, UC-007 | Exercise the referenced use-case path and verify: Inject requests for secrets, tools, paid fallback and external messages; no permission or provider boundary expands. For Claude Critic, assert a command-level denial of known tools, no direct research flag, and a text-only role prompt containing the complete current accepted owner request and its necessary confirmed current-request discussion, with earlier Send requests excluded. Cover native-home/config and isolated-token modes: no user/project customizations, built-in or MCP tools, session transcripts or private credential/error disclosure. Verify failed fresh subscription status or a reported provider-route mismatch starts no inference; failed CLI completion or an exact-model mismatch cannot commit output. Administrator policy remains part of the trusted host, not a claimed isolation boundary. Keep native credential storage intact on success, error and cancellation while removing temporary working data. Return a CLI `result` containing `<invoke name="Bash">…</invoke>`; verify one natural-language retry and that neither attempt can enter events, sources or the browser. | `product_security_requirements` · implementation |
| QA-R52 | NFR-13.1; UC-001, UC-004, UC-005 | Inspect SQLite and its sidecars without the separate data key: settings, instructions and versions, conversations, sources, attachments, pending uploads, sessions, request IDs and run snapshots reveal no plaintext. Alter ciphertext or use a wrong key and verify refusal without replacement. Check private POSIX file modes or current-user Windows ACLs, and that the ownership database contains no application data. | `product_security_requirements` · implementation |
| QA-R53 | NFR-13.2; UC-001, UC-002, UC-004, UC-005, UC-006, UC-007 | Trust the generated public local CA certificate on each test device, then verify hostname/SAN, expiration and HTTPS behavior. Untrusted, expired or wrong-name certificates cannot count as safe successful transfer. Renew the leaf certificate for current local addresses without changing password or data keys. External provider/research TLS validation remains enabled and rejects invalid certificates. | `product_security_requirements` · implementation |
| QA-R54 | NFR-14.1; UC-002, UC-004, UC-006, UC-007 | Exercise the referenced use-case path and verify: Inspect provider/search requests, URLs, caches and logs with marked private fixtures; only authorized minimized content leaves the boundary. | `product_security_requirements` · implementation |
| QA-R55 | NFR-14.2; UC-001, UC-004, UC-006 | Exercise the referenced use-case path and verify: Cancel/fail/background voice recognition and sign out offline; browser recognition ends, client content is cleared as required and browser history cannot reveal private data. NanoDuck receives no audio. | `product_security_requirements` · implementation |
| QA-R56 | NFR-14.3; UC-003, UC-004 | Exercise the referenced use-case path and verify: Delete one conversation, restore an isolated backup and inspect unrelated data; accepted records recover and deletion decisions remain applied. | `product_security_requirements` · implementation |
| QA-R57 | NFR-15.1; UC-001, UC-002, UC-004 | Install, set up and start from a clean checkout using supported Node versions on macOS, Linux and Windows. Verify an unconfigured app refuses startup; setup creates private per-user data outside the repository, default and explicit local bind addresses work, and another Wi-Fi/LAN browser can connect only with the local password. Check dependencies, start entry point, PORT and validated local host settings. Static serving cannot disclose private files, source, repository metadata or debug material. No other application or data directory changes. | `product_security_requirements` · implementation |
| QA-R58 | NFR-16.1; UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 | Exercise the referenced use-case path and verify: Produce auth/validation/recovery events and log-injection strings; protected metadata remains useful without leaking or forging content. | `product_security_requirements` · implementation |
| QA-R59 | NFR-16.2; UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007 | Exercise the referenced use-case path and verify: Fail validation/provider/research/storage/logging paths then retry; access stays denied where required and invalid partial commits never appear. Inject a provider JSON-RPC error and verify that protected logs retain only its normalized category, safe numeric code and failed operation; the browser receives the matching recovery state and never receives raw provider diagnostics, prompts or authentication material. Return two Claude tool transcripts and verify the run fails safely with the owner question retained, no raw tool material committed and no partial Head synthesis. Exceed Claude’s documented local request-size bound and verify a distinct size/recovery notice, no model-unavailable claim or inference, and the unchanged accepted question, confirmed messages and model/effort snapshot. | `product_security_requirements` · implementation |

## Screen and state checks

The preserved three v8 candidates use fictional data for visual comparison. For implementation acceptance, run this same state inventory against the approved Electric baseline and the actual implemented application; simulated state switching cannot pass runtime obligations. The separate inspection URL (`?inspect=1`) exposes state/locale fixtures without contacting live services. The normal preview and intended app omit Review states; verify New occupies its former workspace position and is absent from desktop/mobile menus. Simulated checks do not pass runtime clauses. Implementation executions use actual controls and services, plus the corresponding clause/security checks. QA-S01–QA-S09 and QA-H01–QA-H10 apply to both prototype and implementation; retain their results separately.

| Check | Source states and task | Expected evidence |
|---|---|---|
| QA-S01 | ST-01, ST-02, ST-03, ST-04; S-01; UC-001. Walk local password entry: signed-out, consent, denied/throttled, expired. Verify all controls, safe exits, preserved draft/record and observable completion from the wireframe contract. | Actual state/interaction observations, candidate/version/source hash, viewport and console result; no simulated-runtime claim. |
| QA-S02 | ST-05, ST-06, ST-07, ST-08, ST-09, ST-10, ST-11, ST-12, ST-13, ST-14, ST-15, ST-16, ST-17; S-02; UC-002, UC-003. Walk Discussion and composer: empty, draft, attachment-error, clarification, active, complete, stopped, offline, provider-auth, quota, research-error, system-error, long-content. Verify all controls, safe exits, preserved draft/record and observable completion from the wireframe contract. | Actual state/interaction observations, candidate/version/source hash, viewport and console result; no simulated-runtime claim. |
| QA-S03 | ST-18, ST-19, ST-20; S-03; UC-004. Walk Conversations: populated, empty, unavailable. Verify all controls, safe exits, preserved draft/record and observable completion from the wireframe contract. | Actual state/interaction observations, candidate/version/source hash, viewport and console result; no simulated-runtime claim. |
| QA-S04 | ST-21, ST-22, ST-23, ST-24, ST-25; S-04; UC-005. Walk Settings: saved, edited, invalid-settings (model combination or runtime instructions), catalog-unavailable, session-control through current-session Logoff; operator password reset invalidates all sessions without a browser session manager. Verify all controls, safe exits, preserved draft/record and observable completion from the wireframe contract. | Actual state/interaction observations, candidate/version/source hash, viewport and console result; no simulated-runtime claim. |
| QA-S05 | ST-26, ST-27, ST-28, ST-29, ST-30, ST-31, ST-32, ST-33; S-05; UC-006. Walk optional voice and typing fallback: ready, recognizing, recognition-complete, transcript, permission-denied, microphone-unavailable, interrupted, recognition-error. Verify all controls, safe exits, preserved draft/record and observable completion from the wireframe contract. | Actual state/interaction observations, candidate/version/source hash, viewport and console result; no simulated-runtime claim. |
| QA-S06 | ST-34, ST-35, ST-36; S-06; UC-007, UC-004. Walk Sources and detail: list, detail, unavailable. Verify all controls, safe exits, preserved draft/record and observable completion from the wireframe contract. | Actual state/interaction observations, candidate/version/source hash, viewport and console result; no simulated-runtime claim. |
| QA-S07 | ST-37, ST-38; S-07; UC-002, UC-004. Walk Outcome: recommendation, provisional. Verify all controls, safe exits, preserved draft/record and observable completion from the wireframe contract. | Actual state/interaction observations, candidate/version/source hash, viewport and console result; no simulated-runtime claim. |
| QA-S08 | ST-39, ST-40, ST-41, ST-42; S-08; UC-004. Walk Record action confirmation: delete-confirmation, deleted, export-ready, export-error. Verify all controls, safe exits, preserved draft/record and observable completion from the wireframe contract. | Actual state/interaction observations, candidate/version/source hash, viewport and console result; no simulated-runtime claim. |
| QA-S09 | ST-43, ST-44; S-09; UC-001, UC-003, UC-005. Walk Mobile navigation: closed, open. Verify all controls, safe exits, preserved draft/record and observable completion from the wireframe contract. | Actual state/interaction observations, candidate/version/source hash, viewport and console result; no simulated-runtime claim. |

## Heuristic usability checks

Expert review is separate from visual captures and representative-user testing. All H1–H10 apply; there are no excluded heuristics. Each check runs across relevant default and recovery states on desktop and mobile, with the primary owner tasks from the journey.

| Check | Heuristic/task | Scope and expected evidence |
|---|---|---|
| QA-H01 | H1: Identify draft, accepted, active, paused, browser recognition, transcript and save/delete feedback without misleading completion. | J-01–J-07; all relevant surfaces/UCs. Named reviewer, candidate scope, observations and classified findings. |
| QA-H02 | H2: Use literal Settings, meaningful role/claim/action labels and readable English/Ukrainian fixture content; reject transport jargon and vague slogans. | J-01–J-07; all relevant surfaces/UCs. Named reviewer, candidate scope, observations and classified findings. |
| QA-H03 | H3: Complete Stop, Continue, Cancel, transcript editing, close/Back and cancelled deletion without loss or traps. | J-01–J-07; all relevant surfaces/UCs. Named reviewer, candidate scope, observations and classified findings. |
| QA-H04 | H4: Compare desktop floating navigation and mobile hamburger, fields and focus order across the approved Electric baseline and the implementation. | J-01–J-07; all relevant surfaces/UCs. Named reviewer, candidate scope, observations and classified findings. |
| QA-H05 | H5: Attempt invalid model/effort pairs, unconsented entry, repeat Send and voice/delete cancellation; prevent unintended actions. | J-01–J-07; all relevant surfaces/UCs. Named reviewer, candidate scope, observations and classified findings. |
| QA-H06 | H6: Return to a conversation and identify its context, saved/current model values and supporting sources without recall. | J-01–J-07; all relevant surfaces/UCs. Named reviewer, candidate scope, observations and classified findings. |
| QA-H07 | H7: Complete the simple novice path and repeated work with visible mic/navigation and keyboard alternatives; no unnecessary setup. | J-01–J-07; all relevant surfaces/UCs. Named reviewer, candidate scope, observations and classified findings. |
| QA-H08 | H8: Inspect first viewport and long content; hierarchy emphasizes conversation and controls without clipped or decorative noise. | J-01–J-07; all relevant surfaces/UCs. Named reviewer, candidate scope, observations and classified findings. |
| QA-H09 | H9: Trigger every recovery family and identify cause, preserved work, next action, retry/cancel and success. | J-01–J-07; all relevant surfaces/UCs. Named reviewer, candidate scope, observations and classified findings. |
| QA-H10 | H10: Find concise processing/voice/invalid-choice/source help at the point it is needed; no documentation dump. | J-01–J-07; all relevant surfaces/UCs. Named reviewer, candidate scope, observations and classified findings. |

## Usability validation checks

Not conducted. The owner approved the design without a recorded representative-user task session; the design brief records the pre-approval deferral risk and post-implementation release obligation. No AI agent is a representative participant.

| Check | Owner task and trace | Success and timing |
|---|---|---|
| QA-U01 | Dictate and correct a Ukrainian request without accidental sending; UC-006 | Where supported, browser recognition through editable transcript; otherwise complete the equivalent typed request; no moderator rescue, accidental send or lost draft. Phone and desktop; required before release. Actual participant/session observation required. |
| QA-U02 | Identify the Critic objection, consultant response and source; UC-002, UC-007 | Correctly locate and explain evidence/uncertainty without moderator rescue. Phone and desktop; pre-approval when feasible, required after implementation. Actual participant/session observation required. |
| QA-U03 | Change future model/reasoning without changing the active run; UC-005 | Save a compatible selection and correctly identify which consultation uses it. Phone and desktop; pre-approval when feasible, required after implementation. Actual participant/session observation required. |
| QA-U04 | Stop/recover/export and cancel a deletion; UC-003, UC-004 | Complete actions with no lost accepted work, duplication or unintended deletion. Phone and desktop; pre-approval when feasible, required after implementation. Actual participant/session observation required. |

## UX/UI checks and evidence requirements

The checks mapped to NFR-02.1, NFR-02.2 and NFR-02.3 must be checked against their actual source IDs, not assumed from ordinal numbers. For the selected Electric revision inspect the NanoDuck Consulting Group name, supplied outline-duck SVG in navigation/sign-in/favicon, light outline on dark surfaces and original charcoal-outline export, the full mobile wordmark where space permits and the accepted mark-only variant below 381px with its accessible product/navigation label. Inspect HappyPro blue controls/large heading, raspberry Critic, the warmer Head yellow and distinct Spiritual Consultant/Psychotherapist role tokens. Check every gradient stop against its actual heading surface, white Send text against blue, readable small blue accents, avatar initials and forced-colors fallback. Retain checks for an icon-only SVG microphone with accessible name, `You` role header and `I` avatar for owner entries, New placement, agent identity without colour alone and Ember message/tab formatting. For all UI runs include 320px reflow, 200% text resizing, visible/unobscured focus, native select labels/states, dialog/menu keyboard behavior, primary touch targets, color contrast, reduced motion, forced colors and long English/Ukrainian content. Record device/browser and separate assistive-technology limitations. Do not infer WCAG conformance from screenshots.

Each run records check ID, candidate/version or implementation revision, source/target hashes, executor, time, fixture/state/route/viewport, evidence kind/path/hash, result and findings with P0–P3 severity and blocking/advisory rationale. Baseline fidelity requires the approved Electric A v8 target and permitted variance in the design brief. Security evidence must come from the actual trusted boundary, not hidden/disabled controls.

## Acceptance scope and evidence freshness

The original 90 checks retain their complete criteria, current accepted source corrections and all dated extensions in this document. Their implementation acceptance requires the actual named local consumers and the external/provider/device/user observations their task demands. Controlled captures can supplement them where explicitly specified, but cannot replace a required real provider, trusted device, operating system, native reader, assistive technology or representative-owner observation. Prototype runs under `phase: both` are separate records and never pass implementation acceptance. The new QA-C01 is a bounded controlled contribution, not a substitute for any original check, requirement or state.

Before execution, record the actual evaluated revision, current plan hash, approved baseline/target, required source/configuration/test hashes, executor, timezone-aware execution time, environment and fixture/boundary scope. Each result needs readable hash-bound evidence and observed expected/denied outcomes; leave evidence/findings empty until performed. A later shared-source or baseline change makes affected results stale. Retain their old bindings and rerun affected checks against the final integrated revision; never add current hashes/timestamps to an old result. Full integration/release checks additionally record `execution_mode: real_consumers` and evidence of kind `integration`; security, visual, heuristic and representative-user evidence keep their own required classes. Findings use the PRD severity/release-effect definition, explicit open/closed state, source, applicability and rationale. Open blocking findings or missing/failed/stale/deferred required evidence cannot pass.

The claim-specific `required_source_paths` below name code, configuration, rendering inputs and verification consumers actually relevant to each check. They are a minimum declared inventory, not a completeness proof. The plan separately inventories the complete integrated unit; execution hashes must also cover that owner/prerequisite inventory. These paths are repository-relative regular files, not user data. A task's manual device/account/user prerequisites are evidence needs, not invented source files. Canonical acceptance remains QA-owned; no unit owner or execution order is allocated here.

## Execution evidence and history

All 90 original formal checks remain prepared/not_run; QA-C01 adds one separately bounded prepared/not_run check. No current check or gate was executed by this reconciliation. Dated paragraphs below explicitly retain historical scoped results, not current formal passes; their original evidence remains at the cited receipts and must not be rebound to the revised plan or new unit times. The preserved v8 browser and visual receipts describe only their exact fictional candidate pages. They do not establish local password entry, operating-system compatibility, Wi-Fi access, provider behavior, durable storage or any current implementation gate. Each new execution must bind the actual implementation revision and source hashes.

## Evidence limits, release readiness and open questions

Release readiness: not_evaluated. Actual local setup, authentication, TLS trust, provider execution, persistence, security, recovery and cross-device operation need recorded execution. Representative-owner and assistive-technology observations remain required and missing until performed. No design approval, automated fixture, screenshot or document reconciliation substitutes for those results. The current request authorizes documentation reconciliation only. A revised plan requires a later explicit implementation prompt; any future execution and release claim needs its own actual scope and fresh evidence.

## Parallel consultation acceptance

All following checks: Definition Status **prepared**; Execution Status **not_run**; no evidence or findings claimed. Shared scope: JOB-001/JOB-002, UC-002/UC-003/UC-005 as applicable; S-02/ST-09–ST-17, S-04/ST-21–ST-24, S-07/ST-37–ST-38; authenticated owner, existing baseline/P5, English/Ukrainian, supported desktop/mobile viewports. Controlled provider/store input/output capture supplies bounded regression evidence; full acceptance additionally uses the actual local consumers and every real browser/provider/user observation required by each task. Original full checks cannot inherit a component or fixture pass. New behaviors do not inherit old passing results.

| Check | Clauses | Task and expected result | Gate |
|---|---|---|---|
| QA-R61 | FR-02.9, FR-02.10 | Create an unlisted specialist and adapt a library role; verify Head authored each distinct task, only its own role guidance reaches each consultant, the compact index omits unused details, and private role text is absent from chat/export. One planning call yields separate visible assignments. Long/unusual valid wording is delivered unchanged; no generic fallback or role allowlist refusal. | product_functional_requirements |
| QA-R62 | FR-02.11 | Hold two independent synthetic workers simultaneously and complete them out of order; each result commits once and appears immediately. A dependent task waits for its declared result, while unrelated work continues. Exercise provider queue/failure without silent model/effort changes or hidden serialization. | product_functional_requirements |
| QA-R63 | FR-02.12 | Capture inputs at the actual provider-adapter boundary using marked controlled scenarios: the complete newly accepted owner message occurs exactly once, with its own task/guidance and current-request referenced evidence. Earlier requests, corrections accepted through an earlier Send, results, sources, saved personal memory, unrelated role prose, System events and obsolete drafts are absent even in the same saved chat. Critic receives all current assignments/results. Stop and Continue/Retry preserve that immutable accepted request and completed work. A subsequent explicit Send, including a correction, establishes an independent new boundary and never implicitly imports earlier context. Retain every original archive message unchanged and the image-capability disclosure; validate actual selected-provider behavior separately from controlled captures. | product_functional_requirements |
| QA-R64 | FR-02.13 | Persist a Critic order against a specific result. A repeated answer, unsupported objection and self-declared completion leave it unresolved. Batch independent corrections into a joint resolution assessment; a substantive fix needs a matching Critic assessment before resolution; a supported objection is explicitly upheld; missing evidence is blocked, not passed. Reject stale/wrong-recipient resolution and preserve status across restart, Stop and retry. Escalate repeated noncompliance to Head without an automatic inference loop. | product_functional_requirements |
| QA-R65 | FR-02.14, FR-05.3, NFR-01.3 | For depths 1/3/5, count exactly that many team assessments on a successful run even when round one is adequate; subsequent assessment can be concise, with no invented flaw or mandatory unaffected replies. Auto closes by Head decision within ten. Final-round correction gets focused resolution only; no extra full round. Unresolved or evidence-blocked orders yield provisional advice and never false consensus. | product_functional_requirements |
| QA-R66 | FR-02.15 | Compare baseline and revised synthetic consultations with identical model/effort/team/depth and deliverable rubric, including clean work, targeted rework and long corrected requests. Report call counts, context bytes and actual token categories where available; inspect duplicate removal and complete results. Treat savings as unverified if usage is missing and never claim subscriber quota savings from API pricing. | product_functional_requirements |
| QA-R67 | FR-03.5, NFR-01.2, FR-02.13 | Crash between parallel result and checkpoint writes, retry a failed worker while another succeeds, double-submit a resume, and Stop all workers. Verify atomic unique commits, no lost results, no late commits, preserved directives and exact settings. Migrate an isolated encrypted legacy record without altering its transcript or inventing resolved orders; legacy active runs use their accepted contract until terminal. No real owner run is interrupted. | product_functional_requirements |

Extend QA-R45/QA-R47/QA-R51/QA-R54/QA-R56/QA-R58 to reject cross-conversation assignment/order references, duplicate/stale commits, role-based tool escalation, private guidance exposure and deletion/restore resurrection. Extend QA-S02/QA-S04/QA-S07 and QA-H01–QA-H10 to current statuses, understandable correction outcomes, fixed-depth copy, long dynamic names, keyboard/mobile Stop and partial recovery. Extend QA-U02/QA-U04 with an observed owner following a new-role assignment, an unresolved Critic order and its correction, then resuming after partial failure. These are added obligations under existing scopes, not executed browser/security/user tests.

## Critic reliability and model usage — 2026-09-25

Extend QA-R64/QA-R67: multiple findings for one consultant preserve every issue/correction, produce one reply, and reach assessment; valid reviews cause no repair; malformed reviews receive exactly one repair and otherwise preserve checkpoint. Extend QA-R22: Claude inference allows a valid response beyond nine minutes, has a thirty-minute finite ceiling, and cancellation/failure categories remain truthful. Extend QA-R66: measure native Codex/Claude input/output/cache/reasoning counts, repeated cumulative events, retries, failed/cancelled attempts, unknown historical usage, encrypted restart/recovery/deletion and authenticated Usage UI in desktop/mobile browser engines. Use existing S-02 scope, UC-002/UC-004, Electric A v8 plus the scoped Usage variance. H1/H6/H8/H9/H10 and functional/privacy checks apply. Definition Status: prepared. Execution Status: not_run. Release Readiness: not_evaluated. Actual results must be appended with inspected run evidence.

## Scoped execution evidence — 2026-09-25

**Retained historical scoped result, not a current formal pass.** [Verification receipt](../forge/runs/critic-usage-20260925/verification.json) binds the evaluated implementation files, commands, synthetic screenshots and live provider probes. Executed by Codex on macOS / Node 24.16.0: 189 tests passed, 2 skipped, 0 failed; full Chromium/Firefox/WebKit suite and final focused Usage suite passed. Short Codex Astra and Claude Opus 5.5 Max subscription calls returned reported model usage. CA-verified localhost and LAN health passed after restart; the five saved consultant answers remain stopped and intact. These are passing scoped regressions for QA-R22/R64/R66/R67 and related privacy/browser controls, not completion of every indexed check. Historical usage, the original full private consultation, real thirty-minute duration, physical iPhone audio, Windows/Linux, representative-user validation and whole-product release remain outside this evidence. Release Readiness: not_evaluated.

## Sticky consultation views — 2026-09-25

Extend existing S-02 and navigation/keyboard checks: scroll Discussion/Usage at desktop and 320px; all four views remain reachable through the accepted desktop left rail or narrow-screen picker/status group, active P5 Stop remains reachable, selected-panel switching still works, and no horizontal page overflow occurs. The earlier horizontal sticky-tab arrangement is historical. Definition prepared; inspect the scoped browser receipt for actual execution evidence.

## Review-repair checks — 2026-09-26

Extend existing prepared checks under the retained baseline and shared S-02 desktop/mobile scope:

- QA-R61/R63: a saved marker in Specialist Position/Reply and selected role guidance reaches the corresponding provider prompt. Accept a 64-character role, repair a longer/reserved name without changing Head's task, and keep generated owner-role legacy messages out of owner context. Propagate source metadata to dependent consultants, Critic, corrections, Head and visible history/export. Head must receive Critic summaries even with no findings.
- QA-R62: hold an unrelated worker open after a dependency completes; its dependent starts immediately. Preserve cancellation and successful siblings.
- QA-R64/R65/R67: across three rounds, preserve an unresolved first order, carry it with a different new defect into one linked second attempt, assess it explicitly and permit genuine resolution without altering the first assessment. Reject forged/cross-assignment links. Stop/restart between response and assessment; resume only missing work.
- QA-R17/R51/R54: Critic's evidence request invokes Head query formation and one isolated public search for that round, including final-round rework. No private owner context or guidance reaches research. Reject unsafe queries and credential-like generated bodies before persistence/forwarding; ordinary phone numbers remain allowed. Persist unavailable research truthfully and retain every distinct validated source when Head cites only a subset.
- QA-R06/R66/R67 and QA-H01/QA-H09: one transient poll failure shows a status and automatically recovers; slow usage reads exceeding the poll interval still render and do not overlap for the same scope. Scope replacement, Stop and logout fence stale responses. Exercise Chromium, Firefox and WebKit on isolated fixtures.

These are scoped extensions of existing IDs; full indexed checks remain prepared/not_run pending all required evidence. Separately inspected automated results belong in the run receipt, not a whole-product pass. Release readiness: not_evaluated.

## Review-repair scoped execution evidence — 2026-09-26

**Retained historical scoped result, not a current formal pass.** [Verification receipt](../forge/runs/review-fixes-20260926/verification.json) records isolated macOS/Node regressions: 199 passed, 2 Windows-only tests skipped, 0 failed; full Chromium/Firefox/WebKit verification and final focused recovery/Usage/source checks passed. It binds evaluated files and preserves evidence limits. No live provider call, private-session replay, runtime restart or sister-repository change occurred. These are scoped regression results for the preceding check extensions; they do not close every formal check or establish whole-product release readiness.

## Source metadata regression — 2026-09-26

Extend QA-R17/R51/R67 with provider output containing a title longer than 280 characters and a claim longer than 1000. Verify exact persistence through a complete consultation, encrypted restart and backup/restore without truncation. **Retained historical scoped result, not a current formal pass:** the isolated real-adapter/fake-provider regression passed; complete Node checks: 200 passed, 2 Windows-only tests skipped. Actual runtime health and checkpoint resume were observed separately; the discarded historical answer cannot be reconstructed or claimed recovered. Full private consultation completion remains unverified.

## Table checks — 2026-09-26

For existing QA-R26/QA-R40/QA-R41/QA-R46 and QA-S02/QA-S08 under UC-004/FR-06.2, compare chat and RTF headers/cells, Ukrainian text, emphasis, links, escaped pipes, column boundaries and following text. A malformed row loses no content; supplied HTML/RTF control text remains inert. In Chromium/Firefox/WebKit at 320, 390 and 1280 CSS px, verify that only the table container scrolls horizontally, with keyboard focus and semantic column headers. Relevant automated surfaces are `test/markdown.test.mjs`, `test/markdown-table-export.test.mjs` and `scripts/browser-markdown-tables.mjs`. Opening the export in Word, Pages and LibreOffice is separate compatibility evidence; parsing RTF controls cannot replace it. These checks remain prepared/not_run; release readiness stays not_evaluated.

## Reading-mode checks — 2026-09-26

Extend QA-R13/QA-R14/QA-R15/QA-R35/QA-R40/QA-R41 and QA-S02 under UC-003/UC-004: verify automatic completion collapse; manual opening/collapse with the same page-memory draft and predictable focus; unchanged selected view and reading position on completion; Outcome through existing rail/picker without Read outcome; sticky open input with readable theme-matched matte surfaces; left rail at 1280px and compact picker at 320/390/768px without horizontal overflow; arrow-key movement through vertical tabs; and reopening a completed record. `scripts/browser-check.mjs --reading-only` exercises the actual client with isolated controlled providers. Record that boundary explicitly; actual iPhone and representative-user observations are separate and remain missing. Checks prepared/not_run; release readiness not_evaluated.

## Isolated request and cache economy — 2026-09-26

Additional coverage under existing QA-R03/QA-R11–QA-R16/QA-R36–QA-R39: seed previous owner/answer/source markers, Send again in the same chat, verify markers never enter any participant input or new final sources; Stop/Continue keeps the new accepted ID; rebind attempts fail. test/context-economy.test.mjs checks complete final/Critic input and reduced Head control input. test/codex-provider.test.mjs checks shared same-request cwd, separate request cwd, cleanup and disabled tools. test/usage.test.mjs checks stage totals/allowlisted metadata and unknown cache writes. **Retained historical scoped result from 26 September, not rerun for this plan:** npm run check, 207 passed/2 skipped; browser --usage-only passed Chromium/Firefox/WebKit including 320px, keyboard, retry and reload. Live synthetic GPT-6 Sol/high: original provider 9,825 input tokens; revised provider 6,228 on each of two equivalent calls. Cache reads 0 baseline, 3,072 then 0 revised: no stable hit-rate guarantee. Not a production-workload or subscription-cost benchmark; no representative-user test. Release readiness not_evaluated.

## Chat beginning and end controls — 2026-09-26

Extend QA-R14/QA-R35/QA-R40/QA-R41, QA-S02 and QA-H03/QA-H04/QA-H08: use both existing beginning/end controls in the selected consultation view, retaining the draft, reduced-motion behavior and safe separation from Stop. Use `scripts/browser-reading-mode.mjs` at 320/390/768px and desktop in Chromium/Firefox/WebKit. The historical plain-transparent finish is superseded by current liquid glass. Retained historical scoped record: browser checks passed in three engines, a WebKit mobile capture was reviewed, and artifact/unit checks reported 207 passed/2 skipped. This record is not a current formal check pass or representative-user validation; release readiness remains not_evaluated.

## Centered chat arrows — 2026-09-26

For the same existing checks, observe horizontal centering, up-arrow separation below global navigation and down-arrow separation above the safe area at 320/390/768px and desktop. Preserve 44px circular geometry, accessible names, reduced motion and consultation-only visibility. Use the current glass treatment and open-prompt clearance from the design brief; older plain-transparent styling is historical. Record actual observations separately; full checks remain not_run.

## Chat boundary visibility — 2026-09-26

For the same existing checks, reach both content boundaries and verify the corresponding arrow hides and returns after scrolling away; both hide when content fits. Repeat after viewport/view/content changes without changing the selected view or reading position. Verify the final text remains readable above current bottom controls and that jump/hiding calculations use the same readable boundaries. Current glass/open-composer treatment remains authoritative. Full checks remain prepared/not_run.

## U-12 research and evidence economy — 2026-09-26

U-12 verification: provider same-URL/multiple-claim extraction; evidence-reference stability and resolution; Head-selected reuse versus explicit fresh search; targeted delivery; query checkpoint through Stop/Continue; malformed routing/references; request isolation; current shared prompt measurements and initial/follow-up/repeated-gap scenarios. Run full artifact/unit checks and existing three-engine reading/Usage flows. Compare focused and combined synthetic public research with identical model/effort, recording limitations. Checks are prepared; execution evidence is recorded separately. Formal release readiness not_evaluated.

**Retained historical scoped result, not a current formal pass:** 214 passed, 2 platform-specific skips, 0 failed. Chromium, Firefox and WebKit reading/control/Usage regressions passed. Encrypted store close/reopen proves query checkpoint recovery; malformed/foreign references, same-URL claims and request isolation are covered. [Evidence](../forge/runs/research-economy-20260926/verification.json) and adjacent measurement reports separate synthetic bytes from native provider tokens. Small cases incur metadata overhead; the evidence-heavy fixture saves 11.9% bytes. One uncontrolled live sample favored combined research; no automatic splitting enabled. Whole-product release readiness remains not_evaluated.

## U-12 Critic cache and usage completeness — 2026-09-26

Extend QA-R06/QA-R51/QA-R54/QA-R66/QA-R67 and QA-S02: observe request-isolated Claude context with file tools and persistent provider history disabled, complete current owner input, exact model/effort/depth, independent Send isolation and temporary-data cleanup. Compare public synthetic consecutive calls only under separately authorized provider scope. Inspect every reported input/output/cache/reasoning category, retries and failed attempts; unknown/partial values remain explicit and totals never double count subsets. Actual provider cache reuse needs its own dated provider evidence.

**Retained historical scoped result, not a current formal pass:** 218 tests passed/2 platform-specific skips; Chromium/Firefox/WebKit reading/control/Usage regressions passed. [Evidence](../forge/runs/critic-cache-usage-20260926/verification.json) retains workspace/transport/cleanup and usage observations. Stable-directory-only probing had no hits; separating stable context from assignment reported 8,722 cache-read tokens of 9,197 input and 473 cache-write tokens on the second Opus 5.5/high call. Provider expiry/routing were uncontrolled. No current authorization, guaranteed cache hit or whole-product readiness follows.

## U-12 upstream usage verification — 2026-09-26

Extend QA-R51/QA-R54/QA-R58/QA-R66 and QA-S02: inspect expected-turn numeric telemetry allowlisting and response deduplication. Reconcile upstream response totals against cumulative normalized totals when both exist; when cumulative totals are unavailable, retain the allowlisted upstream response counts with explicit partial coverage instead of discarding them or inventing reconciliation. Test explicit zero, absent fields, positive writes, wrong-turn/repeated events and partial coverage; missing writes cannot be derived from uncached input. Inspect persisted records/UI to exclude raw responses, private IDs and hidden reasoning. Verify optional telemetry failure preserves consultation and existing recovery.

**Retained historical scoped result, not a current formal pass:** 220 tests passed/2 skips and three-engine Usage checks passed. The [receipt](../forge/runs/upstream-usage-20260926/verification.json) reports a Sol/high probe with 4,941 input, 37 output, 4,978 total and explicit upstream cache-write zero, plus relevant fixtures. It proves reported accounting within that dated scope, not physical cache storage or subscription charges. One earlier unchanged review fixture failed output_policy before targeted/full reruns passed; its cause remains unconfirmed.

## U-13 actionable usage dashboard — 2026-09-26

U-13 checks: aggregate providers/requests/participants and repeat union; timestamp durations; malformed/missing account windows; authenticated endpoint; refresh privacy; legacy attempts; live running/partial status; narrow/wide browser rendering. Fresh execution evidence is required; none is created by this reconciliation.

**Retained historical scoped result, not a current formal pass:** 224 tests passed, 2 platform-specific checks skipped; Chromium, Firefox and WebKit Usage flows passed including request filtering, account meters, partial values, retry/reload and 320px reflow. Native Codex read-only account telemetry returned a valid window without inference. Earlier browser iteration exposed and fixed missing ARIA attributes. See [evidence](../forge/runs/usage-dashboard-20260926/verification.json). No representative-user study or exact subscription-charge verification is claimed.

## U-13 reasoning attribution follow-up — 2026-09-26

Extend QA-R20/QA-R21/QA-R23/QA-R66 and QA-S02: compare provider/model/effort groups and attempt labels, including mixed efforts for one model. For historical attempts, accept recovered effort only from a matching immutable request snapshot with known stage/provider/model; otherwise show unknown. Preserve counters, request isolation and selected settings; observational usage differences do not establish advice quality.

**Retained historical scoped result, not a current formal pass:** 226 tests passed/2 skips and Chromium/Firefox/WebKit displayed reasoning beside models. [Evidence](../forge/runs/usage-reasoning-20260926/verification.json) records conservative attribution and a read-only saved-configuration observation, without importing private content.

## U-13 activity counts follow-up — 2026-09-26

Extend QA-R23/QA-R54/QA-R66 and QA-S02: inspect consultant assignments excluding Head/Critic, issued team reviews, issued correction orders, research-call attempts including retries, and reported search/open/find operations for current-conversation and all-saved scopes. Compare known counts with saved ledgers/allowlisted telemetry; mark missing historical coverage partial, omit deleted records, and keep account-wide allowance distinct.

**Retained historical scoped result, not a current formal pass:** 227 tests passed/2 skips; Chromium/Firefox/WebKit checked all five labels, scopes and 320px reflow. [Evidence](../forge/runs/usage-activity-20260926/verification.json) records read-only ledger/summary agreement. Unknown older telemetry remains partial or unavailable.

## Clear-glass navigation follow-up — 2026-09-26

For QA-R35/QA-R40/QA-R41/QA-R55, QA-S09 and relevant H checks, verify current native control sharpness, contrast, hit targets, focus, reduced-transparency and forced-color fallbacks. The earlier tint-only treatment is historical and cannot pass current curved-edge refraction.

**Retained historical scoped result:** [the earlier receipt](../forge/runs/clear-glass-navbar-20260926/verification.json) reports Chromium/Firefox/WebKit production-markup fixtures at 320/390/768/1280px for transparency/no-blur/reflow/focus/fallback and a desktop capture. No active session/server was interrupted. That superseded appearance observation is not current fidelity acceptance.

## Glass edge refinement — 2026-09-26

For the same existing checks, do not use the rejected metallic/masked bevel as current optical acceptance. Retain geometry, clickable native controls and readable accessibility fallbacks, then evaluate the accepted refraction below.

**Retained historical scoped result:** [the rim receipt](../forge/runs/glass-rim-20260926/verification.json) reports isolated Chromium/Firefox/WebKit at 320/390/768/1280px, with clear centre, reflow/focus/fallback and a visually inspected lip/bevel. It remains evidence of that dated superseded treatment, not a current check pass.

## Navbar refraction renderer — 2026-09-26

Extend QA-R35/QA-R40/QA-R41/QA-R54/QA-R55, QA-S02/QA-S09 and relevant H checks: inspect actual curved-edge pixel displacement of visible app text, solid surfaces and same-origin images in each supported engine. The centre stays clear and native controls stay sharp/clickable. Observe changes with content/scroll/resize, every glass host, readable forced-color/reduced-transparency fallbacks and no perpetual idle repaint. Use marked input/hidden content to verify exclusion from sampling; inspect synchronous clearing on privacy lock, Logoff and visibility changes, no recursive glass sampling, stored pixels, external capture or transmitted content. CSS parsing or a border highlight is insufficient.

**Retained historical scoped result, not a current formal pass:** 227 tests passed/2 skips; integrated Usage and optical fixtures passed Chromium/Firefox/WebKit. [Evidence](../forge/runs/navbar-refraction-20260926/verification.json) reports changing pixels, transparent centre, clickable controls, mobile layout and synchronous privacy clearing.

## White theme — 2026-10-08

Extend existing checks for the accepted scoped variance while retaining their full original criteria and IDs.

| Existing check | Additional appearance scope |
|---|---|
| QA-R33 / QA-S09 | Reach White theme in desktop navigation and the open mobile menu; retain visible Login/Logoff with the disclosure closed. Verify name, switch role, selected state, keyboard activation and focus. |
| QA-R35 | Dark default; immediate switching; valid saved choice before paint on reload; missing/invalid/cleared values; blocked storage; cross-tab synchronization; correct logo/favicon and both menu states. |
| QA-R21 | Appearance changes preserve the same accepted run and immutable settings snapshot, plus an unsent draft. |
| QA-R40 / QA-R41 | Readable text, roles, links, controls, focus and P5 Stop in both modes; 320px reflow, 200% text sizing, forced colours and reduced-transparency fallbacks. |
| QA-S01/QA-S02/QA-S03/QA-S04/QA-S07 | Representative signed-out/consent, discussion, history, Settings, Usage and outcome appearances retain hierarchy and usable controls. |
| QA-H01/H03/H04/H06/H08 | Selected-state feedback, reversible switching, consistent navigation, recognizable choice and uncluttered reading. |

Run the real shell through `scripts/browser-check.mjs --theme-only` and `scripts/browser-theme.mjs` with isolated synthetic records. Record engine, viewport, revision and actual observations separately. Scoped observations do not pass complete checks, physical-device coverage, representative-owner tasks or release gates; formal execution statuses remain unchanged.

## Glass reading controls and sticky composer — 2026-10-08

Extend existing QA-R13/QA-R14/QA-R15/QA-R35, QA-S02, QA-R40/QA-R41 and relevant QA-H03/H04/H08: verify removal of Read outcome; Outcome through existing tabs/select; completion collapse; explicit reopening/collapse with unchanged draft; hidden active input; Stop/Retry; sticky opaque black matte composer with readable light text/controls in dark theme and white matte composer with readable dark text/controls in white theme, including opaque/system-colour fallbacks; liquid-glass arrows and Continue conversation.

At narrow/wide widths and zoom, verify the down arrow stays horizontally centered at its original 16 CSS pixels plus bottom safe-area anchor with collapsed or hidden input, including active work and visible Continue conversation. Only a visibly open composer lifts the arrow above that prompt. Verify opening/collapsing restores the corresponding position, Continue conversation never lifts it, and responsive row space/label wrapping keep the action separately clickable. Each end jump leaves the corresponding content boundary visible below navigation and above the bottom overlay; arrow hiding/reappearance uses those same boundaries. Use reading-mode and optical browser observations to cover every glass host, exclusion from sampling, unsampled input values, theme changes and synchronous privacy clearing. Preserve historical evidence; record new results separately without passing whole-product or representative-user gates. This owner prepares definitions and does not manufacture execution results.

## Controlled integration regression

QA-C01 · Required/applicable · `product_functional_requirements` · phase `implementation` · Definition Status: prepared · Execution Status: not_run. Owner group: the existing owner represented by isolated synthetic fixtures. Trace: JOB-001/JOB-002/JOB-003/JOB-004; UC-002/UC-003/UC-004/UC-005; J-02/J-03/J-05/J-06/J-07; S-02/S-03/S-04/S-06/S-07/S-08 at their applicable draft/active/stopped/retry/complete/record states. Baseline: `nanoduck-electric-a-v8-20260914`, current immutable target and permitted variance. Viewports: 320/390/768/1280 CSS px with current desktop rail/narrow picker and theme/glass/matte controls.

**Bounded task:** follow one accepted-request lifecycle through the actual local browser, protected HTTPS API, coordinator, encrypted store, Sources/Usage and export/recovery consumers. Use a temporary synthetic workspace and controlled provider/research/recognition/account boundaries, with no owner data or inference. Preserve and report exactly which calls/data are controlled; local encryption/transactions/HTTP/client rendering remain real. Use existing meaningful seams in `test/http.test.mjs`, `test/parallel-consultation.test.mjs`, `test/context-economy.test.mjs`, `test/local-store.test.mjs`, `test/recovery-cli.test.mjs`, `test/research-evidence.test.mjs`, `test/usage.test.mjs` and the existing browser scripts below; passing an isolated mock function alone does not satisfy the lifecycle.

1. Establish the synthetic authenticated session/consent, save compatible future preferences and send a complete marked request. Observe one accepted message and the exact accepted settings/instruction snapshot. Have controlled Head output two distinct independent assignments, hold both ready workers, then commit their results out of order. The real application exposes each successful result once and retains the declared task/context boundaries.
2. Issue a controlled Critic order against a specific current result. A repeated answer remains unresolved; a matching current assessment resolves only its addressed correction. Stop between response and assessment, preserve the successful prefix/directive/snapshot, restart the isolated runtime/store, and Continue/Retry only missing work. Reject late/duplicate results without losing accepted work. Changing saved future settings cannot alter this accepted snapshot.
3. Reopen that protected record, inspect resolved current-request sources and numeric partial/unknown Usage, download the escaped complete RTF, then explicitly Send a new marked independent request in the same archive. Prior request/result/source markers never reach its participant input or final sources; Continue/Retry retains the new accepted ID. Original archive messages remain unchanged. Exercise draft collapse/reopen and current-view reading controls through actual DOM actions without an accidental Send/Stop.
4. Confirm a synthetic record deletion, and restore an isolated encrypted backup using its separated fixture keys. The deleted record remains deleted, an unrelated accepted record remains readable, and accepted surviving content/export/source references match the canonical stored record. No real owner workspace is opened or migrated.

**Pass predicate and evidence:** all four stages complete with one coherent current source revision, preserved IDs/settings/work and observed expected/denied transitions. Record actual executor/time, current plan/baseline/source hashes, controlled-boundary inventory, state/viewport captures, HTTP/store/event/provider-input comparisons and command results. Existing executable surfaces are `npm run check`, `node scripts/browser-check.mjs`, `node scripts/browser-check.mjs --reading-only`, `node scripts/browser-check.mjs --usage-only` and the relevant recovery/context tests; inspect their actual coverage and supply missing scenario observations rather than assuming a command name proves this task. These procedures are prepared, not executed here.

**Supported contribution only:** FR-02.1, FR-02.11, FR-02.12, FR-02.13, FR-03.4, FR-03.5, FR-05.2, FR-06.1, FR-06.2, FR-06.3, NFR-01.1 and NFR-01.2 at the controlled local lifecycle boundary. This check does not claim all 111 requirement/state obligations, real model quality or concurrency capacity, live research freshness/cache reuse/entitlement, physical recognition/audio, trusted LAN/OS portability, native-reader rendering, complete accessibility/heuristic coverage, representative-user success or release readiness. All original full checks and six gates remain required/not_run.

## Acceptance definitions

This check-ID map is canonical. Every original full check stays required and uses real-consumer integration/release evidence. QA-C01 is separately bounded component evidence. The plan owner assigns acceptance owners and prerequisites without changing these definitions; the orchestrator mirrors this exact object at `verification.checks[*].acceptance`, referenced by `verification.acceptance_ref`.

```json
{
  "QA-C01": {
    "required": true,
    "level": "unit",
    "evidence_mode": "component",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "package-lock.json", "package.json", "public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-check.mjs", "scripts/browser-logoff.mjs", "scripts/browser-progress-recovery.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-send-retry.mjs", "scripts/browser-theme.mjs", "scripts/browser-usage.mjs", "scripts/check-artifacts.mjs", "scripts/test.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/theme.js", "src/server/account-usage.mjs", "src/server/attachments.mjs", "src/server/auth.mjs", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/config.mjs", "src/server/configuration-recovery.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/content-policy.mjs", "src/server/conversation-export.mjs", "src/server/crypto.mjs", "src/server/forbidden-environment.mjs", "src/server/image-structure.mjs", "src/server/index.mjs", "src/server/instruction-bootstrap.mjs", "src/server/instruction-documents.mjs", "src/server/local-request.mjs", "src/server/local-setup.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/output-safety.mjs", "src/server/parallel-contract.mjs", "src/server/password.mjs", "src/server/private-files.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/providers.mjs", "src/server/read-regular-file.mjs", "src/server/recovery-cli.mjs", "src/server/recovery.mjs", "src/server/research-evidence.mjs", "src/server/setup.mjs", "src/server/start.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "src/server/usage.mjs", "src/server/validation.mjs", "test/context-economy.test.mjs", "test/conversation-export.test.mjs", "test/fixtures/fake-codex.mjs", "test/fixtures/local-runtime.mjs", "test/fixtures/runtime-instructions.mjs", "test/http.test.mjs", "test/local-store.test.mjs", "test/parallel-consultation.test.mjs", "test/recovery-cli.test.mjs", "test/research-evidence.test.mjs", "test/review-fixes.test.mjs", "test/usage.test.mjs"]
  },
  "QA-H01": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/notification-audio.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-H02": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/notification-audio.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-H03": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/notification-audio.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-H04": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/notification-audio.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-H05": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/notification-audio.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-H06": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/notification-audio.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-H07": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/notification-audio.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-H08": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/notification-audio.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-H09": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/notification-audio.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-H10": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/notification-audio.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-R01": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["README.md", "package-lock.json", "package.json", "public/index.html", "public/styles.css", "scripts/browser-local-entry.mjs", "src/client/app.js", "src/server/auth.mjs", "src/server/config.mjs", "src/server/crypto.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-setup.mjs", "src/server/password.mjs", "src/server/private-files.mjs", "src/server/read-regular-file.mjs", "src/server/setup.mjs", "src/server/start.mjs", "test/http.test.mjs", "test/local-config-auth.test.mjs"]
  },
  "QA-R02": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-check.mjs", "src/client/app.js", "src/server/auth.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/store.mjs", "test/http.test.mjs"]
  },
  "QA-R03": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-send-retry.mjs", "src/client/app.js", "src/server/auth.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/store.mjs", "test/http.test.mjs"]
  },
  "QA-R04": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "src/client/app.js", "src/server/attachments.mjs", "src/server/auth.mjs", "src/server/image-structure.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/store.mjs", "src/server/validation.mjs", "test/fixtures/images.mjs", "test/http.test.mjs", "test/image-structure.test.mjs"]
  },
  "QA-R05": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/store.mjs", "test/parallel-consultation.test.mjs", "test/prompt-contracts.test.mjs"]
  },
  "QA-R06": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/forbidden-environment.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/providers.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "test/claude-process.test.mjs", "test/claude-provider.test.mjs", "test/codex-provider.test.mjs", "test/context-economy.test.mjs", "test/parallel-consultation.test.mjs", "test/turn-deadline.test.mjs"]
  },
  "QA-R07": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/store.mjs", "test/parallel-consultation.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-R08": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/client/app.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/parallel-contract.mjs", "src/server/store.mjs", "test/parallel-consultation.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-R09": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "src/client/app.js", "src/client/markdown.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/conversation-export.mjs", "src/server/conversation-title.mjs", "src/server/parallel-contract.mjs", "src/server/research-evidence.mjs", "test/conversation-export.test.mjs", "test/conversation-title.test.mjs", "test/parallel-consultation.test.mjs"]
  },
  "QA-R10": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "src/client/app.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/prompt-contracts.mjs", "test/consultation.test.mjs", "test/prompt-contracts.test.mjs"]
  },
  "QA-R11": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-active-discussion.mjs", "src/client/app.js", "src/client/notification-audio.js", "src/server/conversation-title.mjs", "src/server/store.mjs", "test/conversation-title.test.mjs"]
  },
  "QA-R12": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "src/client/app.js", "src/client/markdown.js", "src/server/claude-provider.mjs", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/content-policy.mjs", "src/server/output-safety.mjs", "src/server/parallel-contract.mjs", "src/server/research-evidence.mjs", "src/server/validation.mjs", "test/claude-provider.test.mjs", "test/codex-provider.test.mjs", "test/core.test.mjs", "test/markdown.test.mjs"]
  },
  "QA-R13": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-reading-mode.mjs", "src/client/app.js", "src/server/auth.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/provider-context.mjs", "src/server/store.mjs", "test/context-economy.test.mjs"]
  },
  "QA-R14": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-reading-mode.mjs", "src/client/app.js", "src/client/navbar-glass.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/store.mjs"]
  },
  "QA-R15": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-progress-recovery.mjs", "scripts/browser-send-retry.mjs", "src/client/app.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/store.mjs", "test/parallel-consultation.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-R16": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-check.mjs", "src/client/app.js", "src/server/auth.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/store.mjs", "test/consultation.test.mjs", "test/http.test.mjs"]
  },
  "QA-R17": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/content-policy.mjs", "src/server/output-safety.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/research-evidence.mjs", "src/server/store.mjs", "test/codex-provider.test.mjs", "test/research-evidence.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-R18": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "src/client/app.js", "src/client/markdown.js", "src/server/codex-provider.mjs", "src/server/content-policy.mjs", "src/server/conversation-export.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/output-safety.mjs", "src/server/research-evidence.mjs", "src/server/store.mjs", "test/claude-provider.test.mjs", "test/codex-provider.test.mjs", "test/research-evidence.test.mjs", "test/source-persistence.test.mjs"]
  },
  "QA-R19": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/server/claude-provider.mjs", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/content-policy.mjs", "src/server/output-safety.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/research-evidence.mjs", "test/claude-provider.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-R20": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["docs/model-settings.md", "package-lock.json", "package.json", "public/index.html", "public/styles.css", "scripts/browser-model-settings.mjs", "src/client/app.js", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/forbidden-environment.mjs", "src/server/instruction-bootstrap.mjs", "src/server/instruction-documents.mjs", "src/server/prompt-contracts.mjs", "src/server/providers.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "test/claude-process.test.mjs", "test/claude-provider.test.mjs", "test/codex-provider.test.mjs", "test/core.test.mjs", "test/http.test.mjs", "test/turn-deadline.test.mjs"]
  },
  "QA-R21": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-model-settings.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/notification-audio.js", "src/client/theme.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/instruction-bootstrap.mjs", "src/server/instruction-documents.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/providers.mjs", "src/server/store.mjs", "test/http.test.mjs", "test/prompt-contracts.test.mjs"]
  },
  "QA-R22": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/sounds/table-taps-250ms-v5.wav", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-notification-audio.mjs", "src/client/app.js", "src/client/notification-audio.js", "src/server/claude-provider.mjs", "src/server/index.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "test/notification-audio.test.mjs", "test/parallel-consultation.test.mjs", "test/turn-deadline.test.mjs"]
  },
  "QA-R23": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-usage.mjs", "src/client/app.js", "src/server/account-usage.mjs", "src/server/auth.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/store.mjs", "src/server/usage.mjs", "test/account-usage.test.mjs", "test/usage.test.mjs"]
  },
  "QA-R24": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-provider-connection.mjs", "scripts/claude-login.mjs", "src/client/app.js", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/forbidden-environment.mjs", "src/server/instruction-bootstrap.mjs", "src/server/instruction-documents.mjs", "src/server/prompt-contracts.mjs", "src/server/providers.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "test/claude-process.test.mjs", "test/claude-provider.test.mjs", "test/codex-provider.test.mjs", "test/http.test.mjs", "test/preflight.test.mjs", "test/turn-deadline.test.mjs"]
  },
  "QA-R25": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-check.mjs", "src/client/app.js", "src/client/refresh-state.js", "src/server/attachments.mjs", "src/server/auth.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/research-evidence.mjs", "src/server/store.mjs", "test/local-store.test.mjs", "test/refresh-state.test.mjs"]
  },
  "QA-R26": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-markdown-tables.mjs", "src/client/app.js", "src/client/markdown.js", "src/server/auth.mjs", "src/server/conversation-export.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/store.mjs", "test/conversation-export.test.mjs", "test/markdown-table-export.test.mjs"]
  },
  "QA-R27": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "src/client/app.js", "src/server/attachments.mjs", "src/server/auth.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/store.mjs", "src/server/usage.mjs", "test/http.test.mjs", "test/local-store.test.mjs"]
  },
  "QA-R28": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-check.mjs", "src/client/app.js"]
  },
  "QA-R29": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-check.mjs", "src/client/app.js"]
  },
  "QA-R30": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-check.mjs", "src/client/app.js"]
  },
  "QA-R31": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-check.mjs", "src/client/app.js"]
  },
  "QA-R32": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-check.mjs", "src/client/app.js"]
  },
  "QA-R33": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-local-entry.mjs", "scripts/browser-logoff.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/navbar-glass.js", "src/client/theme.js", "src/server/auth.mjs", "src/server/index.mjs", "src/server/local-request.mjs"]
  },
  "QA-R34": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-model-settings.mjs", "src/client/app.js"]
  },
  "QA-R35": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-navbar-glass.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/theme.js"]
  },
  "QA-R36": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-progress-recovery.mjs", "src/client/app.js", "src/client/refresh-state.js", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/forbidden-environment.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/providers.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "test/codex-provider.test.mjs", "test/local-store.test.mjs", "test/refresh-state.test.mjs"]
  },
  "QA-R37": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/crypto.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/store.mjs", "test/fixtures/local-store-owner.mjs", "test/local-store.test.mjs", "test/parallel-consultation.test.mjs"]
  },
  "QA-R38": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/parallel-contract.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "test/parallel-consultation.test.mjs", "test/turn-deadline.test.mjs"]
  },
  "QA-R39": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-progress-recovery.mjs", "src/client/app.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/parallel-contract.mjs", "src/server/providers.mjs", "src/server/store.mjs"]
  },
  "QA-R40": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["forge/design/candidates/a/v8/app.js", "forge/design/candidates/a/v8/index.html", "forge/design/candidates/a/v8/styles.css", "public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-markdown-tables.mjs", "scripts/browser-reading-mode.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-R41": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["forge/design/candidates/a/v8/app.js", "forge/design/candidates/a/v8/index.html", "forge/design/candidates/a/v8/styles.css", "public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-markdown-tables.mjs", "scripts/browser-reading-mode.mjs", "src/client/app.js", "src/client/markdown.js", "src/client/navbar-glass.js", "src/client/refresh-state.js", "src/client/theme.js"]
  },
  "QA-R42": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["README.md", "package-lock.json", "package.json", "public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-local-entry.mjs", "src/client/app.js", "src/client/navbar-glass.js", "src/client/theme.js", "src/server/auth.mjs", "src/server/config.mjs", "src/server/crypto.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-setup.mjs", "src/server/password.mjs", "src/server/private-files.mjs", "src/server/read-regular-file.mjs", "src/server/setup.mjs", "src/server/start.mjs"]
  },
  "QA-R43": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["scripts/browser-local-entry.mjs", "src/server/auth.mjs", "src/server/config.mjs", "src/server/crypto.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-setup.mjs", "src/server/password.mjs", "src/server/private-files.mjs", "src/server/read-regular-file.mjs", "src/server/setup.mjs", "src/server/start.mjs", "src/server/store.mjs", "test/http.test.mjs", "test/local-config-auth.test.mjs"]
  },
  "QA-R44": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["scripts/browser-logoff.mjs", "src/client/app.js", "src/server/auth.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-setup.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/password.mjs", "src/server/store.mjs", "test/http.test.mjs", "test/local-config-auth.test.mjs"]
  },
  "QA-R45": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/client/markdown.js", "src/server/account-usage.mjs", "src/server/attachments.mjs", "src/server/auth.mjs", "src/server/consultation.mjs", "src/server/conversation-export.mjs", "src/server/image-structure.mjs", "src/server/index.mjs", "src/server/instruction-bootstrap.mjs", "src/server/instruction-documents.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/prompt-contracts.mjs", "src/server/providers.mjs", "src/server/store.mjs", "src/server/usage.mjs", "src/server/validation.mjs", "test/http.test.mjs", "test/local-config-auth.test.mjs"]
  },
  "QA-R46": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "src/client/app.js", "src/client/markdown.js", "src/server/attachments.mjs", "src/server/auth.mjs", "src/server/codex-provider.mjs", "src/server/content-policy.mjs", "src/server/conversation-export.mjs", "src/server/image-structure.mjs", "src/server/index.mjs", "src/server/instruction-bootstrap.mjs", "src/server/instruction-documents.mjs", "src/server/local-request.mjs", "src/server/output-safety.mjs", "src/server/prompt-contracts.mjs", "src/server/providers.mjs", "src/server/research-evidence.mjs", "src/server/store.mjs", "src/server/validation.mjs", "test/core.test.mjs", "test/http.test.mjs", "test/markdown-table-export.test.mjs", "test/markdown.test.mjs", "test/prompt-contracts.test.mjs"]
  },
  "QA-R47": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/server/attachments.mjs", "src/server/auth.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/image-structure.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "src/server/validation.mjs", "test/http.test.mjs", "test/local-store.test.mjs", "test/parallel-consultation.test.mjs"]
  },
  "QA-R48": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["scripts/browser-local-entry.mjs", "src/server/auth.mjs", "src/server/config.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-setup.mjs", "test/http.test.mjs", "test/local-config-auth.test.mjs"]
  },
  "QA-R49": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/content-policy.mjs", "src/server/output-safety.mjs", "src/server/providers.mjs", "src/server/research-evidence.mjs", "test/codex-provider.test.mjs", "test/core.test.mjs", "test/research-evidence.test.mjs"]
  },
  "QA-R50": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "src/client/app.js", "src/server/attachments.mjs", "src/server/auth.mjs", "src/server/image-structure.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/store.mjs", "src/server/validation.mjs", "test/fixtures/images.mjs", "test/http.test.mjs", "test/image-structure.test.mjs"]
  },
  "QA-R51": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/forbidden-environment.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/providers.mjs", "src/server/turn-deadline.mjs", "test/claude-process.test.mjs", "test/claude-provider.test.mjs", "test/codex-provider.test.mjs", "test/review-fixes.test.mjs", "test/turn-deadline.test.mjs"]
  },
  "QA-R52": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/server/config.mjs", "src/server/crypto.mjs", "src/server/instruction-bootstrap.mjs", "src/server/instruction-documents.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/private-files.mjs", "src/server/prompt-contracts.mjs", "src/server/providers.mjs", "src/server/store.mjs", "test/local-config-auth.test.mjs", "test/local-store.test.mjs", "test/private-files.test.mjs"]
  },
  "QA-R53": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["package-lock.json", "package.json", "scripts/browser-local-entry.mjs", "src/server/auth.mjs", "src/server/claude-provider.mjs", "src/server/codex-provider.mjs", "src/server/config.mjs", "src/server/crypto.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-setup.mjs", "src/server/password.mjs", "src/server/private-files.mjs", "src/server/providers.mjs", "src/server/read-regular-file.mjs", "src/server/setup.mjs", "src/server/start.mjs", "test/http.test.mjs", "test/local-config-auth.test.mjs"]
  },
  "QA-R54": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "public/index.html", "public/styles.css", "src/client/app.js", "src/server/account-usage.mjs", "src/server/auth.mjs", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/content-policy.mjs", "src/server/forbidden-environment.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/output-safety.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/providers.mjs", "src/server/research-evidence.mjs", "src/server/turn-deadline.mjs", "src/server/usage.mjs", "test/claude-provider.test.mjs", "test/codex-provider.test.mjs", "test/context-economy.test.mjs", "test/review-fixes.test.mjs", "test/usage.test.mjs"]
  },
  "QA-R55": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-logoff.mjs", "scripts/browser-navbar-glass.mjs", "scripts/browser-reading-mode.mjs", "src/client/app.js", "src/client/navbar-glass.js", "src/client/refresh-state.js", "src/server/auth.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "test/refresh-state.test.mjs"]
  },
  "QA-R56": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/server/attachments.mjs", "src/server/configuration-recovery.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/private-files.mjs", "src/server/recovery-cli.mjs", "src/server/recovery.mjs", "src/server/store.mjs", "src/server/usage.mjs", "test/local-store.test.mjs", "test/recovery-cli.test.mjs", "test/usage.test.mjs"]
  },
  "QA-R57": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": [".github/dependabot.yml", ".github/workflows/ci.yml", ".github/workflows/runtime-checks.yml", ".github/workflows/security.yml", "README.md", "package-lock.json", "package.json", "scripts/check-artifacts.mjs", "src/server/auth.mjs", "src/server/config.mjs", "src/server/configuration-recovery.mjs", "src/server/crypto.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-setup.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/password.mjs", "src/server/private-files.mjs", "src/server/read-regular-file.mjs", "src/server/recovery-cli.mjs", "src/server/recovery.mjs", "src/server/setup.mjs", "src/server/start.mjs", "src/server/store.mjs", "test/http.test.mjs", "test/local-config-auth.test.mjs", "test/private-files.test.mjs", "test/project-consolidation.test.mjs", "test/recovery-cli.test.mjs"]
  },
  "QA-R58": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/server/account-usage.mjs", "src/server/auth.mjs", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/forbidden-environment.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/parallel-contract.mjs", "src/server/providers.mjs", "src/server/turn-deadline.mjs", "src/server/usage.mjs", "src/server/validation.mjs", "test/core.test.mjs", "test/http.test.mjs", "test/usage.test.mjs"]
  },
  "QA-R59": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "src/client/app.js", "src/server/auth.mjs", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/content-policy.mjs", "src/server/forbidden-environment.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/output-safety.mjs", "src/server/parallel-contract.mjs", "src/server/providers.mjs", "src/server/research-evidence.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "test/claude-process.test.mjs", "test/claude-provider.test.mjs", "test/codex-provider.test.mjs", "test/http.test.mjs", "test/local-store.test.mjs", "test/review-fixes.test.mjs", "test/turn-deadline.test.mjs"]
  },
  "QA-R60": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "instructions/WORKING_CONTEXT.md", "public/index.html", "public/styles.css", "scripts/browser-model-settings.mjs", "src/client/app.js", "src/server/auth.mjs", "src/server/index.mjs", "src/server/instruction-bootstrap.mjs", "src/server/instruction-documents.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/providers.mjs", "src/server/store.mjs", "test/http.test.mjs", "test/local-store.test.mjs", "test/prompt-contracts.test.mjs"]
  },
  "QA-R61": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "public/index.html", "public/styles.css", "src/client/app.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/conversation-export.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/store.mjs", "test/parallel-consultation.test.mjs", "test/prompt-contracts.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-R62": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["scripts/browser-active-discussion.mjs", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/forbidden-environment.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/providers.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "test/claude-provider.test.mjs", "test/codex-provider.test.mjs", "test/parallel-consultation.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-R63": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/research-evidence.mjs", "src/server/store.mjs", "test/context-economy.test.mjs", "test/parallel-consultation.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-R64": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/store.mjs", "test/local-store.test.mjs", "test/parallel-consultation.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-R65": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/client/app.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/store.mjs", "test/parallel-consultation.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-R66": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["instructions/AGENTS.md", "instructions/CONSILIUM.md", "instructions/CONSULTING_PLAYBOOK.md", "instructions/RUNTIME_PROMPTS.md", "public/index.html", "public/styles.css", "scripts/benchmark-critic-cache.mjs", "scripts/benchmark-research.mjs", "scripts/browser-usage.mjs", "scripts/measure-consultation-workload.mjs", "src/client/app.js", "src/server/account-usage.mjs", "src/server/child-process.mjs", "src/server/claude-provider.mjs", "src/server/claude-runtime.mjs", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/content-policy.mjs", "src/server/forbidden-environment.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/output-safety.mjs", "src/server/parallel-contract.mjs", "src/server/prompt-contracts.mjs", "src/server/provider-context.mjs", "src/server/providers.mjs", "src/server/research-evidence.mjs", "src/server/store.mjs", "src/server/turn-deadline.mjs", "src/server/usage.mjs", "test/account-usage.test.mjs", "test/context-economy.test.mjs", "test/usage.test.mjs"]
  },
  "QA-R67": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["src/server/configuration-recovery.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/private-files.mjs", "src/server/recovery-cli.mjs", "src/server/recovery.mjs", "src/server/research-evidence.mjs", "src/server/store.mjs", "test/local-store.test.mjs", "test/parallel-consultation.test.mjs", "test/recovery-cli.test.mjs", "test/review-fixes.test.mjs"]
  },
  "QA-S01": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-local-entry.mjs", "scripts/browser-logoff.mjs", "src/client/app.js", "src/server/auth.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-setup.mjs"]
  },
  "QA-S02": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-progress-recovery.mjs", "scripts/browser-reading-mode.mjs", "scripts/browser-usage.mjs", "src/client/app.js", "src/client/navbar-glass.js", "src/client/theme.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/parallel-contract.mjs", "src/server/store.mjs", "src/server/usage.mjs"]
  },
  "QA-S03": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/styles.css", "scripts/browser-check.mjs", "src/client/app.js", "src/client/refresh-state.js", "src/server/index.mjs", "src/server/store.mjs"]
  },
  "QA-S04": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-model-settings.mjs", "scripts/browser-provider-connection.mjs", "src/client/app.js", "src/server/auth.mjs", "src/server/index.mjs", "src/server/instruction-bootstrap.mjs", "src/server/instruction-documents.mjs", "src/server/local-request.mjs", "src/server/prompt-contracts.mjs", "src/server/providers.mjs", "src/server/store.mjs"]
  },
  "QA-S05": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-active-discussion.mjs", "scripts/browser-check.mjs", "src/client/app.js"]
  },
  "QA-S06": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-check.mjs", "src/client/app.js", "src/server/auth.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/research-evidence.mjs", "src/server/store.mjs", "test/research-evidence.test.mjs"]
  },
  "QA-S07": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-reading-mode.mjs", "src/client/app.js", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/parallel-contract.mjs", "src/server/store.mjs"]
  },
  "QA-S08": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-check.mjs", "scripts/browser-markdown-tables.mjs", "src/client/app.js", "src/client/markdown.js", "src/server/auth.mjs", "src/server/conversation-export.mjs", "src/server/index.mjs", "src/server/local-request.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/recovery.mjs", "src/server/store.mjs"]
  },
  "QA-S09": {
    "required": true,
    "level": "integration",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/conversation-list.css", "public/index.html", "public/nanoduck-original.svg", "public/nanoduck.svg", "public/styles.css", "scripts/browser-local-entry.mjs", "scripts/browser-logoff.mjs", "scripts/browser-theme.mjs", "src/client/app.js", "src/client/navbar-glass.js", "src/client/theme.js", "src/server/auth.mjs"]
  },
  "QA-U01": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-check.mjs", "src/client/app.js"]
  },
  "QA-U02": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-check.mjs", "src/client/app.js", "src/server/codex-provider.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/content-policy.mjs", "src/server/output-safety.mjs", "src/server/parallel-contract.mjs", "src/server/provider-context.mjs", "src/server/research-evidence.mjs"]
  },
  "QA-U03": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-model-settings.mjs", "src/client/app.js", "src/server/consultation.mjs", "src/server/instruction-bootstrap.mjs", "src/server/instruction-documents.mjs", "src/server/prompt-contracts.mjs", "src/server/providers.mjs", "src/server/store.mjs"]
  },
  "QA-U04": {
    "required": true,
    "level": "release",
    "evidence_mode": "real_consumers",
    "required_source_paths": ["public/index.html", "public/styles.css", "scripts/browser-reading-mode.mjs", "scripts/browser-send-retry.mjs", "src/client/app.js", "src/client/markdown.js", "src/server/configuration-recovery.mjs", "src/server/consultation-parallel.mjs", "src/server/consultation.mjs", "src/server/conversation-export.mjs", "src/server/local-state.mjs", "src/server/local-store.mjs", "src/server/parallel-contract.mjs", "src/server/private-files.mjs", "src/server/recovery-cli.mjs", "src/server/recovery.mjs", "src/server/store.mjs", "test/recovery-cli.test.mjs"]
  }
}
```
