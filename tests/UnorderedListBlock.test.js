import { UnorderedListBlock } from '@/blocks/UnorderedListBlock.js';
import { ListBlock } from '@/blocks/ListBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';
import { Toolbar } from '@/Toolbar.js';
import { Editor } from '@/Editor.js';

// Mock dependencies
jest.mock('@/Toolbar.js', () => ({
  Toolbar: {
    ul: jest.fn()
  }
}));

jest.mock('@/Editor.js', () => ({
  Editor: {
    setCurrentBlock: jest.fn()
  }
}));

// Mock DOM functions
global.document.createElement = jest.fn(() => ({
  classList: {
    add: jest.fn()
  },
  setAttribute: jest.fn(),
  after: jest.fn(),
  focus: jest.fn(),
  contentEditable: null
}));

global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));

describe('UnorderedListBlock', () => {
  let unorderedListBlock;

  beforeEach(() => {
    unorderedListBlock = new UnorderedListBlock();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new UnorderedListBlock();
      expect(block).toBeInstanceOf(UnorderedListBlock);
      expect(block).toBeInstanceOf(ListBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.UL);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
    });

    test('creates instance with custom parameters', () => {
      const content = 'First list item\nSecond list item';
      const html = '<ul><li>First list item</li><li>Second list item</li></ul>';
      const nested = true;
      
      const block = new UnorderedListBlock(content, html, nested);
      expect(block.type).toBe(BlockType.UL);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
    });
  });

  describe('Key Handling', () => {
    test('handleKeyPress returns false by default', () => {
      const event = { key: 'Enter' };
      const result = unorderedListBlock.handleKeyPress(event, 'list item text');
      expect(result).toBe(false);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns correct triggers', () => {
      const triggers = UnorderedListBlock.getMarkdownTriggers();
      expect(triggers).toHaveLength(2);
      expect(triggers).toContain('* ');
      expect(triggers).toContain('- ');
    });

    test('triggers are static and immutable', () => {
      const triggers1 = UnorderedListBlock.getMarkdownTriggers();
      const triggers2 = UnorderedListBlock.getMarkdownTriggers();
      
      expect(triggers1).toEqual(triggers2);
      expect(triggers1).not.toBe(triggers2); // Different array instances
    });
  });

  describe('applyTransformation', () => {
    test('calls Toolbar.ul method', () => {
      unorderedListBlock.applyTransformation();
      expect(Toolbar.ul).toHaveBeenCalledTimes(1);
      expect(Toolbar.ul).toHaveBeenCalledWith();
    });

    test('can be called multiple times', () => {
      unorderedListBlock.applyTransformation();
      unorderedListBlock.applyTransformation();
      
      expect(Toolbar.ul).toHaveBeenCalledTimes(2);
    });
  });

  describe('createNewListItem', () => {
    test('creates new list item element with correct properties', () => {
      const mockCurrentBlock = {
        after: jest.fn()
      };
      
      const mockNewListItem = {
        classList: {
          add: jest.fn()
        },
        setAttribute: jest.fn(),
        after: jest.fn(),
        focus: jest.fn(),
        contentEditable: null
      };
      
      document.createElement.mockReturnValueOnce(mockNewListItem);
      
      const result = unorderedListBlock.createNewListItem(mockCurrentBlock);
      
      expect(document.createElement).toHaveBeenCalledWith('li');
      expect(mockNewListItem.classList.add).not.toHaveBeenCalledWith('block');
      expect(mockNewListItem.setAttribute).toHaveBeenCalledWith('data-block-type', 'ul');
      expect(mockNewListItem.contentEditable).toBe(true);
      expect(mockCurrentBlock.after).toHaveBeenCalledWith(mockNewListItem);
      expect(Editor.setCurrentBlock).toHaveBeenCalledWith(mockNewListItem);
      expect(result).toBe(true);
    });

    test('focuses on new list item after animation frame', (done) => {
      const mockCurrentBlock = {
        after: jest.fn()
      };
      
      const mockNewListItem = {
        classList: {
          add: jest.fn()
        },
        setAttribute: jest.fn(),
        focus: jest.fn(),
        contentEditable: null
      };
      
      document.createElement.mockReturnValueOnce(mockNewListItem);
      
      // Override requestAnimationFrame to execute immediately for testing
      global.requestAnimationFrame = jest.fn(callback => {
        callback();
        // Verify focus was called
        expect(mockNewListItem.focus).toHaveBeenCalled();
        done();
      });
      
      unorderedListBlock.createNewListItem(mockCurrentBlock);
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from ListBlock', () => {
      expect(unorderedListBlock).toBeInstanceOf(ListBlock);
    });

    test('inherits from BaseBlock', () => {
      expect(unorderedListBlock).toBeInstanceOf(BaseBlock);
    });

    test('has correct block type', () => {
      expect(unorderedListBlock.type).toBe(BlockType.UL);
    });

    test('maintains type when content changes', () => {
      unorderedListBlock.content = 'New list content';
      expect(unorderedListBlock.type).toBe(BlockType.UL);
    });
  });

  describe('Content and HTML handling', () => {
    test('can set and get content', () => {
      const content = 'Item 1\nItem 2\nItem 3';
      unorderedListBlock.content = content;
      expect(unorderedListBlock.content).toBe(content);
    });

    test('can set and get HTML', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
      unorderedListBlock.html = html;
      expect(unorderedListBlock.html).toBe(html);
    });

    test('can set and get nested status', () => {
      expect(unorderedListBlock.nested).toBe(false);
      unorderedListBlock.nested = true;
      expect(unorderedListBlock.nested).toBe(true);
    });
  });
});
