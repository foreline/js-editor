import { OrderedListBlock } from '@/blocks/OrderedListBlock.js';
import { ListBlock } from '@/blocks/ListBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';
import { Toolbar } from '@/Toolbar.js';
import { Editor } from '@/Editor.js';

// Mock dependencies
jest.mock('@/Toolbar.js', () => ({
  Toolbar: {
    ol: jest.fn()
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

describe('OrderedListBlock', () => {
  let orderedListBlock;

  beforeEach(() => {
    orderedListBlock = new OrderedListBlock();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new OrderedListBlock();
      expect(block).toBeInstanceOf(OrderedListBlock);
      expect(block).toBeInstanceOf(ListBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.OL);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
    });

    test('creates instance with custom parameters', () => {
      const content = 'First step\nSecond step';
      const html = '<ol><li>First step</li><li>Second step</li></ol>';
      const nested = true;
      
      const block = new OrderedListBlock(content, html, nested);
      expect(block.type).toBe(BlockType.OL);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
    });
  });

  describe('Key Handling', () => {
    test('handleKeyPress returns false by default', () => {
      const event = { key: 'Enter' };
      const result = orderedListBlock.handleKeyPress(event, 'list item text');
      expect(result).toBe(false);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns correct triggers', () => {
      const triggers = OrderedListBlock.getMarkdownTriggers();
      expect(triggers).toHaveLength(2);
      expect(triggers).toContain('1 ');
      expect(triggers).toContain('1.');
    });

    test('triggers are static and immutable', () => {
      const triggers1 = OrderedListBlock.getMarkdownTriggers();
      const triggers2 = OrderedListBlock.getMarkdownTriggers();
      
      expect(triggers1).toEqual(triggers2);
      expect(triggers1).not.toBe(triggers2); // Different array instances
    });
  });

  describe('applyTransformation', () => {
    test('calls Toolbar.ol method', () => {
      orderedListBlock.applyTransformation();
      expect(Toolbar.ol).toHaveBeenCalledTimes(1);
      expect(Toolbar.ol).toHaveBeenCalledWith();
    });

    test('can be called multiple times', () => {
      orderedListBlock.applyTransformation();
      orderedListBlock.applyTransformation();
      
      expect(Toolbar.ol).toHaveBeenCalledTimes(2);
    });
  });

  describe('createNewListItem', () => {
    test('creates new list item element with correct properties', () => {
      const mockOlElement = {
        appendChild: jest.fn()
      };
      
      const mockCurrentBlock = {
        querySelector: jest.fn().mockReturnValue(mockOlElement)
      };
      
      const mockCurrentListItem = {}; // Mock current list item parameter
      
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
      
      const result = orderedListBlock.createNewListItem(mockCurrentBlock, mockCurrentListItem);
      
      expect(document.createElement).toHaveBeenCalledWith('li');
      expect(mockNewListItem.contentEditable).toBe(true);
      expect(mockOlElement.appendChild).toHaveBeenCalledWith(mockNewListItem);
      expect(Editor.setCurrentBlock).toHaveBeenCalledWith(mockCurrentBlock);
      expect(result).toBe(true);
    });

    test('focuses on new list item after animation frame', (done) => {
      const mockOlElement = {
        appendChild: jest.fn()
      };
      
      const mockCurrentBlock = {
        querySelector: jest.fn().mockReturnValue(mockOlElement)
      };
      
      const mockCurrentListItem = {}; // Mock current list item parameter
      
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
      
      orderedListBlock.createNewListItem(mockCurrentBlock, mockCurrentListItem);
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from ListBlock', () => {
      expect(orderedListBlock).toBeInstanceOf(ListBlock);
    });

    test('inherits from BaseBlock', () => {
      expect(orderedListBlock).toBeInstanceOf(BaseBlock);
    });

    test('has correct block type', () => {
      expect(orderedListBlock.type).toBe(BlockType.OL);
    });

    test('maintains type when content changes', () => {
      orderedListBlock.content = 'New list content';
      expect(orderedListBlock.type).toBe(BlockType.OL);
    });
  });

  describe('Content and HTML handling', () => {
    test('can set and get content', () => {
      const content = 'Step 1\nStep 2\nStep 3';
      orderedListBlock.content = content;
      expect(orderedListBlock.content).toBe(content);
    });

    test('can set and get HTML', () => {
      const html = '<ol><li>Step 1</li><li>Step 2</li><li>Step 3</li></ol>';
      orderedListBlock.html = html;
      expect(orderedListBlock.html).toBe(html);
    });

    test('can set and get nested status', () => {
      expect(orderedListBlock.nested).toBe(false);
      orderedListBlock.nested = true;
      expect(orderedListBlock.nested).toBe(true);
    });
  });
});
