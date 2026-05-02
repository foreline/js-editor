# Test Coverage Strategy & Improvement Plan

**Version:** 0.1.4  
**Date:** 2026-05-02  
**Baseline:** Jest with `--runInBand`, 354 passing tests

---

## Baseline Metrics

| Metric | Current | Target |
|---|---|---|
| Statements | **32.71 %** | 80 % |
| Branches | **28.57 %** | 75 % |
| Functions | **35.39 %** | 80 % |
| Lines | **33.63 %** | 80 % |

---

## Priority 0 — File Coverage Gaps (zero or near-zero coverage)

These source files have no meaningful test coverage at all. Each one is a blind spot in the test harness.

| File | Stmts | Notes |
|---|---|---|
| `src/blocks/ListBlock.js` | **0 %** | No test file exists. `ListBlock` is the shared base for `UnorderedListBlock` and `OrderedListBlock`; untested means both sub-types have untested `handleEnterKey` logic. |
| `src/blocks/index.js` | **0 %** | Barrel export file — no smoke test verifies all block types are exported. One mis-spelling breaks consumer imports silently. |
| `src/blocks/CodeBlock.js` | **1.89 %** | `CodeBlock.test.js` exists but exercises almost nothing. `CodeBlock` is 497 lines; the majority (language selection, syntax highlighting, key handling, `toMarkdown`) is untested. |
| `src/utils/syntaxHighlighter.js` | **3.44 %** | `syntaxHighlighter.test.js` exists but covers only the import. `normalizeLanguage`, `highlight`, and all language-specific paths are untested. |
| `src/DebugTooltip.js` | **6.47 %** | No `DebugTooltip.test.js`. The class manages DOM lifecycle, intervals, and event listeners — exactly the kind of code that leaks memory when untested. |
| `src/interfaces/BlockInterface.js` | **5.26 %** | No test verifies the contract shape against actual block classes. |

### Action items

1. **Create `tests/ListBlock.test.js`** — test `handleEnterKey` at the empty-last-item boundary, mid-list, and at a non-empty last item.
2. **Create `tests/blocks.index.test.js`** — smoke-import all named exports from `src/blocks/index.js` and assert each is a constructor.
3. **Expand `tests/CodeBlock.test.js`** — cover constructor, `toMarkdown()`, `toHtml()`, language selection, `handleKeyPress` (Tab indentation), `handleEnterKey`.
4. **Expand `tests/syntaxHighlighter.test.js`** — test `normalizeLanguage` for all aliases, `highlight` for at least JS/Python/HTML, unknown language fallback.
5. **Create `tests/DebugTooltip.test.js`** — test `enable`/`disable` toggle, `createTooltips`, listener cleanup in `disable()`.
6. **Create `tests/BlockInterface.test.js`** — verify each block class satisfies `BlockInterfaceContract.INSTANCE_METHODS` and `STATIC_METHODS`.

---

## Priority 1 — Critical Low Coverage (< 25 %, test file exists but barely used)

These files have test files yet remain poorly exercised. The tests that exist are mostly constructor smoke tests.

| File | Stmts | Key uncovered areas |
|---|---|---|
| `src/blocks/HeadingBlock.js` | **24.13 %** | Lines 25–35, 69–202: `handleEnterKey`, `handleKeyPress`, `toMarkdown`, `applyTransformation` |
| `src/blocks/ImageBlock.js` | **20 %** | Lines 215–451, 524–542: drag-drop handler, URL insertion, resize logic, `toMarkdown` |
| `src/blocks/TableBlock.js` | **7.15 %** | Lines 115–1081: Tab-navigation, row creation, `toMarkdown`, key handling |
| `src/blocks/OrderedListBlock.js` | **19.23 %** | Lines 74–264: Enter key, item reordering, `toMarkdown` |
| `src/blocks/UnorderedListBlock.js` | **25 %** | Lines 94–266: same as ordered list |
| `src/KeyHandler.js` | **20.7 %** | Lines 31–513: every keyboard shortcut beyond the basic path |
| `src/Parser.js` | **11.62 %** | Lines 22–335: `parseHtml`, `parseMarkdown`, `extractHtmlBlocks`, Showdown pipeline |

### Action items

8. **`tests/HeadingBlock.test.js`** — add tests for: Enter at end (creates paragraph), Enter in middle (splits), `toMarkdown` for H1–H6, markdown trigger activation (`# ` → H1).
9. **`tests/ImageBlock.test.js`** — add tests for `toMarkdown`, `toHtml`, URL parse, alt text extraction.
10. **`tests/TableBlock.test.js`** — add tests for `parseTableContent`, `toMarkdown`, header/row getters.
11. **`tests/OrderedListBlock.test.js` / `UnorderedListBlock.test.js`** — add tests for `toMarkdown`, `handleEnterKey` on empty item, Enter at end creates paragraph.
12. **`tests/KeyHandler.test.js`** — add tests for Tab (indentation), Shift+Tab, Ctrl+B/I/K shortcuts, Arrow key boundary behavior.
13. **`tests/Parser.test.js`** — add tests for `parseHtml` (H1–H6, UL, OL, pre/code, blockquote, table), `parseMarkdown` with full markdown samples.

---

## Priority 2 — Happy Path Coverage (moderate coverage, primary use cases missing)

These files have meaningful tests but miss the most important consumer-facing workflows.

| File | Stmts | Missing happy paths |
|---|---|---|
| `src/Editor.js` | **45.07 %** | `init()` with `markdown` option, `init()` with `html` option, `setMarkdown()`, `setHtml()`, `getMarkdown()`, `getHtml()`, `destroy()` (listener cleanup), `readonly` mode |
| `src/Toolbar.js` | **25.17 %** | Toolbar render with default config, button click → editor method call, dropdown open/close, dynamic button state updates |
| `src/ToolbarHandlers.js` | **25.23 %** | Each toolbar action handler (bold, italic, heading, list, quote, code, table, image) |
| `src/blocks/BaseBlock.js` | **50.81 %** | Lines 134–271: `applyTransformation`, `renderToElement`, `toHtml` |
| `src/blocks/ParagraphBlock.js` | **42.59 %** | Lines 98–189: markdown trigger matching (`# `, `- `, `1. `), conversion logic |
| `src/blocks/QuoteBlock.js` | **42.3 %** | Lines 80–158: `handleEnterKey`, `toMarkdown`, conversion from/to paragraph |
| `src/Block.js` | **26.41 %** | Lines 23–170: all setters/getters, `toHtml`, `toMarkdown`, `serialize` |
| `src/Utils.js` | **46.15 %** | Lines 55–88: DOM utility methods |
| `src/BlockType.js` | **76.74 %** | Lines 38–64, 131: `fromString`, `getDefaultBlockType`, alias resolution |
| `src/blocks/BlockFactory.js` | **42.59 %** | Lines 84–197: all block type creation paths |

### Action items

14. **`tests/Editor.basic.test.js`** — extend with: `new Editor({ markdown: '# Hello' })` asserts H1 block created; `new Editor({ html: '<p>Hi</p>' })` asserts paragraph; `editor.setMarkdown()` / `editor.setHtml()` round-trip; `editor.destroy()` removes listeners; `editor.getMarkdown()` and `editor.getHtml()` return correct types.
15. **`tests/Toolbar.test.js`** — extend with: toolbar renders with correct button count for default config; click on bold button calls `editor.applyFormat('bold')`; dropdown toggle changes `aria-expanded`.
16. **`tests/ToolbarHandlers.test.js`** — add individual handler tests for bold, italic, H1–H3, UL, OL, quote, code, table.
17. **`tests/Block.test.js`** — add getter/setter round-trips for `type`, `content`, `html`; test `serialize()`.
18. **`tests/BlockFactory.test.js`** — add a test for each block type string key (`p`, `h1`–`h6`, `ul`, `ol`, `sq`, `code`, `table`, `image`, `quote`, `del`) that `BlockFactory.create(type)` returns an instance of the correct class.

---

## Priority 3 — NPM-Specific Tests

These tests validate the library as a published package, not just as source code.

### 3.1 — Smoke import tests (ESM + CJS)

Create `tests/npm/` directory with environment-specific import tests.

**`tests/npm/esm-import.test.mjs`**
```js
// Validates that the ESM build exports are correct
import Editor, { Editor as NamedEditor } from '../../dist/blockeditor.es.js';
import assert from 'node:assert/strict';

assert.ok(typeof Editor === 'function', 'default export must be a constructor');
assert.ok(Editor === NamedEditor, 'default and named exports must be the same');
assert.ok(typeof Editor.prototype.init === 'function', 'must have init()');
assert.ok(typeof Editor.prototype.getMarkdown === 'function', 'must have getMarkdown()');
assert.ok(typeof Editor.prototype.getHtml === 'function', 'must have getHtml()');
assert.ok(typeof Editor.prototype.destroy === 'function', 'must have destroy()');
assert.ok(typeof Editor.prototype.on === 'function', 'must have on()');
```

**`tests/npm/cjs-require.test.cjs`**
```js
// Validates that the CJS build exports are correct
const Editor = require('../../dist/blockeditor.cjs.js');
const assert = require('node:assert/strict');

assert.ok(typeof Editor === 'function', 'require() must return a constructor');
assert.ok(typeof Editor.prototype.getMarkdown === 'function');
assert.ok(typeof Editor.prototype.getHtml === 'function');
assert.ok(typeof Editor.prototype.destroy === 'function');
```

**`tests/npm/types-check.test.ts`** (requires `ts-jest` or `tsd`)
```ts
// Validates that index.d.ts matches expected public API
import Editor from '@foreline/blockeditor';
const e = new Editor({ id: 'test' });
const md: string = e.getMarkdown();
const html: string = e.getHtml();
e.on('content.changed', (data) => {});
e.destroy();
```

### 3.2 — README usage examples as executable tests

Add `tests/readme-examples.test.js` that runs every code block from `README.md` which does not require a live DOM:

```js
// From README: Quick Start
import Editor from '../src/index.js'; // use source, not dist
// ... test all constructor option permutations shown in README
```

Covered examples (from `README.md` and `LIBRARY.md`):
- `new Editor({ id: 'my-editor' })` — basic instantiation
- `new Editor({ markdown: '# Hello World' })` — markdown init option
- `new Editor({ html: '<h1>Hello World</h1>' })` — HTML init option
- `new Editor({ toolbar: false })` — toolbar disabled
- `new Editor({ readonly: true })` — readonly mode (note: currently a stub per `consumer-integration-feedback-analysis.md`)
- `editor.getMarkdown()` → `string`
- `editor.getHtml()` → `string`
- `editor.on(EVENTS.CONTENT_CHANGED, cb)` / `editor.off()` / `editor.once()`
- `subscription.unsubscribe()`
- `editor.emit(EVENTS.CONTENT_CHANGED, payload)`

### 3.3 — Node version matrix (CI)

Add a GitHub Actions workflow `ci-node-matrix.yml`:

```yaml
jobs:
  test-node-matrix:
    strategy:
      matrix:
        node: [18, 20, 22]
        module-type: [esm, cjs]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm run build:lib
      - run: npm test -- --testPathPattern=npm/
```

### 3.4 — Package content verification

Expand `scripts/verify-package.js` (already exists) to assert:
- `dist/blockeditor.es.js` is valid ESM (contains `export`)
- `dist/blockeditor.cjs.js` is valid CJS (contains `module.exports` or `exports.`)
- `dist/index.d.ts` exists and has `declare module '@foreline/blockeditor'` (not `js-editor`)
- `dist/style.css` exists and is non-empty
- `dist/editor.css` exists
- The `exports` map in `package.json` resolves to existing files

---

## Priority 4 — Backward Compatibility Checks

### 4.1 — Public API contract test

Create `tests/api-contract.test.js` that asserts the exact public API surface. This file should be committed and reviewed on every minor version bump:

```js
describe('Public API contract', () => {
    const INSTANCE_METHODS = [
        'init', 'destroy', 'getMarkdown', 'setMarkdown',
        'getHtml', 'setHtml', 'on', 'off', 'once', 'emit',
        'addBlock', 'removeBlock', 'getBlocks', 'getCurrentBlock',
    ];
    const STATIC_METHODS = ['getMarkdown', 'getHtml', 'getInstance'];

    test.each(INSTANCE_METHODS)('instance has method: %s', (method) => {
        expect(typeof Editor.prototype[method]).toBe('function');
    });
    test.each(STATIC_METHODS)('static has method: %s', (method) => {
        expect(typeof Editor[method]).toBe('function');
    });
});
```

### 4.2 — Event name contract test

Create `tests/event-contract.test.js`:

```js
import { EVENTS } from '../src/utils/eventEmitter.js';

test('EVENTS object contains all documented event names', () => {
    const REQUIRED_EVENTS = [
        'CONTENT_CHANGED', 'EDITOR_UPDATED', 'BLOCK_CONTENT_CHANGED',
        'BLOCK_FOCUSED', 'BLOCK_CREATED', 'BLOCK_DELETED',
        'TOOLBAR_ACTION', 'USER_KEY_PRESS',
    ];
    for (const name of REQUIRED_EVENTS) {
        expect(EVENTS).toHaveProperty(name);
        expect(typeof EVENTS[name]).toBe('string');
    }
});
```

### 4.3 — Serialization round-trip test

A regression test that protects against silent serialization breakage across versions:

```js
describe('Markdown round-trip', () => {
    const FIXTURES = [
        { input: '# Heading 1', type: 'h1' },
        { input: '## Heading 2', type: 'h2' },
        { input: '- item one\n- item two', type: 'ul' },
        { input: '1. first\n2. second', type: 'ol' },
        { input: '> quoted text', type: 'quote' },
        { input: '```javascript\nconsole.log("hi")\n```', type: 'code' },
        { input: '| Col A | Col B |\n|---|---|\n| 1 | 2 |', type: 'table' },
    ];

    test.each(FIXTURES)('$type round-trips through markdown', ({ input, type }) => {
        const editor = new Editor({ id: 'test', markdown: input });
        expect(editor.getMarkdown().trim()).toBe(input);
    });
});
```

---

## Summary: Ordered Implementation Backlog

| # | Item | Est. effort | Impact |
|---|---|---|---|
| 0.1 | Create `ListBlock.test.js` | Small | High — covers shared base of 2 block types |
| 0.2 | Create `blocks.index.test.js` smoke test | Trivial | High — catches export regressions |
| 0.3 | Expand `CodeBlock.test.js` | Medium | High — most complex block |
| 0.4 | Expand `syntaxHighlighter.test.js` | Small | Medium |
| 0.5 | Create `DebugTooltip.test.js` | Small | Medium — leak prevention |
| 0.6 | Create `BlockInterface.test.js` | Small | Medium — contract enforcement |
| 1.1 | Expand `HeadingBlock.test.js` | Small | High — heading conversion bugs |
| 1.2 | Expand `TableBlock.test.js` | Medium | High — complex DOM interactions |
| 1.3 | Expand `OrderedListBlock` + `UnorderedListBlock` tests | Small | High |
| 1.4 | Expand `KeyHandler.test.js` | Medium | High — keyboard shortcuts |
| 1.5 | Expand `Parser.test.js` | Medium | High — paste + load |
| 2.1 | Expand `Editor.basic.test.js` | Medium | High — primary API |
| 2.2 | Expand `Toolbar.test.js` | Medium | Medium |
| 2.3 | Expand `ToolbarHandlers.test.js` | Small | Medium |
| 2.4 | Expand `BlockFactory.test.js` | Small | High — all type paths |
| 3.1 | Create `tests/npm/esm-import.test.mjs` | Small | **NPM critical** |
| 3.2 | Create `tests/npm/cjs-require.test.cjs` | Small | **NPM critical** |
| 3.3 | Create `tests/readme-examples.test.js` | Medium | NPM — docs reliability |
| 3.4 | Expand `scripts/verify-package.js` | Small | NPM — release gate |
| 3.5 | Add CI node matrix workflow | Small | NPM — Node compatibility |
| 4.1 | Create `tests/api-contract.test.js` | Small | High — semver safety |
| 4.2 | Create `tests/event-contract.test.js` | Small | Medium — event stability |
| 4.3 | Create `tests/markdown-roundtrip.test.js` | Small | High — serialization |
