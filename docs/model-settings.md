# Model settings

22 September 2026. These are preserved user selections, not proof of current
provider availability or a completed model call.

| Role | Provider | Model | Reasoning |
|---|---|---|---|
| Head and specialists | Codex | `gpt-6-astra` | `xhigh` |
| Critic | Codex | `gpt-6-astra` | `xhigh` |

GPT-6 Sol (`gpt-6-sol`) is an additional explicit Codex choice for both
Head/shared specialists and Critic. The authenticated Codex `0.155.1` catalog
reports `low`, `medium`, `high`, `xhigh`, `max` and `ultra`, with `medium` as the
provider default. These supported choices do not change NanoDuck’s preserved
Astra / `xhigh` selections or any saved preference. The earlier `0.153.1` catalog
did not expose this exact model; `gpt-5.6-sol` is distinct and is never a substitute.
See the [bounded catalog observation](../forge/runs/gpt-6-sol-20260922/catalog-observation.json).
Show the requested model as unavailable if the current authenticated catalog
omits it, and never invent an effort list or infer a completed model call from
catalog presence.

The optional Claude Code Critic branch has no inferred saved preference. When
first selected, it offers Opus 5 (`claude-opus-5`) with High as its initial effort;
available effort labels are Low, Medium, High, Extra and Max. At the isolated CLI
boundary, preserve the exact model ID and map only Extra to `xhigh`. Opus 5.5
(`claude-opus-5-5`) is an additional explicit choice with the same five efforts.
Existing Opus 5 / High and saved Codex selections remain unchanged; adding a model
never selects it automatically. Anthropic defaults Opus 5.5 to Medium, distinct
from NanoDuck’s retained High initial preference. Successful Claude output must
report exactly the selected model in `modelUsage`; missing, mixed or substituted
model identities are rejected. Current packages are pinned to Codex `0.155.1`
and Claude Code `2.1.280`, the minimum documented version for Opus 5.5.

Sources checked on 22 September 2026: [Anthropic release](https://www.anthropic.com/claude-opus-5-5)
and [Claude Code model configuration](https://code.claude.com/docs/en/model-config).
The CLI `opus` alias changes across releases and must not stand in for a saved
exact model ID. An authenticated catalog is not proof of model entitlement,
quota or a completed model call.

Use authenticated subscription capabilities to validate a selected tuple before
accepting it. An unavailable model or expired subscription stays unavailable;
never silently substitute a model or effort. Preserve independent consultant and
Critic settings. Provider authorization belongs to the local CLI, not a browser
form containing credentials. The optional Claude route accepts the current local
user’s ordinary Claude Code subscription sign-in, established with
`npm run claude:login` on the server computer. `CLAUDE_CONFIG_DIR`, when set,
must identify the same native credential location for login and NanoDuck. An
explicit `CLAUDE_CODE_OAUTH_TOKEN` remains a separate isolated mode. Check native
first-party subscription status before selection and each invocation; API-key,
Console-billed and third-party routes cannot qualify. After official sign-in,
Settings → Check connection refreshes availability while preserving unsaved
choices; it neither creates a grant nor proves a model call. See the official
[authentication guide](https://code.claude.com/docs/en/authentication) and
[CLI reference](https://code.claude.com/docs/en/cli-reference). No API-key billing fallback, automatic credits or
Claude Fast Mode is permitted.

Specialist count and discussion depth are separate preferences. Count supports
1, 2, 3, 5 and Auto, excluding Head and Critic. Auto selects one through five
specialists. For the planned U-09 contract, fixed depth selects 1, 3 or 5 team review rounds; Auto lets Head close when useful, up to ten. Only consultants with material findings must reply, and Critic explicitly assesses correction fulfillment. Defaults remain two specialists and one review round. Existing accepted legacy runs retain their original exchange/depth semantics until terminal; this document does not claim U-09 is deployed. Codex uses a 540,000 ms inactivity budget renewed only by matching-turn progress, with a 1,800,000 ms absolute ceiling. Claude retains its 540,000 ms absolute deadline. Exact selected model and reasoning settings never change to work around a timeout.

Each accepted consultation snapshots its exact model, effort, specialist count,
depth and effective instructions. Later preference or instruction changes affect
future work only. Saved local data survives application restarts; this refactor
does not read or import another installation's private records.
