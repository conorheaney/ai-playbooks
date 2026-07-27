# AI Playbook Series Progress

Last updated: 27 July 2026

## Working Method

- Draft one playbook at a time and request user review before starting the next.
- Update later content just in time so it reflects feedback from earlier playbooks.
- The series is framework-neutral and intended for a cross-functional audience.
- The series covers AI used as an SDLC assistant, not AI embedded in a clinical product.
- Playbooks 00, 01, and 03-06 use a heavily regulated clinical environment as their context.
- Playbook 02 is the explicit exception: it is a standalone AI concepts guide with no SDLC, clinical, patient, medical, regulated, or regulatory framing.
- Use demonstrations, examples, and practical explanations rather than writing policy or replacement procedures.

## Current Status

| Playbook | File | Status |
| --- | --- | --- |
| 00: AI in the SDLC | `00-ai-enabled-sdlc-overview.md` | Approved. |
| 01: Getting Started with AI Tools | `01-getting-started-with-ai-tools.md` | Approved. |
| 02: AI Concepts and Foundations | `02-ai-concepts-and-foundations.md` | Draft under review; not yet approved. |
| 03: AI-Assisted Planning | Not created | Pending Playbook 02 approval. |
| 04: AI-Assisted Development | Not created | Pending. |
| 05: AI-Assisted Testing | Not created | Pending. |
| 06: AI-Assisted Deployment and Operations | Not created | Pending. |

## Current Review Position

- Playbook 02 remains a draft under review and has not been approved as a whole.
- The current review pass has completed detailed revision of the Introduction, Core Concepts, and Information Pathways chapters, including their integrated illustrations.
- Review is currently in Chapter 5, Agentic Systems. Agents and Harnesses have been substantially revised; Tools, Integrations, Permissions, and Capabilities were most recently split and refined.
- Skills is the next Chapter 5 topic to review, followed by Chapters 6-9: Risks, Assurance, Application, and Reference.
- Playbook 03 remains blocked until Playbook 02 is approved.

## Playbook 02 Decisions

- Write for conceptual understanding rather than as a technical implementation guide.
- Keep high-level technical information, but explain it in accessible language.
- Do not include real-world paradigm block quotes; all were removed as stilted.
- Use short chapter and section names, splitting combined concepts into separate sections.
- Keep related sentences together rather than using many one- or two-sentence paragraphs.
- Keep `Tokens` and `Context Windows` as separate sections.
- Keep the Deployment subsection; the user explicitly chose to leave it unchanged.
- Do not include `Models vs Databases` or the attempted replacement `Model Selection`; both were judged low value.
- Models has level-3 headings for `Model Basics`, `Foundation Models`, `Model Creation`, `Deployment`, and `Model Types`.
- Model Creation has a short summary and a six-step table: Design, Data, Pretraining, Post-training, Evaluation, and Release.
- The `Model Creation` lifecycle illustration is approved and placed before its six-step table.
- Model Types explains capability, weight access, and artifact openness as overlapping dimensions.
- Model examples use current web sources with links, publisher, and home country. They were checked on 26 July 2026.
- The document uses a level-1 title, level-1 numbered chapter headings, level-2 topic headings, and level-3 headings to organize multi-part topics.
- Core Concepts progresses from Models through Tokens, Context, and Generation.
- Information Pathways progresses from Prompt Engineering through Context Engineering, Retrieval-Augmented Generation, and Memory Management; the overlapping Adaptation comparison was removed.
- Agentic Systems prioritizes Agents and Harnesses, followed by Tools, Integrations, Permissions, Capabilities, and Skills; orchestration and delegation are covered as harness responsibilities.
- The `Introduction` illustration uses a campus map to orient readers to ten connected concepts: models, tokens, prompts, context, memory, harnesses, agents, tools, skills, and integrations.
- The `Tokens` illustration uses a two-lane flow to show tokenisation before and after model processing, with a magnified illustrative token split.
- The `Context Windows` illustration uses three identical tanks to show assembled input, model-generated output, unused capacity, and a fixed shared limit over time.
- The `Compaction` illustration uses a before-and-after funnel composition to show recovered context capacity and the risk of losing detail.
- The `Generation` illustration uses a continuous conveyor to show one token being selected, appended, and fed into the next generation step until stopping.
- The `Structured Output` illustration separates structural validation from verification of values against sources and logic.
- The `Prompt Engineering` illustration presents a useful prompt as a modular task brief anchored by its objective.
- The Prompt Engineering comparison illustration shows how a more specific request makes categories, citations, interpretation boundaries, and review questions visible in the response.
- The `Context Engineering` illustration uses a central blueprint to distinguish reusable information-selection and organization decisions from the context assembled for an individual task.
- The first `Retrieval-Augmented Generation` illustration separates collection preparation from request-time search, reranking, context assembly, and referenced generation.
- The second `Retrieval-Augmented Generation` illustration traces claims back through retrieved chunks to source sections and distinguishes citation presence from evidential support.
- The `Memory Management` illustration separates capture and storage from later retrieval, context placement, and possible model use.
- The `Agents` illustration depicts the agent as a robot and keeps the model visibly separate, showing repeated goal-and-state exchange, result updates, completion, and escalation without introducing the harness layer.
- The first `Harnesses` illustration compares a single response, fixed workflow, and agent loop while using a shaded dotted model column to keep model interactions visually separate from harness coordination.
- The second `Harnesses` illustration presents the harness as an application coordinating a multi-agent loop around shared state, with skills and tools inside its boundary and models and integrations outside it.
- The `Tools` illustration separates a tool call into six connected stages: starting the conversation, building context, requesting a tool, checking and running it, returning the result, and responding or repeating.
- The `Integrations` illustration presents one managed connection between a harness and several external systems, distinguishing the integration from the individual operations that travel through it.
- The `Skills` illustration presents a skill as a reusable task kit containing instructions, references, scripts, checks, and tool guidance, while keeping the task, sources, tool, and result outside the package.
- The `Model Basics` illustration is approved as the visual baseline for the series and is stored at `illustrations/02-model-basics-input-model-output.webp`.

## Illustration Style and Creation Process

### Accountable Roles

- The content owner approves the concept, factual meaning, placement, and final illustration.
- The illustration author creates and optimizes the asset, records the generation prompt, and verifies the rendered result.

### Mandatory Baseline

- Trigger: consider an illustration when a concept is materially easier to understand as a relationship, sequence, hierarchy, comparison, or boundary than through prose alone.
- Required inputs: approved surrounding text, the concept to communicate, intended placement, essential relationships, accessibility description, and any content that must not be implied.
- Use a lightweight editorial illustration style with a warm off-white background, rounded geometric forms, restrained navy, teal, sky-blue, coral, and muted-yellow accents, subtle texture, generous whitespace, and consistent line weight.
- Keep embedded text to the minimum needed to understand the visual. Do not place essential explanations only inside the image; provide descriptive alt text and a short caption in the document.
- Avoid vendor logos, trademarks, decorative equations, photorealistic robots, brains, microchips, neon colours, unnecessary interface detail, and visual claims that are not supported by the playbook text.
- Store final assets in `illustrations/` using `<playbook-number>-<section>-<concept>.<format>` filenames.
- Default to a 3:2 landscape WebP at 1200 x 800 pixels. Target no more than 100 KB and use the lowest compression quality that remains visually clean at full document width. Use PNG only when transparency or lossless detail is required.
- Decision gate: the content owner must select and approve a concept before it is treated as final. Rejected variants remain exploratory and must not be referenced by a playbook.
- Before integration, verify conceptual accuracy, label spelling, legibility at document and slide size, alt text, caption, relative path, pixel dimensions, output format, and file size.
- Retain evidence in this file or the relevant review record: approved asset path, approval decision, output dimensions, format, file size, and any approved exception.
- Exception path: the content owner may approve a different aspect ratio, format, palette, text density, or file-size target when the use case requires it; record the reason and approved deviation with the asset decision.

### Recommended Workflow

1. Identify the single teaching point and sketch the visual relationship before choosing decorative elements.
2. When the direction is uncertain, create two or three medium-fidelity alternatives that differ in composition rather than minor styling.
3. Review the alternatives for meaning first, then tone, accessibility, and reuse in presentations.
4. Refine only the selected direction, remove unnecessary text or detail, and generate the final-resolution asset.
5. Optimize the file, integrate it beside the explanatory text, and complete the mandatory verification checks.

### Approved Baseline Asset

- Concept: text, image, audio, and code inputs pass through an abstract model network and emerge as corresponding outputs.
- Style: geometric editorial illustration with `INPUT`, `MODEL`, and `OUTPUT` as the only embedded labels.
- Final asset: `illustrations/02-model-basics-input-model-output.webp`.
- Output: 1200 x 800 WebP, 37,364 bytes.
- Prompt record: a wide 3:2 corporate editorial infographic showing document, image, audio, and code inputs flowing through a layered geometric model network to corresponding outputs; warm off-white background; restrained navy, teal, blue, coral, and muted-yellow palette; only `INPUT`, `MODEL`, and `OUTPUT` labels; no logos, robots, brains, chips, equations, or decorative clutter.
- Approval: Option 1 selected by the content owner on 26 July 2026.

### Approved Introduction Concept Map Asset

- Concept: a campus map places models at the centre of a connected AI environment. Tokens, prompts, context, and memory form the information-facing area; harnesses coordinate the operational area containing agents, tools, and skills; integrations provide an outward connection.
- Style: the approved geometric editorial style expressed as a simplified shallow-elevation campus map, using rounded pavilions, standardized signs, clean connector paths, restrained landscaping, and one concept symbol per building.
- Final asset: `illustrations/02-ai-concepts-campus-map.webp`.
- Output: 1200 x 800 WebP, 72,046 bytes.
- Prompt record: a wide schematic corporate campus map with ten simplified pavilions labelled `MODELS`, `TOKENS`, `PROMPTS`, `CONTEXT`, `MEMORY`, `HARNESSES`, `AGENTS`, `TOOLS`, `SKILLS`, and `INTEGRATIONS`; clean paths and two geometric water areas express relationships without arrows or ranking; architectural and landscaping detail is deliberately reduced to align with the other playbook graphics; warm off-white background and approved palette. The final revision retains six rounded squares for tokens, a robot face for agents, a brain for memory, and an application window for harnesses.
- Approval: the content owner selected the campus-map direction, requested four icon refinements, and then approved the simplified geometric treatment to replace the earlier Introduction illustration on 27 July 2026.
- Interpretation note: map proximity and paths communicate conceptual relationships, not a mandatory workflow, strict system boundary, or implementation architecture.

### Approved Tokens Asset

- Concept: readable input passes through a tokenizer and becomes differently sized tokens for the model; generated tokens pass through the tokenizer again to become a readable response. A magnified inset shows illustrative word fragments, spacing, and punctuation.
- Style: the approved geometric editorial style, using `INPUT`, `TOKENIZER`, `TOKENS`, `MODEL`, and `RESPONSE` as the embedded process labels.
- Final asset: `illustrations/02-tokens-tokenisation-process.webp`.
- Output: 1200 x 800 WebP, 29,652 bytes.
- Prompt record: a wide two-lane corporate editorial infographic with readable input, a tokenizer, varied token tiles, a layered abstract model, generated token tiles, a second tokenizer representation, and a readable response; a circular magnified inset shows short illustrative fragments; warm off-white background and the approved restrained palette; no numeric token IDs, equations, binary digits, vendor marks, robots, brains, chips, people, or decorative clutter.
- Approval: Option 3 selected by the content owner on 26 July 2026.
- Interpretation note: the fragments are illustrative rather than the output of a named tokenizer; the caption states that token boundaries vary by tokenizer.

### Approved Context Window Asset

- Concept: three identical capacity tanks show the same context window over time. The user and AI product contribute to an assembled input at the bottom; the model adds output-token bands directly above the unchanged input; the completed response leaves some capacity unused.
- Style: the approved geometric editorial style, using restrained glass-like tanks and modular token bands rather than literal water or industrial equipment.
- Final asset: `illustrations/02-context-window-fill-over-time.webp`.
- Output: 1200 x 800 WebP, 29,244 bytes.
- Prompt record: a wide three-state corporate editorial infographic with identical glass-like tanks labelled `ASSEMBLE INPUT`, `GENERATE OUTPUT`, and `RESPONSE COMPLETE`; a shared top bracket marks `SAME CONTEXT LIMIT`; user and AI-product cards merge into the input; a layered model adds blue output bands; a legend distinguishes assembled input, model output, and unused capacity; warm off-white background and the approved restrained palette.
- Approval: the content owner selected the three-tank filling-over-time concept for integration on 26 July 2026.
- Interpretation note: solid bands represent tokens already present; clear space represents unused capacity rather than guaranteed output. The completed response intentionally stops below the limit.

### Approved Context Compaction Asset

- Concept: a nearly full context tank passes detailed earlier material through a compaction funnel. A smaller summary enters a second tank, recovering capacity while small discarded fragments show that useful nuance and references may be lost.
- Style: the approved geometric editorial style, reusing the glass-like tank and modular token-band visual language from the Context Window asset.
- Final asset: `illustrations/02-context-compaction.webp`.
- Output: 1200 x 599 WebP, 27,482 bytes.
- Prompt record: a wide before-and-after corporate editorial infographic with a nearly full context tank, a central compaction funnel, a second same-size tank containing preserved current-task blocks and one smaller summary block, clearly recovered empty capacity, and a few faded discarded fragments; warm off-white background and the approved restrained palette; minimal labels and no people, model icon, brain imagery, dense copy, or decorative clutter.
- Approval: Option 1 selected by the content owner for integration on 26 July 2026.
- Interpretation note: the discarded fragments represent information that can be lost or changed during compaction; they do not imply that every compaction operation necessarily loses the same details.

### Approved Generation Asset

- Concept: context and the generated-so-far sequence enter a model; a chooser presents several possible next tokens with relative likelihood bars; one selected token is appended to the sequence, which then repeats through the model or branches to a stop gate.
- Style: the approved geometric editorial style, reusing the layered model and modular token tiles from the Tokens asset in a restrained conveyor metaphor.
- Final asset: `illustrations/02-generation-one-token-at-a-time.webp`.
- Output: 1200 x 600 WebP, 25,724 bytes.
- Prompt record: a wide corporate editorial infographic with context entering a layered abstract model, a continuous generated-so-far token ribbon, three possible next-token tiles with unnumbered relative-likelihood bars, a selector adding exactly one highlighted token, a clear return loop, and a separate stop gate; warm off-white background and the approved restrained palette; no percentages, confidence claims, full prose sentences, brains, robots, chips, equations, vendor marks, or factory clutter.
- Approval: Option 3 selected by the content owner for integration on 26 July 2026.
- Interpretation note: the differently sized bars represent relative next-token likelihoods, not factual confidence or verification. The conveyor is an explanatory metaphor rather than a literal model component.

### Approved Structured Output Asset

- Concept: one structured response sits inside two distinct validation layers. The outer layer checks required fields and value types; the inner layer examines values against sources, calculations, and internal consistency, leaving one value marked for review despite the valid shape.
- Style: the approved geometric editorial style, using nested rounded validation frames, field rows, and restrained evidence icons.
- Final asset: `illustrations/02-structured-output-validation-layers.webp`.
- Output: 1200 x 675 WebP, 33,598 bytes.
- Prompt record: a wide corporate editorial infographic centred on a three-field structured response card inside an outer `STRUCTURE` frame for fields and types and an inner `CONTENT` frame connected to source, calculation, and consistency checks; the footer contrasts `VALID SHAPE` with `REVIEW VALUES`; warm off-white background and the approved restrained palette; no dense JSON, paragraphs, traffic-light dashboard, brains, robots, chips, or vendor marks.
- Approval: Option 3 selected by the content owner for integration on 26 July 2026.
- Interpretation note: structural validity can be enforced mechanically, but the content checks shown are conceptual and do not imply that correctness is automatically guaranteed.

### Approved Prompt Engineering Asset

- Concept: a useful prompt is presented as a modular task brief. A prominent objective anchors six supporting components for context, sources, constraints, tasks, output requirements, and checks.
- Style: the approved geometric editorial style, using one large rounded brief containing detachable-looking component cards with restrained symbols and abstract line marks.
- Final asset: `illustrations/02-prompt-engineering-prompt-anatomy.webp`.
- Output: 1200 x 675 WebP, 29,792 bytes.
- Prompt record: a wide corporate editorial infographic showing one central `PROMPT` task-brief card, a prominent `OBJECTIVE` band, and six balanced modular cards labelled `CONTEXT`, `SOURCES`, `CONSTRAINTS`, `TASKS`, `OUTPUT`, and `CHECKS`; warm off-white background and the approved restrained palette; no model icon, fixed-sequence arrows, numbered steps, paragraphs, dense interface, brains, robots, chips, or vendor marks.
- Approval: Option 1 selected by the content owner for integration on 26 July 2026.
- Interpretation note: the modules represent commonly useful prompt components rather than a mandatory checklist or ordered workflow. The surrounding caption makes this optionality explicit.

### Approved Prompt Comparison Asset

- Concept: two supplied documents are shown feeding the same content into two prompts. A vague summarization request produces a general narrative and unresolved reviewer questions; a specific comparison request produces categorized agreements, conflicts, missing information, and questions with citations and separated interpretations.
- Style: the approved geometric editorial style, using two document icons, aligned prompt and response panels, a small human reviewer, and a compact review checklist.
- Final asset: `illustrations/02-prompt-engineering-document-comparison.webp`.
- Output: 1200 x 675 WebP, 81,026 bytes.
- Prompt record: a wide split corporate editorial infographic with two centred document icons branching to aligned prompt boxes; exact vague and specific document-analysis prompts; a narrative summary with four reviewer-question cards on the left; and a complete comparison table with `TYPE`, `SOURCE STATEMENT`, `CITATION`, and `INTERPRETATION` columns plus a two-item review checklist on the right; warm off-white background and approved palette; no vague/specific headers or prompt icons.
- Approval: the content owner selected the refined document-comparison concept for integration on 26 July 2026.
- Interpretation note: the visual demonstrates clearer structure and reviewability, not guaranteed accuracy. Citations and interpretations remain illustrative.

### Approved Context Engineering Asset

- Concept: a shared pool of instructions, history, sources, task state, tool definitions, and tool results passes through a reusable context blueprint. The blueprint represents selection, ordering, conflict resolution, and fitting decisions; two task tanks receive different context arrangements, while excluded or conflicting material remains outside.
- Style: the approved geometric editorial style, extending the established bottom-filled context-tank analogy with a central four-part blueprint and restrained source cards.
- Final asset: `illustrations/02-context-engineering-blueprint.webp`.
- Output: 1200 x 800 WebP, 34,938 bytes.
- Prompt record: a wide corporate editorial infographic with six compact information-source cards on the left, a central blueprint labelled `SELECT`, `ORDER`, `RESOLVE`, and `FIT`, and two task-specific context tanks on the right labelled `TASK A` and `TASK B`; each tank contains a different bottom-up arrangement with unused capacity above; stale or conflicting cards remain outside the selected routes; warm off-white background and approved palette; no title, paragraphs, legend, robots, brains, chips, vendor marks, or dense interface.
- Approval: Candidate 1 selected by the content owner for integration on 27 July 2026.
- Interpretation note: the four blueprint concerns are design considerations rather than a mandatory ordered workflow. The two tanks illustrate that reusable engineering decisions can produce different per-request assemblies.

### Approved RAG System Workflow Asset

- Concept: a two-band workflow separates preparation of a searchable collection from use of that collection for an individual request. Sources are extracted, divided into chunks with metadata, and represented in search and vector indexes; a question searches both indexes, candidates are reranked, selected referenced chunks enter context, and the model generates an answer with references.
- Style: the approved geometric editorial style, using aligned preparation and request-use bands, restrained index cards, chunk cards, the established context tank, and a compact model and answer path.
- Final asset: `illustrations/02-rag-system-workflow.webp`.
- Output: 1200 x 800 WebP, 45,764 bytes.
- Prompt record: a wide folded corporate editorial workflow. The upper band contains `SOURCES`, `EXTRACT + OCR`, `CHUNKS + METADATA`, `SEARCH INDEX`, and `VECTOR INDEX`; a connecting turn leads to a lower band containing `QUESTION`, `SEARCH`, `RERANK`, selected and excluded chunks, `CONTEXT`, `MODEL`, and `ANSWER + REFERENCES`. A refresh symbol indicates that indexes require updating; warm off-white background and approved palette; no vendors, equations, robots, brains, chips, or dense interface.
- Approval: Candidate 3 selected by the content owner for integration on 27 July 2026.
- Interpretation note: the workflow is conceptual. Search, vector similarity, reranking, and references improve access and inspectability but do not guarantee that decisive evidence is retrieved or correctly applied.

### Approved RAG Traceability Asset

- Concept: three source sections retain identifiers as corresponding chunks enter context and contribute to generated claims. Two source-to-claim evidence threads remain supported, while a third claim cites a real source that does not support it.
- Style: the approved geometric editorial style, using aligned source cards, a transparent context tank, one abstract model, claim rows, preserved reference tags, and continuous or broken evidence threads.
- Final asset: `illustrations/02-rag-source-to-claim-traceability.webp`.
- Output: 1200 x 675 WebP, 37,248 bytes.
- Prompt record: a wide claim-to-source evidence ledger labelled `SOURCES`, `CONTEXT`, `MODEL`, and `CLAIMS + CITATIONS`; source documents and retrieved chunks carry matching `#12`, `#27`, and `#34` reference tags; supported evidence paths remain continuous, while the `#27` path ends in a coral `NOT SUPPORTED` warning; warm off-white background and approved palette; no substantive example claims, URLs, vendors, robots, brains, chips, or dense interface.
- Approval: Candidate 3 selected by the content owner for integration on 27 July 2026.
- Interpretation note: preserved reference identifiers establish traceability only. Review must still compare each generated claim with the cited source content.
- Approved exception: use a 1200 x 675 wide-strip aspect ratio instead of the 3:2 default because the parallel source-to-claim evidence paths require additional horizontal space. The WebP format and file-size target remain unchanged.

### Approved Memory Management Asset

- Concept: a two-phase lifecycle separates the decision to store information and save it with scope from its possible later retrieval, placement into a request context, and use or non-use by the model. A `NOT STORED` branch and subdued ignore route make the conditional paths explicit.
- Style: the approved geometric editorial style, using two clean horizontal bands, a scoped memory cabinet, the established transparent context-tank analogy, and an abstract model endpoint.
- Final asset: `illustrations/02-memory-management-lifecycle.webp`.
- Output: 1200 x 800 WebP, 54,550 bytes.
- Prompt record: a wide two-phase corporate editorial lifecycle. The upper band contains `INFORMATION APPEARS`, `STORE?`, a `NOT STORED` branch, and `SAVE + SCOPE`; a clock turns the path into a lower band containing `RETRIEVE LATER`, `PLACE IN CONTEXT`, and `USE OR IGNORE`. One tagged card is selected from a cabinet containing several stored cards and enters a finite context tank before reaching the model; warm off-white background and approved palette; no scope names, closed loop, vendor marks, robots, brains, chips, or dense interface.
- Approval: Candidate 3 selected by the content owner for integration on 27 July 2026.
- Interpretation note: the path communicates a conceptual lifecycle rather than guaranteed or automatic progression. Stored information may not be retrieved, retrieved information may not be applied, and use does not imply correct application.

### Approved Agents Decision Loop Asset

- Concept: a robot agent carries a goal and current state into repeated interactions with a distinct model. The model returns a next step to the agent, the resulting observation updates the loop, and secondary branches allow completion or a request for help.
- Style: the approved geometric editorial style, using a friendly robot face for the agent, the established layered network for the model, restrained directional connectors, and compact state and result cards.
- Final asset: `illustrations/02-agents-decision-loop.webp`.
- Output: 1200 x 800 WebP, 34,776 bytes.
- Prompt record: refine selected Candidate 3 so `NEXT STEP` sits fully on an unmistakable model-to-agent return connector and points left toward the robot; preserve `AGENT`, `GOAL`, `CURRENT STATE`, `MODEL`, `NEXT STEP`, `RESULT`, `FINISH`, and `ASK FOR HELP`; warm off-white background and approved palette; no humans, harnesses, application windows, runtime containers, tools, permissions, code, brains, chips, vendor marks, or extra labels.
- Approval: Candidate 3 selected by the content owner for integration on 27 July 2026; the model-to-agent direction was clarified before finalization.
- Interpretation note: the robot is a visual metaphor for goal-directed agent behaviour, not a separate human-like actor. The diagram isolates the agent-model interaction and intentionally omits the harness and tool-execution layers.

### Approved Harness Operating Modes Asset

- Concept: three horizontal lanes show one harness coordinating a single response, a fixed workflow, or an agent loop. Each lane interacts with an identically sized model card in a vertically aligned shaded column, while only the agent lane includes a robot and return loop.
- Style: the approved geometric editorial style, using one application-shaped harness frame, compact process cards, a friendly robot agent, and subtle dotted vertical boundaries around the model column.
- Final asset: `illustrations/02-harness-operating-modes.webp`.
- Output: 1200 x 800 WebP, 46,748 bytes.
- Prompt record: refine the original three-lane operating-modes composition while preserving every stage; align the three actual network-model cards vertically; place each in a pale shaded strip bounded by vertical dotted lines; contain all network nodes inside the model cards; remove horizontal dotted trails; retain `HARNESS`, `SINGLE RESPONSE`, `FIXED WORKFLOW`, `AGENT LOOP`, `CURRENT STATE`, and `NEXT STEP`; warm off-white background and approved palette.
- Approval: the content owner supplied and approved the final refined image for integration on 27 July 2026.
- Interpretation note: the shaded dotted column communicates conceptual separation between model calls and harness coordination. It does not prescribe whether the model is local or remote, or whether harness responsibilities are implemented in one application or distributed services.

### Approved Harness Application Ecosystem Asset

- Concept: an application-shaped harness coordinates three robot agents around shared current state. Skills provide reusable procedures inside the application, tools provide controlled operations, and distinct connections lead to a model above and external integrations outside the application boundary.
- Style: the approved geometric editorial style, using a compact hub-and-orbit composition, friendly robot faces for agents, grouped connection rails, minimal labels, and a restrained application boundary.
- Final asset: `illustrations/02-harness-application-ecosystem.webp`.
- Output: 1200 x 800 WebP, 38,274 bytes.
- Prompt record: create a lightweight corporate infographic showing a harness as an application rather than a physical harness; place three robot agents in a multi-agent loop around shared state; keep skills and tools within the harness; place the model and integrations outside its boundary; use grouped, restrained connectors and the established warm off-white, navy, teal, blue, coral, and muted-yellow visual language; avoid humans, dense interface detail, decorative wiring, vendor marks, brains, chips, and neon effects.
- Approval: Candidate 2 selected by the content owner for integration on 27 July 2026.
- Interpretation note: the application boundary communicates responsibility rather than a required deployment topology. Skills influence agent behaviour but do not grant permission, tools expose operations through the harness, and integrations connect those operations to external systems.

### Approved Model Creation Asset

- Concept: six ordered stations show Design, Data, Pretraining, Post-training, Evaluation, and Release; a small iteration symbol within Evaluation indicates that evaluation can inform further work without prescribing a single return path.
- Style: the approved geometric editorial style, using the six stage names as the only embedded text.
- Final asset: `illustrations/02-model-creation-lifecycle.webp`.
- Output: 1200 x 461 WebP, 38,372 bytes.
- Prompt record: a wide corporate editorial lifecycle showing six rounded geometric stations connected left to right; concept-specific symbols for each stage; warm off-white background; restrained navy, teal, sky-blue, coral, and muted-yellow palette; no vendor marks, robots, brains, chips, equations, or decorative text. The initial lower feedback arrows were replaced by one small iteration symbol within Evaluation after review.
- Approval: the content owner requested removal of the confusing lower arrows and approved significant vertical cropping before integration on 26 July 2026.
- Approved exception: use a 1200 x 461 wide-strip aspect ratio instead of the 3:2 default because the six-stage linear lifecycle benefits from reduced vertical whitespace. The WebP format and file-size target remain unchanged.

### Approved Tool Request Workflow Asset

- Concept: six connected stages show a user starting a conversation, the harness building context, the model returning a tool request with metadata, the harness checking availability and invoking the tool, the tool result returning to the harness, and the enriched context returning to the model for a response or another tool request.
- Style: the approved geometric editorial style, using six rounded stage panels, restrained directional connectors, the established application-window harness and layered-network model symbols, compact context bundles, and minimal embedded text.
- Final asset: `illustrations/02-tool-request-workflow.webp`.
- Output: 1200 x 800 WebP, 73,686 bytes.
- Prompt record: restyle the approved six-stage serpentine workflow to match the repository baseline; retain `START`, `BUILD CONTEXT`, `MODEL REQUESTS TOOL`, `CHECK + RUN`, `RETURN RESULT`, and `RESPOND OR REPEAT`; use a warm off-white background, restrained navy, teal, sky-blue, coral, and muted-yellow palette, fine connectors, modular cards, soft shadows, and consistent line weight; preserve the tool-result direction into the harness and the final response-or-repeat branch.
- Approval: the content owner supplied the selected image and requested its integration on 27 July 2026.
- Interpretation note: the diagram shows a conceptual client-side tool loop. A provider-side tool may perform some stages internally, and the availability check does not by itself imply that permission or confirmation requirements have been satisfied.

### Approved Integrations Managed Gateway Asset

- Concept: three operations exposed by a harness pass through one integration to cloud, database, and business-application systems. The integration contains symbols for authentication, data translation, and connectivity, while paired directional connectors distinguish outward requests from returning results.
- Style: the approved geometric editorial style, using three calm zones, rounded operation and system cards, fine bidirectional connectors, minimal labels, and a restrained central gateway.
- Final asset: `illustrations/02-integrations-managed-gateway.webp`.
- Output: 1200 x 800 WebP, 45,322 bytes.
- Prompt record: depict an integration as a managed bridge between a harness and multiple external systems; show search, data, and action operations on the harness side; place authentication, translation, and connectivity symbols inside one central integration gateway; connect to cloud, database, and business-application systems; use paired request-and-result paths, the approved warm off-white background, restrained palette, fine line weight, subtle texture, and minimal embedded text.
- Approval: Candidate 1 selected by the content owner for integration on 27 July 2026.
- Interpretation note: the three aligned rows are illustrative examples, not a claim that each operation uses only one integration concern. Authentication does not itself grant permission, and a connected capability is not necessarily exposed to the model.

### Approved Skills Open Kit Asset

- Concept: one open skill kit contains five reusable components: instructions, references, scripts, checks, and tool guidance. A task enters from the left, a result exits on the right, and optional sources and a tool remain outside the skill boundary.
- Style: the approved geometric editorial style, using one dominant open case, five balanced component cards, subdued external dependencies, minimal connectors, and the restrained repository palette.
- Final asset: `illustrations/02-skills-open-kit.webp`.
- Output: 1200 x 800 WebP, 41,874 bytes.
- Prompt record: depict a skill as a reusable task kit whose contents combine procedural guidance and supporting material; place `INSTRUCTIONS`, `REFERENCES`, `SCRIPTS`, `CHECKS`, and `TOOL GUIDANCE` inside one central `SKILL` case; keep `TASK`, `SOURCES`, `TOOL`, and `RESULT` small and outside; use the approved warm off-white background, rounded geometric forms, restrained palette, fine line weight, subtle texture, soft shadows, and generous whitespace.
- Approval: Candidate 1 selected by the content owner for integration on 27 July 2026.
- Interpretation note: the component cards describe material a skill may package rather than mandatory contents or an ordered workflow. A skill can guide tool use but does not provide credentials, grant permission, create an integration, or execute work independently.

## Next Action

1. Continue Chapter 5 review with Skills, then complete a consistency pass across the full Agentic Systems chapter.
2. Review Chapters 6-9 in order: Risks, Assurance, Application, and Reference.
3. If the remaining Playbook 02 content is approved, mark Playbook 02 complete and draft only Playbook 03; otherwise update only Playbook 02 and request review again.

## Remaining Structure

### Playbook 03: AI-Assisted Planning

- Discovery, source analysis, and stakeholder preparation.
- Requirements, assumptions, acceptance criteria, and traceability.
- Risk, privacy, security, safety, and regulatory planning support.
- Example prompts, tool patterns, worked examples, verification techniques, and practical exercises.

### Playbook 04: AI-Assisted Development

- Codebase exploration, design, coding, refactoring, review, and documentation.
- Context preparation, tool permissions, generated-code review, provenance, and reproducibility.
- Example prompts, agent patterns, worked examples, verification techniques, and practical exercises.

### Playbook 05: AI-Assisted Testing

- Test design, automation, test data, coverage, boundary cases, and failure analysis.
- Independent expected results, probabilistic AI evaluation, adversarial testing, and execution evidence.
- Example prompts, tool patterns, worked examples, verification techniques, and practical exercises.

### Playbook 06: AI-Assisted Deployment and Operations

- Release preparation, runbooks, configuration comparison, deployment support, monitoring, incident analysis, and rollback.
- Human release authority, environment verification, production access boundaries, and observed evidence.
- Example prompts, tool patterns, worked examples, verification techniques, and practical exercises.

## Final Reconciliation

After Playbook 06 is approved:

- Reconcile names and cross-references across all playbooks.
- Check terminology, scope boundaries, examples, and safeguards for consistency.
- Check Markdown links, including current external model references in Playbook 02.
- Confirm that no playbook introduces an unsupported regulatory framework or jurisdiction.
- Perform manual verification only; this repository has no automated documentation toolchain.
