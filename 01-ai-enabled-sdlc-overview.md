# Playbook 01: AI in the SDLC

## 1. What This Series Is For

This series demonstrates how AI and AI-enabled tools can support software teams across the SDLC. It is written for cross-functional teams working in heavily regulated clinical environments, where useful AI output still needs human judgment, traceability, and careful handling of data.

The playbooks focus on AI used by delivery teams. They do not cover building AI into a clinical product, using AI for diagnosis or treatment, or validating a clinical algorithm.

## 2. Where AI Can Help

AI is most useful as a fast collaborator: it can explore information, propose a first draft, transform content, find patterns, and automate bounded tasks. It does not understand the clinical or organizational context unless that context is supplied, and a convincing answer is not necessarily a correct one.

| SDLC stage | Example uses | Useful human checks |
| --- | --- | --- |
| Planning | Summarize source material, compare options, identify stakeholders, draft requirements, expose assumptions, and suggest risks. | Confirm sources, intended use, clinical workflow, constraints, and acceptance criteria. |
| Development | Explain a codebase, propose designs, generate or refactor code, review changes, and draft technical documentation. | Review design intent, security, dependencies, traceability, and executable results. |
| Testing | Derive test ideas, create test data or scripts, identify boundary cases, analyze failures, and map coverage. | Check independence, expected results, clinical scenarios, data handling, and actual execution evidence. |
| Deployment | Summarize changes, draft runbooks, inspect configuration, analyze logs, and propose rollback or monitoring checks. | Confirm environment state, approvals, commands, rollback readiness, and observed production evidence. |

## 3. Common Ways to Work With AI

### Conversational Assistant

A chat interface is useful for exploration, explanation, critique, drafting, and structured analysis. The user selects the context, asks the questions, and transfers accepted output into the working artifact.

### Embedded Assistant

An assistant inside an editor, requirements tool, test tool, or documentation platform can use the current artifact as context. This reduces copying but makes it important to understand what the integration can read, retain, and send externally.

### Retrieval-Augmented Assistant

Retrieval-augmented generation (RAG) searches an approved body of material and supplies relevant extracts to a model. It can help teams work with procedures, requirements, architecture, or evidence collections, but retrieved text and generated citations still need verification against the source.

### Agent

An agent can plan multiple steps and use tools such as repository search, file editing, test runners, issue trackers, or deployment interfaces. Agents are valuable when work requires iteration, but their permissions and the reversibility of their actions matter as much as model quality.

### Automated Workflow

AI can be placed in a repeatable workflow, for example to classify incoming issues, draft release notes, or flag requirement changes. Automation improves consistency and scale, while also allowing a systematic error to spread quickly if outputs are accepted without checks.

## 4. A Practical AI-Assisted Workflow

Use this lightweight pattern at any SDLC stage:

1. **Choose a bounded task.** Start with a clear outcome such as summarizing an approved source, explaining code, drafting test cases, or reviewing a deployment checklist.
2. **Select the tool and mode.** Decide whether the task needs chat, retrieval, editor context, tools, or an agent. Check what the tool can access and change.
3. **Prepare the context.** Provide the objective, relevant source material, constraints, definitions, and expected output format. Remove data the tool is not intended to process.
4. **Ask for visible reasoning artifacts.** Request assumptions, source references, uncertainties, alternatives, or a traceability table rather than only a polished answer.
5. **Inspect and iterate.** Challenge omissions, ask for counterexamples, and refine the output. Do not use the model's confidence or writing style as evidence.
6. **Verify outside the generation path.** Check cited sources, run generated code and tests, compare calculations, or seek independent subject-matter review.
7. **Use the normal workflow.** Incorporate accepted output through the same review, change, validation, and approval route as human-created work.
8. **Record what matters.** Preserve enough context to explain material AI contributions and how the accepted result was checked.

## 5. Example: A Controlled Feature Change

Consider a change to a clinician-facing application's medication-list display. AI could assist throughout the lifecycle without making the product or clinical decisions.

### Planning

- Summarize approved user research and existing requirements.
- Draft questions about workflow, terminology, accessibility, failure states, and downstream interfaces.
- Propose candidate requirements and a source-to-requirement traceability table.
- Highlight statements that lack a source or need clinical confirmation.

The product, clinical, quality, and engineering participants confirm the source interpretation and decide what becomes a requirement.

### Development

- Locate display logic, data contracts, tests, and related documentation in the repository.
- Explain the current execution flow and propose a small implementation plan.
- Generate a candidate change and identify assumptions or files that were not inspected.
- Review the diff for security, error handling, accessibility, and requirement coverage.

Engineers inspect the code, run the repository's checks, and own the resulting change.

### Testing

- Derive normal, boundary, stale-data, missing-data, localization, and accessibility scenarios from approved requirements.
- Suggest test automation while keeping expected outcomes tied to an independent source.
- Compare requirement identifiers with implemented and executed tests to identify gaps.
- Cluster failure output to support investigation without treating the clustering as the defect decision.

Testers confirm expected results and retain actual execution evidence rather than an AI claim that a test passed.

### Deployment

- Summarize the accepted change and affected components.
- Draft deployment, smoke-check, monitoring, and rollback steps from approved sources.
- Compare configuration between environments and explain candidate differences.
- Analyze sanitized logs after release and suggest questions for the operations team.

The release authority confirms readiness and operators verify actual environment state before acting.

## 6. Clinical Environment Considerations

The following practices keep demonstrations useful without treating AI output as established fact:

- Use tools approved for the information and activity involved; understand their data retention, training, access, and integration behavior.
- Minimize context and exclude patient-identifiable data, credentials, secrets, confidential clinical data, production data, or restricted intellectual property unless the processing path explicitly permits it.
- Separate source material from generated interpretation. Open and check cited requirements, procedures, literature, code, tests, and logs.
- Preserve human ownership of clinical, safety, quality, regulatory, security, risk, release, and deployment decisions.
- Avoid having the same AI generation path act as its own independent reviewer.
- Treat generated code, tests, records, citations, and execution claims as proposals until verified by objective evidence.
- Keep enough provenance to explain what influenced a controlled artifact and how the accepted result was verified.
- Stop and use the relevant incident or escalation process if sensitive data is exposed, an agent exceeds its intended access, evidence appears fabricated, or an AI-assisted error may have reached a released product or controlled record.

The detailed playbooks will show these considerations in context rather than prescribe a replacement quality or governance system.

## 7. Choosing a First Use Case

A good first use case has:

- A narrow and repeatable task.
- Approved, non-sensitive source material.
- A correct result that a knowledgeable person can verify quickly.
- A reversible output that enters the normal review process.
- A measurable comparison, such as time saved, coverage found, or corrections required.

Examples include summarizing a public technical specification, explaining an unfamiliar module, drafting test ideas from approved requirements, or producing release-note candidates from accepted changes.

Avoid starting with autonomous repository-wide changes, unsupervised production access, patient data, clinical conclusions, regulatory evidence, or tasks whose correctness cannot be independently assessed.

## 8. Series Roadmap

| Number | Playbook | Focus |
| --- | --- | --- |
| 00 | AI Concepts | Models, tokens, prompting, RAG, agents, harnesses, tools, capabilities, evaluation, and limitations. |
| 01 | AI in the SDLC | Where AI fits and how an AI-assisted workflow operates. |
| 02 | Getting Started with AI Tools | Selecting interaction modes, tools, context, permissions, and practical safeguards. |
| 03 | AI-Assisted Planning | Demonstrations for discovery, analysis, requirements, risk, and planning. |
| 04 | AI-Assisted Development | Demonstrations for codebase exploration, design, coding, review, and documentation. |
| 05 | AI-Assisted Testing | Demonstrations for test design, automation, coverage, failure analysis, and evidence. |
| 06 | AI-Assisted Deployment and Operations | Demonstrations for release preparation, deployment support, monitoring, incident analysis, and rollback. |

Each playbook will include example prompts, tool patterns, worked examples, verification techniques, clinical-environment cautions, and practical exercises.
