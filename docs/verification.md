# Verification

## Composer and incoming sound correction · 22 September 2026

The [scoped runtime receipt](../forge/runs/composer-sound-20260922/runtime-verification.json) binds the current working source and test hashes to this correction. On macOS, Node 24.16.0 (`npm run check`) and Node 22.23.2 (`node scripts/test.mjs`) each passed 173 of 175 tests, with zero failures and two Windows-only skips. The artifact checker passed 23 Markdown files, 77 JavaScript syntax checks and three retained candidates.

Integrated application checks passed in installed Chrome, Chromium, Firefox, WebKit. These are real automated browser runs with isolated synthetic application records. They cover the hidden active composer, a square Stop separated from Send and reachable across consultation tabs and scrolling, Stop/Continue with draft and image preservation, restoration after failure/completion, and rejection of a stale active polling response after Stop. Existing consultation, retry, refresh, history and Logoff privacy regressions also passed. A final test-only 10-second bound on the synthetic polling wait was syntax-checked afterward; its fresh execution awaits CI, while the exercised runtime bytes are unchanged.

Sound checks verified saved preferences on entry without Settings, silence for saved Off and duplicate/history/owner/System events, and delayed native media playback on one reused player. Browser autoplay denial was explicitly simulated to verify visible recovery; Enable sound then used real playback. The exact accepted Knock v5 recording remains unchanged. Native media playback and decoding do not establish physical iPhone/iPad audibility, device mute behavior or background delivery; those and native Safari remain unverified.

The already-running local server returned matching current public assets over HTTPS validated against its existing local CA. It was not restarted, and this check read no private conversation, changed no private state and made no real provider call. Browser refresh and listening on the owner's device remain separate observations.

The SDD audit and implementation gate passed for the reconciled scoped override. All 83 formal QA checks remain prepared/not_run and six release gates remain not_evaluated; this evidence does not replace their complete manual, device or representative-user criteria. Earlier cross-platform results below remain dated evidence for their identified revision.

## Earlier local application refactor

The local application passed the [cross-platform application checks](https://github.com/Ingwarski/NanoDuck-AI-Consulting/actions/runs/35731160632) at runtime commit `34966f398944e1daebed7d185f25a2b00538b6eb`. All six Linux, macOS and Windows jobs passed on Node 22 and 24. Platform-specific skips are recorded explicitly:

| CI operating system | Node | Passed / total | Skipped |
|---|---|---|---|
| Linux | 22 | 166 / 168 | 2 |
| Linux | 24 | 166 / 168 | 2 |
| macOS | 22 | 166 / 168 | 2 |
| macOS | 24 | 166 / 168 | 2 |
| Windows | 22 | 159 / 164 | 5 |
| Windows | 24 | 159 / 164 | 5 |

The artifact checker passed 23 Markdown files, 73 JavaScript syntax checks, three active candidates, links and static references. Local macOS Node 22.23.2 and 24.16.0 runs each reported 168 tests: 166 passed, zero failed and two Windows-only skips. The [runtime receipt](../forge/runs/local-refactor-20260922/runtime-verification.json) binds the exact source snapshot and detailed results; job counts differ because platform-specific subtests apply on different systems.

Integrated automated flows passed in Chromium, Firefox and WebKit on Linux, installed Edge on Windows, and installed Chrome locally. They exercised local password, per-session consent, a complete synthetic consultant/Critic discussion, lost-response retry while editing a draft with an attached image, Outcome, reload, saved history, Settings save, explicit unavailable usage, no unused-provider warning, 390px layout without overflow, the voice dialog/typing fallback and connected/offline Logoff. Offline Logoff immediately cleared private content, blocked delayed responses, kept reload locked until confirmed revocation and prevented browser Back from revealing private content. Incomplete session responses and unexpected logout responses did not clear the lock. These use the actual application with synthetic provider subprocesses and establish neither real provider behavior nor microphone recognition.

Tests also covered bounded PNG/JPEG/WebP container validation with real encoder samples, progressive JPEG and animated WebP; encrypted persistence, private permissions and single-process ownership; and offline backup/restore with absent TLS files, preserved deletion decisions and active-process refusal. Structural acceptance does not establish full pixel-decoder validity or malware safety. HTTPS login through an actual private LAN interface used a client on the same physical computer. Node HTTPS clients verified the exact generated CA; automated browser profiles ignored certificate errors, and no trust store was changed.

The security and CodeQL runs linked in the receipt passed, and the observed open code-scanning, dependency and secret-alert counts were zero. These are scoped automated findings, not a complete security-assurance claim.

The [SDD audit](../forge/runs/local-refactor-20260922/sdd-audit.json) and implementation gate pass for 13 current documents, 60 requirements, 17 security clauses, nine surfaces and 44 states. All 83 formal QA checks remain prepared/not_run and six release gates remain not_evaluated: automated results support relevant checks without satisfying every required observation. Frozen Electric A v8 remains limited visual evidence.

Native Safari, separate physical Wi-Fi devices, physical mobile/microphone use, per-device certificate trust installation, real provider entitlement/consultations, representative-owner tasks and assistive-technology observations remain unverified. Browser engines and emulated viewport sizes do not replace those results.
