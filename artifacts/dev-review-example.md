# Development Review: Medication Capture

**Feature:** Enter medication from the participant visit  
**Change:** [Development Change: Medication Capture](dev-change-example.md)  
**Reviewer:** Development reviewer  
**Date:** 2026-08-27  
**AI or tool:** Critical code review prompt

## Review item 1: Coupled responsibilities

**Category:** Maintainability  
**Location:** `validate()` and form submit handler  
**Severity:** Medium  
**Finding:** Client-side rules, record state, rendering, and persistence concerns are coupled in one script, making policy changes and isolated tests harder.  
**Evidence:** [Participant visit implementation](visit-medication.html).  
**Remediation:** Extract validation, state, rendering, and persistence responsibilities into separate application components.  
**Disposition:** Must resolve before release.

## Review item 2: Unsafe record rendering

**Category:** Security  
**Location:** `renderSaved()`  
**Severity:** High  
**Finding:** Entered medication name and dose are interpolated into `innerHTML`. A crafted value could execute markup or script when the saved record is rendered.  
**Evidence:** [Participant visit implementation](visit-medication.html), `renderSaved()`.  
**Remediation:** Build the row with DOM APIs or safe text binding and add an input/rendering security test.  
**Disposition:** Must resolve before release.

## Review item 3: Client-only trust boundary

**Category:** Security  
**Location:** Form submit and record state  
**Severity:** High  
**Finding:** Client-side validation cannot enforce the timing or authorisation boundary in production. A caller could bypass the page.  
**Evidence:** [SRS acceptance criteria](srs-item-example.md) and [Development Map](dev-map-example.md).  
**Remediation:** Repeat validation and authorisation on the server or trusted application service.  
**Disposition:** Must resolve before release.

## Review item 4: Hard-coded protocol rules

**Category:** Quality  
**Location:** `validate()`  
**Severity:** Medium  
**Finding:** Protocol timing values are hard-coded as string literals and the function combines field validation with workflow policy.  
**Evidence:** [Participant visit implementation](visit-medication.html), `validate()`.  
**Remediation:** Centralise approved timing rules and separate field validation from workflow validation.  
**Disposition:** Must resolve before release.

## Review item 5: Single-file application structure

**Category:** Maintainability  
**Location:** Single HTML file and global `saved` array  
**Severity:** Medium  
**Finding:** Co-located styles, UI, state, and event handlers make the current page difficult to extend or reuse.  
**Evidence:** [Participant visit implementation](visit-medication.html).  
**Remediation:** Split component, style, state, and service responsibilities during application integration.  
**Disposition:** Follow-up.

## Human decision

Retain the current implementation for the participant visit workflow. Resolve Review items 2–4 before release; address Review items 1 and 5 during application integration.
