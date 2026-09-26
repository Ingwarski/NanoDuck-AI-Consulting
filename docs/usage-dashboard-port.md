# Port U-13: actionable usage dashboard

Apply only to the target sister repository. Preserve its hosting, authentication,
provider choices, SDD owners and private storage. Do not copy local grants or
conversations. This unit changes accounting visibility, not model prompts or
subscription billing.

1. In `src/server/usage.mjs`, normalize optional attribution alongside attempts:
   request ID, participant ID/role, and initial/retry/correction/follow-up research
   purpose. Keep older absent fields null. Include attribution in call details.
   Aggregate by provider, accepted request, participant and stage from the same
   attempt list. Sum repeat-work as a union, never add overlapping categories.
   Rank groups by reported total. Coverage is running if an attempt is active,
   otherwise partial if usage is missing/interrupted/partial, otherwise complete.
   Complete covers base totals, not every optional metric.
2. In `consultation.mjs`, bind callbacks to the accepted request message ID;
   Continue retains that ID. Attach participant metadata before storage. Track
   native attempt IDs per invocation to recognize provider-internal retries.
   In `consultation-parallel.mjs`, pass dynamic assignment role/ID, tag structure
   and policy retries, consultant corrections and follow-up research. Do not
   derive roles from model names or copy the assignment text into telemetry.
3. In `store.mjs`, preserve immutable attempt attribution across updates, include
   conversation identity in summary grouping, and retain deletion filtering.
   Keep backward compatibility with encrypted saved/recovery records. Historical
   records cannot be assigned invented request or participant identities.
4. Add `account-usage.mjs`: sanitize native limit windows and provide single-flight
   refresh with a 60-second TTL, retaining the last successful reading as stale
   on failure. In `codex-provider.mjs`, use authenticated `account/read` then
   `account/rateLimits/read` with a 10-second cancellation deadline and guaranteed
   cleanup. Prefer named limit buckets over the legacy bucket. Return only numeric
   windows, safe bucket names and timestamps; no account identity or raw payload.
   Do not start inference to refresh allowance. Claude's existing noninteractive
   result does not provide the documented interactive status-line percentages:
   link to `https://claude.ai/settings/usage` rather than calling private endpoints
   or estimating a percentage. Recheck the target adapter's supported telemetry.
5. Expose `/api/account-usage` behind the same session/origin protections as Usage.
   Keep it independent of `/api/usage` so unavailable accounts do not hide tokens.
6. Update `src/client/app.js`, `public/index.html`, `public/styles.css`: separate
   Codex/Claude cards, show uncached input, cache reads, cache-hit percentage and
   output immediately. Show Claude creation and supplied reasoning as subsets.
   Keep combined raw total secondary. Show account-wide percentage/reset/checked
   time separately. Add ranked request/participant/activity groups, repeat-work
   explanation, completeness, and timed chronological attempts with a request
   selector. Retain expandable raw accounting provenance. Clear allowance UI on
   logoff and reject stale asynchronous responses after privacy generation changes.
   Missing values differ from zero; input minus cache reads is uncached input,
   never inferred cache writes or subscription consumption.
7. Extend `test/usage.test.mjs`, add `test/account-usage.test.mjs`, test the native
   provider account read, and extend `scripts/browser-usage.mjs`. Cover overlap,
   unknown legacy attribution, running/partial status, cache TTL/stale handling,
   numeric allowlists, responsive layout, refresh errors and privacy cleanup.
   Verify Chromium, Firefox and WebKit and reconcile affected SDD descendants.
   Publish only after checking the final diff. Activate without interrupting runs.

Physical cache storage, exact subscription deductions and missing historical
telemetry cannot be reconstructed from these counters. Provider-reported token
usage stays authoritative. A verified zero cache-write counter means accounting
zero, not proof that nothing was physically cached.

## Reasoning attribution follow-up

Record the selected effort in adapter `beginUsage` diagnostics (`effort` and
`effortSource: request`) for Codex and Claude. Claude records its effective CLI
value after mapping Extra to xhigh. Allowlist these fields in `usage.mjs`, group
model totals by provider/model/effort, and expose the effort in individual calls.
Show it beside each model in provider cards, detailed model rows, activity rows
and the timeline. Do not confuse this setting with reasoning-output token counts.

For older records, a read-only summary enrichment may use the immutable saved
run configuration only when there is exactly one owner request, its ID matches
the snapshot, the attempt follows its timestamp, any recorded request ID matches,
and stage/provider/model identify the route. Preserve an existing recorded effort.
Otherwise show unknown; never use today's settings to label yesterday's calls.
Test mixed efforts on one model, unchanged totals, mismatched snapshots and
multi-request histories. Compare saved runs before spending tokens on new probes;
report consultant count, research actions, corrections, cache use and latency,
and distinguish observed differences from causal or quality claims.
