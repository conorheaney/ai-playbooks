# AI Playbook Series Progress

Last updated: 27 July 2026

## Working Method

- Draft one playbook at a time and request user review before starting the next.
- Update later content just in time so it reflects feedback from earlier playbooks.
- The series is framework-neutral and intended for a cross-functional audience.
- The series covers AI used as an SDLC assistant, not AI embedded in a clinical product.
- Playbooks 00, 01, and 03-06 use a heavily regulated clinical environment as their context.
- Playbook 02 is the explicit exception: it is a standalone AI concepts guide with no SDLC, clinical, patient, medical, regulated, or regulatory framing. The content has now been superseded by `02-ai-concepts.md`; update that file for future changes.
- Use demonstrations, examples, and practical explanations rather than writing policy or replacement procedures.

## Current Status

| Playbook | File | Status |
| --- | --- | --- |
| 00: AI in the SDLC | `00-ai-enabled-sdlc-overview.md` | Approved. |
| 01: Getting Started with AI Tools | `01-getting-started-with-ai-tools.md` | Approved. |
| 02: AI Concepts and Foundations | `02-ai-concepts-and-foundations.md` | Superseded by `02-ai-concepts.md`; do not update further. |
| 02b: AI Concepts | `02-ai-concepts.md` | Active target for future updates. |
| 03: AI-Assisted Planning | Not created | Pending Playbook 02 approval. |
| 04: AI-Assisted Development | Not created | Pending. |
| 05: AI-Assisted Testing | Not created | Pending. |
| 06: AI-Assisted Deployment and Operations | Not created | Pending. |

## Current Review Position

- Playbook 02 remains a draft under review and has not been approved as a whole, but the active editing target is now `02-ai-concepts.md`.
- The current review pass has completed detailed revision of the Introduction, Core Concepts, and Information Pathways chapters, including their integrated illustrations.
- Review is currently in Chapter 5, Agentic Systems. Agents and Harnesses have been substantially revised; Tools, Integrations, Permissions, and Capabilities were most recently split and refined.
- Skills is the next Chapter 5 topic to review, followed by Chapters 6-9: Risks, Assurance, Application, and Reference.
- Playbook 03 remains blocked until Playbook 02 is approved.

## Illustration Standards

- Detailed illustration standards, workflow, and approved asset registry live in `PLAYBOOK-ILLUSTRATIONS.md`.

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
