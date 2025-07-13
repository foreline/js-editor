import { ParagraphBlock } from '@/blocks/ParagraphBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';
import { Toolbar } from '@/Toolbar.js';

// Mock the Toolbar module
jest.mock('@/Toolbar.js', () => ({
  Toolbar: {
    paragraph: jest.fn()
  }
}));

describe('ParagraphBlock', () => {
  let paragraphBlock;

  beforeEach(() => {
    paragraphBlock = new ParagraphBlock();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new ParagraphBlock();
      expect(block).toBeInstanceOf(ParagraphBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.PARAGRAPH);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
    });

    test('creates instance with custom parameters', () => {
      const content = 'This is a paragraph of text.';
      const html = '<p>This is a paragraph of text.</p>';
      const nested = true;
      
      const block = new ParagraphBlock(content, html, nested);
      expect(block.type).toBe(BlockType.PARAGRAPH);
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
        const result = paragraphBlock.handleKeyPress(event, 'some text');
        expect(result).toBe(false);
      });
    });

    test('handleEnterKey returns false', () => {
      const event = { key: 'Enter' };
      const result = paragraphBlock.handleEnterKey(event);
      expect(result).toBe(false);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns empty array', () => {
      const triggers = ParagraphBlock.getMarkdownTriggers();
      expect(triggers).toEqual([]);
      expect(triggers).toHaveLength(0);
    });

    test('getToolbarConfig returns correct configuration', () => {
      const config = ParagraphBlock.getToolbarConfig();
      expect(config).toEqual({
        class: 'editor-toolbar-paragraph',
        label: 'Paragraph',
        group: 'headers'
      });
    });
  });

  describe('applyTransformation', () => {
    test('calls Toolbar.paragraph method', () => {
      paragraphBlock.applyTransformation();
      expect(Toolbar.paragraph).toHaveBeenCalledTimes(1);
      expect(Toolbar.paragraph).toHaveBeenCalledWith();
    });

    test('can be called multiple times', () => {
      paragraphBlock.applyTransformation();
      paragraphBlock.applyTransformation();
      
      expect(Toolbar.paragraph).toHaveBeenCalledTimes(2);
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from BaseBlock', () => {
      expect(paragraphBlock).toBeInstanceOf(BaseBlock);
    });

    test('has correct block type', () => {
      expect(paragraphBlock.type).toBe(BlockType.PARAGRAPH);
    });

    test('maintains type when content changes', () => {
      paragraphBlock.content = 'New paragraph content';
      expect(paragraphBlock.type).toBe(BlockType.PARAGRAPH);
    });
  });

  describe('Content and HTML handling', () => {
    test('can set and get content', () => {
      const content = 'This is a long paragraph with multiple sentences. It contains various words and punctuation.';
      paragraphBlock.content = content;
      expect(paragraphBlock.content).toBe(content);
    });

    test('can set and get HTML', () => {
      const html = '<p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>';
      paragraphBlock.html = html;
      expect(paragraphBlock.html).toBe(html);
    });

    test('can set and get nested status', () => {
      expect(paragraphBlock.nested).toBe(false);
      paragraphBlock.nested = true;
      expect(paragraphBlock.nested).toBe(true);
    });
  });
});
