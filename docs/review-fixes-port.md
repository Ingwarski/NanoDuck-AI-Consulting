# Sister-repository prompt: consultation review repairs (26 September 2026)

Use the following prompt in each sister repository separately. This document is an implementation specification, not permission to change another checkout from the source repository. It requires no private consultation history.

---

Fix the consultation orchestration and browser continuity defects below **in the current target repository only**. First verify its Git root, remote, working tree and instructions. Create a target-local repair branch if appropriate. Preserve unrelated edits. Do not modify another repository, copy private data, reset history, replay a real user's request, change selected models/reasoning, enable paid fallback, or restart/deploy an active consultation.

The reference implementation is the local `codex/consultation-review-fixes` branch of `Ingwarski/NanoDuck-AI-Consulting`; do not assume that branch has been published. This prompt is self-contained. If a patch is supplied, inspect differences before adapting code. Preserve the target's own hosting, authentication, origin/CSRF controls, database, subscription grants and visual baseline. This is a behavioral port, not a replacement of the target with the local SQLite application. If files differ, locate equivalent functions and record the mapping. Retain legacy accepted-run contracts and saved snapshots. The updated reader accepts old ledgers; an older reader may not understand linked-order closure. Keep a protected pre-upgrade backup and do not downgrade a store containing new linked attempts to an incompatible binary. Do not delete new private records to make a rollback appear successful.

## 1. Make unresolved Critic orders actionable in later rounds

Files: `src/server/consultation-parallel.mjs`, `src/server/parallel-contract.mjs`; equivalent store commit validation and durable run-snapshot serialization.

Remove the filter that discards a finding whenever the consultant has any `open`/`blocked_evidence` order. It suppresses different defects and prevents another correction after Critic rejects the first reply. Do not simply remove the filter while leaving historical unresolved orders to block closure forever.

Implement one linked correction attempt per affected consultant per selected review round:

- Retain existing immutable order IDs, defective-result message IDs, response IDs, Critic assessments and reasons.
- A new attempt references currently unresolved predecessor IDs in `previousOrderIds`. Carry their exact issue/correction prose plus new findings. Group into one consultant reply; never launch concurrent corrections for the same consultant.
- Keep an atomic `directives` list of `{issue, correction}` entries and deduplicate exact pairs before joining display text. This avoids recursively repeating an already combined order every round. For legacy orders without this optional field, treat their existing issue/correction as one entry.
- Validate links point backward to assessed unresolved orders for the same assignment, with only one successor per predecessor. Freeze linkage and directives on subsequent transitions. Reject forged/cross-assignment links and changes to old assessments.
- `activeOrders(work)` excludes linked predecessors from the current unresolved set. Historical predecessors remain recorded as open/blocked; they are not relabeled successfully resolved. The newest attempt carries their obligations and needs its own Critic assessment.
- Use active orders in Critic/Head context, provisional closure and `validateParallelWork` consensus validation. A response alone cannot resolve anything; only a matching Critic assessment may do so.
- Resume missing responses/assessments from checkpoints. Preserve fixed 1/3/5 rounds and Auto's existing ceiling of ten; do not add a hidden infinite correction loop or extra full final round.

## 2. Pass actual Critic summaries to Head

File: `src/server/consultation-parallel.mjs`, near Auto review decisions and `head_final` construction.

Load each persisted round's `reviewMessageId` from the confirmed event stream. Include the actual summary and its source metadata in Head's review-decision and final-synthesis context, alongside current consultant answers and active order assessments. With `findings: []`, Critic's qualifications must still reach Head. Do not replace the assessment with “review completed” or infer agreement merely from no orders. Preserve conditions and provisional advice.

## 3. Schedule by completed dependencies, not whole batches

File: `src/server/consultation-parallel.mjs`, initial consultant execution loop.

Replace `await Promise.allSettled(ready.map(runPosition))` as a readiness barrier with a map of running assignment promises. Re-read committed results after any promise settles and launch newly eligible tasks immediately. Avoid duplicate launches and replay of already saved results. A dependent of fast A must start while unrelated slow B is still running. On failure, stop scheduling additional work, drain already started siblings, retain their commits and report the original failure. Keep generation/abort checks around invocation and commit.

## 4. Honor accepted specialist and role instructions

Files: `src/server/consultation-parallel.mjs`, `src/server/prompt-contracts.mjs`.

Render `prompts.specialistPosition({specialist, assignedBrief, language})` and `prompts.specialistReply({specialist, language})` from the accepted runtime-instruction snapshot. These render saved Specialist Position/Reply, Universal Response Standard and selected role guidance, including Spiritual Consultant and Psychotherapist boundaries. Supplement with Head's private case-specific guidance and exact task. Do not merely pass `runtimeInstructions` to the adapter: that does not render these sections. Avoid adding the exact task twice if the template already includes it. Keep role guidance private and saved edits applicable only to future accepted runs.

## 5. Align role identity and persistence

Files: `src/server/parallel-contract.mjs`, `src/server/recovery.mjs`, target schema/migrations if present, owner-context filtering in `consultation-parallel.mjs`.

Use the existing role/recipient persistence maximum of 64 characters when accepting a plan. Reject internal actor collisions case-insensitively after trimming: `owner`, `System`, `Head Consultant`, `Critic`. Tell Head these transport constraints in its plan prompt. Use the existing single structural repair to correct invalid metadata while preserving task prose; do not introduce generic fallback tasks or a profession allowlist.

Identify genuine owner context by `role === "owner"` **and no recipient**. Legacy generated `owner → Critic` messages must not become owner requests on the next run. Do not rewrite their historical transcript. Test the target's actual durable store/recovery contract, not only an in-memory parser.

## 6. Restore sensitive-output rejection

Files: `src/server/consultation-parallel.mjs`, existing `content-policy.mjs`/output-safety boundaries.

After a successful provider result, validate the entire response body and source metadata for existing secret-like patterns before parsing into work, committing, or forwarding to another agent. Return the existing safe output-policy failure without including the sensitive content in diagnostics or a repair prompt. Keep tool-trace rejection, language-fragment policy and URL validation. Do not reintroduce blanket phone-number blocking or arbitrary message truncation: a normal public contact number remains permitted output.

## 7. Preserve sources between participants and in the visible record

File: `src/server/consultation-parallel.mjs`; target Sources/history/export consumers if they differ.

Reconstruct result evidence from its stored message ID, including source title, direct URL, supported claim, retrieval date and optional publication date. Apply this to dependency inputs, Critic's team review, a consultant's previous answer, defective/corrected answers in fulfillment assessment, and Head synthesis. Plain answer body alone loses citations because adapters remove structured source tags from it.

Include shared research evidence in correction assessments too. For the final visible message, merge validated Head sources, all initial/follow-up research sources and confirmed participant sources. Deduplicate by URL plus supported claim, retaining distinct claims for the same page; apply the same key in the client Sources renderer so it does not collapse those claims again. Remove the ternary that uses Head's sources instead of all research whenever Head cites anything. Sources must remain available through events, Sources view, history and export; a private ledger alone is insufficient.

## 8. Allow Critic to request bounded follow-up research

Files: `src/server/parallel-contract.mjs` (`parseTeamReview`), `consultation-parallel.mjs`, ledger validation/serialization if the target allowlists round fields.

Extend team-review JSON with optional `researchRequest: string | null` describing the concrete evidence gap. Missing fields from older records remain valid. When present:

1. Invoke the exact selected Head route with output kind `research_query` to form a minimized public query, or `[RESEARCH: NONE]` if public research cannot help.
2. Validate the actual outgoing query with the existing public-query boundary. Contacts, credentials, private/unsafe destinations and query parameters cannot silently pass. A phone number elsewhere in owner context must not disable an otherwise safe query.
3. Send only the safe query, public instructions and empty private discussion to the existing web-enabled Codex research route. Claude Critic stays text-only and tool-free.
4. Persist the research outcome on that round before rework. At most one follow-up search per selected round, including the last round; no extra substantive review round. Successful or unavailable outcomes survive retry/restart without replay. Never claim an unavailable/unsafe search completed.
5. Include updated research and source metadata in corrections, assessments, subsequent reviews and final advice. Existing initial research remains available.

Do not add a generic search to every turn. Critic identifies the gap, Head forms the query, the application enforces the existing transfer/tool boundary.

## 9. Recover browser progress after network errors

Files: `src/client/app.js`, `public/index.html`, target equivalent status surface.

Replace “catch → stopPolling forever” with a single pending progress read and scheduled retries. Keep a healthy 2-second cadence; cap exponential retry delays at 30 seconds and use a 15-second read timeout. Display an accessible connection status stating that reconnect is automatic and saved messages remain preserved. Clear it on success. Retry network errors, timeout/408, 429 and server errors; authentication and permanent client errors need their actual recovery action, not an endless loop.

Fence every asynchronous response by poll generation, conversation identity and authenticated session. Stop/logout/conversation replacement cancel future retries and prevent late responses from restoring private content or active controls. Preserve message-ID notification deduplication and unsent drafts. Do not change the Stop design or sticky tabs.

## 10. Prevent slow Usage requests from starving rendering

File: `src/client/app.js`, `loadUsage` and polling integration.

Coalesce in-flight usage requests by session generation, conversation and scope. A poll must not increment the current request generation and discard a valid pending response for the same selection. Scope/conversation/session changes still invalidate obsolete responses.

Render the completed response, then perform at most one coalesced trailing refresh if updates were requested while it was pending. This trailing refresh matters when the consultation completes during a slow request: stopping progress polling must not leave the final count stale. Release the pending marker on success/error/timeout; use a bounded read timeout. Keep unknown historic counts, privacy, exact provider usage and scope semantics intact. If the target has not implemented Usage yet, record that prerequisite and port the existing usage feature first rather than inventing a counter.

## Required regressions and evidence

Adapt `test/review-fixes.test.mjs`, the existing parallel/store/provider tests, and `scripts/browser-progress-recovery.mjs` to the target. Verify:

- Three reviews: first correction remains open, second review introduces a different defect, one linked reply carries both, Critic resolves it, historical assessment is unchanged and genuine consensus can complete. Tampered linkage is rejected.
- A dependent starts before an unrelated held worker finishes; Stop/failure/retry retain fencing and successful siblings.
- Saved position/reply/role markers reach the actual prompt; role guidance stays out of visible assignments.
- 64-character role round-trips; 65-character/reserved roles trigger bounded metadata repair; a legacy generated owner-role message is not counted as owner input.
- Synthetic credential output never persists or reaches another agent; ordinary phone output is accepted.
- Critic summary reaches both Auto Head and final Head with no findings. Metadata-only source URLs reach Critic/Head, corrections and assessments.
- Initial research, follow-up research, specialist and Head sources all survive final events and the target's export.
- Follow-up research gets no private discussion/guidance, unsafe queries are withheld, and encrypted/database restart after a correction but before assessment replays neither the reply nor saved research.
- Actual Chromium, Firefox and WebKit fixture sessions recover from one failed poll, render usage delayed longer than polling, coalesce pending reads, preserve sticky navigation/reflow and fence Stop/logout/stale scopes. Test final-count refresh after completion during a slow read.

Run the target's complete check/test suite and applicable real-browser suites in isolated synthetic storage. Do not use production records, real credentials or paid provider calls for these regressions. Report skips and test limitations honestly. A test suite pass is not production deployment, physical-device verification or representative-user validation.

Reconcile affected architecture → DoD → QA → development-plan owners and manifest bindings under the installed SDD contract. Reuse the approved baseline; this repair restores existing behavior. Keep formal release readiness `not_evaluated` unless all separate release criteria are actually evaluated. Create an implementation/verification receipt containing changed file hashes, commands, observed results and limitations. Inspect the final diff and commit only target-owned changes under that repository's instructions. Report any runtime activation still needed; never interrupt active work merely to activate the patch.
