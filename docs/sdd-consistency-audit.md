# SDD consistency audit

## Current runtime-instructions state — 15 September 2026

The owner instruction document exists only as encrypted current and version records in the application database. There is no checked-in instruction document or startup baseline. A fresh owned database can receive one validated document through the one-time `RUNTIME_INSTRUCTIONS_BOOTSTRAP_B64` deployment secret during migration; the secret is removed afterwards. Settings exposes the current document, metadata-only saved-version list, owner-only read-only review, and explicit restore that creates a fresh revision. Current and historical document text uses the existing data-encryption key; metadata remains separate. Deterministic tests cover encryption, optimistic stale-save protection, history and restore. A local browser owner session also saved a valid test-only contract revision, reviewed the encrypted bootstrap version, and restored it as a new current revision. Hosted MySQL durability, deployment configuration, provider behavior and release gates remain unverified, and no GoDaddy resource has been touched.

## Prior current-state snapshot — historical

Current state: Electric A v8 remains the approved visual baseline. The former Fast/Balanced/Thorough/Ultra pace allocation is historical. The current reconciliation replaces it with independent specialist-count (1/2/3/5/Auto) and discussion-depth (1/3/5/Auto) settings, including Head selection of an Auto team and a 10-exchange Auto-depth ceiling. The manifest binds current hashes, the preserved frozen baseline and the renewed Phase 3 prompt receipt. The prior [approved-plan audit receipt](../forge/design/evidence/electric-v8-approved-plan-audit-20260914.json) remains historical evidence for its earlier source set. The owner authorized local Phase 3 work; browser-native voice, owner-only JPEG/PNG/WebP image attachments at most 8 MiB, role/language/source enforcement and the two consultation controls are implemented locally. The [14 September U-08 receipt](../forge/runs/U-08/phase3-local-integration-preparation-20260914/verification.json) and its [non-deploying cutover package](../forge/runs/U-08/phase3-local-integration-preparation-20260914/cutover-package.md) remain historical: their 82-check count and source hashes describe that earlier source set. The current [fixture-topology receipt](../forge/runs/U-08/phase3-local-fixture-topology-20260915/verification.json) records the fresh local memory-store/fake-provider workflow, required recipient order, and Discussion/Outcome/Sources rendering. It does not treat the fixture prose or in-app voice observation as provider, Ukrainian-voice, device, production or release evidence. The 83 formal checks and six release gates remain prepared / not_run and release readiness remains not_evaluated; production and GoDaddy operations remain unperformed. U-02 has a limited [session-and-data receipt](../forge/runs/U-02/phase3-local-session-data-20260915/verification.json): unauthenticated access is denied, the local cookie is fixed at 86400 seconds, consent does not extend expiry, expired signed cookies fail, and encryption/MySQL seams pass controlled tests. It does not prove deployed Google OAuth or GoDaddy MySQL. U-04 has source-bound [recipient-topology](../forge/runs/U-04/phase3-recipient-topology-correction-20260914/verification.json), [Head-task enforcement](../forge/runs/U-04/phase3-head-task-enforcement-20260915/verification.json), [response-quality](../forge/runs/U-04/phase3-response-quality-20260915/verification.json) and [database-document](../forge/runs/U-04/phase3-runtime-instructions-database-20260915/verification.json) receipts. The current U-04 source is one validated Markdown document in the existing application database; the checked-in text is an insert-once seed and never a live baseline or override. The local deterministic and browser evidence covers seed preservation, valid/invalid/stale saves and immutable accepted run snapshots; it does not prove hosted MySQL durability or a deployed provider. Their other deterministic and actual local provider evidence shows task-only Head handoffs, specialist-to-Critic positions, Critic-specialist revisions and final Head synthesis, with role-specific message bounds. U-05 has a limited [actual-research receipt](../forge/runs/U-05/phase3-local-research-source-20260915/verification.json): an official English source passed through title, direct HTTPS URL, claim and times without prohibited language or host. Broader provider and release compliance remain unobserved; neither U-02, U-05 nor U-08 treats formal acceptance as passed. U-03 has a limited [safe-Markdown rendering receipt](../forge/runs/U-03/phase3-safe-markdown-rendering-20260915/verification.json): the browser client parses a restricted Markdown subset into constructed DOM nodes, raw markup/unsafe links stay inert or fail validation, focused tests pass and the existing local app preview reloads normally. It does not replace formal QA-R46 or release acceptance.

The pre-approval logo v8 audit remains historical in [its original receipt](../forge/design/evidence/nanoduck-v8-sdd-audit.json).

The prior Electric v4 audit remains preserved in [its own receipt](../forge/design/evidence/electric-v4-sdd-audit.json).

The earlier combined v3 audit is preserved in [its own receipt](../forge/design/evidence/hybrid-v3-sdd-audit.json).

## Earlier v2 audit snapshot

13 September 2026. Review of the corrected design-stage documents; this report records observations and does not own product requirements, architecture or approval.

The 12 canonical pre-design documents pass the installed pipeline audit. Their owners, required-before edges, invocation/output identities and consumed-source hashes match the machine contract. The context and canonical-terms pair remains one invocation with two outputs. All 30 reachable installed skill/reference resources resolve. The pipeline skill repository remains clean and unchanged.

### Earlier corrections

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

### Earlier verification and boundary

- Canonical `sdd_check.py --audit`: **passed**, no issues or warnings.
- Before/after owner checks: **passed** after current return metadata and the QA index were integrated.
- Ownership, dependency, consumption and installed-link audit: **passed**.
- Local artifact checks: **passed**; exactly three active candidates, with historical versions retained.
- v2 render reuse: **exact byte equality** with v1 for all nine HTML/CSS/JavaScript files. New v2 routes and Settings were checked in the Codex in-app browser; the comparison embeds the three current routes.
- Formal QA: **82 prepared / not_run**. No production security, representative-user or release pass is claimed.
- `prototype-candidates` after-check: **blocked only by `browser_receipt`**. The Mac is locked, so the required separate visible Safari review of v2 has not occurred. Successful v1 Safari receipts were not relabelled.

The preserved v2 operational evidence is in [the audit receipt](../forge/design/evidence/sdd-consistency-audit-20260913.json), [verification](verification.md) and [the manifest](../forge/sdd-manifest.json). The Mac was subsequently unlocked; the user requested a new combined revision, and current v3 has its own successful Safari evidence. V2 was superseded without rewriting its blocked receipts. Whole-design approval, post-approval reconciliation, planning and a later explicit implementation prompt remain separate steps. No GoDaddy operation was performed.
