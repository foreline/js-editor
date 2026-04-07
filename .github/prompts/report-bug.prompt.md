---
description: "Report a bug and add it to ISSUES.md with reproduction details"
---

# Report Bug

You are reporting a bug in the JS Editor project.

## Instructions

1. Ask the user to describe the bug if not already provided. Gather:
   - What happens (actual behavior)
   - What should happen (expected behavior)
   - Steps to reproduce
   - Which block type or component is affected
2. Add the bug to `ISSUES.md` under the **Bugs** section using the format:
   ```
   - [ ] **Short Title**: Description of the bug. Steps to reproduce: ... Expected: ... Actual: ...
   ```
3. If the bug is complex (multiple components, needs investigation), also create a detailed document in `dev-docs/issues/` with:
   - Full reproduction steps
   - Console log analysis (the project logs every method call)
   - Affected components (`Editor.js`, block classes, `KeyHandler.js`, `Toolbar.js`, `Parser.js`)
   - Potential root cause analysis
   - State flag considerations (`isCreatingBlock`, `isConvertingBlock`) if relevant
4. Check for duplicate bugs in `ISSUES.md` — the bugs section notes that bugs can be repeated, indicating regressions.

## Notes
- Note in `ISSUES.md`: "bugs can be repeated, indicating that the bug may have already been fixed and appeared again" — always check for duplicates.
- Reference the specific block type if applicable (e.g., `code-block`, `table-block`).
- Use debug mode and `DebugTooltip` for runtime inspection when investigating.
