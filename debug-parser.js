import { Parser } from './src/Parser.js';

const markdownString = `# Heading 1

## Heading 2

**Bold text** and *italic* and ~~strikethrough~~.

- First list item
- Second list item
- Third list item

1. First numbered item
2. Second item
3. Third item

> This is a quote.

\`Inline code\`

\`\`\`javascript
console.log('Hello, world!');
\`\`\`

[Link to Google](https://www.google.com)`;

console.log('Parsing markdown...');
const result = Parser.parse(markdownString);
console.log('Result length:', result.length);
result.forEach((block, index) => {
    console.log(`Block ${index}: type=${block.type}, content="${block.content}", html="${block.html}"`);
});
