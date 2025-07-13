import { Parser } from '@/Parser.js';
import { CodeBlock } from '@/blocks/CodeBlock.js';
import { UnorderedListBlock } from '@/blocks/UnorderedListBlock.js';
import { OrderedListBlock } from '@/blocks/OrderedListBlock.js';

describe('Parser - List and Code Block Separation Fix', () => {
  describe('HTML parsing with lists containing code elements', () => {
    test('should not interpret list items as code blocks', () => {
      const htmlWithListAndCode = `
        <ul>
          <li>First item</li>
          <li>Second item with <code>inline code</code></li>
          <li>Third item</li>
        </ul>
        <pre><code class="language-javascript">
        console.log("This is a code block");
        </code></pre>
      `;

      const blocks = Parser.parseHtml(htmlWithListAndCode);
      
      // Should parse exactly 2 blocks: 1 UnorderedListBlock and 1 CodeBlock
      expect(blocks).toHaveLength(2);
      
      // First block should be an UnorderedListBlock
      expect(blocks[0]).toBeInstanceOf(UnorderedListBlock);
      expect(blocks[0].content).toContain('First item');
      expect(blocks[0].content).toContain('Second item with inline code');
      expect(blocks[0].content).toContain('Third item');
      
      // Second block should be a CodeBlock
      expect(blocks[1]).toBeInstanceOf(CodeBlock);
      expect(blocks[1].language).toBe('javascript');
      expect(blocks[1].content).toContain('console.log');
    });

    test('should handle ordered lists with code elements', () => {
      const htmlWithOrderedListAndCode = `
        <ol>
          <li>Step 1: Install <code>npm</code></li>
          <li>Step 2: Run <code>npm install</code></li>
          <li>Step 3: Execute <code>npm start</code></li>
        </ol>
        <pre><code class="language-bash">
        npm install
        npm start
        </code></pre>
      `;

      const blocks = Parser.parseHtml(htmlWithOrderedListAndCode);
      
      // Should parse exactly 2 blocks: 1 OrderedListBlock and 1 CodeBlock
      expect(blocks).toHaveLength(2);
      
      // First block should be an OrderedListBlock
      expect(blocks[0]).toBeInstanceOf(OrderedListBlock);
      expect(blocks[0].content).toContain('Install npm');
      expect(blocks[0].content).toContain('npm install');
      expect(blocks[0].content).toContain('npm start');
      
      // Second block should be a CodeBlock
      expect(blocks[1]).toBeInstanceOf(CodeBlock);
      expect(blocks[1].language).toBe('bash');
      expect(blocks[1].content).toContain('npm install');
    });

    test('should parse individual li elements correctly when not part of a list', () => {
      // This tests the edge case where individual <li> elements exist outside of <ul>/<ol>
      const htmlWithStandaloneLi = `
        <li>Standalone list item</li>
        <pre><code>Some code</code></pre>
      `;

      const blocks = Parser.parseHtml(htmlWithStandaloneLi);
      
      // Since <li> is no longer treated as a block tag, it should be parsed as paragraph
      // or fall back to default parsing behavior
      expect(blocks.length).toBeGreaterThan(0);
      
      // At least one should be a CodeBlock
      const codeBlocks = blocks.filter(block => block instanceof CodeBlock);
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].content).toContain('Some code');
    });

    test('should maintain correct parsing order for complex mixed content', () => {
      const complexHtml = `
        <h1>Title</h1>
        <ul>
          <li>List item 1</li>
          <li>List item with <code>code</code></li>
        </ul>
        <p>Paragraph between list and code</p>
        <pre><code class="language-python">
        def hello():
            print("Hello, World!")
        </code></pre>
        <ol>
          <li>First step</li>
          <li>Second step</li>
        </ol>
      `;

      const blocks = Parser.parseHtml(complexHtml);
      
      // Should have exactly 5 blocks in order:
      // 1. HeadingBlock (h1)
      // 2. UnorderedListBlock (ul)
      // 3. ParagraphBlock (p)
      // 4. CodeBlock (pre/code)
      // 5. OrderedListBlock (ol)
      expect(blocks).toHaveLength(5);
      
      // Verify the types and order
      expect(blocks[0].type).toBe('h1');
      expect(blocks[1]).toBeInstanceOf(UnorderedListBlock);
      expect(blocks[2].type).toBe('paragraph');
      expect(blocks[3]).toBeInstanceOf(CodeBlock);
      expect(blocks[4]).toBeInstanceOf(OrderedListBlock);
      
      // Verify content integrity
      expect(blocks[1].content).toContain('List item with code');
      expect(blocks[3].language).toBe('python');
      expect(blocks[3].content).toContain('def hello');
    });
  });
});
