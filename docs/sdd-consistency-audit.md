# SDD consistency audit

13 September 2026. Review of the corrected design-stage documents; this report records observations and does not own product requirements, architecture or approval.

The 12 canonical pre-design documents pass the installed pipeline audit. Their owners, required-before edges, invocation/output identities and consumed-source hashes match the machine contract. The context and canonical-terms pair remains one invocation with two outputs. All 30 reachable installed skill/reference resources resolve. The pipeline skill repository remains clean and unchanged.

## Corrections

| Issue | Owning correction |
|---|---|
| Product brief linked the rejected green prototype as the new candidate. | Product-idea owner labels it historical and points to the current review inventory as a later lookup. |
| Product evidence was read without current source bindings. | Product-idea owner declares review, model and deployment evidence plus rejected design material; orchestrator records exact hashes. |
| Explicit Critic request was lost between intent and requirements. | PRD owner restores it in UC-002, FR-02.3 and AC-002; QA-R05 verifies the separate invocation even for a simple question. |
| Source revision labels and future-generation wording were stale. | Product-idea, PRD and context owners replace them with current or durable ownership wording. |
| Screen map gave architecture ownership of user-facing routes. | Screen-map owner retains those routes; architecture owns API/runtime paths and hosting. |
| Canonical surface locations were described as identical candidate hashes. | Screen-map owner records observed v1 fragment/overlay differences without changing required states or frozen files. |
| Design brief described completed v1 freeze and heuristic review as future work. | Design owner records the existing evidence and retains the proposed, unapproved baseline. |
| DoD referenced an absent PRD severity glossary and condensed it inconsistently. | PRD owner records the shared P0–P3 scale; DoD references that definition. |
| QA/DoD status mixed prepared formal checks with prototype observations. | Owners separate the 82 unexecuted definitions from limited v1 observations; runtime prerequisites apply before execution. |
| Repository guidance and a historical verification link targeted the wrong design generation. | Repository guidance points to active versioned candidates; the rejected design links its own historical evidence. |
| Design execution used a non-contract state value. | Orchestrator uses the prescribed state values and records the actual browser blocker separately. |

Revalidation followed the required-before order. Stable JOB, UC, requirement, state, gate and check IDs were preserved; the 17 security obligations and pinned ASVS assessment were not weakened. Later references did not become creation dependencies. The original v1 candidate files, input snapshots and receipts remain preserved.

## Verification and remaining boundary

- Canonical `sdd_check.py --audit`: **passed**, no issues or warnings.
- Before/after owner checks: **passed** after current return metadata and the QA index were integrated.
- Ownership, dependency, consumption and installed-link audit: **passed**.
- Local artifact checks: **passed**; exactly three active candidates, with historical versions retained.
- v2 render reuse: **exact byte equality** with v1 for all nine HTML/CSS/JavaScript files. New v2 routes and Settings were checked in the Codex in-app browser; the comparison embeds the three current routes.
- Formal QA: **82 prepared / not_run**. No production security, representative-user or release pass is claimed.
- `prototype-candidates` after-check: **blocked only by `browser_receipt`**. The Mac is locked, so the required separate visible Safari review of v2 has not occurred. Successful v1 Safari receipts were not relabelled.

Current operational evidence is in [the audit receipt](../forge/design/evidence/sdd-consistency-audit-20260913.json), [verification](verification.md) and [the manifest](../forge/sdd-manifest.json). Unlocking the Mac permits the remaining Safari check. Whole-design approval, post-approval reconciliation, planning and a later explicit implementation prompt remain separate steps. No GoDaddy operation was performed.
