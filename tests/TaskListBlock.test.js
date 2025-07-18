import { TaskListBlock } from '@/blocks/TaskListBlock.js';
import { ListBlock } from '@/blocks/ListBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';
import { Editor } from '@/Editor.js';

// Mock dependencies
jest.mock('@/Editor.js', () => ({
  Editor: {
    setCurrentBlock: jest.fn(),
    update: jest.fn()
  }
}));

// Mock DOM functions
global.document.createElement = jest.fn(() => ({
  classList: {
    add: jest.fn(),
    remove: jest.fn()
  },
  setAttribute: jest.fn(),
  after: jest.fn(),
  focus: jest.fn(),
  appendChild: jest.fn(),
  querySelector: jest.fn(),
  closest: jest.fn(),
  contentEditable: null,
  type: null,
  checked: false,
  addEventListener: jest.fn()
}));

global.document.createTextNode = jest.fn(text => ({ textContent: text }));
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));

describe('TaskListBlock', () => {
  let taskListBlock;

  beforeEach(() => {
    taskListBlock = new TaskListBlock();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new TaskListBlock();
      expect(block).toBeInstanceOf(TaskListBlock);
      expect(block).toBeInstanceOf(ListBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.SQ);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
      expect(block._checked).toBe(false);
    });

    test('creates instance with custom parameters', () => {
      const content = 'Complete this task';
      const html = '<li><input type="checkbox"> Complete this task</li>';
      const nested = true;
      
      const block = new TaskListBlock(content, html, nested);
      expect(block.type).toBe(BlockType.SQ);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
      expect(block._checked).toBe(false);
    });
  });

  describe('Key Handling', () => {
    test('handleKeyPress toggles checkbox on Ctrl+Space', () => {
      const mockBlock = {
        closest: jest.fn().mockReturnValue('mockClosestBlock')
      };
      
      const event = {
        key: ' ',
        ctrlKey: true,
        target: mockBlock
      };
      
      // Mock toggleCheckbox method
      taskListBlock.toggleCheckbox = jest.fn();
      
      const result = taskListBlock.handleKeyPress(event, 'task text');
      
      expect(mockBlock.closest).toHaveBeenCalledWith('.block');
      expect(taskListBlock.toggleCheckbox).toHaveBeenCalledWith('mockClosestBlock');
      expect(result).toBe(true);
    });

    test('handleKeyPress returns false for other keys', () => {
      const event = { key: 'Enter', ctrlKey: false };
      const result = taskListBlock.handleKeyPress(event, 'task text');
      expect(result).toBe(false);
    });

    test('handleKeyPress returns false for space without Ctrl', () => {
      const event = { key: ' ', ctrlKey: false };
      const result = taskListBlock.handleKeyPress(event, 'task text');
      expect(result).toBe(false);
    });
  });

  describe('toggleCheckbox', () => {
    test('toggles checkbox state from unchecked to checked', () => {
      const mockCheckbox = {
        checked: false
      };
      
      const mockCurrentBlock = {
        querySelector: jest.fn().mockReturnValue(mockCheckbox),
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        }
      };
      
      taskListBlock.toggleCheckbox(mockCurrentBlock);
      
      expect(mockCurrentBlock.querySelector).toHaveBeenCalledWith('input[type="checkbox"]');
      expect(mockCheckbox.checked).toBe(true);
      expect(taskListBlock._checked).toBe(true);
      expect(mockCurrentBlock.classList.add).toHaveBeenCalledWith('task-completed');
      expect(Editor.update).toHaveBeenCalled();
    });

    test('toggles checkbox state from checked to unchecked', () => {
      const mockCheckbox = {
        checked: true
      };
      
      const mockCurrentBlock = {
        querySelector: jest.fn().mockReturnValue(mockCheckbox),
        classList: {
          add: jest.fn(),
          remove: jest.fn()
        }
      };
      
      taskListBlock._checked = true; // Start with checked state
      taskListBlock.toggleCheckbox(mockCurrentBlock);
      
      expect(mockCheckbox.checked).toBe(false);
      expect(taskListBlock._checked).toBe(false);
      expect(mockCurrentBlock.classList.remove).toHaveBeenCalledWith('task-completed');
    });

    test('does nothing when currentBlock is null', () => {
      taskListBlock.toggleCheckbox(null);
      expect(Editor.update).not.toHaveBeenCalled();
    });

    test('does nothing when checkbox is not found', () => {
      const mockCurrentBlock = {
        querySelector: jest.fn().mockReturnValue(null)
      };
      
      taskListBlock.toggleCheckbox(mockCurrentBlock);
      expect(Editor.update).not.toHaveBeenCalled();
    });
  });

  describe('createNewListItem', () => {
    test('creates new task list item with checkbox', () => {
      const mockCurrentBlock = {
        after: jest.fn()
      };
      
      const mockListItem = {
        classList: {
          add: jest.fn()
        },
        setAttribute: jest.fn(),
        appendChild: jest.fn(),
        focus: jest.fn(),
        contentEditable: null
      };
      
      const mockCheckbox = {
        type: null,
        addEventListener: jest.fn()
      };
      
      const mockTextNode = { textContent: ' ' };
      
      document.createElement
        .mockReturnValueOnce(mockListItem)
        .mockReturnValueOnce(mockCheckbox);
      document.createTextNode.mockReturnValueOnce(mockTextNode);
      
      const result = taskListBlock.createNewListItem(mockCurrentBlock);
      
      expect(document.createElement).toHaveBeenCalledWith('li');
      expect(document.createElement).toHaveBeenCalledWith('input');
      expect(mockListItem.classList.add).not.toHaveBeenCalledWith('block');
      expect(mockListItem.setAttribute).toHaveBeenCalledWith('data-block-type', 'sq');
      expect(mockListItem.contentEditable).toBe(true);
      expect(mockCheckbox.type).toBe('checkbox');
      expect(mockCheckbox.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mockListItem.appendChild).toHaveBeenCalledWith(mockCheckbox);
      expect(mockListItem.appendChild).toHaveBeenCalledWith(mockTextNode);
      expect(mockCurrentBlock.after).toHaveBeenCalledWith(mockListItem);
      expect(result).toBe(true);
    });
  });

  describe('Checkbox State', () => {
    test('isChecked returns correct state', () => {
      expect(taskListBlock.isChecked()).toBe(false);
      
      taskListBlock._checked = true;
      expect(taskListBlock.isChecked()).toBe(true);
    });

    test('setChecked updates state', () => {
      taskListBlock.setChecked(true);
      expect(taskListBlock._checked).toBe(true);
      expect(taskListBlock.isChecked()).toBe(true);
      
      taskListBlock.setChecked(false);
      expect(taskListBlock._checked).toBe(false);
      expect(taskListBlock.isChecked()).toBe(false);
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from ListBlock', () => {
      expect(taskListBlock).toBeInstanceOf(ListBlock);
    });

    test('inherits from BaseBlock', () => {
      expect(taskListBlock).toBeInstanceOf(BaseBlock);
    });

    test('has correct block type', () => {
      expect(taskListBlock.type).toBe(BlockType.SQ);
    });

    test('maintains type when content changes', () => {
      taskListBlock.content = 'New task content';
      expect(taskListBlock.type).toBe(BlockType.SQ);
    });
  });

  describe('Content and HTML handling', () => {
    test('can set and get content', () => {
      const content = 'Complete the documentation';
      taskListBlock.content = content;
      expect(taskListBlock.content).toBe(content);
    });

    test('can set and get HTML', () => {
      const html = '<li><input type="checkbox"> Complete the documentation</li>';
      taskListBlock.html = html;
      expect(taskListBlock.html).toBe(html);
    });

    test('can set and get nested status', () => {
      expect(taskListBlock.nested).toBe(false);
      taskListBlock.nested = true;
      expect(taskListBlock.nested).toBe(true);
    });
  });
});
