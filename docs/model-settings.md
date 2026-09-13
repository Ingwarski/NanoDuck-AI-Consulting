# Model preservation record

13 September 2026. This is a design/migration reference, not live configuration.

The existing live-review report dated **7 September 2026** records:

| Field | Recorded value |
|---|---|
| Head/specialist provider | `codex` |
| Head/specialist model | `gpt-6-astra` |
| Head/specialist reasoning | `xhigh` |
| Critic provider | `codex` |
| Critic model | `gpt-6-astra` |
| Critic reasoning | `ultra` |
| Speed | `збалансовано` (balanced) |

**Do not silently change Critic ultra to xhigh.** The code's bootstrap defaults are different: provider default/first model for consultants with null effort, Astra/xhigh for Codex Critic and balanced speed (`src/godaddy/runtime-bootstrap.ts:52–63`). Null means provider default, not medium. Inactive Claude model/effort preferences are unknown and must not be invented from the list of supported candidates.

The current source pins `@openai/codex` to `0.153.1` and `@anthropic-ai/claude-code` to `2.1.258`. It dynamically discovers capabilities. Do not replace that discovery with a speculative hard-coded list. The rejected initial prototype offered only the recorded Astra example. The three revision-2 candidates now demonstrate selection using a copied, read-only local desktop Codex `model/list` catalog observed on 13 September: see [catalog evidence](../forge/design/evidence/local-model-catalog-20260913.json). This is local discovery evidence, not proof of the deployed app catalog or execution entitlement. It does not change the preserved initial selections. Production must continue to discover provider capabilities dynamically.

Preserve independent consultant settings and Critic provider/branch settings, the selected preset, and immutable effective settings for a running consultation. Changing preferences affects future runs. Keep the no-API-key/PAYG/automatic-credit/Claude-Fast-Mode rule.

Current speed policies (`src/settings/speed-policy.ts:57–75`) use specialist caps/concurrency 2/3/5 for fast/balanced/thorough, one configured critique-revision cycle and a 540,000 ms provider budget. The adaptive router separately limits Critic messages to seven per specialist; the single policy field does not describe the entire current discussion loop.

Before implementation/cutover, read the current saved settings without private conversation content, including the inactive branch. Verify each exact active `(provider, model, effort)` separately. The existing Astra entitlement probe at xhigh is not independent execution proof for ultra. If an exact selection cannot run, preserve it, report the limitation and obtain a decision; never substitute a model/effort just to pass readiness.
