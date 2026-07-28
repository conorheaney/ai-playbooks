PLAYBOOK 02: AI-ASSISTED PLANNING

# 1. Purpose

This playbook follows the medication-display change introduced in Playbook 01 and looks more closely at three opportunities for AI during planning. Each opportunity uses one of the Ask, Search, and Act modes with the same human-led Loop: Define, Provide Context, Set Access, Request Evidence, Check, and Accept or Revise.

The examples show AI helping a team clarify the overall concept, build the context around it, and prepare a high-level User Requirements Specification (URS) statement. People still supply stakeholder knowledge, resolve uncertainty, assess risk, and approve the concept that moves into Design.

# 2. Three Planning Opportunities

The starting idea is to improve the medication list so clinicians can identify current medication and understand its status. Research supports the need, but the intended outcome, scope, terminology, and treatment of unknown or stale status are not yet clear. Planning aims to turn that idea into a supported concept definition and high-level URS statement, without deciding the detailed software behaviour or design.

| Opportunity | Mode | Planning outcome | Playbook 00 connection |
| --- | --- | --- | --- |
| Explore the concept | Ask | Possible concept framings, assumptions, and stakeholder questions. | Prompt engineering |
| Build the context | Search | Source-linked needs, constraints, gaps, and risks. | Retrieval-augmented generation |
| Prepare the concept and URS brief | Act | A reviewable concept definition and high-level URS statement. | Permissions |

The mode changes as the work becomes broader and more actionable. The Loop remains the same, giving people a familiar way to set up, inspect, and decide what happens to each result.

# 3. Ask: Explore the Idea

The first opportunity is to explore what the change is trying to achieve before searching a large collection or drafting a requirement. Ask suits a small set of material supplied directly in the conversation. It can help a team consider several ways to frame the user need, expose assumptions, and prepare questions for a workshop without presenting one answer as the concept.

## Concept Connection: Prompt Engineering

Playbook 00 describes a prompt as direction that may include an objective, background, sources, constraints, tasks, output, and checks. This is useful during exploration because a vague request such as *“What should we do with medication status?”* may jump to a solution before the need and intended outcome are understood.

A more useful Ask prompt could be:

> Using the change idea, research excerpt, and terminology definitions supplied below, suggest three ways to frame the user need and intended outcome. For each, identify affected users, scope, assumptions, possible benefits, risks, and stakeholder questions. Keep the framing independent of a particular display or ordering solution. Do not recommend an option or draft detailed software behaviour.

The prompt encourages breadth while keeping the stopping point clear. It also makes assumptions and questions part of the expected output rather than allowing the model to fill gaps silently.

## Ask With the Loop

| Loop stage | How it appears in this use case |
| --- | --- |
| Define | Explore possible ways to express the medication-list need and prepare workshop questions. |
| Provide Context | Supply the change idea, selected research excerpt, terminology definitions, and known constraints. |
| Set Access | Use Ask with only the supplied material; no repository or external access is needed. |
| Request Evidence | Keep quoted or paraphrased source statements separate from interpretations and assumptions. |
| Check | Product and clinical reviewers compare the output with the supplied excerpts and their knowledge of the workflow. |
| Accept or Revise | Useful questions move into the workshop; weak interpretations can be corrected or explored again. |

The result is not a requirement. It is a clearer conversation starter: possible problem statements, users, outcomes, scope boundaries, and questions such as what “current” means and whether stale or unknown status changes the user need.

# 4. Search: Build the Context

The second opportunity begins when the small supplied bundle is no longer enough. Relevant material may sit across research notes, existing requirements, terminology guidance, support records, risk files, policies, and approved standards. Search can help build the context needed to define the concept and show where the proposed need is supported, constrained, or unclear.

## Concept Connection: Retrieval-Augmented Generation

Playbook 00 explains that retrieval-augmented generation brings selected material from an external collection into model context. Preserved references can make findings easier to inspect, but retrieval may miss decisive material and a real citation may not support the claim beside it. For planning, the search boundary is therefore part of the result.

A Search prompt could be:

> Search the approved planning collection for evidence about clinicians identifying current medication and understanding medication status. Include related workflow, terminology, accessibility, privacy, security, safety, and regulatory considerations. Group findings as supported need, constraint, conflict, gap, risk question, or possibly outdated material. Include the source, version, and section for each finding. Report sources that were not searched or could not be accessed. Draft clarification questions separately; do not define detailed software behaviour.

This gives the team a source-linked view rather than a general summary. It also invites the search to look for missing and conflicting material, not just content that supports the candidate wording.

## Search With the Loop

| Loop stage | How it appears in this use case |
| --- | --- |
| Define | Find the evidence, constraints, gaps, and risks needed to define the medication-list concept. |
| Provide Context | Identify the change idea, relevant terms, date range, approved collections, and source priorities. |
| Set Access | Give a read-only agent access to the approved planning sources, with sensitive or irrelevant collections excluded. |
| Request Evidence | Ask for source versions, sections, searches, inaccessible areas, interpretations, and unresolved questions. |
| Check | Reviewers open the cited passages, test whether they support each claim, and look for important omitted sources. |
| Accept or Revise | Supported findings inform the concept and URS discussion; unsupported claims are removed and search gaps may lead to another pass. |

The output may support a need for clinicians to recognise current medication and understand status, while leaving display, ordering, and stale-data behaviour for later definition. It may also surface scope limits, terminology, accessibility, data, safety, or regulatory questions. People decide which findings become part of the concept, its context, assumptions, risks, or open questions.

# 5. Act: Prepare the Concept and URS Brief

The third opportunity comes after the team has resolved enough of the main questions to describe the concept clearly. Act can help place accepted content into a controlled planning template, preserve source links, and prepare a coherent review draft. It is most useful when the artifact structure and editing boundary are already understood.

The concept and URS brief could include:

- A concise problem and opportunity statement.
- Intended users, workflow, outcome, scope, and exclusions.
- Agreed terminology, assumptions, constraints, gaps, and risks.
- A high-level URS statement linked to its supporting sources.
- Open questions, owners, decisions, and the context needed by Design.

For this example, a candidate statement might be `URS-MED-014`: *"The medication list shall enable clinicians to identify current medications and understand the status of each medication."* Design can use that approved need and its context to develop the SRS, acceptance criteria, architecture, and API contracts.

## Concept Connection: Permissions

Playbook 00 separates tool availability from permission. An editing operation may exist, but that does not mean an AI system has authority to overwrite an approved document or publish a new baseline. A prompt can describe the intended boundary; permissions and workflow controls enforce it.

An Act task brief could be:

> Using only the accepted planning findings and the supplied template, prepare a draft concept and URS brief in the review workspace. Include the problem, users, intended outcome, scope, exclusions, terminology, assumptions, constraints, gaps, risks, high-level URS statement, source links, and open decisions. Mark unresolved information rather than inventing it. Show the files changed and provide a diff. Do not edit approved baselines, publish the brief, or approve the URS.

## Act With the Loop

| Loop stage | How it appears in this use case |
| --- | --- |
| Define | Prepare one reviewable concept and URS brief from accepted findings, with no approval or publication. |
| Provide Context | Supply accepted findings, source links, the template, naming rules, and the current draft. |
| Set Access | Allow editing only in an isolated review workspace; keep approved baselines and publishing actions unavailable. |
| Request Evidence | Ask for changed files, diffs, preserved identifiers, validation results, unresolved fields, and failed checks. |
| Check | Document owners inspect the wording, links, classifications, and differences against the accepted decisions and sources. |
| Accept or Revise | Reviewed changes may enter the normal approval process; gaps return to the draft or an earlier planning conversation. |

Stable checks can complement the agent by finding duplicate identifiers, missing required fields, or broken source links. Human reviewers decide whether the concept is clear, the high-level URS expresses the accepted need, the supporting context is sufficient, and the open questions and risks are visible enough for Design.

# 6. What the Three Examples Teach

The three opportunities show a gradual change in capability and access:

- Ask helps widen and clarify the conversation using supplied context.
- Search adds approved source collections and traceable retrieval.
- Act adds bounded editing once people have accepted the underlying planning decisions.

Moving to a more capable mode is not the measure of progress. Ask may reveal that the change is not understood, Search may show that a source is missing, and Act may expose an unresolved field that belongs back in the workshop. In each case, the Loop allows the team to use what it learned and revise the task.

A short practice run could use another change idea with an unclear user need. The team could try an Ask prompt to explore possible concept framings, a Search task to build source-backed context, and an Act task that prepares a disposable concept and URS brief. Comparing what each mode adds, what it cannot establish, and what people still need to decide makes the boundaries visible.

# 7. Summary

AI can support planning at three useful points: exploring the concept, building its context, and preparing a high-level URS brief for review. Prompt engineering helps shape the Ask, retrieval supports source-linked Search, and permissions keep Act within its intended boundary. The mode changes, but the human-led Loop keeps context, evidence, checking, and decisions connected as the concept moves towards Design.
