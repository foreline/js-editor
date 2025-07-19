# Changelog

All notable changes to the JS Editor project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.0.16]

### Added
- **Blocks Conversion**: Implemented automatic block type conversion based on markdown triggers
  - Added `checkAndConvertBlock()` method to Editor class for detecting when a block should be converted to a different type
  - Added `convertBlockType()` method to handle the actual conversion process
  - Added `findEditableElementInBlock()` method to locate the correct element to edit within converted blocks
  - Added `placeCursorAtEnd()` method for proper cursor positioning after conversion
  - Added `BLOCK_CONVERTED` event to track conversion operations
  - Integrated conversion logic into `KeyHandler.handleKeyPress()` for real-time conversion as user types
  - Added input event listener to catch content changes from paste operations and other sources
  - When typing markdown triggers (e.g., `# `, `- `, `* `, `1. `, `- [ ]`) in a paragraph block, the block automatically converts to the appropriate type (heading, list, task list, etc.)
  - Conversion only occurs from paragraph blocks to other types to prevent unwanted conversions
  - Remaining content after the trigger is preserved and properly positioned in the new block structure
  - Static method `Editor.checkAndConvertBlock()` added for backward compatibility

## [v0.0.15]

### Fixed
- **Enter keypress at the last list item**: Fixed issue where pressing Enter at the end of the last item in list blocks (unordered, ordered, and task lists) was creating a new default paragraph block instead of adding a new list item to the current list
  - Modified `ListBlock.handleEnterKey()` to detect when cursor is at the last list item and handle it appropriately
  - Updated `createNewListItem()` method signature to accept both `currentBlock` and `currentListItem` parameters
  - Enhanced `UnorderedListBlock.createNewListItem()` to append new list items to the existing `<ul>` container instead of creating separate blocks
  - Enhanced `OrderedListBlock.createNewListItem()` to append new list items to the existing `<ol>` container instead of creating separate blocks
  - Updated `TaskListBlock.createNewListItem()` to maintain consistency with new method signature
  - Added defensive programming to handle test environments and edge cases in focus management
  - Updated test cases to reflect the new behavior and ensure proper functionality
  - Lists now behave like normal contenteditable lists: Enter at the last item adds a new item, Enter at an empty last item exits the list

## [v0.0.14]

### Fixed
- **TaskList Block Presentation**: Completely refactored TaskList blocks to render as proper semantic unordered lists
  - TaskList blocks now render as `<div class="block block-sq">` containing `<ul class="task-list">` with proper `<li class="task-list-item">` elements
  - Each task item contains `<input type="checkbox">` and editable `<span>` for task text
  - Completed tasks display with `checked="checked"` attribute and strikethrough text styling
  - Checkbox state changes update both input state and text appearance dynamically
  - Updated `toHtml()` method to generate proper `<ul>` structure instead of individual `<li>` elements
  - Enhanced `toMarkdown()` method to handle multiple tasks within a single block
  - Updated Parser to group consecutive task list items into proper `<ul>` containers
  - Improved CSS styling to target the new semantic structure
  - Updated all test cases to match the new implementation architecture
  - Fixed HTML parsing to handle both legacy and new task list formats
  - Enhanced focus management and checkbox interaction for better user experience

## [v0.0.13]

### Fixed
- **Block Structure Consistency**: Fixed all blocks to be wrapped in `<div>` tags for consistent block architecture
  - Updated `UnorderedListBlock.renderToElement()` to create div wrapper containing `<ul>` element
  - Updated `OrderedListBlock.renderToElement()` to create div wrapper containing `<ol>` element  
  - Updated `TaskListBlock.renderToElement()` to create div wrapper containing `<li>` element
  - Updated CSS selectors to properly target nested list elements within div wrappers
  - All blocks now follow the consistent pattern: `<div class="block block-[type]" data-block-type="[type]">...</div>`

### ✅ COMPLETED: Instance-Based Architecture

**MAJOR UPDATE**: Successfully converted Editor from static to instance-based architecture with isolated event systems.

### Added
- **Instance-Based Editor Architecture**: Complete refactoring to support multiple editor instances
  - Each `new Editor()` creates an isolated instance with its own event system
  - Multiple editors can coexist on the same page without interference
  - Instance methods: `editor.on()`, `editor.off()`, `editor.once()`, `editor.emit()`
  - Static instance registry: `Editor._instances` Map for tracking all instances
  - Backward compatibility: Static methods delegate to first instance
  - Lifecycle management: `editor.destroy()` for proper cleanup
- **Enhanced Event Management System**: Implemented comprehensive event system with debouncing and throttling
  - Added `EditorEventEmitter` class with advanced features
  - Support for event priorities and one-time subscriptions
  - Debouncing for content change events (default 500ms delay)
  - Throttling for user interaction events (key presses, focus changes)
  - Structured event types with categories (CONTENT, BLOCK, EDITOR, TOOLBAR, USER)
  - Block content change tracking with timestamps using `data-timestamp` attributes
  - Events for block creation, deletion, focus changes, content modifications
  - Toolbar action events for all button interactions
  - User interaction events for paste operations and key presses
  - Backward compatibility with legacy `EDITOR.UPDATED_EVENT`
  - Comprehensive event documentation and usage examples in README

### Changed
- Enhanced `Editor.update()` method with timestamp tracking and improved event emission
- Updated `Editor.setCurrentBlock()` to emit focus events with throttling
- Enhanced `Editor.addEmptyBlock()` to generate unique block IDs and emit creation events
- Modified `Editor.paste()` to emit paste events with content details
- Updated `KeyHandler` to emit throttled key press events
- Enhanced `ToolbarHandlers` with automatic event emission for all toolbar actions
- Upgraded test suite for new event system with debouncing and throttling tests

### Technical Details
- Event debouncing prevents excessive backend calls during rapid content changes
- Event throttling improves performance for high-frequency events like key presses
- Block timestamps track content changes for potential undo/redo functionality
- Priority-based event execution allows proper event handling order
- Memory-efficient event cleanup prevents memory leaks
- Full test coverage for all new event functionality (456 tests passing)
