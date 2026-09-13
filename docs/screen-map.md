# Screen map

## Source references

[PRD](prd.md), [context](project-context.md), [terms](canonical-terms.md), [guardrails](guardrails.md) and [journey](user-journey.md). This inventory owns surfaces and states; visual treatment belongs downstream.

## Screen inventory and journey-to-screen trace

Routes are candidate-local fragment destinations, not production API commitments. All entry points retain the candidate base URL. Desktop floating navigation exposes Discussion, Conversations, Settings and New; mobile exposes those destinations through a labelled hamburger menu. Outcome and Sources remain local consultation views.

| Surface | Route | Use cases | Journey | Requirement |
|---|---|---|---|---|
| S-01 — Sign in | `#login` | UC-001 | J-01 | FR-01.1, FR-01.2 |
| S-02 — Discussion and composer | `#discussion` | UC-002, UC-003 | J-02/J-03/J-05 | FR-02.1–02.8, FR-03.1–03.6 |
| S-03 — Conversations | `#history` | UC-004 | J-06 | FR-06.1 |
| S-04 — Settings | `#settings` | UC-005 | J-07 | FR-05.1–05.5, FR-08.2, NFR-10.2 |
| S-05 — Voice input | `#voice` | UC-006 | J-02 | FR-07.1–07.5 |
| S-06 — Sources and detail | `#sources` | UC-007, UC-004 | J-04 | FR-04.2 |
| S-07 — Outcome | `#outcome` | UC-002, UC-004 | J-06 | FR-02.6, FR-02.7 |
| S-08 — Record action confirmation | `#record-action` | UC-004 | J-06 | FR-06.2, FR-06.3 |
| S-09 — Mobile navigation | `#menu` | UC-001, UC-003, UC-005 | J-01/J-05/J-07 | FR-08.1 |

## Screen states

These states apply to all three candidates. Cancellation returns to the prior surface and preserves its draft; it is a transition, not another empty screen. Loading/progress is visible only while a relevant operation is pending. Long English and Ukrainian discussion/draft fixtures exercise mixed scripts and wrapping.

| State | Surface | Meaning / fixture key | Route and use cases |
|---|---|---|---|
| ST-01 | S-01 | `signed-out` | `#login` · UC-001 |
| ST-02 | S-01 | `consent` | `#login` · UC-001 |
| ST-03 | S-01 | `denied` | `#login` · UC-001 |
| ST-04 | S-01 | `expired` | `#login` · UC-001 |
| ST-05 | S-02 | `empty` | `#discussion` · UC-002, UC-003 |
| ST-06 | S-02 | `draft` | `#discussion` · UC-002, UC-003 |
| ST-07 | S-02 | `attachment-error` | `#discussion` · UC-002, UC-003 |
| ST-08 | S-02 | `clarification` | `#discussion` · UC-002, UC-003 |
| ST-09 | S-02 | `active` | `#discussion` · UC-002, UC-003 |
| ST-10 | S-02 | `complete` | `#discussion` · UC-002, UC-003 |
| ST-11 | S-02 | `stopped` | `#discussion` · UC-002, UC-003 |
| ST-12 | S-02 | `offline` | `#discussion` · UC-002, UC-003 |
| ST-13 | S-02 | `provider-auth` | `#discussion` · UC-002, UC-003 |
| ST-14 | S-02 | `quota` | `#discussion` · UC-002, UC-003 |
| ST-15 | S-02 | `research-error` | `#discussion` · UC-002, UC-003 |
| ST-16 | S-02 | `system-error` | `#discussion` · UC-002, UC-003 |
| ST-17 | S-02 | `long-content` | `#discussion` · UC-002, UC-003 |
| ST-18 | S-03 | `populated` | `#history` · UC-004 |
| ST-19 | S-03 | `empty` | `#history` · UC-004 |
| ST-20 | S-03 | `unavailable` | `#history` · UC-004 |
| ST-21 | S-04 | `saved` | `#settings` · UC-005 |
| ST-22 | S-04 | `edited` | `#settings` · UC-005 |
| ST-23 | S-04 | `invalid-combination` | `#settings` · UC-005 |
| ST-24 | S-04 | `catalog-unavailable` | `#settings` · UC-005 |
| ST-25 | S-04 | `session-control` | `#settings` · UC-005 |
| ST-26 | S-05 | `permission` | `#voice` · UC-006 |
| ST-27 | S-05 | `recording` | `#voice` · UC-006 |
| ST-28 | S-05 | `transcribing` | `#voice` · UC-006 |
| ST-29 | S-05 | `transcript` | `#voice` · UC-006 |
| ST-30 | S-05 | `permission-denied` | `#voice` · UC-006 |
| ST-31 | S-05 | `microphone-unavailable` | `#voice` · UC-006 |
| ST-32 | S-05 | `interrupted` | `#voice` · UC-006 |
| ST-33 | S-05 | `transcription-error` | `#voice` · UC-006 |
| ST-34 | S-06 | `list` | `#sources` · UC-007, UC-004 |
| ST-35 | S-06 | `detail` | `#sources` · UC-007, UC-004 |
| ST-36 | S-06 | `unavailable` | `#sources` · UC-007, UC-004 |
| ST-37 | S-07 | `recommendation` | `#outcome` · UC-002, UC-004 |
| ST-38 | S-07 | `provisional` | `#outcome` · UC-002, UC-004 |
| ST-39 | S-08 | `delete-confirmation` | `#record-action` · UC-004 |
| ST-40 | S-08 | `deleted` | `#record-action` · UC-004 |
| ST-41 | S-08 | `export-ready` | `#record-action` · UC-004 |
| ST-42 | S-08 | `export-error` | `#record-action` · UC-004 |
| ST-43 | S-09 | `closed` | `#menu` · UC-001, UC-003, UC-005 |
| ST-44 | S-09 | `open` | `#menu` · UC-001, UC-003, UC-005 |

## Transitions and closure

J-01 resolves through S-01 to S-02; the navigation surface S-09 never grants identity. J-02 enters S-05 only after explicit voice choice; Stop leads through transcription to editable review, Use transcript returns to the composer, and Send remains a separate action. Cancel/denied/interrupted voice returns to the preserved draft. An invalid attachment stays at S-02 with a removable filename/error.

J-03 clarification and substantive exchange remain on S-02; no procedural stage screen is added. J-04 moves to S-06 and back to the originating claim. J-05 Stop/Continue preserves the same record, while New ends or pauses active work before establishing another. Offline, quota, provider-auth and system/research failure keep distinct recovery transitions. App expiry goes through S-01.

J-06 uses S-07 for the conclusion, S-03 to reopen history and S-08 for export/deletion. Delete cancellation is inert; success removes only the selected record and returns to empty history/new discussion. J-07 opens S-04, validates the edited combination and saves for future work; Cancel restores previous selections. Session-control confirmation leads to simulated reauthentication then revocation, never revealing credentials.

Security boundaries: NFR-10.1–10.3 remain enforced by the later trusted service, not by screen visibility. NFR-12.2/NFR-14.2 protect audio and draft exits; NFR-14.3 governs record actions. Reflow, keyboard and focus apply to every surface under NFR-02.1–02.3.

## Open questions

No material surface gap remains. Exact production path naming and runtime support are architecture concerns. Design candidates simulate this inventory and do not prove production behavior.
