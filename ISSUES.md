# Issues, Features and Improvements Checklist

Common instruction: Take one task of the checklists at a time. After the task is completed mark it as checked, update `SPECS.md` file. Update `README.md` if needed. Commit your changes. Get the next task. Prioritize tasks by their dependencies of other tasks and by difficulty: take easy tasks first.

## Bugs

Take into consideration: the bugs can be repeated, indicating that the bug may have already been fixed and appeared again.

- [x] **Focus Management**: Ensure `Editor.focus()` handles cases where the `currentBlock` is null or detached from the DOM. Add a fallback mechanism to focus on the editor instance itself.
- [x] **Clipboard Handling**: Refactor `Editor.paste()` to sanitize pasted content properly and prevent XSS attacks. Use a dedicated parser for HTML sanitization.
- [x] **Event Listeners**: Fix the `focusin` event listener in `Editor.addListeners()` to ensure it works correctly for keyboard navigation.
- [x] **Markdown Conversion**: Address edge cases in `Editor.md2html()` and `Editor.html2md()` where malformed markdown or HTML might cause errors.
- [x] **Toolbar Integration**: Ensure all toolbar buttons are dynamically initialized and their event listeners are removed during reinitialization to prevent memory leaks.
- [x] **Error Handling**: Improve error handling in methods like `Editor.initMarkdownContainer()` and `Editor.initHtmlContainer()` to log warnings when containers are not found.
- [x] **Focus management**: When backspace is pressed inside an empty block it should be removed and the nearest upper block should become active.
- [x] **Enter key press handling**. 
    - [x] Ensure that enter key press inside a block leads to creating a new default block when a cursor is at the end of block. Except cases when user edits ul or ol list, when enter key press should lead to creating a new ul or ol item.
    - [x] In lists (`ol` and `ul`) when the cursor is at the end of the its last item the `Enter` keypress must lead to creating a new list item. Now it is creating a new default block.
    - [x] Ensure that when the new default block is created it becomes focused.
    - [x] (appeared again) Ensure that enter key press inside a block leads to creating a new default block when a cursor is at the end of block. Except cases when user edits ul or ol list, when enter key press should lead to creating a new ul or ol item.
- [x] **TableBlock is not editable**: The text inside a table is not editable.
- [x] **Lists blocks margin and padding**: The padding or margin of list blocks (`ul`, `ol`, `sq`) is different from other blocks. All blocks must be aligned evenly.
- [x] **Code Block parsing error**: The ```\ncode block\n``` must be parsed as a separate block.
- [x] **Active block**: If the cursor is placed on block it should become active.
- [x] (appeared again) **Code Block parsing error**: The ```\ncode block\n``` must be parsed as a separate block.
- [x] **TaskBlock presentation**: The task block must not have `li` bullets in HTML representation. It must be rendered as `<input type="checkbox">` only. It should be aligned with proper margin from the left.
- [x] **Block classes**: The list blocks have wrong class `block-p` instead of `block-ul`, `block-ol`. The `data-block-type` attribute value is also wrong. Other block must also be checked for this error.
- [x] **Enter key focus**: When placing the cursor at the end of a block (i.e. a Header Block) and hitting Enter, the new default block is created but the cursor remains in the header block instead of moving to the newly created block. Fixed by improving focus handling in `Editor.addEmptyBlock()` and removing redundant `Editor.update()` calls.
- [x] **Backspace key focus**: When hitting backspace at an empty block, the block must be deleted (which is working) and the cursor must be placed at the end of the previous block. Now the cursor is placed at the beginning of the next block
- [x] **List elements interpreted as Blocks**: List items (`<li>` tags) should not be interpreted (and behave) as a Block element and thus should not have a `block` class on them. They are just a part of OrderedList `<ol>`, UnorderedList `<ul>` and TaskList blocks.
- [ ] **Blocks conversion**: If a list inserted inside a `Paragraph` block the block should become a List block. Now it stays a paragraph block (has block-p) class on it. The other types of block must be converted in the same way. This should be implemented as a common mechanism for converting a block from one type to another.

## Features

- [x] **Get Editor content as markdown**: The `Editor` must provide a static method `getMarkdown` for getting all its content in markdown format. Just a content without metadata must be provided.
- [x] **Get Editor content as html**: The `Editor` must provide a static method `getHtml` for getting all its content in html format. Just a content without metadata must be provided.
- [x] **BlockInterface**. Each block must implement a `BlockInterface`.
- [x] **Toolbar buttons groups**. Toolbar buttons must be placed inside a group. A block can create its own group or put its control buttons to other groups.
- [x] **Block integration with Toolbar**: Blocks must provide control buttons to Toolbar. I.e. a `TableBlock` should put a button to toolbar for creating tables. Each block must provide a static method returning toolbar configuration. Block must have control on its own toolbar buttons and buttons of other blocks.
- [x] **Checklist support**: A BlockType for working with checklists (square brackets, where `- [ ] unchecked item` means unchecked item and `- [x] checked item` means checked item). Checklists must be represented as `<input type="checkbox">` html tag.
- [x] **Tables support**: A BlockType for working with basic markdown tables.
    - [x] The ability to add and remove table columns and table rows. The buttons should appear near the current table when it is in focus.
- [x] **Images support**: A BlockType for working with images. An ImageBlock must support drag and drop. An image can have an URL. An image inside an ImageBlock must be resizable.
- [ ] **Tracking blocks changes mechanism**: Use timestamp(content) for tracking changes in block's content. Use `data-timestamp` attribute for holding timestamp value.

## Improvements
Instruction: Improvements must be prioritized according by the list.

- [x] **Block Architecture Refactoring**: Refactored the editor to use a modular block architecture where each block type is its own class with specific key press handling and behavior. This provides perfect extensibility for future block types.
- [x] **Code Quality**: Enforce consistent code style using Prettier and ESLint. Refactor repetitive code in `Editor.js` and `ToolbarHandlers.js`. *(Partially completed with block architecture refactoring)*
- [ ] **Dynamic Toolbar Configuration**: Allow users to dynamically configure toolbar buttons and their behavior via a plugin system.
- [ ] **Export/Import**: Support exporting and import of Editor content to JSON with block metadata.
- [ ] **Performance Optimization**: Use a virtual DOM approach to minimize DOM updates and improve rendering efficiency, especially for large documents.
- [ ] **Accessibility**: Add ARIA roles and keyboard navigation support to ensure the editor is fully accessible.
- [ ] **Scalability**: Optimize the `Editor.update()` method to handle thousands of blocks efficiently without performance degradation.
- [ ] **Testing Coverage**: Write integration tests for edge cases, such as invalid toolbar configurations and malformed content blocks.
- [ ] **Enhanced Parsing**: Extend markdown parsing to support advanced syntax like tables, task lists, and fenced code blocks.
- [ ] **Version Control**: Add versioning capabilities to track changes and allow rollback to previous states.
