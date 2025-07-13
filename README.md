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
- **Block type system**: Support for paragraphs, headings (H1-H6), lists (ul/ol), and special blocks.

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

### Block System

The editor uses a modular block system where each block type implements the BlockInterface:

```javascript
import { ParagraphBlock, H1Block } from './src/blocks/';

// Create blocks programmatically
const paragraph = new ParagraphBlock('Hello world');
const heading = new H1Block('My Title');

// Get markdown representation
console.log(paragraph.toMarkdown()); // "Hello world"
console.log(heading.toMarkdown());   // "# My Title"

// Get HTML representation  
console.log(paragraph.toHtml()); // "<p>Hello world</p>"
console.log(heading.toHtml());   // "<h1>My Title</h1>"
```

## Contribution Guidelines

We welcome contributions to improve the JS Editor. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Write clear and concise commit messages.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.