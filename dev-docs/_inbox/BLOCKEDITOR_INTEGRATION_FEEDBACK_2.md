# BlockEditor Integration Feedback — Round 2

*From integrating `@foreline/blockeditor@0.1.4` into Bitrix Framework, following round-1 improvements.*

All issues below are confirmed by reading the minified `dist/blockeditor.es.js` source. Exact code is quoted.

---

## Issue 1 — Toolbar is inserted into `parentElement`, not into the mount element

**Priority: Critical**

### What happens

`initializeToolbar()` resolves the toolbar container as:

```js
const t = this.instance.parentElement || this.instance;
```

This `t` — the **parent of the mount div** — is then passed as `container` to the `Toolbar` constructor, which inserts the toolbar element there.

**Result in a real host page:**

```
fieldContainer               ← this is t (parentElement)
├── .title  "Описание"       ← host label
├── .bke-toolbar             ← ⚠ toolbar lands here, BEFORE the label
└── #task-description-editor ← mount div (this.instance)
```

The toolbar renders above the field label, breaking the visual order.

### Why this design is wrong

The consumer passes `id: 'my-div'` to the constructor. `my-div`'s parent is under the host's control and may contain arbitrary siblings (labels, loading spinners, other fields). The library must not insert elements into territory it does not own.

### Workaround required from consumer

We had to introduce a dedicated wrapper div around the mount point purely to give the library a safe parent to inject into:

```js
const wrapper = document.createElement('div');
const mountDiv = document.createElement('div');
mountDiv.id = EDITOR_ID;
wrapper.appendChild(mountDiv);
fieldContainer.appendChild(wrapper);
// Now: toolbar lands in wrapper, not in fieldContainer
```

This is boilerplate that every consumer in a structured-layout host will need.

### Recommended fix

Insert the toolbar **inside** `this.instance` (the mount div itself), not into its parent:

```js
// initializeToolbar() — change:
const t = this.instance.parentElement || this.instance;
// to:
const t = this.instance;
```

The toolbar and the editable content area are logically part of the same unit. Both should be children of the mount element. This also makes the library consistent with how every other block editor (Quill, TipTap, Lexical, CKEditor) works — all of them render toolbar + content area inside the single mount div.

---

## Issue 2 — Hidden storage elements use `.visually-hidden` + `minHeight`, breaking layout in host CSS environments

**Priority: High**

### What happens

`initMarkdownContainer()` and `initHtmlContainer()` create hidden storage elements:

```js
// initMarkdownContainer():
t.className = 'bke-text-md visually-hidden';
t.style.width = '100%';
t.style.minHeight = '300px';   // ⚠ height set on a "hidden" element

// initHtmlContainer():
t.className = 'bke-text-html visually-hidden';
t.style.width = '100%';
t.style.minHeight = '300px';   // ⚠ same
```

The library relies on Bootstrap's `.visually-hidden` definition, which removes elements from visual flow:
```css
/* Bootstrap visually-hidden */
position: absolute; width: 1px; height: 1px; ...
```

However, Bitrix (and many other frameworks) define `.visually-hidden` differently:
```css
/* Bitrix visually-hidden */
visibility: hidden;
```

`visibility: hidden` preserves layout flow. With `minHeight: 300px`, each hidden element occupies **300px of vertical space**. Two elements = **600px of invisible dead space** below the editor.

**Screenshot evidence:** The two elements are visible in DevTools as 568×300 boxes with `visibility: hidden`.

### Recommended fix

Use `display: none` directly, without relying on any host-provided utility class:

```js
// Instead of className = 'bke-text-md visually-hidden' + style.minHeight:
t.style.display = 'none';
```

`display: none` removes the element from layout entirely regardless of host CSS. It is the correct approach for elements that are purely programmatic storage (never user-visible). The `minHeight` style is meaningless on a hidden storage element and should be removed.

---

## Issue 3 — Hidden storage elements are appended to `parentElement`, not inside the mount element

**Priority: High**

Related to Issue 1. The markdown/HTML storage elements are appended to:

```js
const n = (this.instance?.parentElement) ?? document.body;
n.appendChild(t);
```

Same problem as the toolbar: these elements land in the host's parent container, polluting it with foreign children. If `parentElement` is a form field row, `document.body` (the fallback) is even worse.

Both storage elements should be appended inside `this.instance`, alongside the toolbar and content area.

---

## Issue 4 — Hardcoded element IDs conflict with multiple editor instances

**Priority: High**

The markdown and HTML storage elements are created with hardcoded IDs:

```js
t.id = 'editor-markdown';   // initMarkdownContainer
t.id = 'editor-html';       // initHtmlContainer
```

If two `Editor` instances exist on the same page (e.g., description + comment fields), the second call to `initMarkdownContainer()` finds `#editor-markdown` already in the DOM and skips creation:

```js
return n.querySelector('#editor-markdown')
  ? (warn('Markdown container already exists, skipping...'), true)
  : (n.appendChild(t), true);
```

The second editor then reads/writes the first editor's markdown container, silently corrupting state.

### Recommended fix

Scope IDs to the editor instance:

```js
t.id = `${this.editorId}-markdown`;   // e.g. "task-description-editor-markdown"
t.id = `${this.editorId}-html`;
```

---

## Issue 5 — Toolbar event listeners use `document.querySelectorAll`, not scoped to instance

**Priority: High**

The toolbar action handlers are bound with global selectors:

```js
document.querySelectorAll('.bke-toolbar-undo').forEach(...)
document.querySelectorAll('.bke-toolbar-redo').forEach(...)
document.querySelectorAll('.bke-toolbar-bold').forEach(...)
// ... all buttons
```

With two editors on the same page, clicking "Bold" in editor A triggers the Bold action in editor B as well (because both toolbars have `.bke-toolbar-bold` buttons and both listeners fire).

### Recommended fix

Scope all `querySelectorAll` calls to the toolbar's own container element:

```js
// Instead of:
document.querySelectorAll('.bke-toolbar-undo').forEach(...)

// Use:
this.container.querySelectorAll('.bke-toolbar-undo').forEach(...)
```

---

## Issue 6 — `minHeight` option is applied to hidden storage elements, not just the editor

**Priority: Medium**

When the consumer passes `minHeight: '300px'` to the constructor, this value is forwarded to the hidden `<textarea>` and `<div>` storage elements (see Issue 2). The consumer intends to control the **visible editor** height, not invisible internal storage.

The `minHeight` option should be applied only to the visible editing surface (`this.instance` or the content area within it).

---

## Issue 7 — `document.querySelectorAll('.bke-toolbar-*')` in `initViewToggle()`

**Priority: Medium**

The view-toggle logic (Text / Markdown / HTML view) also uses global `document.querySelector`:

```js
const t = document.querySelector('.bke-text-md');
const n = document.querySelector('.bke-text-html');
const s = document.querySelector('.bke-toolbar-text');
```

Single-editor pages work, but these will silently target the wrong instance on multi-editor pages.

Same fix as Issue 5 — scope all queries to the instance container.

---

## Summary

| # | Issue | Priority | Root cause |
|---|---|---|---|
| 1 | Toolbar inserted into `parentElement` | **Critical** | `container: this.instance.parentElement` in `initializeToolbar()` |
| 2 | Hidden elements cause height bloat via `.visually-hidden` | **High** | `visually-hidden` + `minHeight: 300px` on storage elements |
| 3 | Storage elements appended to `parentElement` | **High** | `n = this.instance.parentElement` in `initMarkdownContainer()` |
| 4 | Hardcoded `#editor-markdown` / `#editor-html` IDs | **High** | Static ID strings in `init*Container()` |
| 5 | Toolbar listeners use `document.querySelectorAll` | **High** | Global selectors in toolbar event binding |
| 6 | `minHeight` applied to hidden storage elements | **Medium** | Options forwarded without filtering |
| 7 | View toggle uses `document.querySelector` | **Medium** | Global selectors in `initViewToggle()` |

---

## The Common Thread

Issues 1, 3, 4, 5, and 7 all have the same root cause: **the library assumes it is the only editor on the page and uses global DOM queries**. The fix is consistent across all of them — scope every DOM operation to `this.instance` or the toolbar container element, and derive all IDs from the instance's own `id` option.

Issue 2 is independent and simpler: replace `className = 'visually-hidden'` with `style.display = 'none'` on storage elements.

Fixing all 7 issues together would eliminate the need for any consumer-side workarounds in structured host environments.
