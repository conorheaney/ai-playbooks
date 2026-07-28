PLAYBOOK 01: AI IN THE SDLC

# 1. Purpose

This playbook helps teams to begin to apply AI concepts across the software development life cycle (SDLC). The aim is to help them start small, choose a sensible way to work, and build checking into the task from the beginning.

# 2. Introduction

These playbooks treat AI as an assistive technology within human-led work. AI can help explore, compare, draft, and find gaps, while people bring context, judgement, accountability, and authority over decisions.

![A person leads a shared workbench, providing a task card and controlling the final decision. A smaller AI assistant explores and compares sources, prepares a draft, and flags a gap before the work passes through human judgement and accountability checks.](illustrations/01-introduction-human-led-ai-workbench.webp)

*AI can assist with parts of the task, while people provide context, apply judgement, remain accountable, and make decisions.*

Within the SDLC, AI can help teams understand problems, explore sources, draft changes, find gaps, and prepare work for review. It works best on bounded tasks with clear sources, actions, outputs, and checks, but it can also miss details or be wrong. Teams remain responsible for the data they provide, permissions they grant, AI actions they authorise, and outputs and decisions they accept. The table below gives examples for each SDLC stage.

| SDLC stage | AI can help teams |
| --- | --- |
| Planning | Compare sources, summarise research, expose assumptions, and draft questions, requirements, or risks. |
| Development | Explore and explain code, propose designs, draft or review changes, and update documentation. |
| Testing | Derive scenarios, suggest data or automation, find boundaries, map coverage, and analyse failures. |
| Deployment and operations | Summarise changes, draft runbooks, compare configuration, inspect sanitised logs, and suggest monitoring or rollback checks. |

# 3. Approach

One approach is to start with the task rather than the tool by describing the outcome, useful sources, excluded information, necessary access, expected output, and how it could be checked. The simplest mode with the least access is often enough. For example, **"Help with requirements"** could become:

> Compare these three approved source documents. List conflicting medication-display rules with exact references and draft clarification questions. Do not create final requirements.

Ask, Search, and Act are playbook labels for thinking about increasing capability and access, not industry-standard or mutually exclusive product categories. Ask works with supplied context, Search adds approved read-only sources, and Act adds changes or repeated actions. A product or task may combine these modes. Choose the simplest combination that can complete the task while keeping it understandable and reviewable.

![Three bounded work zones labelled Ask, Search, and Act show a task moving from supplied context to approved read-only sources and stopping with a check at Search. The unused Act zone adds an isolated workspace, preview, confirmation, and recovery controls.](illustrations/01-choose-how-you-work-capability-steps.webp)

*Ask, Search, and Act add progressively more capability and access.*

| Mode | Useful for | Worth checking |
| --- | --- | --- |
| Ask | One-off explanation, comparison, critique, and drafting with chat or embedded assistants. | Whether the product also includes the current file, workspace, history, or hidden instructions. |
| Search | Work across several approved sources with retrieval or read-only agents. | What was searched, found, missed, or inaccessible, and whether each citation supports its claim. |
| Act | Changes or repeated actions with editing agents or automated workflows. | Whether an isolated branch or sandbox, previews, confirmation, and recovery are available. |

The product around the model determines the context, credentials, permissions, tools, and evidence available. Before using a product, confirm where data is processed and retained, which data classifications are approved, whether supplied information may be used for training or service improvement, and whether actions and evidence are visible, attributable, confirmable, and reversible as the task requires.

It is important to be aware that Search and Act modes can expose an AI system to instructions embedded in documents, websites, repositories, tickets, or logs. Treat retrieved content as potentially untrusted data rather than authority to change the task, disclose information, or use additional tools. Product controls should keep source content from overriding approved instructions, permissions, and confirmation requirements.

# 4. Loop

A loop is a repeatable way of working in which people prepare an AI task, check the result, and either accept it or use what they learned to try again. In this loop, the team defines the work, provides context, sets access, requests evidence, and reviews the output before deciding what happens next. The details may change across the SDLC, but the cycle remains useful whenever an AI result benefits from review and refinement.

![A human-led boundary contains Define, Context, and Access and hands a prepared task to a matching agent boundary, where a robot-marked workspace produces an inspectable output. The output passes to a human check and normal acceptance gate, while a failed check returns to human preparation.](illustrations/01-simple-loop-human-agent-boundaries.webp)

*People set the boundaries, inspect the output, and accept it through the normal process or revise and repeat.*

A loop can be any repeatable process that feeds results or review into the next attempt; it does not need one fixed design. The guideline suggested here uses six stages: Define, Provide Context, Set Access, Request Evidence, Check, and Accept or Revise. Teams can adapt, combine, or repeat these stages to suit the task and their existing process.

## 1. Define

One observable outcome can anchor the task, together with its sources, boundaries, expected output, stopping point, and method of checking. This focus helps the AI prioritise relevant work and makes a useful result easier to recognise. It also reduces the chance of a broad request producing a polished but incomplete answer.

## 2. Provide Context

A small set of approved information may be enough. Useful context can include relevant users, workflow, terminology, constraints, and decisions. This gives the AI details it could not otherwise know and helps it produce work that fits the situation, while irrelevant or conflicting material can hide what matters.

## 3. Set Access

Read-only access is often a suitable starting point, with editing, execution, network, or external-system access added when needed. Matching access to the task allows the AI to do useful work without introducing unnecessary actions or complexity. A prompt cannot reliably prevent actions the system permits. For example, asking an agent not to edit files does not enforce read-only access if its tools still allow changes.

## 4. Request Evidence

Inspectable output can make review easier by identifying sources, assumptions, searches, gaps, open questions, and failed checks. An AI's account cannot be trusted as evidence on its own: a cited source may not support the claim, and a reported action may not have succeeded. The account can still guide the review, while opened sources and independently run checks provide stronger support. Keeping these details visible helps teams find problems, make corrections, and improve the next attempt without relying on hidden chain-of-thought.

## 5. Check

Checking might involve opening cited sources, inspecting affected artifacts, comparing calculations, running repository-native checks, or observing the real system. Agreement from a person or another AI does not verify an answer; confidence comes from checking it against an authoritative source, calculation, test result, or observed behaviour.

## 6. Accept or Revise

AI output can remain a proposal until the usual checks and approvals are complete. Useful work can move forward, while weak tasks, context, or boundaries can be revised and tried again before adding access. Records of sources, contributions, checks, decisions, task briefs, source versions, and available product details can make the work easier to explain or revisit, although another run may differ.

Together, these stages help a team get useful AI output without treating the first response as finished work. A brief look back at effort, coverage, corrections, and review can help the team decide whether the approach is worth using again. The next section shows how the loop might support one change through planning, development, testing, and deployment.

# 5. Example

A team is preparing a change to how medication lists appear in a clinician-facing application. The change may affect requirements, display logic, tests, documentation, and release activities. The team has approved, de-identified research notes, current requirements, a terminology guide, and the relevant repository. At each SDLC stage, the loop is applied with a suitable AI approach while people review the output and make the decisions.

![Four aligned columns follow one change through Planning, Development, Testing, and Operations. In each stage, an AI assistant prepares a provisional output above a linked change record, while a person reviews the work and attaches source-based or observed evidence below.](illustrations/01-one-change-through-sdlc-evidence-ledger.webp)

*At each stage, AI proposals remain separate from human review and observed evidence linked to the change.*

## Planning

The team is considering a candidate requirement: `MED-DISPLAY-014`: *"The medication list shall show each medication's status and place active medications before inactive medications."* A read-only agent is asked to compare the wording with the approved research notes, current requirements, and terminology guide and to draft questions rather than final requirements. It links relevant statements to their sources and highlights conflicts, inaccessible material, and gaps such as unknown or stale status. Product and clinical reviewers open the sources, assess the findings, and either decide the final requirement and acceptance criteria or refine the task and repeat the loop.

## Development

With `MED-DISPLAY-014` approved, a read-only agent is asked to identify the code, interfaces, tests, and documentation that may be affected. It traces medication status from the source contract to the display, lists the files and symbols it inspected, and records gaps or inaccessible areas. After an engineer checks this impact map, an editing agent prepares a candidate change in an isolated branch. Engineers review the design and diff, inspect security and error handling, run repository checks, and confirm that the implementation covers the requirement.

## Testing

Using `MED-DISPLAY-014`, its acceptance criteria, and the candidate implementation, an agent is asked to propose normal, missing-data, stale-data, boundary, localisation, and accessibility scenarios. It links each scenario to the relevant criterion and may prepare test automation in an isolated branch. Testers establish expected results from the approved requirement, review any generated code, run the tests, and retain the execution evidence. The agent may then help group failures or suggest investigation paths, while testers decide whether the result is acceptable.

## Deployment and Operations

Using the accepted change record, test evidence, and existing runbooks, a read-only agent is asked to draft release notes, runbook updates, smoke checks, monitoring questions, and rollback steps. It may also compare approved configuration snapshots or analyse sanitised logs, without production access. Release staff review the drafts, confirm the approvals and evidence, and verify the real environment, commands, monitoring, and rollback state before acting.

Planning uses Search, development moves from Search to Act, testing begins with supplied context and may move to Act, and deployment uses Search without production access. At each stage, checks either support acceptance or shape another pass, so the mode changes while the human-led loop provides continuity.

# 6. Summary

Across the SDLC, the task, tool, and level of access may change, while the same human-led loop connects the work: teams prepare bounded tasks, AI produces inspectable proposals, and people check, accept, or revise them. The medication-display example shows this approach carrying evidence and decisions from planning through development, testing, and operations. The following playbooks explore how it can be applied within each stage.

| Playbook | Focus |
| --- | --- |
| **02: AI-Assisted Planning** | Discovery, source analysis, requirements, assumptions, acceptance criteria, risk, and traceability. |
| **03: AI-Assisted Development** | Codebase exploration, design, coding, refactoring, review, documentation, and provenance. |
| **04: AI-Assisted Testing** | Test design, automation, data, coverage, boundaries, failure analysis, and execution evidence. |
| **05: AI-Assisted Deployment and Operations** | Release preparation, runbooks, configuration, monitoring, incidents, rollback, and production boundaries. |
