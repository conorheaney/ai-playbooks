# Repository Purpose

- This repository contains SDLC playbooks, templates, checklists, and governance guidance; optimize changes for operational use, not application implementation.
- The repository currently has no build, test, lint, formatter, or release toolchain. Do not invent commands or claim automated verification until executable configuration exists.

# Playbook Changes

- Make each process explicit about its trigger, accountable role, required inputs, ordered activities, decision gates, outputs, and retained evidence.
- Distinguish mandatory controls from recommendations. For every exception path, identify who approves it and what evidence records the decision.
- Keep roles separate from named people or teams unless a document is deliberately organization-specific.
- Check changes across the lifecycle: an upstream gate, artifact, role, or status change must be reconciled with affected downstream playbooks, templates, and checklists.
- Prefer verifiable exit criteria over subjective wording such as "appropriate," "adequate," or "as needed."
- Do not introduce a framework, regulatory obligation, approval policy, SLA, or tool-specific workflow unless repository content or the user establishes it.

# Verification

- Until repository tooling is added, verify documentation changes by checking internal links, terminology, role names, artifact names, and gate/exception consistency manually.
- When adding executable tooling, document exact setup and focused verification commands in the same change, then update this file only with non-obvious constraints.
