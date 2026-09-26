# Native usage investigation — 26 September 2026

Read-only verification of runtime accounting after f17c423. No private conversation replay, no runtime restart, and no model/provider changes.

## Critic

The latest saved real-user Critic calls ended at 16:15 UTC, before f17c423 was activated. No saved post-fix real-user Critic invocation existed at inspection time. Historical cache-read zeros cannot be changed retroactively.

A new probe exercised the actual runParallelConsultation coordinator with a synthetic owner request, stubbed Head/consultants and real Claude Opus 5.5/high. Claude identified the deliberately wrong revenue calculation, issued a correction, then assessed the corrected consultant answer. Review: input 4561, cache read 0, cache write 4559, output 344. Correction assessment: input 4627, cache read 3717, cache write 908, output 373. The attached numeric report contains no private owner data. This verifies cache reuse through the real coordinator, not an end-to-end all-live team or a guaranteed future hit rate.

## Sol

A new public synthetic gpt-6-sol/high invocation was observed at the native app-server notification boundary, before NanoDuck normalization. The thread/tokenUsage/updated event reported inputTokens 4941, cachedInputTokens 0, cacheWriteInputTokens 0, outputTokens 33, reasoningOutputTokens 19, totalTokens 4974. NanoDuck preserved exactly those numbers. No richer usage event was emitted in this probe.

The pinned Codex v0.155.1 parser declares cache_write_tokens with serde(default), converting a missing upstream field to zero before the app-server notification. Thus a zero at NanoDuck's boundary cannot establish whether upstream measured zero or omitted it. The parser does preserve a positive supplied value. The generated app-server schema also defaults cacheWriteInputTokens to zero. The internal RawResponseCompleted schema uses the same already-normalized TokenUsageBreakdown and therefore does not restore field presence; its description is internal-only, not an alternative supported public billing source.

Source: https://github.com/openai/codex/blob/rust-v0.155.1/codex-rs/codex-api/src/sse/responses.rs (ResponseCompletedUsage conversion and ResponseCompletedInputTokensDetails).

Official API documentation exposes usage.input_tokens_details.cache_write_tokens, but this app uses the ChatGPT subscription Codex route, not a metered API route: https://developers.openai.com/api/docs/guides/prompt-caching . API availability does not prove availability on the subscription transport.

Input minus cached input is uncached input, not a measurement of cache writes. No fabricated counter, retrospective rewrite or paid-route switch was made. Exact input/output/reasoning/cache-read figures remain available; a definitive cache-write number requires upstream field-presence-aware telemetry or another supported subscription accounting source. No such source was established in this investigation.

## Correction from deeper investigation

The earlier conclusion about RawResponseCompleted was incomplete. Although its `usage` field is normalized, `usageMetadata.metadata` preserves the original upstream usage object. Enabling the pinned experimental thread option reveals that metadata. A subsequent real subscription probe explicitly included `input_tokens_details.cache_write_tokens: 0`, confirming provider-reported zero for that call. Original probes did not enable that event.

The application now reads numeric upstream usage through this opt-in and records provenance without persisting raw events. Official Codex credit billing has no separate cache-write charge (https://learn.chatgpt.com/docs/pricing#token-rates); API-key accounting differs. This does not prove physical cache writes absent. The follow-up evidence is in ../upstream-usage-20260926/verification.json.
