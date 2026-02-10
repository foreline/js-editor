---
description: "Debug an issue using the project's console log tracing and editor inspection tools"
---

# Debug Issue

You are debugging an issue in the JS Editor project.

## Approach

### 1. Reproduce
- Use `index.html` (main demo) for manual testing in the browser
- Open browser DevTools console — the project logs every method call
- Identify the sequence of method calls that lead to the problem

### 2. Trace Execution Flow
- The project provides extensive `console.log` output for every method call
- Look for patterns:
  - **Infinite loops**: repeated method calls (e.g., `update()` → `html2md()` → `update()`)
  - **Race conditions**: check `isCreatingBlock` and `isConvertingBlock` flags
  - **Focus issues**: trace `Editor.focus()`, `setCurrentBlock()`, `findEditableElementInBlock()`
  - **DOM state**: check `data-block-type`, `class="block block-<type>"`, `data-timestamp` attributes

### 3. Use Debug Tools
- Enable debug mode on the Editor instance for `DebugTooltip` overlay
- `DebugTooltip` shows current block info, selection state, and timestamps
- Set breakpoints in the browser DevTools at key entry points:
  - `Editor.js`: `_performUpdate()`, `convertCurrentBlockOrCreate()`, `setCurrentBlock()`
  - `KeyHandler.js`: `handleKeyDown()`, `handleEnterKey()`, `handleBackspaceKey()`
  - Block classes: `handleKeyPress()`, `applyTransformation()`

### 4. Run Targeted Tests
- Run the specific test file related to the issue:
  ```powershell
  npx jest tests/SpecificTest.test.js --verbose
  ```
- If the test doesn't exist, create one in `tests/` to reproduce the bug
- Use `tests/testUtils.js` for shared helpers

### 5. Common Issues
- **Block conversion fails silently**: check for circular dependency between block → toolbar → editor
- **Empty editor after action**: check `ensureDefaultBlock()` and the `isCreatingBlock`/`isConvertingBlock` flags
- **Focus lost after conversion**: check `findEditableElementInBlock()` and whether inner contenteditable elements are properly set
- **Duplicate method calls**: check `setCurrentBlock()` deduplication and event handler binding
