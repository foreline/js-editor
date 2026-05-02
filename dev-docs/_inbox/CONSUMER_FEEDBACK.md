# BlockEditor Integration Feedback — Consumer Perspective

*From integrating `@foreline/blockeditor@0.1.3` into Bitrix Framework (PHP host, SidePanel iframe, CSS asset pipeline)*

---

## 1. CSS Architecture — Critical

### 1.1 Remove Bootstrap (and @popperjs/core) as hard dependencies

**Priority: Critical**

This is the root cause of every visual breakage in host environments. Bootstrap bundles a CSS reset (`reboot.css`) and opinionated global styles for `ul`, `li`, `button`, `table`, `code`, etc. When the host page already has Bootstrap at a different version, or has its own global stylesheet (like Bitrix), two resets fight each other.

**What broke in practice:**
- Toolbar dropdown `<li>` items rendered with bullet points from Bitrix's `ul { list-style: disc }`, because Bootstrap's own reset that was supposed to suppress them wasn't winning the cascade inside the iframe
- Table and button styles were overridden unpredictably
- `@popperjs/core` (Bootstrap's positioning engine) was bundled even though the dropdown could be positioned with pure CSS

**Recommended fix:**
- Remove `bootstrap` and `@popperjs/core` from `dependencies` entirely
- Re-implement the toolbar dropdown with plain CSS (`position: absolute`, no Popper)
- The only Bootstrap component actually used is the dropdown — it is not worth the dependency weight

---

### 1.2 Scope all CSS under a unique namespace

**Priority: Critical**

Classes like `.editor`, `.editor-toolbar`, `.block`, `.dropdown` are extremely generic. They will collide with any host that has its own `.editor` or `.block` class (both are common in CMS environments).

**Recommended fix — option A, prefix every class:**

```css
/* Before */
.editor { ... }
.editor-toolbar { ... }
.block { ... }

/* After */
.bke-editor { ... }
.bke-toolbar { ... }
.bke-block { ... }
```

**Recommended fix — option B, data-attribute scoping:**

```css
[data-bke-root] .toolbar { ... }
[data-bke-root] .block { ... }
```

Either approach completely eliminates bleed-in and bleed-out with host CSS.

---

### 1.3 Add a CSS reset scoped to the editor container

**Priority: High**

The editor needs a local CSS reset that undoes host page styles *inside* the editor boundary, without touching anything outside it:

```css
.bke-editor-container *,
.bke-editor-container *::before,
.bke-editor-container *::after {
    box-sizing: border-box;
}

.bke-editor-container ul,
.bke-editor-container ol {
    list-style: none;
    margin: 0;
    padding: 0;
}

.bke-editor-container button {
    font-family: inherit;
    cursor: pointer;
}
```

This is the standard pattern used by all production editors (Quill, TipTap, Lexical, Slate).

---

## 2. Font / Asset Loading — High

### 2.1 Don't bundle FontAwesome — make it a peer dependency or provide an abstraction

**Priority: High**

FontAwesome is `158 kB` of webfonts + `75 kB` of CSS. It is the single largest contributor to bundle size. Many host applications already load FontAwesome globally (Bitrix ships it). Bundling it causes duplicate font downloads.

**Current problem:** Vite emits `url(fa-solid-900.woff2)` relative paths in the output CSS. When the host's CSS pipeline concatenates files (Bitrix, Webpack, Laravel Mix, etc.), relative paths break and fonts 404. We worked around this by setting `base: '/servicedesk/js/dist/'` in our consumer Vite config, but that is a consumer-side hack — the problem is in the library.

**Recommended options (pick one):**

**Option A — Peer dependency + opt-in import:**

```json
// package.json
"peerDependencies": {
    "@fortawesome/fontawesome-free": ">=6"
},
"peerDependenciesMeta": {
    "@fortawesome/fontawesome-free": { "optional": true }
}
```

```js
// Consumer decides whether to import FA
import '@foreline/blockeditor';
import '@foreline/blockeditor/css';
// FA: host loads its own, or consumer adds:
// import '@fortawesome/fontawesome-free/css/all.min.css';
```

**Option B — Icon abstraction layer:**

Accept an icon renderer in options, defaulting to FA but swappable:

```js
new Editor({
    id: 'my-editor',
    icons: {
        bold:   '<i class="fa-solid fa-bold"></i>',  // default FA
        // or:  bold: '<svg>...</svg>'
        // or:  bold: () => document.createElement('my-icon')
    }
});
```

**Option C — Inline SVG icons only (zero font dependency):**

Replace FA with a small inline SVG set. Heroicons, Lucide, or a hand-picked subset are all < 5 kB total. This is what TipTap, Quill, and CKEditor do. The toolbar uses only ~15–20 icons — the full FA font (1400+ icons) is extreme overkill.

Option C is the most robust for a library.

---

## 3. JavaScript API — Medium/High

### 3.1 Fix the module declaration name in `index.d.ts`

**Priority: Medium — currently breaks TypeScript consumers completely**

The type declaration file says:

```ts
declare module 'js-editor' {   // ← wrong package name
```

But the package is `@foreline/blockeditor`. TypeScript consumers get zero type checking because the module name doesn't match the import. Fix:

```ts
declare module '@foreline/blockeditor' {
```

---

### 3.2 `initMarkdownContainer()` global `querySelector` is fragile

**Priority: High**

The method does `document.querySelector('.editor-container')` globally. This breaks in:

- Multiple editors on the same page (always matches the first one)
- Shadow DOM / iframes
- AJAX-rendered fragments where `.editor-container` doesn't exist at call time
- Host pages that happen to have an unrelated `.editor-container` element (common in CMS)

**Fix:** The constructor already accepts `id` — the library should create or locate its own wrapper using `document.getElementById(id)`, not rely on a host-provided ancestor class:

```js
// Consumer should only need a plain empty div:
// <div id="my-editor"></div>
new Editor({ id: 'my-editor', ... });
// Library wraps it internally as needed — no .editor-container required from host
```

---

### 3.3 Export `Editor` as both default and named export

**Priority: Medium**

Currently the ESM build exports `Editor` only as default. Bundlers in application-bundle mode (Vite `rollupOptions.input`, not library mode) do not re-export named exports from a bundle entry. This means the consumer cannot do:

```js
import { Editor } from '/dist/blockeditor.js'; // fails
```

Both should work:

```js
import Editor from '@foreline/blockeditor';          // default ✓
import { Editor } from '@foreline/blockeditor';      // named  ✓
```

One-line fix in the library entry:

```js
export { Editor };      // named
export default Editor;  // default
```

---

## 4. Bundle Size — Medium

**Current transfer cost per page load:**

| Asset | Raw | Gzipped |
|---|---|---|
| `blockeditor.js` | 255 kB | 74 kB |
| `style.css` (incl. FA) | 75 kB | 23 kB |
| `fa-solid-900.woff2` | 158 kB | already compressed |
| `fa-brands-400.woff2` | 118 kB | already compressed |
| **Total** | **~606 kB** | **~370 kB** |

**Breakdown of JS contributors:**

- `showdown` (Markdown↔HTML): ~45 kB
- `prismjs` (syntax highlighting): ~30 kB
- Bootstrap JS: ~20 kB
- Editor core: remainder

**Recommendations:**

| Item | Action | Estimated saving |
|---|---|---|
| Bootstrap | Remove entirely | ~20 kB JS + ~30 kB CSS |
| FontAwesome | Make peer dep or use SVG | ~75 kB CSS + ~280 kB fonts |
| prismjs | Lazy-load on first code block render | ~30 kB (deferred) |
| showdown | Consider `marked` (smaller) or `micromark` | ~15–20 kB |

**Realistic post-cleanup target: < 60 kB JS gzipped, zero font downloads when host already provides FA.**

---

## 5. `change` Event Payload — Medium

The `change` event callback receives a `data` argument but its shape is not documented or typed. As a consumer we had to write:

```js
editor.on('change', (data) => {
    const md = editor.getMarkdown?.() ?? data?.markdown ?? '';
});
```

The `?.` optional chaining was defensive guessing. The event payload should be typed and documented:

```ts
interface ChangeEventData {
    markdown: string;
    html: string;
    blocks: BlockData[];
}

on(event: 'change', callback: (data: ChangeEventData) => void): void;
on(event: 'focus' | 'blur', callback: () => void): void;
```

All supported event names should also be listed as a union type or enum, not just `string`.

---

## 6. `destroy()` Lifecycle — Medium

The `destroy()` method and `Editor.destroyInstance(id)` static method exist, which is excellent. However:

1. **It should remove all document/window-level event listeners** (keyboard shortcuts, resize observers, mutation observers) — leaks in SPA and AJAX environments
2. **It should be idempotent** — calling `destroy()` twice must not throw
3. **Document it prominently** — SPAs and AJAX-heavy pages re-render containers frequently; consumers *will* forget to call it

---

## 7. `readonly` Mode — Low/Medium

The `readonly` option is declared in the types. Hardening suggestions:

- Explicitly set `pointer-events: none` and `user-select: none` on the editor root in readonly mode (not just removing `contenteditable`) so host CSS cannot accidentally re-enable interaction
- The toolbar should be hidden by default in readonly mode unless the consumer explicitly opts in

---

## 8. Summary — Priority Order

| # | Issue | Priority | Effort |
|---|---|---|---|
| 1 | Remove Bootstrap + @popperjs/core dependency | **Critical** | Medium |
| 2 | Namespace all CSS classes (`bke-*` or `[data-bke]`) | **Critical** | Medium |
| 3 | Scoped local CSS reset inside container | **High** | Low |
| 4 | FontAwesome → peer dep or inline SVG icons | **High** | Medium–High |
| 5 | Fix `initMarkdownContainer` global `querySelector` | **High** | Low |
| 6 | Fix `declare module 'js-editor'` → `'@foreline/blockeditor'` | **Medium** | Trivial |
| 7 | Named + default ESM exports | **Medium** | Trivial |
| 8 | Type + document `change` event payload and event name union | **Medium** | Low |
| 9 | `destroy()` completeness + idempotency | **Medium** | Low |
| 10 | Lazy-load prismjs | **Low** | Low |
| 11 | `readonly` visual hardening | **Low** | Low |

---

## 9. The One Change That Fixes 80% of Integration Pain

If you implement only one thing: **remove Bootstrap and scope all CSS under `[data-bke]` or `.bke-*`**.

Those two changes together mean the library is CSS-isolated — no bleed-in from host, no bleed-out to host, no version conflicts, no need for consumer-side override stylesheets. Every other item in this document is incremental polish on top of that foundation.
