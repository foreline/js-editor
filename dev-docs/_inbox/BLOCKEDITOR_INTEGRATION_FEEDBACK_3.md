# BlockEditor Integration Feedback — Round 3

*From integrating `@foreline/blockeditor@0.6.3` into Bitrix Framework. Follows rounds 1 and 2.*

---

## Issue 8 — `id:` API leaves mount element without `.bke-editor` class; all library CSS silently breaks

**Priority: Critical**

### What happens

`init()` creates an internal `div.bke-editor` wrapper but only inserts it into the DOM when the `container` option is provided:

```js
// From blockeditor.es.js ~line 7499:
const t = document.createElement("div");
t.id = "editor";
t.className = "bke-editor";
e.container && (/* ... */ e.container.appendChild(t));   // ← only when container provided

this.instance = document.getElementById(e.id);           // ← consumer's div, no .bke-editor
```

When using the `id:` API without `container:`, `this.instance` is the consumer's element — but the `.bke-editor` CSS class is **never added to it**. All library CSS is scoped to `.bke-editor`:

```css
.bke-editor { outline: none; font-size: var(--editor-font-size); ... }
.bke-editor * { outline: none; box-sizing: border-box; ... }
.bke-editor .bke-block { ... }
/* ... every rule in style.css is under .bke-editor */
```

**Observed result in browser**: thick browser-default focus outline around the editor, some interactive CSS (pointer-events, cursor, selection) not applying.

**Root cause**: The `div.bke-editor` created in `init()` is a dead orphan — it is constructed, given the class, then discarded when `container` is absent. The consumer's element (found by `getElementById(e.id)`) silently has none of the required CSS.

### Recommended fix

When `container` is absent, apply the class to the mount element directly:

```js
if ( e.container ) {
    e.container.appendChild(t);
    this.instance = t;
} else {
    // id: API — treat the consumer's element as the root; give it the class
    this.instance = document.getElementById(e.id);
    this.instance.classList.add('bke-editor');
}
```

### Consumer-side workaround (until fixed)

```js
const mountDiv = document.createElement('div');
mountDiv.id = 'my-editor-id';
mountDiv.classList.add('bke-editor');   // ← required workaround
document.getElementById('field').appendChild(mountDiv);
new BlockEditor({ id: 'my-editor-id', ... });
```

---

## Issue 9 — No CSS custom properties for theming; editor ignores host document font stack

**Priority: Medium**

### What happens

The library defines fixed CSS variables:

```css
.bke-editor {
    --editor-font-size: 1rem;
    --editor-line-height: 1.5;
    /* no --editor-font-family */
}
```

`font-family` is not set at all on `.bke-editor`, relying on CSS inheritance from the document body. In most browsers this works, but:

1. In isolated contexts (SidePanel iframes, shadow DOM, or when a CSS reset higher up clears `font-family`) the inheritance chain breaks silently.
2. Heading blocks use browser-default `<h1>`–`<h3>` element sizing (2em / 1.5em / 1.17em), which is visually large inside compact host UI forms designed for 14px body text.
3. There is no documented way to theme the editor without knowing the full internal selector map.

**Observed result**: heading blocks are oversized relative to surrounding Bitrix UI form elements (body `font-family: 'Open Sans'; font-size: 14px`).

### Recommended fix

Add explicit `inherit` fallbacks and expose heading-scale custom properties:

```css
.bke-editor {
    --bke-font-family: inherit;
    --bke-font-size: 1rem;
    --bke-line-height: 1.5;
    --bke-h1-size: 1.5em;
    --bke-h2-size: 1.25em;
    --bke-h3-size: 1.1em;

    font-family: var(--bke-font-family);
    font-size: var(--bke-font-size);
    line-height: var(--bke-line-height);
}

.bke-editor .bke-block[data-block-type="h1"] { font-size: var(--bke-h1-size); }
.bke-editor .bke-block[data-block-type="h2"] { font-size: var(--bke-h2-size); }
.bke-editor .bke-block[data-block-type="h3"] { font-size: var(--bke-h3-size); }
```

Host integrations can then override to match their design system:

```css
#my-editor-container {
    --bke-font-family: 'Open Sans', sans-serif;
    --bke-h1-size: 1.4em;
}
```

### Consumer-side workaround (until fixed)

```css
/* blockeditor-overrides.css */
.bke-editor { font-family: inherit; }
.bke-editor .bke-block[data-block-type="h1"] { font-size: 1.5em; font-weight: 700; }
.bke-editor .bke-block[data-block-type="h2"] { font-size: 1.25em; font-weight: 700; }
.bke-editor .bke-block[data-block-type="h3"] { font-size: 1.1em; font-weight: 600; }
```

---

## Issue 10 — No `mount(element, options)` API; `id:` API requires awkward DOM pre-setup

**Priority: Low / DX improvement**

### What happens

The current `id:` API requires the consumer to:
1. Create a `<div>` with a known `id`
2. Insert it into the DOM at the right position
3. Pass the `id` string to the constructor

In frameworks that replace existing DOM elements (e.g. swapping a native `<textarea>` for an editor), this means 3 extra steps and reliance on a string ID to reconnect what is already a known DOM reference.

### Recommended API addition

```js
// Mount directly onto an existing DOM element — no id, no pre-insertion needed
const editor = BlockEditor.mount(existingElement, {
    markdown: '...',
    minHeight: '300px',
    toolbar:   true,
});
```

`mount()` would:
1. Add `.bke-editor` to `existingElement` (fixing issue 8 structurally)
2. Initialise the editor with `existingElement` as `this.instance`
3. Return the editor instance

This would eliminate ~10 lines of DOM manipulation from every host integration.

---

## Version Status

| Issue | v0.6.3 | Notes |
|---|---|---|
| 8 — `id:` API missing `.bke-editor` class | Present | Consumer workaround: `mountDiv.classList.add('bke-editor')` |
| 9 — No CSS custom properties, heading sizes | Present | Consumer workaround: `blockeditor-overrides.css` |
| 10 — No `mount(element)` API | Present | DX improvement request |
