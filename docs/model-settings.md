# Model preservation record

14 September 2026. This is a model-preservation record and content-free capability evidence, not a saved-settings export or live deployment configuration.

## Current local capability read

On 14 September 2026, the replacement checkout's controlled Codex app-server preflight read the current account/catalog/rate-limit state without starting a model turn, creating a conversation, contacting MySQL or changing GoDaddy. It returned `ready` and listed `gpt-6-astra` with both `xhigh` and `ultra` reasoning efforts. The [U-01 capability matrix](../forge/runs/U-01/phase3-local-preflight-20260914/capability-matrix.json) records the content-free result.

This confirms that the current Codex catalog supports the current tuples. It does not independently prove a model invocation at either effort or record actual rate-limit quantities.

## Current saved settings

On 14 September 2026, an authenticated owner session viewed the named current GoDaddy app's Settings screen without changing a value, opening a secret, exporting content or calling a model. Its saved active Codex fields were:

| Field | Current saved value |
|---|---|
| Head/specialist provider | `codex` |
| Head/specialist model | `gpt-6-astra` |
| Head/specialist reasoning | `xhigh` |
| Critic provider | `codex` |
| Critic model | `gpt-6-astra` |
| Critic reasoning | `xhigh` |
| Speed | `збалансовано` (balanced) |

The settings UI labelled the selectable catalog entries unavailable because its catalog snapshot was stale, but the saved raw provider/model/effort values above were present and exact. The inactive Claude branch was not selected or exposed as a saved current value, so it remains unknown. The replacement defaults preserve the verified active Codex values; they do not infer a Claude configuration.

## Historical record

Do not silently substitute a model or effort from an unavailable catalog or from a historical record. Null still means provider default, not medium. Inactive Claude model/effort preferences must not be invented from supported candidate lists.

The current source pins `@openai/codex` to `0.153.1` and `@anthropic-ai/claude-code` to `2.1.258`. It dynamically discovers capabilities. Do not replace that discovery with a speculative hard-coded list. The rejected initial prototype offered only the historical Astra example. The three revision-2 candidates now demonstrate selection using a copied, read-only local desktop Codex `model/list` catalog observed on 13 September: see [catalog evidence](../forge/design/evidence/local-model-catalog-20260913.json). This is local discovery evidence, not proof of the deployed app catalog or execution entitlement. It does not change the current saved selections. Production must continue to discover provider capabilities dynamically.

Preserve independent consultant settings and Critic provider/branch settings, the selected preset, and immutable effective settings for a running consultation. Changing preferences affects future runs. Keep the no-API-key/PAYG/automatic-credit/Claude-Fast-Mode rule.

The legacy source policies (`src/settings/speed-policy.ts:57–75`) used specialist caps/concurrency 2/3/5 for fast/balanced/thorough. NanoDuck uses one/two/three/five selected specialists for Fast/Balanced/Thorough/Ultra while preserving the 540,000 ms provider budget and the ceiling of seven Critic messages per specialist. The single pace field still does not describe the entire discussion loop.

Before cutover, verify each exact active `(provider, model, effort)` separately without private conversation content. The existing Astra entitlement probe at xhigh supports catalog compatibility but is not an invocation proof. If an exact selection cannot run, preserve it, report the limitation and obtain a decision; never substitute a model/effort just to pass readiness.
