# Block-Toolbar Integration Documentation

## Overview

The JS Editor supports dynamic toolbar button state management based on the currently active block type. This allows blocks to control which toolbar buttons are available and disabled, providing a context-aware editing experience.

## Architecture

### Core Components

1. **Block Interface**: Each block implements `getDisabledButtons()` method
2. **Editor Integration**: `Editor.setCurrentBlock()` triggers toolbar state updates
3. **Toolbar State Management**: Dynamic enabling/disabling of buttons based on context

### Implementation Flow

```
User focuses on block → setCurrentBlock() → updateToolbarButtonStates() → 
Block provides disabled buttons → Toolbar buttons are enabled/disabled
```

## Block Methods

### `getDisabledButtons()`

Each block type must implement this method to return an array of toolbar button class names that should be disabled for this block type.

```javascript
getDisabledButtons() {
    return [
        'editor-toolbar-bold',
        'editor-toolbar-italic',
        'editor-toolbar-ul',
        'editor-toolbar-ol'
    ];
}
```

### `getToolbarConfig()` 

Blocks can also provide their own toolbar button configurations:

```javascript
getToolbarConfig() {
    return {
        group: [
            { 
                class: 'editor-toolbar-table', 
                icon: 'fa-table', 
                title: 'Insert table' 
            }
        ]
    };
}
```

## Editor Methods

### `updateToolbarButtonStates()`

Called automatically when the current block changes. This method:

1. Gets the current block type from `data-block-type` attribute
2. Creates a block instance to access its methods
3. Calls `enableAllToolbarButtons()` to reset state
4. Disables buttons specified by `getDisabledButtons()`

### `enableAllToolbarButtons()`

Resets all toolbar buttons to enabled state, except for view buttons that should maintain their current state.

### `getBlockInstance(blockType)`

Creates a temporary block instance for the given type to access its methods.

### `setCurrentBlock(block)`

Sets the active block and triggers toolbar state updates.

## Block Type Behaviors

### Header Blocks (H1-H6)

Headers disable formatting buttons that don't make sense in headers:

- Bold, Italic, Underline, Strikethrough
- List buttons (UL, OL, Checklist)
- Code formatting

**Rationale**: Headers are structural elements and shouldn't contain complex formatting.

### Paragraph Blocks

Paragraph blocks allow all formatting options:

- Text formatting (bold, italic, underline, strikethrough)
- Lists (when converting paragraph to list)
- Code formatting

### List Blocks

List blocks disable incompatible formatting:

- Header buttons (can't make list items into headers)
- Other list type buttons (prevent nesting conflicts)

### Code Blocks

Code blocks disable text formatting:

- Bold, Italic, Underline, Strikethrough
- Lists
- Headers

**Rationale**: Code should maintain plain text formatting for readability.

## DOM Integration

### Block Identification

Blocks are identified using the `data-block-type` attribute:

```html
<div class="block" data-block-type="h1" data-placeholder="Type '/' to insert block">
    <h1>Heading content</h1>
</div>
```

### Button State Classes

Disabled buttons receive additional styling:

```css
.editor-toolbar button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.editor-toolbar button:disabled {
    pointer-events: none;
}
```

## Event Flow

1. **User Interaction**: User clicks on or navigates to a block
2. **Focus Event**: Block receives focus and becomes current
3. **State Update**: `Editor.setCurrentBlock(block)` is called
4. **Toolbar Update**: `updateToolbarButtonStates()` runs automatically
5. **Button Management**: Buttons are enabled/disabled based on block type

## Extension Points

### Adding New Block Types

When creating a new block type:

1. Implement `getDisabledButtons()` method
2. Optionally implement `getToolbarConfig()` for custom buttons
3. Add the block type to `BlockFactory`
4. Define button behavior logic

### Custom Button Behaviors

To add new context-aware buttons:

1. Add button configuration to toolbar groups
2. Implement button handler in `Toolbar.js`
3. Update block `getDisabledButtons()` methods as needed
4. Add CSS styling for disabled states

## Example Integration

```javascript
// Custom TableBlock example
class TableBlock extends BaseBlock {
    getDisabledButtons() {
        return [
            'editor-toolbar-h1',
            'editor-toolbar-h2', 
            'editor-toolbar-h3',
            'editor-toolbar-ul',
            'editor-toolbar-ol'
        ];
    }
    
    getToolbarConfig() {
        return {
            group: [
                { 
                    class: 'editor-toolbar-table-row', 
                    icon: 'fa-plus', 
                    title: 'Add table row' 
                },
                { 
                    class: 'editor-toolbar-table-col', 
                    icon: 'fa-columns', 
                    title: 'Add table column' 
                }
            ]
        };
    }
}
```

## Testing

The block-toolbar integration is tested in `tests/BlockToolbarIntegration.test.js`, covering:

- Button state updates on block change
- Proper method call sequences
- Error handling for invalid block types
- Integration with existing toolbar system

## Browser Compatibility

The integration uses standard DOM APIs:

- `document.querySelector()` and `querySelectorAll()` 
- `classList.add()` and `classList.remove()`
- `element.disabled` property
- `element.getAttribute()`

Compatible with all modern browsers supporting ES6+ features.
