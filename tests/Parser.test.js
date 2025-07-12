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
    });

    test('should parse heading markdown', () => {
      const markdownString = '# Heading';
      const result = Parser.parse(markdownString);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(BlockType.H1);
      expect(result[0].content).toBe('Heading');
    });

    test('should parse multiple lines of markdown', () => {
      const markdownString = '# Heading\nParagraph text';
      const result = Parser.parse(markdownString);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe(BlockType.H1);
      expect(result[0].content).toBe('Heading');
      expect(result[1].type).toBe(BlockType.PARAGRAPH);
      expect(result[1].content).toBe('Paragraph text');
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
        expect(result[1].type).toBe(BlockType.PARAGRAPH);
        expect(result[1].content).toBe('Paragraph text with **bold** and *italic*');
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

[] checkbox
- [x] First checkbox
- [ ] Second checkbox

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
      expect(result[1].type).toBe(BlockType.H2);
      expect(result[1].content).toBe('Heading 2');
      // Check for bold/italic/strikethrough paragraph
      expect(result.some(b => b.content.includes('Bold text'))).toBe(true);
      expect(result.some(b => b.content.includes('italic'))).toBe(true);
      expect(result.some(b => b.content.includes('strikethrough'))).toBe(true);
      // Check for list items
      expect(result.some(b => b.content.includes('First list item'))).toBe(true);
      expect(result.some(b => b.content.includes('Second list item'))).toBe(true);
      expect(result.some(b => b.content.includes('Third list item'))).toBe(true);
      // Check for numbered list
      expect(result.some(b => b.content.includes('First numbered item'))).toBe(true);
      expect(result.some(b => b.content.includes('Second item'))).toBe(true);
      expect(result.some(b => b.content.includes('Third item'))).toBe(true);
      // Check for checkboxes
      expect(result.some(b => b.content.includes('checkbox'))).toBe(true);
      expect(result.some(b => b.content.includes('First checkbox'))).toBe(true);
      expect(result.some(b => b.content.includes('Second checkbox'))).toBe(true);
      // Check for quote
      expect(result.some(b => b.content.includes('This is a quote.'))).toBe(true);
      // Check for inline code
      expect(result.some(b => b.content.includes('Inline code'))).toBe(true);
      // Check for code block
      expect(result.some(b => b.content.includes("console.log('Hello, world!');"))).toBe(true);
      // Check for link
      expect(result.some(b => b.content.includes('Link to Google'))).toBe(true);
    });
  });

  describe('parseHtml method', () => {
    test('should parse simple paragraph HTML', () => {
      // Mock log function to prevent console outputs during tests
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const htmlString = '<p>Hello World</p>';
      const result = Parser.parseHtml(htmlString);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('p');
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
      expect(result[0].type).toBe('h1');
      expect(result[0].content).toBe('Title');
      
      console.log.mockRestore();
    });

    test('should parse multiple blocks', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const htmlString = '<h1>Title</h1><p>Paragraph</p>';
      const result = Parser.parseHtml(htmlString);
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('h1');
      expect(result[1].type).toBe('p');
      
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
