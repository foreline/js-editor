# JS Editor

WYSIWYG editor built with JavaScript, featuring a comprehensive toolbar and block-based content management system.

## Features

- Block-based content management system.
- Comprehensive toolbar for text formatting, lists, blockquotes, and code blocks.
- Markdown support using Showdown.
- Fenced code block parsing.
- Inline code block extraction.
- Preprocessing for HTML block separation.

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

## Contribution Guidelines

We welcome contributions to improve the JS Editor. To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Write clear and concise commit messages.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.