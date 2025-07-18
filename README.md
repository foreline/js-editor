# JS Editor

WYSIWYG editor built with JavaScript, featuring a comprehensive toolbar and block-based content management system.

## Features

- **Block-based architecture**: Modular content management with individual block types.
- **Content export**: Export editor content as markdown (`Editor.getMarkdown()`) or HTML (`Editor.getHtml()`).
- **BlockInterface contract**: Consistent behavior across all block types with standardized methods.
- **Comprehensive toolbar**: Text formatting, lists, blockquotes, and code blocks.
- **Markdown support**: Full markdown parsing and conversion using Showdown.
- **Advanced key handling**: Smart Enter/Backspace behavior for different block types.
- **Clipboard integration**: Paste support with markdown conversion and XSS protection.
- **Block type system**: Support for paragraphs, headings (H1-H6), lists (ul/ol), checklists, tables, images, and special blocks.
- **Interactive checklists**: Task lists with clickable checkboxes supporting markdown syntax `- [ ]` and `- [x]`.
- **Table support**: Markdown tables with Tab navigation, cell editing, and dynamic row creation.
- **Image support**: Drag & drop image upload, URL insertion, and resizable images with markdown syntax `![alt](src)`.

## Setup

Install dependencies:

```shell
npm install
```

Start development server:

```shell
npm run dev
```

Build for production:

```shell
npm run build
```

## Testing

This project uses Jest for unit testing and integration tests.

Run tests:

```shell
npm test
```

Run tests in watch mode:

```shell
npm run test:watch
```

Generate test coverage report:

```shell
npm run test:coverage
```

After running the coverage command, you can find the detailed coverage report in the `coverage` directory.

## Dependencies

- Showdown (for markdown support)

## Usage

Initialize the editor in your HTML:

```html
<div id="editor" class="editor"></div>

<script type="module">
    import { Editor } from './src/Editor.js';
    const editor = new Editor({ id: 'editor' });
</script>
```

### Content Export

Export editor content as markdown or HTML:

```javascript
// Get all content as markdown
const markdownContent = Editor.getMarkdown();
console.log(markdownContent);

// Get all content as HTML  
const htmlContent = Editor.getHtml();
console.log(htmlContent);
```

### Event System

The editor provides an event system for monitoring content changes and user interactions:

```javascript
import { eventEmitter, EVENTS } from './src/utils/eventEmitter.js';

// Listen for content changes (debounced for performance)
eventEmitter.subscribe(EVENTS.CONTENT_CHANGED, (eventData) => {
    console.log('Content changed:', eventData.data.markdown);
    // Send to backend for auto-save
    saveToBackend(eventData.data);
});

// Listen for block focus changes
eventEmitter.subscribe(EVENTS.BLOCK_FOCUSED, (eventData) => {
    console.log('Block focused:', eventData.data.blockType);
});

// Listen for user interactions
eventEmitter.subscribe(EVENTS.USER_KEY_PRESS, (eventData) => {
    console.log('User pressed:', eventData.data.key);
}, { throttle: 100 }); // Throttled for performance

// Listen for toolbar actions
eventEmitter.subscribe(EVENTS.TOOLBAR_ACTION, (eventData) => {
    console.log('Toolbar action:', eventData.data.action);
});

// Custom event handling with priorities
eventEmitter.subscribe(EVENTS.BLOCK_CREATED, (eventData) => {
    console.log('High priority handler');
}, { priority: 10 });

eventEmitter.subscribe(EVENTS.BLOCK_CREATED, (eventData) => {
    console.log('Low priority handler');
}, { priority: 1 });
```

#### Event Types

Available event types:
- `EVENTS.CONTENT_CHANGED` - Debounced content changes for backend sync
- `EVENTS.BLOCK_CREATED` - When a new block is created
- `EVENTS.BLOCK_DELETED` - When a block is deleted  
- `EVENTS.BLOCK_FOCUSED` - When a block gains focus
- `EVENTS.BLOCK_CONTENT_CHANGED` - When block content changes
- `EVENTS.TOOLBAR_ACTION` - When toolbar buttons are clicked
- `EVENTS.USER_PASTE` - When user pastes content
- `EVENTS.USER_KEY_PRESS` - When user presses keys (throttled)

### Block System

The editor uses a modular block system where each block type implements the BlockInterface:

```javascript
import { ParagraphBlock, H1Block, TaskListBlock, TableBlock, ImageBlock } from './src/blocks/';

// Create blocks programmatically
const paragraph = new ParagraphBlock('Hello world');
const heading = new H1Block('My Title');
const checklist = new TaskListBlock('My task item');
const table = new TableBlock();
const image = new ImageBlock('![Sample](https://example.com/image.jpg)');

// Get markdown representation
console.log(paragraph.toMarkdown()); // "Hello world"
console.log(heading.toMarkdown());   // "# My Title"
console.log(checklist.toMarkdown()); // "- [ ] My task item"
console.log(table.toMarkdown());     // "| Header | ... |"
console.log(image.toMarkdown());     // "![Sample](https://example.com/image.jpg)"

// Get HTML representation  
console.log(paragraph.toHtml()); // "<p>Hello world</p>"
console.log(heading.toHtml());   // "<h1>My Title</h1>"
console.log(checklist.toHtml()); // "<li><input type=\"checkbox\"> My task item</li>"
console.log(table.toHtml());     // "<table>...</table>"
console.log(image.toHtml());     // "<img src=\"...\" alt=\"Sample\">"
```

### Image Features

Insert images using markdown syntax or drag & drop:

```markdown
![Alt text](https://example.com/image.jpg)
```

- Drag & drop image files directly onto image placeholders
- Click image placeholders to open file picker
- Resize images by dragging the resize handle (appears on hover)
- Images support both URLs and uploaded files (converted to base64)
- Export maintains image references in both markdown and HTML formats

### Table Features

Create tables using markdown syntax:

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

- Use `Tab` to navigate between table cells
- Use `Shift+Tab` to navigate backwards
- Press `Enter` within a table to add a new row
- Click cells to edit content directly
- Tables export properly to both markdown and HTML formats

### Checklist Features

Create interactive task lists using markdown syntax:

```markdown
- [ ] Unchecked task item
- [x] Checked task item
```

- Click checkboxes to toggle completion status
- Use `Ctrl+Space` keyboard shortcut to toggle checkboxes
- Press `Enter` at the end of a task item to create a new task item
- Export maintains checkbox state in both markdown and HTML formats

## Contribution Guidelines

We welcome contributions to improve the JS Editor. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Write clear and concise commit messages.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.