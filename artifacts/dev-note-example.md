# Development Note: Medication Capture

**Feature:** Enter medication from the participant visit  
**Accepted change:** [Development Change: Medication Capture](dev-change-example.md)  
**Requirement and design references:** [SRS item](srs-item-example.md), [wireframe](srs-example-mockup.png), [entry workflow](srs-medication-workflow.webp), [validation workflow](srs-medication-validation-workflow.webp)  
**Date:** 2026-08-27  
**Reviewer or approver:** Development reviewer; follow-up findings recorded

## User-visible behaviour

When the authorised clinician starts the due post-treatment assessment, the application opens **Enter medication**. The dialog displays the participant and assessment context as read-only, captures medication name, dose, unit, route, administration date, and administration time, rejects incomplete or out-of-window entries, confirms a valid save, and provides a history action for the saved record.

## Affected components

| Component | Change | Traceability |
| --- | --- | --- |
| Post-treatment action | Opens the capture dialog. | SRS Acceptance Criterion 1; entry workflow. |
| Capture dialog | Presents context and approved medication fields. | SRS Acceptance Criteria 1–2; wireframe. |
| Validation and save state | Rejects invalid entries and confirms valid records. | SRS Acceptance Criteria 3–4; validation workflow. |
| History action | Shows accountable record information. | SRS Acceptance Criterion 6; correction workflow. |

## Boundaries and limitations

- The page does not administer medication or analyse efficacy.
- The current page stores records in client-side state and does not implement service persistence or server-side authorisation.
- Production integration must repeat validation and access controls in trusted application services.

## Verification

| Check or observation | Result | Evidence |
| --- | --- | --- |
| Post-treatment action opens dialog | Pass | [Development Change](dev-change-example.md). |
| Required and timing validation | Pass | [Development Change](dev-change-example.md). |
| Valid save and confirmation | Pass | [Development Change](dev-change-example.md). |
| Quality, security, and maintainability review | Follow-up findings recorded | [Development Review](dev-review-example.md). |

## Provenance

- **AI or tools used:** Read-only mapping, bounded implementation, and critical code review prompts.
- **Context sources:** [Development Map](dev-map-example.md) and approved SRS/design artefacts.
- **Prompt or task brief:** [Playbook 04](../04-ai-assisted-development.md), Explore, Implement, and Review prompts.
- **Human review:** Development review retained with production integration findings open.
