import { Parser } from '@/Parser.js';
import { Block } from '@/Block.js';
import { BlockType } from '@/BlockType.js';

// Remove previous global.document mock

beforeAll(() => {
  // Mock document.createElement for all tests
  global.document.createElement = jest.fn(() => ({
    classList: {
      add: jest.fn()
    },
    setAttribute: jest.fn(),
    innerHTML: ''
  }));
});

beforeEach(() => {
  // Reset the mock implementation for each test
  global.document.createElement.mockClear();
});

describe('Parser', () => {
  describe('parse method', () => {

    test('should parse simple markdown paragraph', () => {
        const markdownString = 'Hello World';
        const result = Parser.parse(markdownString);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe(BlockType.PARAGRAPH);
        expect(result[0].content).toBe('Hello World');
        expect(result[0].html).toBe('<p>Hello World</p>');
    });

    test('should parse bold markdown', () => {
        const markdownString = '**Bold text**';
        const result = Parser.parse(markdownString);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe(BlockType.PARAGRAPH);
        expect(result[0].content).toBe('Bold text');
        expect(result[0].html).toBe('<p><strong>Bold text</strong></p>');
    });

    test('should parse italic markdown', () => {
        const markdownString = '*Italic text*';
        const result = Parser.parse(markdownString);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe(BlockType.PARAGRAPH);
        expect(result[0].content).toBe('Italic text');
        expect(result[0].html).toBe('<p><em>Italic text</em></p>');
    });

    test('should parse strikethrough markdown', () => {
        const markdownString = '~~Strikethrough~~';
        const result = Parser.parse(markdownString);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe(BlockType.PARAGRAPH);
        expect(result[0].content).toBe('Strikethrough');
        expect(result[0].html).toBe('<p><del>Strikethrough</del></p>');
    });

    test('should parse heading markdown', () => {
        const markdownString = '# Heading';
        const result = Parser.parse(markdownString);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe(BlockType.H1);
        expect(result[0].content).toBe('Heading');
        expect(result[0].html).toBe('<h1>Heading</h1>');
    });

    test('should parse ordered list markdown', () => {
        const markdownString = '1. First item\n2. Second item';
        const result = Parser.parse(markdownString);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe(BlockType.OL);
        expect(result[0].content).toBe('First item\nSecond item');
        expect(result[0].html).toBe("<ol>\n<li>First item</li>\n<li>Second item</li>\n</ol>");
    });

    test('should parse unordered list markdown', () => {
      const markdownString = '- First item\n- Second item';
      const result = Parser.parse(markdownString);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(BlockType.UL);
      expect(result[0].content).toBe('First item\nSecond item');
      expect(result[0].html).toBe('<ul>\n<li>First item</li>\n<li>Second item</li>\n</ul>');
    });

    test('should parse multiple lines of markdown', () => {
      const markdownString = '# Heading\nParagraph text';
      const result = Parser.parse(markdownString);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe(BlockType.H1);
      expect(result[0].content).toBe('Heading');
      expect(result[0].html).toBe('<h1>Heading</h1>');

      expect(result[1].type).toBe(BlockType.PARAGRAPH);
      expect(result[1].content).toBe('Paragraph text');
      expect(result[1].html).toBe('<p>Paragraph text</p>');
    });

    test('should handle empty markdown', () => {
      const markdownString = '';
      const result = Parser.parse(markdownString);

      expect(result).toHaveLength(0);
    });

    test('should handle whitespace in markdown', () => {
      const markdownString = '   ';
      const result = Parser.parse(markdownString);

      expect(result).toHaveLength(0);
    });

    test('should parse markdown with mixed content', () => {
        const markdownString = '# Heading\n\nParagraph text with **bold** and *italic*';
        const result = Parser.parse(markdownString);
    
        expect(result).toHaveLength(2);
        expect(result[0].type).toBe(BlockType.H1);
        expect(result[0].content).toBe('Heading');
        expect(result[0].html).toBe('<h1>Heading</h1>');

        expect(result[1].type).toBe(BlockType.PARAGRAPH);
        expect(result[1].content).toBe('Paragraph text with bold and italic');
        expect(result[1].html).toBe('<p>Paragraph text with <strong>bold</strong> and <em>italic</em></p>');
    });

    test('should parse complex translated markdown sample', () => {
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

        const result = Parser.parse(markdownString);
        // Basic checks: block count and types
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].type).toBe(BlockType.H1);
        expect(result[0].content).toBe('Heading 1');
        expect(result[0].html).toBe('<h1>Heading 1</h1>');

        expect(result[1].type).toBe(BlockType.H2);
        expect(result[1].content).toBe('Heading 2');
        expect(result[1].html).toBe('<h2>Heading 2</h2>');

        expect(result[2].type).toBe(BlockType.PARAGRAPH);
        expect(result[2].content).toBe('Bold text and italic and strikethrough.');
        expect(result[2].html).toBe('<p><strong>Bold text</strong> and <em>italic</em> and <del>strikethrough</del>.</p>');

        // Check for list items
        expect(result[3].type).toBe(BlockType.UL);
        expect(result[3].content).toBe('First list item\nSecond list item\nThird list item');
        expect(result[3].html).toBe('<ul><li>First list item</li><li>Second list item</li><li>Third list item</li></ul>');

        expect(result[4].type).toBe(BlockType.OL);
        expect(result[4].content).toBe('First numbered item\nSecond item\nThird item');
        expect(result[4].html).toBe('<ol><li>First numbered item</li><li>Second item</li><li>Third item</li></ol>');

        expect(result[5].type).toBe(BlockType.QUOTE);
        expect(result[5].content).toBe('This is a quote.');
        expect(result[5].html).toBe('<blockquote>This is a quote.</blockquote>');

        expect(result[6].type).toBe(BlockType.CODE);
        expect(result[6].content).toBe('Inline code');
        expect(result[6].html).toBe('<code>Inline code</code>');

        expect(result[7].type).toBe(BlockType.CODE);
        expect(result[7].content).toBe("console.log('Hello, world!');");
        expect(result[7].html).toBe('<pre><code class="language-javascript">console.log(\'Hello, world!\');\n</code></pre>');

        expect(result[8].type).toBe(BlockType.PARAGRAPH);
        expect(result[8].content).toBe('Link to Google');
        expect(result[8].html).toBe('<p><a href="https://www.google.com">Link to Google</a></p>');
    });
  });

  describe('parseHtml method', () => {
    test('should parse simple paragraph HTML', () => {
      // Mock log function to prevent console outputs during tests
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const htmlString = '<p>Hello World</p>';
      const result = Parser.parseHtml(htmlString);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(BlockType.PARAGRAPH);
      expect(result[0].content).toBe('Hello World');
      expect(result[0].html).toBe('<p>Hello World</p>');
      expect(result[0].nested).toBe(null);

      // Restore console.log
      console.log.mockRestore();
    });

    test('should parse heading HTML', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const htmlString = '<h1>Title</h1>';
      const result = Parser.parseHtml(htmlString);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(BlockType.H1);
      expect(result[0].content).toBe('Title');
      expect(result[0].html).toBe('<h1>Title</h1>');

      console.log.mockRestore();
    });

    test('should parse multiple blocks', () => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        
        const htmlString = '<h1>Title</h1><p>Paragraph</p>';
        const result = Parser.parseHtml(htmlString);
      
        expect(result).toHaveLength(2);
        expect(result[0].type).toBe(BlockType.H1);
        expect(result[0].content).toBe('Title');
        expect(result[0].html).toBe('<h1>Title</h1>');

        expect(result[1].type).toBe(BlockType.PARAGRAPH);
        expect(result[1].content).toBe('Paragraph');
        expect(result[1].html).toBe('<p>Paragraph</p>');
      
      console.log.mockRestore();
    });

    test('should handle empty HTML', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const htmlString = '';
      const result = Parser.parseHtml(htmlString);
      
      expect(result).toHaveLength(0);
      
      console.log.mockRestore();
    });
  });

  describe('html method', () => {
    test('should convert a paragraph block to HTML element', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const block = new Block(BlockType.PARAGRAPH);
      block.html = 'Test paragraph';
      
      Parser.html(block);
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.createElement().classList.add).toHaveBeenCalledWith('block');
      expect(document.createElement().classList.add).toHaveBeenCalledWith('block-p');
      expect(document.createElement().setAttribute).toHaveBeenCalledWith(
        'data-placeholder', 
        'Type "/" to insert block'
      );
      
      console.log.mockRestore();
    });

    test('should convert a heading block to HTML element', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const block = new Block(BlockType.H1);
      block.html = 'Test heading';
      
      Parser.html(block);
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.createElement().classList.add).toHaveBeenCalledWith('block');
      expect(document.createElement().classList.add).toHaveBeenCalledWith('block-h1');
      
      console.log.mockRestore();
    });
  });
});
