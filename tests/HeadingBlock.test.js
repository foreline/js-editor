import { HeadingBlock } from '@/blocks/HeadingBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';

// HeadingBlock no longer imports Toolbar or Editor directly
jest.mock('@/utils/log.js');

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
    function makeMockBlock() {
      const el = {
        setAttribute: jest.fn(),
        textContent: 'Test heading',
        innerHTML: '',
        appendChild: jest.fn(),
        contains: jest.fn(() => false)
      };
      Object.defineProperty(el, 'className', { writable: true, value: '' });
      return el;
    }

    beforeEach(() => {
      // Ensure document.createElement is reset to setup.js default mock each test
      // (beforeEach in jest clears mock state but not implementations; reset here)
      window.getSelection = jest.fn(() => ({
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      }));
      document.createRange = jest.fn(() => ({
        selectNodeContents: jest.fn(),
        collapse: jest.fn()
      }));
    });

    test('transforms block to H1 correctly', () => {
      const mockCurrentBlock = makeMockBlock();
      const h1Block = new HeadingBlock(1);
      h1Block.applyTransformation(mockCurrentBlock);

      expect(mockCurrentBlock.setAttribute).toHaveBeenCalledWith('data-block-type', 'h1');
      expect(mockCurrentBlock.className).toBe('bke-block bke-block--h1');
    });

    test('transforms block to H2 correctly', () => {
      const mockCurrentBlock = makeMockBlock();
      const h2Block = new HeadingBlock(2);
      h2Block.applyTransformation(mockCurrentBlock);

      expect(mockCurrentBlock.setAttribute).toHaveBeenCalledWith('data-block-type', 'h2');
      expect(mockCurrentBlock.className).toBe('bke-block bke-block--h2');
    });

    test('transforms block to H3 correctly', () => {
      const mockCurrentBlock = makeMockBlock();
      const h3Block = new HeadingBlock(3);
      h3Block.applyTransformation(mockCurrentBlock);

      expect(mockCurrentBlock.setAttribute).toHaveBeenCalledWith('data-block-type', 'h3');
      expect(mockCurrentBlock.className).toBe('bke-block bke-block--h3');
    });

    test('does nothing when targetElement is null', () => {
      const h1Block = new HeadingBlock(1);
      expect(() => h1Block.applyTransformation(null)).not.toThrow();
    });

    test('does nothing when targetElement is undefined', () => {
      const h1Block = new HeadingBlock(1);
      expect(() => h1Block.applyTransformation()).not.toThrow();
    });

    test('preserves existing text content during transformation', () => {
      const mockCurrentBlock = makeMockBlock();
      mockCurrentBlock.textContent = 'Existing content';
      // Track heading element created by createElement
      const createdElements = [];
      document.createElement = jest.fn((tag) => {
        const el = {
          tagName: tag.toUpperCase(),
          setAttribute: jest.fn(),
          textContent: '',
          focus: jest.fn()
        };
        createdElements.push(el);
        return el;
      });

      const h1Block = new HeadingBlock(1);
      h1Block.applyTransformation(mockCurrentBlock);

      const headingEl = createdElements.find(e => e.tagName === 'H1');
      expect(headingEl).toBeTruthy();
      expect(headingEl.textContent).toBe('Existing content');
      expect(headingEl.setAttribute).toHaveBeenCalledWith('contenteditable', 'true');
    });

    test('handles all heading levels 1-6', () => {
      for (let level = 1; level <= 6; level++) {
        const mockBlock = makeMockBlock();
        const block = new HeadingBlock(level);
        block.applyTransformation(mockBlock);
        expect(mockBlock.setAttribute).toHaveBeenCalledWith('data-block-type', `h${level}`);
        expect(mockBlock.className).toBe(`bke-block bke-block--h${level}`);
      }
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
