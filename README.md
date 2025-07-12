# JS Editor

WYSIWYG editor built with JavaScript, featuring a comprehensive toolbar and block-based content management system.

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
* Showdown (for markdown support)

## Usage

Initialize the editor in your HTML:

```html
<div id="editor" class="editor"></div>

<script type="module">
    import { Editor } from './src/Editor.js';
    const editor = new Editor({ id: 'editor' });
</script>
```