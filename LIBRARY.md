# JS Editor Library

A modern JavaScript WYSIWYG editor with block-based architecture.

## Installation

```bash
npm install js-editor
```

## Quick Start

### ES Modules (Recommended)

```javascript
import Editor from 'js-editor';
import 'js-editor/css'; // Import styles

// Create editor instance
const editor = new Editor({
    id: 'my-editor' // ID of the container element
});
```

### CommonJS

```javascript
const Editor = require('js-editor');
require('js-editor/css'); // Import styles

// Create editor instance
const editor = new Editor({
    id: 'my-editor'
});
```

### HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="node_modules/js-editor/dist/style.css">
</head>
<body>
    <div id="my-editor"></div>
    
    <script type="module">
        import Editor from './node_modules/js-editor/dist/js-editor.es.js';
        
        const editor = new Editor({
            id: 'my-editor'
        });
    </script>
</body>
</html>
```

## Configuration Options

```javascript
const editor = new Editor({
    id: 'my-editor',           // Required: Container element ID
    placeholder: 'Start writing...', // Placeholder text
    debug: false,              // Enable debug mode
    autofocus: true,          // Auto-focus on creation
    readonly: false,          // Make editor read-only
    minHeight: '200px',       // Minimum height
    maxHeight: '500px',       // Maximum height
    toolbar: {                // Toolbar configuration
        groups: ['basic', 'blocks', 'lists'],
        sticky: true,
        hideOnFocus: false
    },
    markdown: '# Hello World', // Initial markdown content
    html: '<h1>Hello World</h1>' // Initial HTML content
});
```

## API Reference

### Editor Methods

```javascript
// Content methods
editor.getMarkdown();         // Get content as markdown
editor.getHtml();            // Get content as HTML
editor.setMarkdown(md);      // Set content from markdown
editor.setHtml(html);        // Set content from HTML
editor.clear();              // Clear all content

// Control methods
editor.focus();              // Focus the editor
editor.blur();               // Remove focus
editor.destroy();            // Destroy editor instance

// Event methods
editor.on('change', callback);    // Listen to content changes
editor.off('change', callback);   // Remove event listener
editor.emit('custom-event', data); // Emit custom event
```

### Static Methods

```javascript
// Instance management
Editor.getInstance(id);       // Get editor instance by ID
Editor.getAllInstances();     // Get all editor instances
Editor.destroyInstance(id);   // Destroy specific instance
```

### Events

```javascript
editor.on('ready', () => {
    console.log('Editor is ready');
});

editor.on('change', (data) => {
    console.log('Content changed:', data);
});

editor.on('focus', () => {
    console.log('Editor focused');
});

editor.on('blur', () => {
    console.log('Editor blurred');
});

editor.on('block:add', (block) => {
    console.log('Block added:', block);
});

editor.on('block:remove', (block) => {
    console.log('Block removed:', block);
});
```

## Block Types

The editor supports various block types:

- **Paragraph** - Regular text content
- **Headings** - H1 through H6
- **Lists** - Ordered and unordered lists
- **Task Lists** - Interactive checkboxes
- **Quotes** - Blockquotes
- **Code** - Syntax-highlighted code blocks
- **Tables** - Markdown tables with editing
- **Images** - Drag & drop image support
- **Delimiters** - Horizontal rules

## Styling

### CSS Files

The library provides separate CSS files for different purposes:

```javascript
// All styles (recommended)
import 'js-editor/css';

// Individual stylesheets
import 'js-editor/css/editor';  // Core editor styles
import 'js-editor/css/prism';   // Syntax highlighting
```

### Custom Themes

You can override CSS variables to customize the appearance:

```css
.editor {
    --editor-font-family: 'Your Font', sans-serif;
    --editor-font-size: 16px;
    --editor-line-height: 1.6;
    --editor-border-color: #e1e5e9;
    --editor-focus-color: #007bff;
}
```

## Dependencies

The library depends on these packages (install them separately):

```bash
npm install @fortawesome/fontawesome-free @popperjs/core bootstrap prismjs showdown
```

## TypeScript Support

TypeScript definitions are included:

```typescript
import Editor, { EditorOptions, BlockData } from 'js-editor';

const options: EditorOptions = {
    id: 'my-editor',
    placeholder: 'Start writing...'
};

const editor = new Editor(options);
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

MIT License - see LICENSE file for details.
