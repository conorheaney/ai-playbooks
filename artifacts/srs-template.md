# Software Requirements Specification (SRS) Template

**Document ID:** SRS-<ID>  
**Status:** Working draft  
**Version:** <version>  
**Source:** <approved URS, change request, or other source>  
**Scope:** <short description>  
**Related URS:** <URS document ID and version>

## 1. Purpose and Scope

<Describe the software, the problem it addresses, and the intended outcome. State what is inside and outside the software boundary. Do not add capabilities that are not supported by the approved URS.>

## 2. Document Conventions

- **Requirement language:** “Shall” states a mandatory, testable requirement. “Should” states a preferred requirement. “May” states an optional capability.
- **Requirement IDs:** Use stable IDs such as `SRS-<AREA>-<NUMBER>`. Do not reuse an ID when wording changes materially.
- **Priority:** <Must / Should / Could / Won’t, or the approved alternative>.
- **Status:** <Proposed / In review / Approved / Implemented / Verified / Retired>.
- **Agile mapping:** A requirement may be represented by an epic, feature, user story, or task, but the SRS remains the source of the approved behaviour.

## 3. Context and Sources

<Summarise the approved URS, current system context, relevant workflows, and design boundaries. Keep source statements separate from interpretations and record the search boundary.>

| Source ID | Source | Version/section | Use |
| --- | --- | --- | --- |
| SRC-<ID> | <source> | <version or section> | <what it supports> |

<Record inaccessible sources, unresolved gaps, terminology, and any conflicts between sources.>

## 4. Product and System Overview

### 4.1 Product perspective

<Describe the existing system, the change, neighbouring systems, and the boundary of this product.>

### 4.2 Users, roles, and stakeholders

| Role or stakeholder | Goal or responsibility | Relevant permissions or needs |
| --- | --- | --- |
| <role> | <goal> | <permissions, accessibility, privacy, or support needs> |

### 4.3 Operating environment

<Describe supported environments, devices, browsers, platforms, deployment context, and relevant compatibility expectations.>

### 4.4 Assumptions and dependencies

| ID | Type | Statement | Owner/status |
| --- | --- | --- | --- |
| ASM-<ID> | Assumption or Dependency | <concise statement> | <owner and status> |

## 5. Functional Requirements

<Decompose the approved URS into atomic, necessary, uniquely identifiable, and testable software requirements. Group requirements by capability or domain.>

### 5.1 <Capability name>

| ID | Requirement | Source/trace | Priority | Status |
| --- | --- | --- | --- | --- |
| SRS-<AREA>-<NUMBER> | The system shall <state one observable behaviour>. | <URS/source ID> | <priority> | Proposed |

<Repeat the subsection for each capability. Include normal behaviour, validation, errors, permissions, correction, concurrency, and boundary conditions where relevant.>

## 6. Workflows and Use Cases

<Use this section for waterfall use cases, workflow rules, or shared scenarios. In an agile delivery, link each scenario to the relevant story or requirement.>

### UC-<ID>: <use-case name>

- **Goal:** <outcome>
- **Primary actor:** <role>
- **Trigger:** <event>
- **Preconditions:** <conditions that must hold>
- **Main flow:**
  1. <actor or system action>
  2. <system response>
- **Alternative and exception flows:** <branch, error, or recovery behaviour>
- **Postconditions:** <resulting state>
- **Related requirements:** <SRS IDs>

## 7. Data and Information Requirements

<Define information that the system must capture, create, use, retain, update, export, or delete. Keep the detail sufficient for implementation and verification without silently choosing an unapproved design.>

| Data item/entity | Required attributes or rules | Source/owner | Retention, privacy, or integrity needs |
| --- | --- | --- | --- |
| <item> | <attributes, format, units, allowed values, cardinality> | <source/owner> | <need> |

<Include identifiers, relationships, timestamps, audit history, validation, data quality, migration, reporting, and backup/recovery requirements where applicable.>

## 8. External and Internal Interfaces

### 8.1 User interfaces

<Describe user-visible interactions, navigation, content, validation feedback, accessibility, localisation, and responsive or device behaviour. Link to approved designs where available.>

### 8.2 System and API interfaces

<Describe systems, services, APIs, events, protocols, data exchange, authentication, error handling, retry behaviour, and version compatibility.>

### 8.3 Hardware, platform, and communication interfaces

<Describe required hardware, operating-system, network, browser, device, or communication interfaces. State when a category does not apply.>

## 9. Quality and Non-Functional Requirements

<State measurable constraints and quality attributes. Each requirement should have a defined measure, condition, and verification method.>

| ID | Quality area | Requirement and measure | Source/trace | Priority | Verification |
| --- | --- | --- | --- | --- | --- |
| SRS-NFR-<NUMBER> | <performance, security, privacy, safety, availability, accessibility, usability, maintainability, portability, or compliance> | The system shall <measurable constraint>. | <source ID> | <priority> | <test, inspection, analysis, or demonstration> |

## 10. Business Rules and Constraints

| ID | Rule or constraint | Source/trace | Affected requirements |
| --- | --- | --- | --- |
| BR-<ID> | <rule, timing condition, calculation, policy, or explicit exclusion> | <source ID> | <SRS IDs> |

<Record legal, regulatory, contractual, organisational, technical, safety, privacy, security, accessibility, timing, budget, and compatibility constraints. State explicit exclusions.>

## 11. Agile Delivery View

<Use this optional view when the work is delivered incrementally. Keep the requirement and acceptance evidence stable while stories and tasks evolve.>

| Feature/epic | User story or slice | Requirement IDs | Acceptance criteria | Priority | Status |
| --- | --- | --- | --- | --- | --- |
| <feature> | As a <user>, I want <capability>, so that <outcome>. | <SRS IDs> | <criterion IDs or concise criteria> | <priority> | <status> |

### Acceptance criteria

#### AC-<ID>: <criterion name>

- As a <user>, I want to <do something>, so that <this happens>.
- **Related requirements:** <SRS IDs>

<Keep criteria short. Add a separate criterion for important boundary or exception behaviour. Criteria must not introduce behaviour that is absent from the approved requirement without review.>

## 12. Traceability and Verification

<Maintain bidirectional traceability from each SRS requirement to its URS/source, design element, implementation item, acceptance criterion, test, and verification evidence.>

| SRS ID | URS/source | Design or component | Story/task | Acceptance criterion | Test/evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| SRS-<ID> | <URS/source ID> | <design ID> | <work item> | <AC ID> | <test/evidence ID> | <status> |

<Record review decisions, requirement changes, deferred items, and rationale. Define the verification method and expected evidence before implementation where practical.>

## 13. Open Questions, Risks, and Decisions

| ID | Type | Question, risk, or decision | Owner | Impact and required action | Status |
| --- | --- | --- | --- | --- | --- |
| <ID> | Question, Risk, or Decision | <concise statement> | <owner> | <impact or next action> | <status> |

## 14. Handoff to Development and Testing

<State whether this SRS is approved for implementation. Identify the requirements, acceptance criteria, design decisions, dependencies, and risks that Development and Testing must use. List unresolved items that must return to Planning or Design, and define the approval authority and required evidence for changes.>
