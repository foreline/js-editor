# Issues and Improvements Checklist

## Bug Fixes

- [x] **Focus Management**: Ensure `Editor.focus()` handles cases where the `currentBlock` is null or detached from the DOM. Add a fallback mechanism to focus on the editor instance itself.
- [x] **Clipboard Handling**: Refactor `Editor.paste()` to sanitize pasted content properly and prevent XSS attacks. Use a dedicated parser for HTML sanitization.
- [x] **Event Listeners**: Fix the `focusin` event listener in `Editor.addListeners()` to ensure it works correctly for keyboard navigation.
- [x] **Markdown Conversion**: Address edge cases in `Editor.md2html()` and `Editor.html2md()` where malformed markdown or HTML might cause errors.
- [x] **Toolbar Integration**: Ensure all toolbar buttons are dynamically initialized and their event listeners are removed during reinitialization to prevent memory leaks.
- [x] **Error Handling**: Improve error handling in methods like `Editor.initMarkdownContainer()` and `Editor.initHtmlContainer()` to log warnings when containers are not found.
- [x] **Focus management**: When backspace is pressed inside an empty block it should be removed and the nearest upper block should become active.
- [ ] **Enter key press handling**. 
    - [x] Ensure that enter key press inside a block leads to creating a new default block when a cursor is at the end of block. Except cases when user edits ul or ol list, when enter key press should lead to creating a new ul or ol item.
    - [ ] In lists (`ol` and `ul`) when the cursor is at the end of the its last item the `Enter` keypress must lead to creating a new list item. Now it is creating a new default block.
    - [ ] Ensure that when the new default block is created it becomes focused.

## Features

- [x] **Get Editor content as markdown**: The `Editor` must provide a static method `getMarkdown` for getting all its content in markdown format. Just a content without metadata must be provided.
- [x] **Get Editor content as html**: The `Editor` must provide a static method `getHtml` for getting all its content in html format. Just a content without metadata must be provided.
- [x] **BlockInterface**. Each block must implement a `BlockInterface`.
- [x] **Toolbar buttons groups**. Toolbar buttons must be placed inside a group. A block can create its own group or put its control buttons to other groups.
- [ ] **Block integration with Toolbar**: Blocks must provide control buttons to Toolbar. I.e. a `TableBlock` should put a button to toolbar for creating tables. Each block must provide a static method returning toolbar configuration. Block must have control on its own toolbar buttons and buttons of other blocks. Headers blocks must disable buttons such as bold, italic, list controls and so on, because you cannot make Header bold, italic or put a list inside a header.
- [ ] **Checklist support**: A BlockType for working with checklists (square brackets, where `- [ ] unchecked item` means unchecked item and `- [x] checked item` means checked item). Checklists must be represented as `<input type="checkbox">` html tag.
- [ ] **Tables support**: A BlockType for working with basic markdown tables.
- [ ] **Images support**: A BlockType for working with images. An ImageBlock must support drag and drop. An image can have an URL. An image inside an ImageBlock must be resizable.

## Improvements

- [x] **Block Architecture Refactoring**: Refactored the editor to use a modular block architecture where each block type is its own class with specific key press handling and behavior. This provides perfect extensibility for future block types.
- [x] **Code Quality**: Enforce consistent code style using Prettier and ESLint. Refactor repetitive code in `Editor.js` and `ToolbarHandlers.js`. *(Partially completed with block architecture refactoring)*
- [ ] **Performance Optimization**: Use a virtual DOM approach to minimize DOM updates and improve rendering efficiency, especially for large documents.
- [ ] **Accessibility**: Add ARIA roles and keyboard navigation support to ensure the editor is fully accessible.
- [ ] **Scalability**: Optimize the `Editor.update()` method to handle thousands of blocks efficiently without performance degradation.
- [ ] **Testing Coverage**: Write integration tests for edge cases, such as invalid toolbar configurations and malformed content blocks.
- [ ] **Dynamic Toolbar Configuration**: Allow users to dynamically configure toolbar buttons and their behavior via a plugin system.
- [ ] **Enhanced Parsing**: Extend markdown parsing to support advanced syntax like tables, task lists, and fenced code blocks.
- [ ] **Real-Time Collaboration**: Implement a mechanism for real-time collaborative editing with conflict resolution strategies.
- [ ] **Version Control**: Add versioning capabilities to track changes and allow rollback to previous states.
- [ ] **Export/Import**: Support exporting content to formats like PDF, Word, and JSON, and importing from external sources like Google Docs.
