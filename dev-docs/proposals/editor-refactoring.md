# Editor.js Refactoring Proposal

**Version:** 0.1.4  
**Date:** 2026-05-03  
**File:** `src/Editor.js` (~2 450 LOC)  
**Status:** Draft — open for discussion

---

## Summary

`Editor.js` is the largest file in the codebase and violates the Single Responsibility Principle in several distinct ways. It currently acts as an orchestrator, a DOM manipulator, a content serializer, a cursor manager, a paste handler, a block factory, a block converter, and a toolbar configurator — all at once. This proposal identifies seven extraction opportunities that would reduce `Editor.js` to a thin coordinator (~600–700 LOC) without changing any public API.

---

## Current Responsibilities (SRP violations)

| Responsibility | Methods / sections |
|---|---|
| Lifecycle & orchestration | `constructor`, `init`, `initializeToolbar`, `destroy` |
| DOM event wiring | `addListeners` and its five inline handler closures (`keydown`, `keyup`, `beforeinput`, `input`, `click`, `focusin`, `mousedown`) |
| Cross-block delete logic | 100-line `beforeinput` handler inside `addListeners` |
| Block creation | `addDefaultBlock`, `addDefaultBlockBefore`, `createNewBlock`, `createBlockElement`, `createParagraphBlock` |
| Block insertion after paste | `insertMultipleBlocks`, `insertMultipleLinesAsBlocks` |
| Block protection / invariants | `ensureDefaultBlock`, `detachBlockEvents`, `isBlockEmpty`, `isEditorEmpty`, `isParagraphBlock` |
| Block conversion | `checkAndConvertBlock`, `convertBlockType`, `convertCurrentBlockOrCreate`, `generateTriggerForBlockType` |
| Content serialization | `getMarkdown`, `getHtml`, `_blockElementToMarkdown`, `_blockElementToHtml`, `html2md`, `md2html` |
| Cursor / selection | `focus`, `focusElement`, `placeCursorAtEnd`, `placeCursorAtStart`, `placeCursorAtOffset`, `findEditableElementInBlock` |
| View containers | `initMarkdownContainer`, `initHtmlContainer` |
| Toolbar config & state | `initializeToolbar` (including ~70-line default config literal), `updateToolbarButtonStates`, `enableAllToolbarButtons` |
| Change tracking | `update`, `_performUpdate`, `updateBlockTimestamps` |
| Event pub/sub facade | `on`, `off`, `once`, `emit` |

---

## Proposed Extractions

### 1. `src/config/defaultToolbarConfig.js` — Toolbar configuration constant

**Why**: The ~70-line default toolbar config array is hardcoded inside `initializeToolbar()`. It is pure data with no logic and has no reason to live in the same file as the editor lifecycle.

**What moves**:
```js
// Before (inline inside Editor.js)
const defaultToolbarConfig = [ ... 70 lines ... ];

// After
import { defaultToolbarConfig } from './config/defaultToolbarConfig.js';
```

**Impact**: ~70 LOC removed from `Editor.js`. Zero behaviour change.

---

### 2. `src/CursorManager.js` — Selection and cursor placement

**Why**: Cursor placement is a well-isolated concern. None of these methods access `this.blocks`, `this.eventEmitter`, or `this._stateMachine`. They only need a DOM element and the `window.getSelection()` API.

**What moves**:
- `focusElement(element)`
- `placeCursorAtEnd(element)`
- `placeCursorAtStart(element)`
- `placeCursorAtOffset(element, offset)`
- `findEditableElementInBlock(blockElement)`

**Proposed interface**:
```js
export class CursorManager {
    focusElement(element) { … }
    placeCursorAtEnd(element) { … }
    placeCursorAtStart(element) { … }
    placeCursorAtOffset(element, offset) { … }
    findEditableElementInBlock(blockElement) { … }
}
```

`Editor` creates one instance (`this.cursor = new CursorManager()`) and delegates; existing call sites do not change because `Editor.placeCursorAtEnd(el)` becomes a one-liner proxy — or call sites inside `Editor` switch to `this.cursor.placeCursorAtEnd(el)` directly.

**Impact**: ~120 LOC removed from `Editor.js`.

---

### 3. `src/ContentSerializer.js` — Markdown and HTML serialization

**Why**: `getMarkdown`, `getHtml`, and their `_blockElementTo*` helpers are read-only DOM-walking operations. They do not mutate state, fire events, or depend on the editor's state machine. The two `static` converters (`html2md`, `md2html`) only wrap a `showdown.Converter` call and belong alongside the serializer rather than on the `Editor` class itself.

**What moves**:
- `getMarkdown()` → instance method that accepts the content area element
- `getHtml()` → same
- `_blockElementToMarkdown(blockEl, blockType)`
- `_blockElementToHtml(blockEl, blockType)`
- `static html2md(html)` → exported standalone function
- `static md2html(md)` → exported standalone function

**Proposed interface**:
```js
export class ContentSerializer {
    getMarkdown(contentArea) { … }
    getHtml(contentArea) { … }
    // private helpers
    _blockElementToMarkdown(blockEl, blockType) { … }
    _blockElementToHtml(blockEl, blockType) { … }
}

export function html2md(html) { … }
export function md2html(md) { … }
```

`Editor` delegates:
```js
this.serializer = new ContentSerializer();
getMarkdown() { return this.serializer.getMarkdown(this.instance); }
```

`Editor.html2md` and `Editor.md2html` become one-line static shims importing from `ContentSerializer.js`, preserving backward compatibility.

**Impact**: ~220 LOC removed from `Editor.js`.

---

### 4. `src/BlockManager.js` — Block creation and invariants

**Why**: Block creation, ID generation, block-map registration, and "ensure at least one block" logic is a coherent sub-system that currently forces `Editor` to know about `BlockFactory`, `Parser`, `Block`, `BlockType`, and `EVENTS.BLOCK_CREATED` all at once.

**What moves**:
- `addDefaultBlock()`
- `addDefaultBlockBefore()`
- `createNewBlock(blockType, options)`
- `createBlockElement(block)`
- `createParagraphBlock(html)`
- `ensureDefaultBlock()`
- `detachBlockEvents(blocks)`
- `isBlockEmpty(block)`
- `isEditorEmpty(blocks)`
- `isParagraphBlock(block)`

**Observation**: `addDefaultBlock`, `addDefaultBlockBefore`, `createBlockElement`, `createParagraphBlock`, and `createNewBlock` all share the same four-step boilerplate:
1. Instantiate a block via `BlockFactory`
2. Render to an element via `Parser.html`
3. Generate a unique `data-block-id`
4. Emit `EVENTS.BLOCK_CREATED`

This duplication should collapse into a single private `_createAndRegisterBlock(type, content)` helper inside `BlockManager`.

**Proposed interface**:
```js
export class BlockManager {
    constructor({ contentArea, blockMap, eventEmitter, stateMachine, setCurrentBlock, focus }) { … }

    addDefaultBlock() { … }
    addDefaultBlockBefore() { … }
    createNewBlock(blockType, options) { … }
    ensureDefaultBlock() { … }
    isBlockEmpty(block) { … }
    isEditorEmpty(blocks) { … }
    isParagraphBlock(block) { … }

    // private
    _createAndRegisterBlock(type, content) { … }
}
```

**Impact**: ~350 LOC removed from `Editor.js`. Eliminates four copies of the block-ID generation pattern.

---

### 5. `src/BlockConverter.js` — Block type conversion

**Why**: `convertBlockType`, `checkAndConvertBlock`, and `convertCurrentBlockOrCreate` are the most complex logic cluster in `Editor.js`. They already have clear inputs (a block element, a target type, trigger text) and outputs (boolean success). They only need the state machine, the event emitter, and the cursor manager — not the full `Editor` object.

**What moves**:
- `checkAndConvertBlock(blockElement)`
- `convertBlockType(blockElement, targetBlockType, triggerText)`
- `convertCurrentBlockOrCreate(targetBlockType, options)`
- `generateTriggerForBlockType(blockType, existingContent)`

**Proposed interface**:
```js
export class BlockConverter {
    constructor({ stateMachine, eventEmitter, cursor, blockMap }) { … }

    checkAndConvert(blockElement) { … }
    convertType(blockElement, targetType, triggerText) { … }
    convertCurrentOrCreate(targetType, options, currentBlock) { … }
    generateTrigger(blockType, existingContent) { … }
}
```

**Impact**: ~200 LOC removed from `Editor.js`.

---

### 6. Move `updateToolbarButtonStates` / `enableAllToolbarButtons` to `Toolbar`

**Why**: These two methods query and mutate toolbar button DOM state. They have no business being in `Editor`. The bug noted in the Code Quality section — `document.querySelector(`.${buttonClass}`)` being unscoped — is a direct consequence of them living in the wrong class. Moving them to `Toolbar` provides natural access to the scoped container and improves multi-editor support.

**What moves** (from `Editor` → `Toolbar`):
- `updateToolbarButtonStates()` — renamed to `updateButtonStates(blockType)`
- `enableAllToolbarButtons()` — renamed to `resetButtonStates()`

**Change in `Editor`**:
```js
// Before
updateToolbarButtonStates() { … }   // 40 LOC in Editor
enableAllToolbarButtons() { … }      // 20 LOC in Editor

// setCurrentBlock() calls:
this.updateToolbarButtonStates();

// After
// Editor delegates to Toolbar:
if (this.toolbar) this.toolbar.updateButtonStates(blockType);
```

**Change in `Toolbar`**:
```js
updateButtonStates(blockType) {
    const blockClass = BlockFactory.getBlockClass(blockType);
    if (!blockClass) return;
    const disabledButtons = blockClass.getDisabledButtons();
    this.resetButtonStates();
    disabledButtons.forEach(buttonClass => {
        const button = this.container.querySelector(`.${buttonClass}`);
        if (button) { button.disabled = true; button.classList.add('disabled'); }
    });
}

resetButtonStates() {
    this.container.querySelectorAll('button').forEach(button => {
        const isViewButton = button.classList.contains('bke-toolbar-text') ||
            button.classList.contains('bke-toolbar-markdown') ||
            button.classList.contains('bke-toolbar-html');
        if (!isViewButton) { button.disabled = false; button.classList.remove('disabled'); }
    });
}
```

This also fixes the global `document.querySelector` scoping bug, since `Toolbar` naturally has access to its own container element.

**Impact**: ~60 LOC removed from `Editor.js`. `Toolbar.js` grows by ~40 LOC (net gain from DRY and scope fix).

---

### 7. `src/PasteHandler.js` — Paste and multi-block insertion

**Why**: `paste()` and its helpers are already a self-contained pipeline: sanitize → parse → decide single/multi → insert → emit. They have a clear seam from the rest of `Editor`. The pattern mirrors the existing `InlineMarkdownHandler` architecture.

**What moves**:
- `paste(e)`
- `insertInlineContent(html, selection)`
- `insertMultipleBlocks(blocks)`
- `insertMultipleLinesAsBlocks(lines)`

**Proposed interface**:
```js
export class PasteHandler {
    constructor({ editor }) { … }   // takes editor reference for block creation
    handle(clipboardEvent) { … }
}
```

`addListeners` in `Editor` becomes:
```js
this._boundHandlers.paste = (e) => this._pasteHandler.handle(e);
```

**Impact**: ~160 LOC removed from `Editor.js`.

---

### 8. Extract `beforeinput` handler to a named method

The `beforeinput` handler is ~100 lines of inline logic inside `addListeners`. It is the most complex single closure in the file and is currently untestable in isolation.

**Proposed change** (minimal — does not require a new file):
```js
// In addListeners():
this._boundHandlers.beforeinput = (e) => this._handleCrossBlockDelete(e);

// New private method:
_handleCrossBlockDelete(e) { … }   // the 100-line body, unchanged
```

This alone makes the handler unit-testable and makes `addListeners` a simple wiring function.

**Impact**: `addListeners` shrinks from ~250 LOC to ~30 LOC. No file count change.

---

## Dead Code Removed ✓

The following were removed from `Editor.js` in this session:

| Location | Removed |
|---|---|
| `init()` | Commented-out jQuery `$(element).on(...)` blocks (three stanzas) and `// @fixme` comment |
| `init()` | `if (0) { this.focus(); }` dead branch and its comment |
| `_performUpdate()` | Commented-out `debugTooltip` call |
| `updateBlockTimestamps()` | Commented-out `debugTooltip` call |
| `createNewBlock()` | Four `console.log(...)` calls; `console.error(...)` replaced with `logWarning()` |
| `convertCurrentBlockOrCreate()` | Four `console.log(...)` calls; stale inline comments removed |

---

## Code Quality Issues

### Inconsistent logging
Some methods use the project's `log()` utility; others call `console.log()` directly. `createNewBlock` and `convertCurrentBlockOrCreate` use raw `console.log`. All debug output should go through the `log()` utility so it respects the `debug` flag.

### Duplicated block ID generation
The pattern below appears **five times** across `addDefaultBlock`, `addDefaultBlockBefore`, `createBlockElement`, `createParagraphBlock`, and `createNewBlock`:
```js
const blockId = 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
htmlBlock.setAttribute('data-block-id', blockId);
htmlBlock.setAttribute('data-timestamp', Date.now().toString());
```
This should live in a single `generateBlockId()` utility function (or inside `BlockManager._createAndRegisterBlock`).

### `addDefaultBlock` / `addDefaultBlockBefore` duplication
These two methods share ~30 lines of identical boilerplate. Only the DOM insertion point differs (`after` vs `before`). A shared private `_insertNewParagraphBlock(insertFn)` helper would DRY this up.

### `updateToolbarButtonStates` uses `document.querySelector` globally
```js
const button = document.querySelector(`.${buttonClass}`);
```
This is not scoped to the current editor instance and breaks multi-editor setups. Should be `this.instance.querySelector(...)` or delegated to `Toolbar`.

---

## Proposed File Structure (after refactoring)

```
src/
  Editor.js                      (~650 LOC — coordinator only)
  CursorManager.js               (~130 LOC — NEW)
  ContentSerializer.js           (~230 LOC — NEW)
  BlockManager.js                (~280 LOC — NEW)
  BlockConverter.js              (~200 LOC — NEW)
  PasteHandler.js                (~170 LOC — NEW)
  config/
    defaultToolbarConfig.js      (~75 LOC — NEW, pure data)
  KeyHandler.js                  (unchanged)
  InlineMarkdownHandler.js       (unchanged)
  Toolbar.js                     (unchanged)
  Parser.js                      (unchanged)
  ...
```

> `Toolbar.js` changes from "unchanged" to "modified" — it gains `updateButtonStates()` and `resetButtonStates()`.

Estimated `Editor.js` line count reduction: **~1 800 LOC → ~650 LOC** (73 % reduction).

---

## Migration Strategy

Because the public API must not change, all refactoring should be done via **facade delegation** on `Editor`:

1. Create the new file with the extracted class.
2. Instantiate it in `Editor`'s constructor: `this.cursor = new CursorManager()`.
3. Replace the method body in `Editor` with a one-line delegation: `placeCursorAtEnd(el) { return this.cursor.placeCursorAtEnd(el); }`.
4. Run the full test suite after each file is extracted.
5. Once all tests pass, optionally remove the delegation shim if it is only used internally.

This approach means **zero breaking changes** for consumers of the published npm package.

---

## Recommended Order of Work

| Step | Task | Risk | Status |
|---|---|---|---|
| 1 | Remove dead code / fix `console.log` | Low | **Done** |
| 2 | Extract `defaultToolbarConfig.js` | Very low — pure data | **Done** |
| 3 | Extract `_handleCrossBlockDelete` to named method | Very low — same file | **Done** |
| 4 | Extract `CursorManager` | Low — no state mutation | **Done** |
| 5 | Extract `ContentSerializer` | Low — read-only | **Done** |
| 6 | Move `updateToolbarButtonStates` / `enableAllToolbarButtons` to `Toolbar` | Low — fixes scoping bug | **Done** |
| 7 | Extract `PasteHandler` | Medium — depends on BlockManager | **Done** |
| 8 | Extract `BlockConverter` | Medium — depends on CursorManager | **Done** |
| 9 | Extract `BlockManager` | Medium-high — largest and most stateful | **Done** |

---

## Resolved Questions

1. **Should `ContentSerializer` be a class or a module of standalone functions?**  
   **Decision:** Class. Dependency injection is cleaner with a class instance.

2. **Should `html2md` / `md2html` stay as static shims on `Editor`?**  
   **Decision:** Yes — keep `Editor.html2md()` and `Editor.md2html()` as one-line static shims for backward compatibility. They import and delegate to the implementations inside `ContentSerializer.js`.

3. **Does `BlockManager` need a reference to `Editor` itself?**  
   **Decision:** Deferred — no answer yet. This question must be revisited before implementing `BlockManager`.

4. **Should `updateToolbarButtonStates` and `enableAllToolbarButtons` move to `Toolbar`?**  
   **Decision:** Yes — move both methods to `Toolbar`. They are clearly the toolbar's responsibility. `Editor` will call `this.toolbar.updateButtonStates(blockType)` and the toolbar handles the rest.