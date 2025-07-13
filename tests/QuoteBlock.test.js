import { QuoteBlock } from '@/blocks/QuoteBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';
import { Toolbar } from '@/Toolbar.js';

// Mock the Toolbar module
jest.mock('@/Toolbar.js', () => ({
  Toolbar: {
    quote: jest.fn()
  }
}));

describe('QuoteBlock', () => {
  let quoteBlock;

  beforeEach(() => {
    quoteBlock = new QuoteBlock();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new QuoteBlock();
      expect(block).toBeInstanceOf(QuoteBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.QUOTE);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
    });

    test('creates instance with custom parameters', () => {
      const content = 'This is a quoted text block.';
      const html = '<blockquote>This is a quoted text block.</blockquote>';
      const nested = true;
      
      const block = new QuoteBlock(content, html, nested);
      expect(block.type).toBe(BlockType.QUOTE);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
    });
  });

  describe('Key Handling', () => {
    test('handleKeyPress returns false for all keys', () => {
      const scenarios = [
        { key: 'Enter', description: 'Enter key' },
        { key: 'Tab', description: 'Tab key' },
        { key: 'Backspace', description: 'Backspace key' },
        { key: 'a', description: 'letter key' }
      ];

      scenarios.forEach(({ key, description }) => {
        const event = { key };
        const result = quoteBlock.handleKeyPress(event, 'some text');
        expect(result).toBe(false);
      });
    });

    test('handleEnterKey returns false', () => {
      const event = { key: 'Enter' };
      const result = quoteBlock.handleEnterKey(event);
      expect(result).toBe(false);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns correct triggers', () => {
      const triggers = QuoteBlock.getMarkdownTriggers();
      expect(triggers).toHaveLength(1);
      expect(triggers).toContain('> ');
    });

    test('triggers are static and immutable', () => {
      const triggers1 = QuoteBlock.getMarkdownTriggers();
      const triggers2 = QuoteBlock.getMarkdownTriggers();
      
      expect(triggers1).toEqual(triggers2);
      expect(triggers1).not.toBe(triggers2); // Different array instances
    });
  });

  describe('applyTransformation', () => {
    test('calls Toolbar.quote method', () => {
      quoteBlock.applyTransformation();
      expect(Toolbar.quote).toHaveBeenCalledTimes(1);
      expect(Toolbar.quote).toHaveBeenCalledWith();
    });

    test('can be called multiple times', () => {
      quoteBlock.applyTransformation();
      quoteBlock.applyTransformation();
      
      expect(Toolbar.quote).toHaveBeenCalledTimes(2);
    });
  });

  describe('Content Conversion', () => {
    test('toMarkdown returns quoted format', () => {
      quoteBlock.content = 'This is a test quote';
      const markdown = quoteBlock.toMarkdown();
      expect(markdown).toBe('> This is a test quote');
    });

    test('toMarkdown handles empty content', () => {
      quoteBlock.content = '';
      const markdown = quoteBlock.toMarkdown();
      expect(markdown).toBe('> ');
    });

    test('toHtml returns blockquote format', () => {
      quoteBlock.content = 'This is a test quote';
      const html = quoteBlock.toHtml();
      expect(html).toBe('<blockquote>This is a test quote</blockquote>');
    });

    test('toHtml handles empty content', () => {
      quoteBlock.content = '';
      const html = quoteBlock.toHtml();
      expect(html).toBe('<blockquote></blockquote>');
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from BaseBlock', () => {
      expect(quoteBlock).toBeInstanceOf(BaseBlock);
    });

    test('has correct block type', () => {
      expect(quoteBlock.type).toBe(BlockType.QUOTE);
    });

    test('maintains type when content changes', () => {
      quoteBlock.content = 'New quote content';
      expect(quoteBlock.type).toBe(BlockType.QUOTE);
    });
  });

  describe('Content and HTML handling', () => {
    test('can set and get content', () => {
      const content = 'To be or not to be, that is the question.';
      quoteBlock.content = content;
      expect(quoteBlock.content).toBe(content);
    });

    test('can set and get HTML', () => {
      const html = '<blockquote>To be or not to be, that is the question.</blockquote>';
      quoteBlock.html = html;
      expect(quoteBlock.html).toBe(html);
    });

    test('can set and get nested status', () => {
      expect(quoteBlock.nested).toBe(false);
      quoteBlock.nested = true;
      expect(quoteBlock.nested).toBe(true);
    });
  });
});
