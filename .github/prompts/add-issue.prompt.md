---
description: "Record a new issue or feature request in dev-docs/issues/ or ISSUES.md"
---

# Add Issue

You are recording a new issue or feature request for the JS Editor project.

## Instructions

1. Ask the user to describe the issue or feature request if not already provided.
2. Determine scope:
   - **Small/focused** (single behavior, clear fix) → Add as a checklist item in `ISSUES.md` under the appropriate section (Bugs, Features, Improvements).
   - **Complex/multi-step** (needs analysis, design) → Create a detailed issue document in `dev-docs/issues/` with a descriptive subdirectory and numbered file.
3. For `ISSUES.md` entries:
   - Use `- [ ] **Title**: Description` format.
   - Place under the correct section.
4. For `dev-docs/issues/` documents:
   - Create a subdirectory named after the feature area (e.g., `dev-docs/issues/ghost_text/`).
   - Use the naming convention `XX. SHORT_DESCRIPTION.md`.
   - Include: Problem description, reproduction steps (if applicable), expected behavior, affected components, and suggested approach.
5. Check if an inbox item exists in `dev-docs/_inbox/` for this topic — use it as context and remind the user to clean it up.

## Notes
- Issues describe problems or desired behaviors, not solutions.
- For bugs specifically, prefer `/report-bug` which has a more targeted template.
