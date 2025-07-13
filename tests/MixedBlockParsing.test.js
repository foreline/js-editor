import { Parser } from '@/Parser.js';
import { CodeBlock } from '@/blocks/CodeBlock.js';
import { HeadingBlock } from '@/blocks/HeadingBlock.js';
import { ParagraphBlock } from '@/blocks/ParagraphBlock.js';

describe('Mixed Block Parsing - Real World Scenarios', () => {
  
  test('should correctly parse mixed markdown with code blocks and other blocks', () => {
    const markdown = `# Code Examples

Here's some JavaScript code:

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

And here's some Python:

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")
\`\`\`

## Another Section

More text here.

\`\`\`bash
npm install
npm start
\`\`\`

Final paragraph.`;

    const blocks = Parser.parse(markdown);
    
    // Should parse into distinct blocks
    expect(blocks.length).toBeGreaterThan(6);
    
    // Find all code blocks
    const codeBlocks = blocks.filter(block => block instanceof CodeBlock);
    expect(codeBlocks).toHaveLength(3);
    
    // Verify language extraction
    expect(codeBlocks[0]._language).toBe('javascript');
    expect(codeBlocks[1]._language).toBe('python');
    expect(codeBlocks[2]._language).toBe('bash');
    
    // Verify content separation
    expect(codeBlocks[0].content).toContain('function greet');
    expect(codeBlocks[0].content).not.toContain('def greet');
    
    expect(codeBlocks[1].content).toContain('def greet');
    expect(codeBlocks[1].content).not.toContain('function greet');
    
    expect(codeBlocks[2].content).toContain('npm install');
    expect(codeBlocks[2].content).not.toContain('function greet');
    
    // Find headings
    const headings = blocks.filter(block => block instanceof HeadingBlock);
    expect(headings.length).toBeGreaterThan(1);
    
    // Find paragraphs
    const paragraphs = blocks.filter(block => block instanceof ParagraphBlock);
    expect(paragraphs.length).toBeGreaterThan(2);
  });

  test('should handle adjacent code blocks correctly', () => {
    const markdown = `\`\`\`javascript
const a = 1;
\`\`\`
\`\`\`python
b = 2
\`\`\``;

    const blocks = Parser.parse(markdown);
    const codeBlocks = blocks.filter(block => block instanceof CodeBlock);
    
    expect(codeBlocks).toHaveLength(2);
    expect(codeBlocks[0]._language).toBe('javascript');
    expect(codeBlocks[1]._language).toBe('python');
    expect(codeBlocks[0].content.trim()).toBe('const a = 1;');
    expect(codeBlocks[1].content.trim()).toBe('b = 2');
  });

  test('should handle code blocks mixed with various other block types', () => {
    const markdown = `# Title

Some text.

> Quote block

\`\`\`js
console.log("code");
\`\`\`

- List item 1
- List item 2

\`\`\`
plain code
\`\`\`

**Bold text**`;

    const blocks = Parser.parse(markdown);
    const codeBlocks = blocks.filter(block => block instanceof CodeBlock);
    
    expect(codeBlocks).toHaveLength(2);
    expect(codeBlocks[0]._language).toBe('js');
    expect(codeBlocks[1]._language).toBe('');
    expect(codeBlocks[0].content).toContain('console.log');
    expect(codeBlocks[1].content.trim()).toBe('plain code');
  });

  test('should parse HTML with mixed code and other blocks', () => {
    const html = `<h1>Title</h1>
<p>Paragraph text</p>
<pre><code class="language-javascript">const x = 42;</code></pre>
<ul><li>List item</li></ul>
<pre><code class="python language-python">y = 24</code></pre>
<p>Final paragraph</p>`;

    const blocks = Parser.parseHtml(html);
    const codeBlocks = blocks.filter(block => block instanceof CodeBlock);
    
    expect(codeBlocks).toHaveLength(2);
    expect(codeBlocks[0]._language).toBe('javascript');
    expect(codeBlocks[1]._language).toBe('python');
    expect(codeBlocks[0].content).toBe('const x = 42;');
    expect(codeBlocks[1].content).toBe('y = 24');
  });
});
