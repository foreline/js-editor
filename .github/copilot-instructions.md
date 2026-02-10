# GitHub Copilot Instructions for JS Editor

## Project Overview

JS Editor is a modern JavaScript WYSIWYG editor with a block-based architecture. It provides rich text editing capabilities including markdown conversion, toolbar-based formatting, event handling, and modular block-based content management.

- **Build tool**: Vite
- **Test framework**: Jest (with Babel transforms)
- **Language**: Vanilla JavaScript (ES modules)
- **Package format**: Dual CJS/ESM library output

## Architecture

### Core Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `Editor` | `src/Editor.js` | Lifecycle, state, rendering/update cycle, selection/focus, conversions, paste |
| `Block` classes | `src/blocks/` | One class per block type; key handling, conversion, rendering, serialization |
| `Toolbar` + `ToolbarHandlers` | `src/Toolbar.js`, `src/ToolbarHandlers.js` | UI actions calling editor instance methods; dynamic button states |
| `KeyHandler` | `src/KeyHandler.js` | Centralized keyboard handling, delegates to block types |
| `Parser` | `src/Parser.js` | Markdown/HTML conversions, sanitization, preprocessing |
| `DebugTooltip` | `src/DebugTooltip.js` | Optional debug overlay with its own lifecycle |
| `Event` | `src/Event.js` | Event system with debouncing support |

### Block Types

Block classes live in `src/blocks/` and extend `BaseBlock`. Available types:
- `ParagraphBlock` (default), `H1Block`–`H6Block` (extend `HeadingBlock`), `UnorderedListBlock`, `OrderedListBlock`, `TaskListBlock`, `CodeBlock`, `TableBlock`, `ImageBlock`, `QuoteBlock`, `DelimiterBlock`

### Block Contract

Every block implements:
- **Instance methods**: `handleKeyPress(evt)`, `handleEnterKey(evt)`, `toMarkdown()`, `toHtml()`, `applyTransformation(targetType)`
- **Static methods**: `getMarkdownTriggers()`, `getToolbarConfig()`, `getDisabledButtons()`
- **Properties**: `type`, optional `nested`, and a DOM element as the block container

### Instance-Based API

The editor uses an **instance-based architecture**. Static methods are deprecated shims that delegate to the first created instance. Always use instance methods (e.g., `editor.getMarkdown()`, `editor.getHtml()`, `editor.on()`).

## Coding Conventions

### General

- Follow **SOLID principles** — classes must be small with clear lines of responsibility
- Use ES module `import`/`export` syntax (the project uses `"type": "module"`)
- Do not introduce new static methods on `Editor`; use instance methods
- Keep circular dependencies out of block ↔ toolbar interactions (blocks must not call toolbar methods that call back into editor conversion)

### Naming

- Block type constants are short strings: `p`, `h1`–`h6`, `ul`, `ol`, `sq`, `code`, `table`, `image`, `quote`
- CSS classes follow the pattern `block block-<type>` with `data-block-type="<type>"`
- Toolbar button IDs follow the pattern `editor-toolbar-<action>`

### DOM Structure

- Every block is wrapped in a `<div>` with `class="block block-<type>"` and `data-block-type="<type>"`
- List items (`<li>`) are NOT blocks — they are children of list blocks
- Task lists render as `<ul class="block block-sq">` with `<li class="task-list-item">` children containing interactive checkboxes
- Headings have an inner `<h1>`–`<h6>` element that is `contenteditable`

### State Flags

The editor uses important flags to prevent race conditions:
- `isCreatingBlock` — prevents empty-editor enforcement after block creation
- `isConvertingBlock` — suspends empty-editor checks during type conversions

### Change Tracking

Blocks update a `data-timestamp` attribute on content changes to efficiently detect modifications and emit change events.

## Testing Guidelines

- Test framework: **Jest** with `babel-jest` transform
- Test files live in `tests/` directory, named `<Subject>.test.js`
- Test setup and DOM mocks are in `tests/setup.js` and `tests/mocks/`
- **Run only relevant tests** — avoid running the full suite to keep output focused:
  ```powershell
  npx jest tests/SpecificTest.test.js
  ```
- Use `tests/testUtils.js` for shared test helpers
- When adding a new block type, add a corresponding test file

## Build & Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run build:lib` | Library build + post-build verification |
| `npm run build:demo` | Demo build |
| `npm test` | Run all Jest tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with coverage report |

## Version Control Workflow

1. Make changes and ensure `npm run build` succeeds
2. Ensure all tests pass with `npm test`
3. Commit with descriptive messages
4. Create incremental version tags (check last tag first with `git tag --sort=-v:refname | Select-Object -First 5`)
5. Update `CHANGELOG.md` with version tags

## Documentation

- `SPECS.md` — Technical specification (update when behavior changes)
- `docs/` — Developer documentation:
  - `BLOCK_ARCHITECTURE.md` — Block system design
  - `BLOCK_TOOLBAR_INTEGRATION.md` — How blocks integrate with toolbar
  - `EVENT_SYSTEM.md` — Event system documentation
  - `TOOLBAR_GROUPS.md` — Toolbar group configuration
- `ISSUES.md` — Issue/feature tracker with checklists
- `CHANGELOG.md` — Version history

## Key Design Decisions

- **No circular dependencies**: `applyTransformation()` in blocks must not call toolbar methods that call back into the editor
- **Markdown triggers**: Sequences like `# `, `- `, `* `, `1. ` at start of a paragraph convert it to the corresponding block type
- **Task list preprocessing**: Showdown's native task list support is disabled (`tasklists: false`); custom preprocessing handles all task list formats
- **Paste handling**: Multi-block content is split into individual blocks rather than inserted as one fragment
- **Empty editor protection**: At least one default block always exists; `ensureDefaultBlock()` does not recurse into the update cycle

## Debugging

- The project uses extensive `console.log` output — each method call generates a log message
- Use debug mode and `DebugTooltip` for runtime inspection
- `index.html` contains the main editor demo for manual testing

## E2E Testing

- **Framework**: Playwright Test (`@playwright/test`)
- **E2E tests** live in `e2e/` directory, named `<feature>.spec.js`
- **Test page**: Use `test-page.html` for clean test environment (not `index.html`)
- **Run E2E tests**: 
  ```powershell
  npm run test:e2e          # Run all E2E tests
  npm run test:e2e:ui       # Interactive UI mode
  npm run test:e2e:headed   # Run with visible browser
  npm run test:e2e:debug    # Debug mode
  ```
- Always wait for `window.editorReady` before running test assertions
- Use class-based selectors (`.block-h1`, `.editor-toolbar-bold`)
- Add `await page.waitForTimeout(200)` after markdown trigger conversions

---

**Skills**: For specialized tasks, refer to skill files in `.github/skills/`:
- **proposal-writer**: Architectural proposals and design documents
- **playwright-e2e**: Writing and debugging Playwright E2E tests
