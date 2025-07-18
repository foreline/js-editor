# Changelog

All notable changes to the JS Editor project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
