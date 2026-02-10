---
description: "Create a new block type following the block architecture patterns"
---

# New Block Type

You are adding a new block type to the JS Editor. Follow this guide:

## Block Architecture
- Create a new block class in `src/blocks/` extending `BaseBlock`
- Implement the full block contract:
  - **Instance methods**: `handleKeyPress(evt)`, `handleEnterKey(evt)`, `toMarkdown()`, `toHtml()`, `applyTransformation(targetType)`
  - **Static methods**: `getMarkdownTriggers()`, `getToolbarConfig()`, `getDisabledButtons()`
  - **Properties**: `type`, optional `nested`, DOM element as block container

## DOM Structure
- Block container: `<div class="block block-<type>" data-block-type="<type>">`
- Add change tracking with `data-timestamp` attribute updates on content changes
- Make the primary content element `contenteditable`

## Integration
- Register the new block in `src/blocks/index.js` and `src/BlockType.js`
- Add toolbar configuration via `getToolbarConfig()` — specify group and button properties
- Add markdown triggers via `getMarkdownTriggers()` if applicable
- Add disabled buttons via `getDisabledButtons()` to prevent invalid toolbar actions

## Styling
- Add block-specific styles in `src/scss/` or `src/css/`
- Follow the naming pattern: `.block-<type>` for block-specific selectors

## Testing
- Create `tests/<BlockName>.test.js`
- Test: rendering, markdown round-trip, keyboard handling, toolbar integration, applyTransformation
- Use `tests/testUtils.js` for shared test helpers

## Documentation
- Update `docs/BLOCK_ARCHITECTURE.md` with the new block type
- Update `docs/BLOCK_TOOLBAR_INTEGRATION.md` if adding toolbar buttons
- Update `SPECS.md` block types section
- Update `CHANGELOG.md`
