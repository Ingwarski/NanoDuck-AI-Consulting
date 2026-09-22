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
boundary, the model maps to `opus` and Extra maps to `xhigh`. Saved settings and
run snapshots retain the owner-facing values. Current packages are pinned to
Codex `0.153.1` and Claude Code `2.1.258`.

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
