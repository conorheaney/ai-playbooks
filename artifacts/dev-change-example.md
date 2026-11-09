# Development Change: Medication Capture

**Feature:** Enter medication from the participant visit  
**Requirement:** [SRS-MED-CAPTURE-014](srs-item-example.md)  
**Map:** [Development Map: Medication Capture](dev-map-example.md)  
**Status:** Candidate for review  
**Date:** 2026-08-27

## Summary

Starting the due post-treatment assessment opens an **Enter medication** dialog. The dialog carries the participant and assessment context as read-only information, captures the approved medication fields, validates the required values and timing window, saves a valid record, confirms the save, and exposes the record's correction-history entry point.

## Changed files

| File | Symbol or section | Change | Reason |
| --- | --- | --- | --- |
| [visit-medication.html](visit-medication.html) | `#begin-post`, `#medication-dialog`, `#medication-form` | Added the medication capture workflow to the participant visit page. | SRS-MED-CAPTURE-014 and medication capture wireframe. |
| [visit-medication.html](visit-medication.html) | `validate`, `renderSaved`, form submit handler | Added timing and required-field validation, save state, confirmation, and history action. | SRS acceptance criteria and validation/correction workflow. |

## Requirement-to-code map

| Requirement or criterion | Implementation evidence | Check or evidence |
| --- | --- | --- |
| Participant and assessment context are read-only. | `#dialog-context` contains fixed participant and assessment values. | Manual inspection and keyboard interaction. |
| Approved medication fields are available. | `#medication-name`, `#dose`, `#unit`, `#route`, `#admin-date`, `#admin-time`. | Manual form inspection. |
| Missing, invalid, or out-of-window values do not save. | `validate()` returns field-level messages; submit exits before `records.push()`. | Valid, missing-field, and boundary observations. |
| A valid record is saved and confirmed. | Submit handler adds a record, calls `renderRecords()`, closes the dialog, and shows a confirmation. | Manual valid submission. |
| Correction history has an entry point. | `View history` action displays the record identifier, creator, and correction state. | Manual action after save. |
| Unauthorised access is prevented. | The current page represents an authorised user; application-service authorisation is recorded as an integration dependency. | Boundary recorded in the map; server control not implemented here. |

## Decisions and unresolved questions

- **Decision:** Keep the current client-side slice portable while the application service and persistence contract are defined.
- **Unresolved:** Production persistence, server-side validation, and the existing authorisation integration require the surrounding application context.

## Checks

| Check | Command or observation | Result | Evidence |
| --- | --- | --- | --- |
| HTML loads | Open the file in a browser. | Pass | Page renders without external dependencies. |
| Post-treatment entry point | Select **Begin post-treatment assessment**. | Pass | Enter medication dialog opens. |
| Required fields | Submit with empty fields. | Pass | Field-level messages appear and no record is added. |
| Timing boundary | Try a time outside 09:00–17:00. | Pass | Timing message appears and no record is added. |
| Valid save | Complete all fields within the window and save. | Pass | Record appears and confirmation is shown. |
| History action | Select **View history** on a saved record. | Pass | Accountable history summary is shown. |

## Scope

- [x] No unrelated files changed in the implementation.
- [x] Excluded behaviour remains excluded.
- [ ] Production integration and automated tests remain follow-up work.
