# User Requirements Specification: Medication Recording

**Document ID:** URS-MED-EXAMPLE  
**Status:** Working draft for Design review  
**Source:** Playbook 02 planning example  
**Scope:** Recording medication given to a trial participant between selected clinical assessments

## 1. Purpose and Scope

The diagnostic application already supports clinical tests. The sponsor wants authorised clinicians to record medication given to a trial participant between the pre-treatment and post-treatment efficacy assessments. The record will support later efficacy analysis outside the application.

The application records medication details and timing. It does not administer medication, determine efficacy, or present an efficacy conclusion.

## 2. Users and Outcome

- **Primary users:** Authorised clinicians responsible for recording the medication.
- **Related users:** Product, clinical, data, privacy, security, and support stakeholders who review or use the record.
- **Intended outcome:** A trusted, traceable medication record associated with the correct trial participant and assessment period, ready for approved downstream analysis.

## 3. Context and Sources

The planning context includes the existing clinical-test workflow, the sponsor's intended use, the trial protocol, approved terminology, and relevant privacy, security, data-integrity, and audit material. Accepted findings are recorded with their source, version, and section.

| Source ID | Source | Use |
| --- | --- | --- |
| SRC-MED-001 | Sponsor change request | Need, users, and intended outcome. |
| SRC-MED-002 | Approved trial protocol | Assessment period and timing rules. |
| SRC-MED-003 | Existing application workflow and requirements | Current boundaries, terminology, and constraints. |

The search boundary, inaccessible sources, interpretations, and unresolved gaps should remain visible. This context supports the requirements below without defining the detailed solution.

## 4. User Requirements

| ID | Requirement | Planning basis | Status |
| --- | --- | --- | --- |
| URS-MED-014 | The application shall enable authorised clinicians to record medication given to a trial participant between the pre-treatment and post-treatment efficacy assessments. | SRC-MED-001; exploration | Proposed |
| URS-MED-015 | The application shall associate each medication record with the correct trial participant and relevant assessment period. | SRC-MED-002; supported need | Proposed |
| URS-MED-016 | The application shall record the medication information and timing required by the approved trial workflow. | SRC-MED-002; supported need | Proposed |
| URS-MED-017 | The application shall support correction of medication records while retaining an accountable history of changes. | SRC-MED-003; supported need | Proposed |
| URS-MED-018 | Access to medication records shall be limited to authorised users and approved uses. | SRC-MED-003; supported need | Proposed |

These requirements describe the need and intended outcome. Design will define the detailed data, workflow, interfaces, validation, access controls, and acceptance criteria.

## 5. Constraints and Boundaries

- Medication administration remains outside the application.
- Efficacy analysis and interpretation remain outside the application.
- The record must follow protocol-defined timing and trial-participant association rules.
- The change must fit the existing clinical-test workflow and approved terminology.
- The design must consider privacy, security, safety, data integrity, accessibility, correction, and audit needs.
- No solution, interface, data model, or technology choice is approved by this document.

## 6. Decisions and Assumptions

| ID | Type | Statement | Owner/status |
| --- | --- | --- | --- |
| DEC-MED-001 | Decision | The application records medication information but does not administer medication or analyse efficacy. | Planning team; accepted |
| DEC-MED-002 | Decision | The high-level requirement will move to Design for decomposition into software requirements. | Product and clinical reviewers; proposed |
| ASM-MED-001 | Assumption | The protocol defines the relevant assessment period and timing rules. | Clinical owner; to confirm |
| ASM-MED-002 | Assumption | Existing identity and authorisation controls can support the new record. | Product and security owners; to confirm |

## 7. Open Questions and Risks

| ID | Question or risk | Owner | Design input |
| --- | --- | --- | --- |
| Q-MED-001 | What medication information must be recorded for the trial? | Clinical and sponsor owners | Defines detailed requirements and acceptance criteria. |
| Q-MED-002 | What timing rules and exceptions apply between the assessments? | Clinical and protocol owners | Defines boundary and validation needs. |
| Q-MED-003 | How should corrections, late entries, and duplicate records be handled? | Product, clinical, and quality owners | Defines workflow and audit requirements. |
| R-MED-001 | A record could be linked to the wrong participant or assessment period. | Product and clinical owners | Requires design controls and test coverage. |
| R-MED-002 | Unauthorised access or inappropriate use could expose medication information. | Security and privacy owners | Requires access and data-handling decisions. |

## 8. Handoff to Design

Design should use this approved URS as its planning input. Design is responsible for producing the detailed software requirements, acceptance criteria, solution options, architecture, interfaces, data flows, and design decisions. Any unresolved planning question that affects those outputs should return to Planning for clarification.
