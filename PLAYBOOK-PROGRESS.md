# AI Playbook Series Progress

Last updated: 26 July 2026

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
- Knowledge and Context progresses from Prompt Engineering through Context Engineering, Retrieval-Augmented Generation, and Memory; the overlapping Adaptation comparison was removed.
- Action and Agency progresses from Tools and Integrations through Harnesses, Permissions and Capabilities, Workflows and Agents, and Orchestration.
- The `AI Landscape` illustration uses a hub-and-orbit composition to show that a model is one coordinated component of a complete AI product.
- The `Tokens` illustration uses a two-lane flow to show tokenisation before and after model processing, with a magnified illustrative token split.
- The `Context Windows` illustration uses three identical tanks to show assembled input, model-generated output, unused capacity, and a fixed shared limit over time.
- The `Compaction` illustration uses a before-and-after funnel composition to show recovered context capacity and the risk of losing detail.
- The `Generation` illustration uses a continuous conveyor to show one token being selected, appended, and fed into the next generation step until stopping.
- The `Structured Output` illustration separates structural validation from verification of values against sources and logic.
- The `Prompt Engineering` illustration presents a useful prompt as a modular task brief anchored by its objective.
- The Prompt Engineering comparison illustration shows how a more specific request makes categories, citations, interpretation boundaries, and review questions visible in the response.
- The `Context Engineering` illustration uses a central blueprint to distinguish reusable information-selection and organization decisions from the context assembled for an individual task.
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

### Approved AI Landscape Asset

- Concept: an AI product encloses a central model and five coordinated modules for instructions and context, retrieval and memory, tools and permissions, harness and interface, and evaluation and monitoring; a request enters the product and a useful response leaves it.
- Style: the approved geometric editorial style, using component names as the only embedded explanatory text.
- Final asset: `illustrations/02-ai-landscape-ai-product-components.webp`.
- Output: 1200 x 800 WebP, 31,782 bytes.
- Prompt record: a wide hub-and-orbit corporate editorial infographic with a layered abstract model at the centre, five rounded supporting modules, an enclosing `AI PRODUCT` boundary, and simple request and response cards; warm off-white background; restrained navy, teal, sky-blue, coral, and muted-yellow palette; no vendor marks, robots, brains, chips, equations, binary digits, people, dense interfaces, or decorative clutter.
- Approval: Option 1 selected by the content owner on 26 July 2026.

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

### Approved Model Creation Asset

- Concept: six ordered stations show Design, Data, Pretraining, Post-training, Evaluation, and Release; a small iteration symbol within Evaluation indicates that evaluation can inform further work without prescribing a single return path.
- Style: the approved geometric editorial style, using the six stage names as the only embedded text.
- Final asset: `illustrations/02-model-creation-lifecycle.webp`.
- Output: 1200 x 461 WebP, 38,372 bytes.
- Prompt record: a wide corporate editorial lifecycle showing six rounded geometric stations connected left to right; concept-specific symbols for each stage; warm off-white background; restrained navy, teal, sky-blue, coral, and muted-yellow palette; no vendor marks, robots, brains, chips, equations, or decorative text. The initial lower feedback arrows were replaced by one small iteration symbol within Evaluation after review.
- Approval: the content owner requested removal of the confusing lower arrows and approved significant vertical cropping before integration on 26 July 2026.
- Approved exception: use a 1200 x 461 wide-strip aspect ratio instead of the 3:2 default because the six-stage linear lifecycle benefits from reduced vertical whitespace. The WebP format and file-size target remain unchanged.

## Next Action

1. Continue review of Playbook 02 with the approved `Model Basics` illustration and illustration baseline in place.
2. If the remaining Playbook 02 content is approved, mark Playbook 02 complete and draft only Playbook 03.
3. If revisions are requested, update only Playbook 02 and ask for review again.

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
