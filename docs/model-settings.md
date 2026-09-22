# Model settings

22 September 2026. These are preserved user selections, not proof of current
provider availability or a completed model call.

| Role | Provider | Model | Reasoning |
|---|---|---|---|
| Head and specialists | Codex | `gpt-6-astra` | `xhigh` |
| Critic | Codex | `gpt-6-astra` | `xhigh` |

The optional Claude Code Critic branch has no inferred saved preference. When
first selected, it offers Opus 5 (`claude-opus-5`) with High as its initial effort;
available effort labels are Low, Medium, High, Extra and Max. At the isolated CLI
boundary, preserve the exact model ID and map only Extra to `xhigh`. Opus 5.5
(`claude-opus-5-5`) is an additional explicit choice with the same five efforts.
Existing Opus 5 / High and saved Codex selections remain unchanged; adding a model
never selects it automatically. Anthropic defaults Opus 5.5 to Medium, distinct
from NanoDuck’s retained High initial preference. Successful Claude output must
report exactly the selected model in `modelUsage`; missing, mixed or substituted
model identities are rejected. Current packages are pinned to Codex `0.153.1`
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
form containing credentials. No API-key billing fallback, automatic credits or
Claude Fast Mode is permitted.

Specialist count and discussion depth are separate preferences. Count supports
1, 2, 3, 5 and Auto, excluding Head and Critic. Auto selects one through five
specialists. Depth supports 1, 3, 5 and Auto complete Critic/specialist exchanges
per selected specialist. Auto checks the whole team and stops after supported
agreement or ten exchanges per specialist. Defaults remain two specialists and
one exchange. The provider budget remains 540,000 ms.

Each accepted consultation snapshots its exact model, effort, specialist count,
depth and effective instructions. Later preference or instruction changes affect
future work only. Saved local data survives application restarts; this refactor
does not read or import another installation's private records.
