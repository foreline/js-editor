# Block Architecture Refactoring

## Overview

The editor has been refactored to use a modular block architecture where each block type is its own class with specific behavior for key handling and transformations.

## New Architecture

### Core Components

1. **BaseBlock** (`src/blocks/BaseBlock.js`) - Abstract base class for all block types
2. **Block Type Classes** - Specific implementations for each block type:
   - `ParagraphBlock` - Basic paragraph blocks
   - `HeadingBlock`, `H1Block`, `H2Block`, etc. - Heading blocks
   - `UnorderedListBlock`, `OrderedListBlock`, `TaskListBlock` - List blocks
   - `CodeBlock`, `QuoteBlock`, `DelimiterBlock` - Special blocks
3. **BlockFactory** (`src/blocks/BlockFactory.js`) - Factory pattern for creating block instances
4. **KeyHandler** (`src/KeyHandler.js`) - Centralized key handling system
5. **Block** (`src/Block.js`) - Backward compatibility wrapper

### Key Features

#### Individual Block Behavior

Each block type can now define its own:

- **Markdown Triggers**: What text patterns convert to this block type
- **Key Press Handling**: Custom behavior for specific key presses
- **Enter Key Handling**: Custom behavior when Enter is pressed
- **Toolbar Integration**: How to apply this block type via toolbar

#### Example Usage

```javascript
// Create a heading block
const h1Block = new H1Block('My Heading', '<h1>My Heading</h1>');

// Check if text matches markdown trigger
if (H1Block.matchesMarkdownTrigger('# ')) {
    // Convert to H1 block
    const block = new H1Block();
    block.applyTransformation();
}

// Handle key press for specific block type
const handled = block.handleKeyPress(keyEvent, currentText);
```

#### Factory Pattern

```javascript
// Create blocks using the factory
const block = BlockFactory.createBlock('h1', 'content', '<h1>content</h1>');

// Find block class for markdown trigger
const BlockClass = BlockFactory.findBlockClassForTrigger('# ');

// Create block from trigger
const block = BlockFactory.createBlockFromTrigger('# ', 'Heading content');
```

### Key Handler System

The new `KeyHandler` centralizes all key press logic:

- **Markdown Trigger Detection**: Automatically detects markdown patterns and converts blocks
- **Block-Specific Handling**: Delegates key handling to individual block types
- **Special Key Handling**: Manages Enter, Tab, and other special keys
- **Code Block Creation**: Handles triple backtick code block creation

### Backward Compatibility

The original `Block` class has been converted to a wrapper that:
- Maintains the same API for existing code
- Delegates behavior to the appropriate block type class
- Provides access to advanced features through `getBlockInstance()`

## Extension Points

### Adding New Block Types

1. Create a new class extending `BaseBlock`
2. Implement required methods:
   - `getMarkdownTriggers()` - Static method returning trigger strings
   - `handleKeyPress()` - Custom key handling logic
   - `handleEnterKey()` - Custom Enter key handling
   - `applyTransformation()` - How to apply via toolbar

3. Register in `BlockFactory.createBlock()` and `getAllBlockClasses()`

### Example New Block Type

```javascript
class TableBlock extends BaseBlock {
    constructor(content = '', html = '', nested = false) {
        super('table', content, html, nested);
    }

    static getMarkdownTriggers() {
        return ['| '];
    }

    handleKeyPress(event, text) {
        if (event.key === 'Tab') {
            // Navigate to next cell
            return true;
        }
        return false;
    }

    handleEnterKey(event) {
        // Add new row
        return true;
    }

    applyTransformation() {
        Toolbar.table();
    }
}
```

### Custom Key Handling

Each block type can override `handleKeyPress()` to implement custom behavior:

```javascript
handleKeyPress(event, text) {
    if (event.key === 'Tab' && this.type === BlockType.CODE) {
        // Insert tab character in code blocks
        event.preventDefault();
        document.execCommand('insertText', false, '\t');
        return true;
    }
    return false; // Let default handling continue
}
```

## Benefits

1. **Separation of Concerns**: Each block type manages its own behavior
2. **Extensibility**: Easy to add new block types with custom behavior
3. **Maintainability**: Block-specific logic is isolated and easier to test
4. **Type Safety**: Clear interfaces for block behavior
5. **Backward Compatibility**: Existing code continues to work unchanged

## Testing

- **BlockFactory.test.js**: Tests for the factory pattern and block creation
- **KeyHandler.test.js**: Tests for centralized key handling
- **Block.test.js**: Updated tests for backward compatibility wrapper

The refactoring maintains all existing functionality while providing a foundation for future block type extensions with custom key handling and behavior.
