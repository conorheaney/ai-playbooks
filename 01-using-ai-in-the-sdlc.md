# Playbook 01: Using AI in the SDLC

## 1. What AI Can Help With

AI can help a software team understand a problem, explore source material, draft changes, find gaps, and prepare work for review. Like any collaborator, it can also miss important details or get things wrong.

It tends to work best on bounded tasks where the sources, available actions, expected result, and method of checking are clear. The team still owns the work and decides what to keep.

This playbook is for product, clinical, quality, regulatory, engineering, testing, security, and operations teams working in heavily regulated clinical environments. It stays focused on AI as part of software delivery rather than AI built into a clinical product, used for diagnosis or treatment, or used as a clinical algorithm.

Playbook 00 explains models, context, prompting, retrieval-augmented generation (RAG), agents, tools, permissions, evaluation, and other AI concepts. This playbook shows how to apply those ideas during the software development life cycle (SDLC).

| SDLC stage | AI can help you |
| --- | --- |
| Planning | Compare sources, summarise research, expose assumptions, draft questions, and propose requirements or risks. |
| Development | Explore a codebase, explain code, propose designs, draft changes, review a diff, and update documentation. |
| Testing | Derive scenarios, suggest test data or automation, find boundary cases, map coverage, and analyse failures. |
| Deployment and operations | Summarise changes, draft runbooks, compare configuration, inspect sanitised logs, and suggest monitoring or rollback checks. |

Think of these as starting points rather than decisions. People still confirm the sources, choose the design, approve requirements, establish expected test results, accept risk, and control releases.

## 2. Choose How You Work

A useful place to start is the task, not the tool. It helps to jot down:

- The result you are after.
- The sources that may help.
- Anything that should stay out of the AI tool.
- How much access would actually be useful.
- What a helpful result would contain.
- How you could check it.

"Help with requirements" does not give the AI much direction. A bounded request is easier to work with:

> Compare these three approved source documents. List conflicting medication-display rules with exact references and draft clarification questions. Do not create final requirements.

A useful rule of thumb is to choose the simplest option with the least access needed for the task.

### Ask

Chat and embedded assistants work well for explaining, comparing, critiquing, or drafting from context you provide. They are often a good starting point for one-off work. It is worth checking what the product adds to the conversation, such as the current file, workspace content, history, or hidden instructions.

### Search

Retrieval and read-only agents are useful when a task draws on several approved sources. You can ask what they searched, what they found, and what they could not access. Search results can be incomplete, and a real citation may not support the claim beside it.

### Act

Editing agents and automated workflows become useful when a task genuinely needs changes or repeated actions. An isolated branch or sandbox gives you room to inspect the result first. When an action affects a shared system or another person, previews, confirmation, and a way back are especially helpful.

An AI tool is more than its model. The surrounding product decides what context is included, which credentials and permissions apply, which tools are available, and what evidence you can inspect. A few questions are worth asking:

- Where prompts, files, outputs, retrieved content, and logs are processed and retained.
- Which data classifications are approved for that path.
- Whether supplied information may be used for training or service improvement.
- Whether actions are visible, confirmable, attributable, and reversible.
- Whether the tool shows sources, searches, commands, diffs, results, and errors.

For most early uses, asking, searching, or proposing is enough. Editing shared systems or acting in production is rarely needed.

## 3. Try a Simple Loop

Here is a simple loop that works across the SDLC.

### 1. Define

Start with one outcome you can see and check. Note the sources, boundaries, useful output, finishing point, and how you expect to check the result.

### 2. Provide Context

Bring in the smallest useful set of approved information. Explain the relevant users, workflow, terminology, constraints, and previous decisions. More context is not always better; irrelevant or conflicting material can make the result worse.

### 3. Set Access

Read-only access is often enough at first. Editing, execution, network, or external-system access can be added when the task really needs it. A prompt on its own cannot reliably prevent an action that the surrounding system allows.

### 4. Ask for Inspectable Output

It helps to ask for sources, facts, assumptions, searches, gaps, and open questions. Failed checks are useful information too. Visible evidence is more useful than hidden chain-of-thought.

### 5. Check the Result

This is where you open cited sources, inspect affected artifacts, run repository-native checks, compare calculations, and observe the real system state. Clinical, quality, security, or other specialist review can add the context the task needs. AI reviewing AI is not independent verification.

### 6. Accept Through the Normal Process

The output can stay as a proposal until your usual checks and approvals are complete. Your normal process will determine how much to record about the sources, AI contribution, human changes, checks, and final decision.

If the result exposes missing context or a poor task boundary, you can adjust the task and repeat the loop. Better context or a clearer request will often help more than extra access.

## 4. See One Change Through the SDLC

Consider a proposed change to the medication-list display in a clinician-facing application. The team has approved, de-identified research notes, existing requirements, a terminology guide, and the relevant repository.

### Planning

The team asks a retrieval assistant to compare the approved sources, group statements about medication naming and status, identify conflicts, and draft workshop questions. The request asks for an exact source reference beside each observed statement, keeps source facts separate from interpretations, and leaves final requirements to the team.

Product and clinical reviewers open the cited sections, check the terminology, look for missing or contradictory material, and decide which questions enter the workshop. They own the resulting requirements and acceptance criteria.

### Development

A read-only repository agent traces the display data from its source contract to the user interface. It lists relevant files, symbols, tests, interfaces, searches performed, and areas it could not inspect. An engineer checks the paths before asking an editing agent to prepare a small change in an isolated branch.

Engineers review the design and diff, inspect security and error handling, run the repository's checks, and confirm requirement coverage. The agent's summary is not evidence that the code built or the tests passed.

### Testing

The team asks AI to suggest normal, missing-data, stale-data, boundary, localisation, and accessibility scenarios from the approved requirements. It can also draft automation, while the expected results stay tied to an independent source rather than being copied from the implementation.

Testers review the scenarios, inspect generated test code, run the tests, and keep the actual execution evidence. AI can group failures or suggest investigation paths, while the team decides whether the product is acceptable.

### Deployment and Operations

AI can draft release notes, runbook updates, smoke checks, monitoring questions, and rollback steps from accepted change records. It can also compare approved configuration snapshots or analyse sanitised logs without receiving production credentials.

The people responsible for the release confirm readiness. Operators verify the real environment, commands, monitoring, and rollback state before acting. Production access is not required for AI to provide useful deployment support.

This example uses different tools at different stages because the tasks and boundaries change. The loop stays the same: define, provide context, set access, ask for inspectable output, check, and accept.

## 5. Find a Safe Place to Start

A good first setup usually looks something like this:

- The tool and sources are approved for the task and contain no unnecessary sensitive data.
- The task is narrow, has a clear stopping point, and is easy for someone to check.
- The AI has only the access it needs, and important actions are previewed and confirmed.
- Changes are isolated and reversible where possible.
- Accepted work is saved where the team normally keeps it.

A few warning signs are worth watching for:

| Warning sign | A useful response |
| --- | --- |
| The request is vague | Make the outcome, sources, exclusions, output, and check more specific. |
| The tool receives everything | Trim irrelevant files, records, logs, and history. |
| The answer sounds certain but shows no evidence | Ask for sources and check them directly. |
| The tool has more access than the task needs | Step back to fewer tools, lower permissions, or a simpler mode. |
| The AI says its own work is correct | Bring in a person, executable checks, or observed evidence. |
| The search boundary is hidden | Ask what was searched, missed, inaccessible, or assumed. |
| One error could spread widely | Try representative cases first and keep a way to stop or reverse the workflow. |

Prompts can guide behaviour, but they are not security controls. The tool and its integrations are the better place to enforce permissions, isolation, confirmations, limits, logging, and recovery.

If sensitive information is exposed or an agent goes beyond its intended access, pause the work. The same applies if evidence appears fabricated, an action cannot be explained, or an AI-assisted error may have reached a released product or controlled record. The relevant incident or escalation process can then guide the next steps.

When choosing a first use case, look for something narrow, repeatable, low consequence, and easy to verify. Good options include summarising a public specification, explaining an unfamiliar module, drafting test ideas from approved requirements, finding candidate inconsistencies across documents, or preparing release-note candidates from accepted changes.

Speed is only part of the picture. It is also useful to note errors, omissions, unsupported assumptions, corrections, review effort, and whether the result genuinely helped.

## 6. Continue Through the Series

| Playbook | Focus |
| --- | --- |
| **00: AI Concepts** | Models, context, prompting, retrieval, agents, tools, risks, evaluation, and other shared concepts. |
| **01: Using AI in the SDLC** | A practical way to choose tasks, tools, boundaries, checks, and first use cases. |
| **02: AI-Assisted Planning** | Discovery, source analysis, requirements, assumptions, acceptance criteria, risk, and traceability. |
| **03: AI-Assisted Development** | Codebase exploration, design, coding, refactoring, review, documentation, and provenance. |
| **04: AI-Assisted Testing** | Test design, automation, data, coverage, boundary cases, failure analysis, and execution evidence. |
| **05: AI-Assisted Deployment and Operations** | Release preparation, runbooks, configuration, monitoring, incidents, rollback, and production boundaries. |

Playbooks 02-05 build on the loop introduced here with stage-specific prompts, tool and agent patterns, worked examples, verification techniques, and practical exercises.
