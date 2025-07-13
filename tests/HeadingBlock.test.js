import { HeadingBlock } from '@/blocks/HeadingBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';
import { Toolbar } from '@/Toolbar.js';

// Mock the Toolbar module
jest.mock('@/Toolbar.js', () => ({
  Toolbar: {
    h1: jest.fn(),
    h2: jest.fn(),
    h3: jest.fn(),
    h4: jest.fn(),
    h5: jest.fn(),
    h6: jest.fn()
  }
}));

describe('HeadingBlock', () => {
  let headingBlock;

  beforeEach(() => {
    headingBlock = new HeadingBlock(1); // Create H1 heading
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates H1 heading with default parameters', () => {
      const block = new HeadingBlock(1);
      expect(block).toBeInstanceOf(HeadingBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe('h1');
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
      expect(block.level).toBe(1);
    });

    test('creates H3 heading with custom parameters', () => {
      const content = 'Section Heading';
      const html = '<h3>Section Heading</h3>';
      const nested = true;
      
      const block = new HeadingBlock(3, content, html, nested);
      expect(block.type).toBe('h3');
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
      expect(block.level).toBe(3);
    });

    test('creates all heading levels correctly', () => {
      for (let level = 1; level <= 6; level++) {
        const block = new HeadingBlock(level);
        expect(block.type).toBe(`h${level}`);
        expect(block.level).toBe(level);
      }
    });
  });

  describe('Key Handling', () => {
    test('handleKeyPress returns false', () => {
      const event = { key: 'Enter' };
      const result = headingBlock.handleKeyPress(event, 'heading text');
      expect(result).toBe(false);
    });

    test('handleEnterKey returns false', () => {
      const event = { key: 'Enter' };
      const result = headingBlock.handleEnterKey(event);
      expect(result).toBe(false);
    });
  });

  describe('applyTransformation', () => {
    test('calls correct Toolbar method for H1', () => {
      const h1Block = new HeadingBlock(1);
      h1Block.applyTransformation();
      expect(Toolbar.h1).toHaveBeenCalledTimes(1);
    });

    test('calls correct Toolbar method for H2', () => {
      const h2Block = new HeadingBlock(2);
      h2Block.applyTransformation();
      expect(Toolbar.h2).toHaveBeenCalledTimes(1);
    });

    test('calls correct Toolbar method for H3', () => {
      const h3Block = new HeadingBlock(3);
      h3Block.applyTransformation();
      expect(Toolbar.h3).toHaveBeenCalledTimes(1);
    });

    test('calls correct Toolbar method for H4', () => {
      const h4Block = new HeadingBlock(4);
      h4Block.applyTransformation();
      expect(Toolbar.h4).toHaveBeenCalledTimes(1);
    });

    test('calls correct Toolbar method for H5', () => {
      const h5Block = new HeadingBlock(5);
      h5Block.applyTransformation();
      expect(Toolbar.h5).toHaveBeenCalledTimes(1);
    });

    test('calls correct Toolbar method for H6', () => {
      const h6Block = new HeadingBlock(6);
      h6Block.applyTransformation();
      expect(Toolbar.h6).toHaveBeenCalledTimes(1);
    });

    test('handles invalid level gracefully', () => {
      const invalidBlock = new HeadingBlock(7);
      expect(() => invalidBlock.applyTransformation()).not.toThrow();
    });
  });

  describe('Level Property', () => {
    test('level property is accessible', () => {
      expect(headingBlock.level).toBe(1);
    });

    test('level remains constant after content changes', () => {
      headingBlock.content = 'New heading content';
      expect(headingBlock.level).toBe(1);
    });

    test('different heading levels have correct level property', () => {
      const levels = [1, 2, 3, 4, 5, 6];
      levels.forEach(level => {
        const block = new HeadingBlock(level);
        expect(block.level).toBe(level);
      });
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from BaseBlock', () => {
      expect(headingBlock).toBeInstanceOf(BaseBlock);
    });

    test('has correct block type for each level', () => {
      const levels = [1, 2, 3, 4, 5, 6];
      levels.forEach(level => {
        const block = new HeadingBlock(level);
        expect(block.type).toBe(`h${level}`);
      });
    });

    test('maintains type when content changes', () => {
      headingBlock.content = 'New heading content';
      expect(headingBlock.type).toBe('h1');
    });
  });

  describe('Content and HTML handling', () => {
    test('can set and get content', () => {
      const content = 'Main Page Heading';
      headingBlock.content = content;
      expect(headingBlock.content).toBe(content);
    });

    test('can set and get HTML', () => {
      const html = '<h1>Main Page Heading</h1>';
      headingBlock.html = html;
      expect(headingBlock.html).toBe(html);
    });

    test('can set and get nested status', () => {
      expect(headingBlock.nested).toBe(false);
      headingBlock.nested = true;
      expect(headingBlock.nested).toBe(true);
    });
  });

  describe('Static Methods (when implemented in subclasses)', () => {
    test('has level-specific behavior for different heading types', () => {
      // This tests the polymorphic behavior across different heading levels
      const headings = [
        { level: 1, expectedType: 'h1' },
        { level: 2, expectedType: 'h2' },
        { level: 3, expectedType: 'h3' },
        { level: 4, expectedType: 'h4' },
        { level: 5, expectedType: 'h5' },
        { level: 6, expectedType: 'h6' }
      ];

      headings.forEach(({ level, expectedType }) => {
        const block = new HeadingBlock(level, `Heading ${level}`);
        expect(block.type).toBe(expectedType);
        expect(block.level).toBe(level);
        expect(block.content).toBe(`Heading ${level}`);
      });
    });
  });
});
