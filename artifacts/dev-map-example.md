# Development Map: Medication Capture

**Feature:** Enter medication from the participant visit  
**Requirement:** [SRS-MED-CAPTURE-014](srs-item-example.md)  
**Date:** 2026-08-27  
**Prepared by:** Development team  
**AI or tool:** Read-only file analysis

## Sources inspected

| Source | Version or date | Relevant section | Use |
| --- | --- | --- | --- |
| [Participant visit workflow](visit-workflow.html) | 2026-08-27 | Participant visit overview | Current page structure, post-treatment action, participant context, and blood pressure progress. |
| [SRS item](srs-item-example.md) | 2026-08-18 | Acceptance Criteria; Design History | Approved fields, validation, association, authorisation, and correction-history behaviour. |
| [Medication capture wireframe](srs-example-mockup.png) | 2026-08-18 | Medication capture screen | Field arrangement, read-only context, and form actions. |
| [Medication entry workflow](srs-medication-workflow.webp) | 2026-08-18 | Normal workflow | Entry point, submission, and confirmation sequence. |
| [Medication validation workflow](srs-medication-validation-workflow.webp) | 2026-08-18 | Validation and correction | Validation boundary, save behaviour, and correction history. |

## Current behaviour

- The participant visit shows Jordan Patel, participant `PT-1048`, with a completed pre-treatment blood pressure assessment.
- The post-treatment assessment is due to begin.
- The current page has a neutral assessment action but no medication fields, medication records, or medication state.
- Participant and visit context is visible in the page and can be reused by the capture workflow.

## Implementation surface

| Area | File, symbol, or artefact | Current role | Likely change or dependency |
| --- | --- | --- | --- |
| Entry point | `artifacts/visit-workflow.html#starter-button` | Starts the post-treatment assessment | Open the Enter medication dialog before the assessment continues. |
| Context | `artifacts/visit-workflow.html#participant-heading` and `.context` | Shows participant and visit information | Carry the read-only participant and assessment period into the dialog. |
| Dialog | New `#medication-dialog` | Not present in starter | Add the complete capture form and accessible dialog controls. |
| Validation | New form validation function | Not present in starter | Validate required fields and the approved assessment timing window. |
| Save state | New client-side record state | Not present on current page | Show a saved record and confirmation; persistence will be supplied by the application service. |
| History | New record history action | Not present in starter | Expose the saved record's accountable history entry point. |

## Gaps and open questions

| Question or gap | Source or reason | Owner | Disposition |
| --- | --- | --- | --- |
| Which application service and persistence layer will store the record? | The current page has no service integration. | Development and architecture | Return to implementation planning. |
| Which existing authorisation service supplies the clinician decision? | SRS requires authorisation; the current page represents an authenticated clinician. | Security and product | Must be supplied before release. |

## Boundary

**Included:** A complete client-side implementation that opens Enter medication when post-treatment begins and provides the approved form, validation, save confirmation, and history entry point.  
**Excluded:** Medication administration, efficacy analysis, service persistence, server-side authorisation, and wider application integration.
