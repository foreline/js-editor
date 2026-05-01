---
description: "Create an architectural proposal in dev-docs/proposals/ for a well-defined feature or change"
---

# Add Proposal

You are creating an architectural proposal for the BlockEditor project.

## Instructions

1. Ask the user to describe the feature or change if not already provided.
2. Check if an inbox item already exists in `dev-docs/_inbox/` for this topic — if so, use it as context.
3. Use the `proposal-writer` skill to create a formal proposal in `dev-docs/proposals/`.
4. Follow the proposal template: Status, Summary, Motivation, Design (Architecture, Block Contract Impact, DOM Changes, API Surface), Alternatives Considered, Implementation Plan, Testing Strategy, Documentation Impact, Risks and Mitigations.
5. If the feature is complex, suggest recording key decisions as ADRs after the proposal is accepted.
6. If an inbox item was used as source, remind the user to clean it up from `dev-docs/_inbox/`.

## Notes
- Proposals need enough design detail to be implementable without ambiguity.
- Reference existing architecture: instance-based Editor, BaseBlock contract, toolbar groups, event system.
- Consider SOLID principles and circular dependency constraints.
