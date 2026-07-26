# Playbook 01: Getting Started with AI Tools

## 1. Purpose

This playbook shows how to select and use an AI tool for a bounded SDLC task. It focuses on the practical differences among chat assistants, embedded assistants, retrieval systems, agents, and automated workflows.

The examples use AI as an assistant to delivery teams in a regulated clinical environment. They do not use AI to make clinical, quality, regulatory, or release decisions.

## 2. Start With the Task, Not the Tool

Before opening an AI tool, write down:

- The outcome you want.
- The source material the tool needs.
- Information the tool must not receive.
- Actions the tool may take.
- What a useful output looks like.
- How a person will check the result.

For example, "help with requirements" is too broad. A bounded task is:

> Compare these three approved source documents, list conflicting medication-display rules with exact source references, and draft clarification questions. Do not create final requirements.

The bounded version makes it easier to choose a tool, provide only relevant context, recognize completion, and verify the output.

## 3. Choose an Interaction Mode

| Mode | Best suited to | Typical limitation | Example SDLC use |
| --- | --- | --- | --- |
| Chat assistant | Exploration, explanation, critique, and one-off drafting. | Knows only the context supplied in the conversation and may lose detail in long exchanges. | Turn approved workshop notes into candidate themes and open questions. |
| Embedded assistant | Work on the artifact currently open in an editor or platform. | May see only part of a repository or record and may silently inherit surrounding context. | Explain a function, draft a unit test, or rewrite a requirement for clarity. |
| Retrieval assistant | Search and synthesize an approved document collection. | Retrieval can omit the decisive source or return a misleading fragment. | Find related procedures and requirements, then present linked extracts for review. |
| Read-only agent | Explore multiple files or systems and iterate toward an analysis. | Can form a persuasive but incomplete picture when search terms or access are limited. | Map code, tests, interfaces, and documentation affected by a proposed change. |
| Editing agent | Propose coordinated changes and run local checks. | A mistaken plan can alter many artifacts quickly. | Implement a reviewed change in a branch and report the resulting diff and checks. |
| Automated workflow | Repeat a stable, high-volume transformation or classification. | A systematic error can propagate at scale. | Draft release-note entries from accepted change records for human review. |

Use the least capable mode that can complete the task. A chat response may be sufficient where an agent with repository write access would add risk without adding value.

## 4. Understand the Tool Boundary

An AI tool is more than its model. Its interface or harness determines what context is assembled, which tools are available, what actions can run, and what evidence is shown to the user.

Ask these questions before use:

### Context

- Does the tool receive only selected text, the current file, the whole workspace, retrieved documents, conversation history, or external data?
- Can hidden instructions, repository files, retrieved content, or tool output influence the model?
- How much context can the model process before earlier or less relevant details are ignored?

### Data

- Where are prompts, attachments, retrieved sources, and outputs processed and retained?
- Can supplied data be used for service improvement or model training?
- Which approved data classifications can be processed through this path?
- Can users remove unnecessary identifiers, records, logs, or proprietary details before use?

### Capabilities

- Can the tool only answer, or can it search, edit, execute, connect to a network, open issues, send messages, or deploy?
- Which credentials and user permissions does it inherit?
- Does each consequential action require confirmation?
- Can an action be previewed, isolated, reversed, and attributed to a user?

### Evidence

- Does the tool show the files, source extracts, commands, diffs, tests, and errors it used?
- Can accepted output and verification be retained in the normal system of record?
- Can the model or integration change without being obvious to the user?

In a clinical environment, these answers often matter more than a small difference in benchmark scores.

## 5. Use a Capability Ladder

Increase access only when the task demonstrates a need for it:

1. **Ask:** The AI responds using user-supplied, non-sensitive context.
2. **Read:** The AI searches approved files or document collections.
3. **Propose:** The AI prepares a plan, patch, command, or action for inspection.
4. **Act in isolation:** The AI edits a branch or sandbox and runs approved local checks.
5. **Act externally:** The AI changes a shared system or communicates outside the workspace.
6. **Act in production:** The AI can affect a live service or production data.

Most learning and drafting tasks fit levels 1 through 3. Levels 4 through 6 need progressively stronger previews, confirmations, isolation, logging, recovery, and human oversight. Production capability is not a prerequisite for useful deployment assistance.

## 6. Write a Task Brief

A reusable task brief gives the AI enough direction without relying on a long conversational prompt.

```text
Objective
State the one outcome required.

Sources
List the authoritative files, documents, records, or links to use.

Context
Explain relevant users, workflow, terminology, and prior decisions.

Constraints
State exclusions, data boundaries, permitted actions, and standards already adopted by the project.

Tasks
List the analysis or transformation steps in order.

Output
Define the format, level of detail, traceability, and where uncertainty should appear.

Verification
State how a person or executable check will confirm the result.
```

Useful instructions include:

- "Cite the source file and section for every proposed requirement."
- "Separate observed facts, inferences, assumptions, and open questions."
- "List files you inspected and relevant areas you could not inspect."
- "Do not modify files; return an impact analysis only."
- "Show the proposed diff and commands before executing them."
- "Report failed checks and unresolved limitations; do not describe them as successful."

Request visible evidence, assumptions, and uncertainty rather than hidden chain-of-thought. A detailed explanation is still generated content and must be checked against sources or execution results.

## 7. Demonstration: Source-Grounded Analysis

### Scenario

A product team has approved research notes, an existing requirement set, and a clinical terminology guide. It wants clarification questions before a medication-display workshop.

### Suitable Setup

- Chat or retrieval assistant.
- Only the three approved, de-identified sources.
- No write access or external actions.
- Output reviewed by product and clinical subject-matter experts.

### Example Task Brief

```text
Objective
Prepare questions for the medication-display requirements workshop.

Sources
- research-notes.md
- current-requirements.md
- terminology-guide.md

Constraints
- Use only the supplied sources.
- Do not infer a clinical rule or create final requirements.
- Label missing or conflicting information.

Tasks
1. Identify statements about medication naming, status, ordering, and warnings.
2. Group duplicate statements.
3. Identify conflicts and missing decisions.
4. Draft clarification questions.

Output
Return a table with topic, source reference, observed statement, conflict or gap,
and clarification question.

Verification
Every observed statement must be traceable to an exact source section.
```

### Review the Result

Open each cited section and confirm that the table distinguishes source text from interpretation. Look for missing negative findings, such as a source that says nothing about stale data, and for clinical terms that the model may have treated as synonyms.

## 8. Demonstration: Read-Only Repository Agent

### Scenario

An engineering team wants to understand the likely impact of changing a medication-list display before estimating the work.

### Suitable Setup

- Agent with read and repository-search tools.
- No file edits, command execution, network access, issue updates, or deployment access.
- Access limited to the relevant repository and approved documentation.

### Example Task Brief

```text
Objective
Map the likely implementation and verification impact of the proposed display change.

Sources
- Requirement MED-DISPLAY-014
- The current repository
- The architecture overview and test strategy

Constraints
- Read-only analysis. Do not edit files or run commands.
- Do not assume a search result proves absence.
- Distinguish direct evidence from inference.

Tasks
1. Trace the display data from source contract to user interface.
2. Locate related validation, error handling, tests, and documentation.
3. Identify interfaces and shared components that may be affected.
4. List uncertainties and additional access or expertise needed.

Output
Provide an impact table with file or artifact, relevant symbol or section,
evidence, likely impact, confidence reason, and verification question.
Also list the searches performed and areas not inspected.
```

### Review the Result

Engineers inspect the referenced code paths and use repository-native search and build or test commands to check the analysis. Clinical and product participants review inferred workflow impacts. The output informs planning; it is not proof that every affected component was found.

## 9. A Short Working Session

Try this exercise with a low-consequence, non-sensitive artifact:

1. Ask a vague question and save the result.
2. Repeat using the task-brief structure.
3. Compare factual errors, missing context, unsupported assumptions, usefulness, and review effort.
4. Give the tool read-only access to an approved source collection, if available, and repeat.
5. Record which improvement came from the model and which came from better context, retrieval, or tool access.

Then run a capability review:

1. List everything the tool can read, change, execute, or send.
2. Remove capabilities not required for the exercise.
3. Identify which actions are visible, confirmable, reversible, and logged.
4. Decide whether a less capable interaction mode would achieve the same result.

## 10. Common Failure Patterns

| Pattern | What it looks like | Better approach |
| --- | --- | --- |
| Vague delegation | "Review this system and tell me what to do." | Define a bounded outcome, sources, exclusions, format, and verification. |
| Context dumping | Entire repositories or record sets supplied without selection. | Start with the smallest relevant context and let approved search retrieve more. |
| Plausibility acceptance | Fluent output is accepted without opening sources or running checks. | Build source references and executable verification into the task. |
| Capability overshoot | An editing or deployment agent is used for analysis. | Begin read-only and increase capability only when the task requires it. |
| Self-review | The same AI is asked whether its answer is correct. | Use source inspection, executable checks, or an independent reviewer. |
| Hidden incompleteness | The tool reports findings without its search boundary. | Ask for inspected sources, searches, inaccessible areas, and open questions. |
| Accidental disclosure | Logs, screenshots, records, or source files contain restricted data. | Minimize and sanitize context before it enters the tool path. |

## 11. Ready for the Next Playbook

Before moving to more advanced techniques, a team should be able to:

- Match a bounded task to an interaction mode.
- Explain what context the tool receives and what actions it can take.
- Write a task brief with sources, constraints, output, and verification.
- Start with minimal permissions and recognize when more capability is justified.
- Verify generated content through source evidence, executable checks, or independent review.

Playbook 02 explains models, tokens, context, prompting, retrieval, agents, harnesses, tools, capabilities, evaluation, and common limitations.
