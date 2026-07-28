# AI Playbook Rules

Last updated: 28 July 2026

This document governs tracking and content rules for the playbook series that covers the use of AI in the software development life cycle and the shared conventions that keep the series aligned as it grows.

## Source of Truth

- Treat this file as the top-level tracker for the AI in the software development life cycle (SDLC) playbook series.
- Use the `Playbook Themes` section to keep individual playbook content on track.
- Keep the series framework-neutral and intended for a cross-functional audience.
- Keep the series focused on the use of AI in the SDLC.
- Frame AI as an assistive technology within human-led SDLC work, not as a replacement for professional judgement or decision authority.
- Treat Playbook 00 as a standalone concepts guide without SDLC or regulated-clinical framing.
- Stick to the language style and tone in `Editorial Standards` when drafting playbooks.
- Follow the `Illustration Workflow` when the user asks to generate illustrations.
- Track live playbook progress in `Playbook Status`.
- Use the `Playbook Status` section to determine the next recommended action.
- Record detailed asset decisions and approvals in `DECISION-LOG.md`.

## Playbook Status

| Playbook | File | Status |
| --- | --- | --- |
| 00: AI Concepts | `00-ai-concepts.md` | Draft; under review. |
| 01: Using AI in the SDLC | `01-using-ai-in-the-sdlc.md` | Complete. |
| 02: AI-Assisted Planning | `02-ai-assisted-planning.md` | Draft; under review. |
| 03: AI-Assisted Design | Not created | Blocked pending Playbook 02 approval. |
| 04: AI-Assisted Development | Not created | Pending. |
| 05: AI-Assisted Testing | Not created | Pending. |
| 06: AI-Assisted Deployment | Not created | Pending. |

## Playbook Themes

Playbooks 02-06 include example prompts, tool or agent patterns, worked examples, verification techniques, and practical exercises.

### Playbook 00: AI Concepts

- Explain the core building blocks of modern AI systems in plain language.
- Cover models, tokens, prompts, context, retrieval, memory, tools, agents, harnesses, skills, and integrations.
- Focus on how the concepts fit together rather than implementation details.
- Support later playbooks with shared vocabulary and mental models.

### Playbook 01: Using AI in the SDLC

- Series scope, audience, and what the playbooks do and do not cover.
- Where AI can help across planning, design, development, testing, and deployment.
- Start with the task and choose the least capable interaction mode that can complete it.
- Understand tool boundaries, context limits, permissions, and evidence.
- Prepare, prompt, and verify bounded work clearly.
- Safety, judgment, and human review as the baseline.

### Playbook 02: AI-Assisted Planning

- Discovery, source analysis, and stakeholder preparation.
- Concept definition, context, stakeholder needs, high-level URS, assumptions, gaps, and traceability.
- Risk, privacy, security, safety, and regulatory planning support.

### Playbook 03: AI-Assisted Design

- Translation of the approved URS into SRS requirements and acceptance criteria.
- Solution exploration, architecture, APIs, interfaces, data flows, trade-offs, constraints, and design decisions.
- Design evidence, review, traceability, and handoff into development.

### Playbook 04: AI-Assisted Development

- Codebase exploration, coding, refactoring, review, and documentation.
- Context preparation, tool permissions, generated-code review, provenance, and reproducibility.

### Playbook 05: AI-Assisted Testing

- Test design, automation, test data, coverage, boundary cases, and failure analysis.
- Independent expected results, probabilistic AI evaluation, adversarial testing, and execution evidence.

### Playbook 06: AI-Assisted Deployment

- Release preparation, runbooks, configuration comparison, deployment support, smoke checks, and rollback.
- Human release authority, environment verification, production access boundaries, and observed evidence.

## Final Reconciliation

After Playbook 06 is approved:

- Reconcile names and cross-references across all playbooks.
- Check terminology, scope boundaries, examples, and safeguards for consistency.
- Check Markdown links, including current external model references in Playbook 00.
- Confirm that no playbook introduces an unsupported regulatory framework or jurisdiction.
- Perform manual verification only; this repository has no automated documentation toolchain.

## Editorial Standards

- Draft one playbook at a time and request user review before starting the next.
- Update later content just in time so it reflects feedback from earlier playbooks.
- Use demonstrations, examples, and practical explanations rather than policy or replacement procedures.
- Prefer a conversational style with plain, concise, accessible language.
- Keep chapter and section names short and direct.
- Keep related sentences together rather than using many one- or two-sentence paragraphs.
- Keep technical detail when it helps understanding, but avoid implementation drift.
- Avoid paradigm block quotes.

## Illustration Standards

- Use a lightweight editorial illustration style with a warm off-white background and rounded geometric forms.
- Use restrained navy, teal, sky-blue, coral, and muted-yellow accents for colour.
- Use subtle textures, generous whitespace, and consistent line weight.
- Keep embedded text to the minimum needed to understand the visual.
- Do not place essential explanations only inside the image; provide descriptive alt text and a short caption in the document.
- Avoid vendor logos, trademarks, decorative equations, photorealistic robots, brains, microchips.
- Avoid neon colours, unnecessary interface detail, and visual claims that are not supported by the playbook text.

## Illustration Workflow

### Stage 1: Select a Concept

1. Identify the target playbook section.
2. Use its approved content as the source material.
3. Define the placement and accessibility needs.
4. Propose several distinct illustration concepts.
5. Describe each concept's teaching point and composition.
6. State its essential relationships and anything it must not imply.
7. Wait for the user to select one concept.

### Stage 2: Generate Candidates

1. Ask how many images to generate, from one to five, unless already specified.
2. Generate the requested candidates using `Illustration Standards`.
3. Wait for the user to select a candidate or request refinements.
4. Do not reference unselected concepts or images in a playbook.

### Stage 3: Finalize the Image

1. Finalize only the selected image.
2. Correct labels and remove unnecessary detail.
3. Prepare descriptive alt text and a short caption.

### Stage 4: Integrate the Image

1. Save the asset in `illustrations/` as `<playbook-number>-<section>-<concept>.<format>`.
2. Default to a 1200 x 800 WebP no larger than 100 KB. Use PNG only for transparency or lossless detail.
3. Get user approval before deviating from `Illustration Standards` or production defaults.
4. Verify accuracy, spelling, legibility, alt text, caption, path, dimensions, format, and file size.
5. Optimize and integrate the asset.
6. Record the selected concept, final asset, generation prompt, dimensions, format, file size, approval, and any approved exception and reason in `DECISION-LOG.md`.
