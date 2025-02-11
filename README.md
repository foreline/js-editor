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