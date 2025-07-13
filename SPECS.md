# Technical Requirements for JS Editor

## Overview
The JS Editor project is a web-based rich text editor designed to provide users with advanced text editing capabilities. It supports features such as markdown conversion, toolbar-based formatting, event handling, and block-based content management.

## Project Structure
The project is organized into the following key directories:

- **src/**: Contains the main source code for the editor.
  - `Block.js`: Manages individual content blocks.
  - `BlockType.js`: Defines types of blocks (e.g., paragraph, header).
  - `Editor.js`: Core editor logic.
  - `Event.js`: Handles custom events.
  - `Parser.js`: Parses and converts content between formats.
  - `Toolbar.js`: Manages toolbar functionality.
  - `ToolbarHandlers.js`: Handles toolbar button interactions.
  - `Utils.js`: Utility functions.
  - `utils/`: Additional utilities like event emitters and logging.

- **tests/**: Contains unit tests for the project.
  - `Block.test.js`: Tests for `Block.js`.
  - `Editor.test.js`: Tests for `Editor.js`.
  - `ToolbarHandlers.test.js`: Tests for `ToolbarHandlers.js`.
  - Other test files for integration and specific modules.

- **coverage/**: Contains code coverage reports.

## Functional Requirements

### Editor Core
1. **Initialization**:
   - The editor should initialize with a valid DOM element ID.
   - Default blocks should be created if no content is provided.
   - Toolbar configuration should be applied during initialization.

2. **Content Blocks**:
   - Support multiple block types (e.g., paragraph, headers).
   - Allow adding, removing, and updating blocks dynamically.

3. **Event Handling**:
   - Implement custom events for editor updates.
   - Provide listeners for key events like `keydown`, `keyup`, and `paste`.

4. **Focus Management**:
   - Ensure focus is set on the current block or editor instance.

5. **Clipboard Support**:
   - Handle text paste events and convert markdown to HTML.

### Toolbar
1. **Toolbar Buttons**:
   - Provide buttons for formatting options like bold, italic, underline, and strikethrough.
   - Support list creation (unordered, ordered).
   - Include buttons for headers, paragraphs, and code blocks.

2. **Event Listeners**:
   - Attach click event listeners to toolbar buttons.
   - Call appropriate methods in `Toolbar.js` for each button.

### Parsing
1. **Markdown Conversion**:
   - Convert markdown to HTML and vice versa.

2. **HTML Parsing**:
   - Parse HTML content into editor blocks.

### Utilities
1. **Event Emitters**:
   - Provide a utility for emitting and listening to custom events.

2. **Logging**:
   - Include logging utilities for debugging.

## Expanded Functional Requirements

### Editor Core
1. **Initialization**:
   - Validate the provided DOM element ID and throw an error if invalid.
   - Create a default block with a paragraph type if no content is provided.
   - Apply toolbar configuration dynamically based on user preferences.
   - Reset editor state (blocks, keybuffer, current block) during reinitialization.

2. **Content Blocks**:
   - Support block types including paragraph, headers (H1-H6), code blocks, and lists.
   - Allow nesting of blocks for hierarchical content structures.
   - Provide methods for splitting, merging, and rearranging blocks.
   - Ensure blocks are editable and maintain their state during updates.
   - **List Block Behavior**: For unordered (ul) and ordered (ol) list blocks, Enter key creates new list items of the same type. Empty list items can be removed with Backspace or converted to regular paragraphs by pressing Enter.

3. **Event Handling**:
   - Implement custom events for editor updates, block changes, and toolbar interactions.
   - Provide listeners for key events (`keydown`, `keyup`, `paste`, `click`) and ensure proper propagation.
   - Handle edge cases like empty keybuffer or invalid event targets.
   - **Enter Key Handling**: Create new blocks when Enter is pressed at the end of a block. For list blocks (ul, ol), create new list items when cursor is at the end of the item, or end the list if the current item is empty. For non-list blocks, create a new paragraph block when cursor is at the end.
   - **Backspace Key Handling**: Remove empty blocks when Backspace is pressed and focus on the previous block. Maintain at least one block in the editor.
   - **Cursor-based Block Activation**: When a user clicks or places cursor within a block, that block automatically becomes the active/current block.

4. **Focus Management**:
   - Automatically focus on the first block when the editor is initialized.
   - Provide methods to programmatically set focus on specific blocks.
   - Handle focus transitions when blocks are added, removed, or updated.
   - Support cursor placement detection via mouseup events to track which block contains the cursor.

5. **Block Rendering and Classes**:
   - Each block type has a corresponding CSS class for proper styling: `block-p` for paragraphs, `block-h1` through `block-h6` for headers, `block-ul` for unordered lists, `block-ol` for ordered lists, `block-sq` for task lists, `block-code` for code blocks, `block-table` for tables, `block-image` for images, and `block-quote` for quotes.
   - Task blocks (`sq` type) are rendered as div elements with checkboxes rather than list items to avoid bullet points and ensure proper alignment.
   - All data-block-type attributes correctly match the actual block type for proper key handling and styling.

6. **Code Block Parsing**:
   - Fenced code blocks (using triple backticks ``` or tildes ~~~) are properly parsed as separate blocks.
   - Pre-processing ensures fenced code blocks are isolated on their own lines before markdown conversion.
   - **Intelligent Block Removal**: When empty blocks are removed via Backspace, automatically focus on the nearest available block (previous block preferred, fallback to next block).

5. **Clipboard Support**:
   - Parse pasted content and sanitize it to prevent XSS attacks.
   - Convert markdown to HTML and vice versa during paste operations.
   - Support rich text paste with formatting retention.

6. **Content Export**:
   - Provide `Editor.getMarkdown()` method to export all editor content as markdown format.
   - Provide `Editor.getHtml()` method to export all editor content as HTML format.
   - Export methods return clean content without metadata or editor-specific markup.
   - Handle edge cases like empty content and malformed blocks gracefully.

7. **Block Architecture**:
   - Implement BlockInterface contract for consistent block behavior.
   - All blocks implement required methods: `handleKeyPress()`, `handleEnterKey()`, `toMarkdown()`, `toHtml()`, `applyTransformation()`.
   - All blocks provide static methods: `getMarkdownTriggers()`, `getToolbarConfig()`, `getDisabledButtons()`.
   - Blocks maintain consistent properties: `type`, `content`, `html`, `nested`.
   - Interface validation available for ensuring blocks meet contract requirements.
   - **Task List Support**: TaskListBlock supports checkbox lists with markdown syntax `- [ ]` for unchecked and `- [x]` for checked items. Checkboxes are interactive HTML input elements with toggle functionality via click or Ctrl+Space keyboard shortcut.
   - **Table Support**: TableBlock supports markdown table syntax with header rows and data rows. Tables are rendered as HTML table elements with interactive cell editing, Tab navigation between cells, and Enter key to add new rows. **Contextual table controls** appear near the table when any cell is focused, providing buttons to add/remove columns and rows. The control panel automatically appears on cell focus and disappears on blur with a short delay to allow interaction with the buttons.
   - **Image Support**: ImageBlock supports image insertion via URL input, drag & drop file upload, and file picker selection. Images are resizable by dragging the resize handle and support markdown syntax `![alt](src)`. Uploaded images are converted to base64 data URLs for embedding.

### Toolbar
1. **Toolbar Buttons**:
   - Include buttons for text alignment (left, center, right, justify).
   - Provide options for text color and background color.
   - Support undo and redo operations with visual indicators.
   - Include advanced formatting options like superscript, subscript, and blockquote.

2. **Event Listeners**:
   - Attach click event listeners to toolbar buttons dynamically based on configuration.
   - Ensure event listeners are removed during toolbar reinitialization.
   - Provide visual feedback (e.g., active state) for toolbar buttons based on editor state.

### Parsing
1. **Markdown Conversion**:
   - Support extended markdown syntax (e.g., tables, task lists).
   - Ensure accurate conversion of nested markdown structures to HTML.

2. **HTML Parsing**:
   - Parse HTML content into editor blocks while preserving formatting.
   - Handle invalid or malformed HTML gracefully.

### Utilities
1. **Event Emitters**:
   - Provide a utility for emitting and listening to custom events with namespaces.
   - Ensure event listeners can be dynamically added and removed.

2. **Logging**:
   - Include logging utilities with configurable log levels (e.g., debug, info, warn, error).
   - Provide methods to log editor state for debugging purposes.

## Non-Functional Requirements

### Code Quality
1. **Testing**:
   - Achieve high test coverage for all modules.
   - Write unit tests for core functionalities.

2. **Linting**:
   - Use ESLint for code linting.

### Performance
1. **Efficiency**:
   - Optimize DOM manipulations.
   - Minimize reflows and repaints.

2. **Scalability**:
   - Ensure the editor can handle large documents.

### Compatibility
1. **Browser Support**:
   - Support modern browsers (Chrome, Firefox, Edge).

2. **Responsive Design**:
   - Ensure the editor works well on different screen sizes.

## Expanded Non-Functional Requirements

### Code Quality
1. **Testing**:
   - Write integration tests to validate interactions between modules.
   - Ensure tests cover edge cases and error handling scenarios.

2. **Linting**:
   - Enforce consistent code style using Prettier.

### Performance
1. **Efficiency**:
   - Optimize rendering of blocks to minimize DOM updates.
   - Use virtual DOM techniques for efficient updates.

2. **Scalability**:
   - Ensure the editor can handle documents with thousands of blocks without performance degradation.

### Compatibility
1. **Browser Support**:
   - Include polyfills for older browser versions.

2. **Accessibility**:
   - Ensure the editor is fully accessible (e.g., ARIA roles, keyboard navigation).

## Future Enhancements
1. **Plugins**:
   - Allow users to extend functionality via plugins.

2. **Themes**:
   - Provide support for custom themes.

3. **Collaboration**:
   - Enable real-time collaborative editing.

4. **Versioning**:
   - Provide version control for editor content with rollback capabilities.

5. **Export/Import**:
   - Support exporting content to formats like PDF, Word, and JSON.
   - Allow importing content from external sources (e.g., Google Docs, Markdown files).

## Dependencies
- **Vite**: Build tool for development.
- **Jest**: Testing framework.
- **Babel**: JavaScript compiler.

## Development Workflow
1. **Setup**:
   - Install dependencies using `npm install`.

2. **Build**:
   - Use Vite for building the project.

3. **Testing**:
   - Run tests using `npm test`.

4. **Linting**:
   - Run ESLint to check code quality.

## Deployment
1. **Static Hosting**:
   - Deploy the editor on platforms like Netlify or Vercel.

2. **CDN**:
   - Serve assets via a Content Delivery Network for faster load times.

## Conclusion
The JS Editor project is designed to be modular, extensible, and user-friendly. By adhering to the technical requirements outlined above, the project can achieve high performance, compatibility, and maintainability.
