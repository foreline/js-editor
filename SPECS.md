# Technical Requirements for JS Editor

## Overview
The JS Editor project is a web-based rich text editor designed to provide users with advanced text editing capabilities. It supports features such as markdown conversion, toolbar-based formatting, event handling, and block-based content management.

## Functional Requirements
# JS Editor Specifications — Logic and Features

This document describes the current behavior of the editor based on implemented features and resolved issues. It focuses on editor logic, block architecture, keyboard handling, conversion, clipboard behavior, toolbar integration, and export APIs.

## Architecture Overview

- Instance-based editor: `Editor` is an instance-driven API. Remaining legacy static methods are kept as back-compat shims and are deprecated. Static shims delegate to the first created editor instance (see Export APIs section).
- Main components:
   - `Editor`: lifecycle, state, rendering/update cycle, selection/focus, conversions, paste.
   - `Block` classes: one class per block type; encapsulate key handling, conversion, rendering, and serialization.
   - `Toolbar` + `ToolbarHandlers`: UI actions that call editor instance methods; dynamic states reflect the current selection/block.
   - `KeyHandler`: centralizes keyboard handling, delegates list/enter/backspace specifics to block types.
   - `Parser`: markdown/HTML conversions, sanitization, and preprocessing for special syntaxes (code fences, task lists, tables).
   - `DebugTooltip`: optional debug overlay extracted from `Editor`; handles its own lifecycle.

## Block Model and DOM Structure

- Each block container has:
   - `class="block block-<type>"` where `<type>`: `p`, `h1..h6`, `ul`, `ol`, `sq` (task list), `code`, `table`, `image`, `quote`.
   - `data-block-type="<type>"` matching the block type.
- Lists:
   - Unordered and ordered lists use `<ul>`/`<ol>` as the block container element and carry the `block` classes and `data-block-type` on the list element.
   - List items (`<li>`) DO NOT carry `block` classes and are not treated as blocks.
- Task lists:
   - Render as a semantic `<ul class="block block-sq" data-block-type="sq">` with `<li class="task-list-item">` children.
   - Each task item contains an interactive `<input type="checkbox">` and an editable text container (e.g., `<span contenteditable>`), aligned without list bullets.
   - Markdown supports `[ ]`, `[x]`, `[X]`, and `[]`. Checkbox toggling updates markdown state. Keyboard Ctrl+Space toggles the checkbox.
- Headings:
   - Inner heading element (`<h1>`..`<h6>`) is contenteditable and receives focus after conversion.
- Code blocks:
   - Fenced code blocks (``` and ~~~) parse into dedicated `code` blocks; code content is preserved and safely escaped.
 - Change tracking:
    - Each block updates a `data-timestamp` attribute on content changes to efficiently detect modifications and emit change events.

## Initialization and Update Cycle

- Initialization validates container, builds the toolbar, installs listeners, and ensures at least one default paragraph block exists.
- The editor maintains `currentBlock` and updates toolbar state when it changes. Duplicate `setCurrentBlock()` calls are suppressed.
- `ensureDefaultBlock()` guarantees a default block exists but does not recurse into the update cycle.
- Flags prevent race conditions:
   - `isCreatingBlock`: prevents empty-editor enforcement immediately after creating blocks.
   - `isConvertingBlock`: suspends empty-editor checks during type conversions (e.g., markdown triggers).

## Focus Management

- `Editor.focus()` focuses the current block’s primary editable element. If `currentBlock` is null or detached, it falls back to focusing the editor root.
- On empty-block deletion or block creation, focus moves predictably:
   - After Enter that creates a block or list item, focus moves to the new element.
   - After Backspace removes an empty block, focus moves to the previous block (caret at end); if none, to the next block.

## Keyboard Behavior
# JS Editor Specifications — Logic and Features

This document describes the current behavior of the editor based on implemented features and resolved issues. It focuses on editor logic, block architecture, keyboard handling, conversion, clipboard behavior, toolbar integration, and export APIs.

## Architecture Overview

- Instance-based editor: `Editor` is an instance-driven API. Remaining legacy static methods are kept as back-compat shims and are deprecated. Static shims delegate to the first created editor instance (see Export APIs section).
- Main components:
   - `Editor`: lifecycle, state, rendering/update cycle, selection/focus, conversions, paste.
   - `Block` classes: one class per block type; encapsulate key handling, conversion, rendering, and serialization.
   - `Toolbar` + `ToolbarHandlers`: UI actions that call editor instance methods; dynamic states reflect the current selection/block.
   - `KeyHandler`: centralizes keyboard handling, delegates list/enter/backspace specifics to block types.
   - `Parser`: markdown/HTML conversions, sanitization, and preprocessing for special syntaxes (code fences, task lists, tables).
   - `DebugTooltip`: optional debug overlay extracted from `Editor`; handles its own lifecycle.

## Block Model and DOM Structure

- Each block container has:
   - `class="block block-<type>"` where `<type>`: `p`, `h1..h6`, `ul`, `ol`, `sq` (task list), `code`, `table`, `image`, `quote`.
   - `data-block-type="<type>"` matching the block type.
- Lists:
   - Unordered and ordered lists use `<ul>`/`<ol>` as the block container element and carry the `block` classes and `data-block-type` on the list element.
   - List items (`<li>`) DO NOT carry `block` classes and are not treated as blocks.
- Task lists:
   - Render as a semantic `<ul class="block block-sq" data-block-type="sq">` with `<li class="task-list-item">` children.
   - Each task item contains an interactive `<input type="checkbox">` and an editable text container (e.g., `<span contenteditable>`), aligned without list bullets.
   - Markdown supports `[ ]`, `[x]`, `[X]`, and `[]`. Checkbox toggling updates markdown state. Keyboard Ctrl+Space toggles the checkbox.
- Headings:
   - Inner heading element (`<h1>`..`<h6>`) is contenteditable and receives focus after conversion.
- Code blocks:
   - Fenced code blocks (``` and ~~~) parse into dedicated `code` blocks; code content is preserved and safely escaped.
- Change tracking:
   - Each block updates a `data-timestamp` attribute on content changes to efficiently detect modifications and emit change events.

## Initialization and Update Cycle

- Initialization validates container, builds the toolbar, installs listeners, and ensures at least one default paragraph block exists.
- The editor maintains `currentBlock` and updates toolbar state when it changes. Duplicate `setCurrentBlock()` calls are suppressed.
- `ensureDefaultBlock()` guarantees a default block exists but does not recurse into the update cycle.
- Flags prevent race conditions:
   - `isCreatingBlock`: prevents empty-editor enforcement immediately after creating blocks.
   - `isConvertingBlock`: suspends empty-editor checks during type conversions (e.g., markdown triggers).

## Focus Management

- `Editor.focus()` focuses the current block’s primary editable element. If `currentBlock` is null or detached, it falls back to focusing the editor root.
- On empty-block deletion or block creation, focus moves predictably:
   - After Enter that creates a block or list item, focus moves to the new element.
   - After Backspace removes an empty block, focus moves to the previous block (caret at end); if none, to the next block.

## Keyboard Behavior

- Enter:
   - In paragraphs/headings/other non-list blocks: create a new default paragraph after the block when the caret is at the end; focus it.
   - In lists (`ul`/`ol`):
      - At end of a non-empty `<li>`: create a new `<li>` in the same list and focus it.
      - On an empty `<li>`: close the list and create a new default paragraph after the list.
- Backspace:
   - In an empty block: delete the block and move focus to the previous block (caret to end). Maintain at least one default block in the editor.
- Active block tracking: placing the caret inside a block makes it the current block (duplicate calls coalesced).

## Markdown Triggers and Conversion

- Supported triggers in a paragraph at start of block (space-terminated): `# `, `## ` ... `###### `, `- `, `* `, `1 `, `1. `.
- Trailing spaces are preserved for trigger detection.
- Single-empty-editor case: triggers can convert the sole paragraph block to the requested type.
- Conversion flow:
   - Toolbar and trigger conversions call `Editor.convertCurrentBlockOrCreate(<type>)`.
   - Each block implements `applyTransformation(targetType)` to change its DOM in place (no circular calls back into toolbar).
   - After header conversion, focus is moved to the inner heading element.

## Clipboard and Pasting

- Pasted content is sanitized to prevent XSS.
- Multi-paragraph or rich content (lists, tables, code fences) is split into appropriate blocks rather than inserted as one fragment.
- Task list processing uses custom preprocessing; native task-list support in the markdown engine is disabled to avoid disabled checkboxes.
- Fenced code blocks are isolated into `code` blocks with preserved formatting and safe HTML entity escaping.

## Toolbar Integration

- Toolbar buttons are initialized dynamically and removed on reinit to avoid leaks.
- Buttons convert the current block or create blocks as appropriate (e.g., list, header, code).
- Button active/disabled states reflect current selection and block type.
- The code toolbar action converts selection to a `code` block without circular dependencies.
- Toolbar groups are supported; blocks can contribute buttons and target specific groups via their toolbar configuration.

## Block Contract

Blocks implement a common contract to integrate with the editor lifecycle:

- Instance methods: `handleKeyPress(evt)`, `handleEnterKey(evt)`, `toMarkdown()`, `toHtml()`, `applyTransformation(targetType)`.
- Static methods: `getMarkdownTriggers()`, `getToolbarConfig()`, `getDisabledButtons()`.
- Properties: `type`, optional `nested`, and a DOM element as the block container.

## Block Types and Capabilities

- Paragraph (`p`): default block; supports triggers to convert into other types.
- Headings (`h1..h6`): contenteditable heading element; cursor moves to inner heading on creation.
- Unordered/Ordered Lists (`ul`, `ol`): Enter creates items; empty item Enter exits list.
- Task List (`sq`): semantic UL with interactive checkboxes; markdown `[ ]`/`[x]` round-trips; no bullets.
- Code (`code`): fenced code; safe escaping; syntax highlighting supported by the highlighter integration.
- Table (`table`): markdown table support; editable cells; Tab cycles cells; Enter adds rows; contextual controls allow add/remove rows/columns while focused.
- Image (`image`): URL input, drag & drop, file picker; resizable; supports `![alt](src)` markdown; files may be embedded as base64.
- Quote (`quote`): standard block quote rendering and editing.

## Export APIs

- Instance methods provide canonical exports:
   - `editor.getMarkdown()` returns clean markdown content for all blocks.
   - `editor.getHtml()` returns clean HTML content for all blocks.
- Deprecated static shims for back-compat:
   - `Editor.getMarkdown()` and `Editor.getHtml()` delegate to the first editor instance when present.

## Event System

- `editor.on(eventName, handler)` to subscribe to editor events (e.g., content change, block add/remove, selection change). Handlers can be debounced.
- Events reflect updates from user input, toolbar actions, conversions, and paste operations.

## Performance and Reliability Notes

- Duplicate `setCurrentBlock()` calls are prevented to reduce redundant work.
- Empty-editor protection avoids infinite loops by not triggering update recursively from `ensureDefaultBlock()`.
- Flags (`isCreatingBlock`, `isConvertingBlock`) remove race conditions between creation/conversion and empty-editor checks.

## Compatibility

- Modern browsers (Chrome, Firefox, Edge).
- Responsive layout for editor container and toolbar.

## Dependencies (high level)

- Build: Vite
- Tests: Jest
- Transforms: Babel
- Markdown/Parsing: project markdown/HTML parsing with custom preprocessing (task lists, code fences, tables); tasklists in the underlying parser are disabled in favor of custom processing.

## Notes and Future Enhancements (non-binding)

- Dynamic toolbar configuration via plugins.
- Export/import JSON with block metadata.
- Further performance work for very large documents.
