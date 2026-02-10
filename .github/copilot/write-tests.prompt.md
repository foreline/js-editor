---
description: "Write or update tests for a specific component following project testing patterns"
---

# Write Tests

You are writing or updating tests for the JS Editor project.

## Setup
- Test framework: **Jest** with `babel-jest` transform
- Tests live in `tests/` directory, named `<Subject>.test.js`
- Import test helpers from `tests/testUtils.js`
- DOM mocks and setup are in `tests/setup.js` and `tests/mocks/`

## Conventions
- Use `describe` blocks grouped by feature or method
- Use clear test names: `it('should convert paragraph to heading when # trigger is typed')`
- Create Editor instances in tests — do not rely on static methods
- Mock DOM elements using JSDOM (available in the test environment)
- Use `Element.closest` polyfill if needed (may be missing in JSDOM)

## Running Tests
- Run only the relevant test file to keep output focused:
  ```powershell
  npx jest tests/SpecificTest.test.js
  ```
- Use `--verbose` for detailed output: `npx jest tests/SpecificTest.test.js --verbose`
- Run full suite only before committing: `npm test`

## What to Test
- **Block types**: rendering, markdown serialization (`toMarkdown()`/`toHtml()`), keyboard handling, `applyTransformation()`
- **Editor**: block creation, conversion, focus management, paste handling, event emission
- **Parser**: markdown-to-HTML and HTML-to-markdown round-trips, edge cases, sanitization
- **Toolbar**: button state updates, handler delegation, no circular dependencies
- **KeyHandler**: Enter/Backspace behavior, markdown trigger detection

## Common Patterns
- Create a container div and initialize Editor with it
- Access blocks via the editor's DOM children with `data-block-type` attribute
- Simulate keyboard events with `new KeyboardEvent()` or `dispatchEvent`
- Check DOM state after operations (classes, attributes, content)
