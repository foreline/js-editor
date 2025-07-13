import { ParserV2 } from '@/ParserV2.js';
import { Block } from '@/Block.js';
import { BlockType } from '@/BlockType.js';
import { ParagraphBlock } from '@/blocks/ParagraphBlock.js';
import { H1Block } from '@/blocks/HeadingBlock.js';
import { TaskListBlock } from '@/blocks/TaskListBlock.js';

// Mock DOM for testing
beforeAll(() => {
  const mockElement = {
    classList: {
      add: jest.fn()
    },
    setAttribute: jest.fn(),
    appendChild: jest.fn(),
    innerHTML: '',
    style: {}
  };
  
  global.document.createElement = jest.fn(() => mockElement);
});

describe('ParserV2 - Block-based parsing', () => {
  describe('Block parsing delegation', () => {
    test('should delegate HTML parsing to block types', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      // Test heading parsing
      const headingHtml = '<h1>Test Heading</h1>';
      const result = ParserV2.parseHtml(headingHtml);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(BlockType.H1);
      expect(result[0].content).toBe('Test Heading');
      
      console.log.mockRestore();
    });

    test('should parse task list items using TaskListBlock', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const taskHtml = '<li class="task-list-item" data-block-type="sq"><input type="checkbox" checked> Complete task</li>';
      const result = ParserV2.parseHtml(taskHtml);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(BlockType.SQ);
      expect(result[0].content).toBe('Complete task');
      expect(result[0]._checked).toBe(true);
      
      console.log.mockRestore();
    });

    test('should parse paragraphs using ParagraphBlock', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const paragraphHtml = '<p>This is a paragraph</p>';
      const result = ParserV2.parseHtml(paragraphHtml);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(BlockType.PARAGRAPH);
      expect(result[0].content).toBe('This is a paragraph');
      
      console.log.mockRestore();
    });
  });

  describe('Markdown parsing delegation', () => {
    test('should delegate markdown parsing to block types', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const markdown = '# Heading 1\n\nThis is a paragraph\n\n- [x] Completed task';
      const result = ParserV2.parse(markdown);
      
      expect(result.length).toBeGreaterThan(0);
      // Should have at least heading and paragraph blocks
      
      console.log.mockRestore();
    });
  });

  describe('Block rendering delegation', () => {
    test('should delegate rendering to block instances', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const blockInstance = new H1Block('Test', '<h1>Test</h1>');
      const block = new Block(BlockType.H1, 'Test', '<h1>Test</h1>', null, false, blockInstance);
      
      const element = ParserV2.html(block);
      
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(element.classList.add).toHaveBeenCalledWith('block');
      expect(element.classList.add).toHaveBeenCalledWith('block-h1');
      
      console.log.mockRestore();
    });
  });

  describe('Block type detection', () => {
    test('HeadingBlock should detect HTML headings', () => {
      expect(H1Block.canParseHtml('<h1>Test</h1>')).toBe(true);
      expect(H1Block.canParseHtml('<h2>Test</h2>')).toBe(true);
      expect(H1Block.canParseHtml('<p>Test</p>')).toBe(false);
    });

    test('TaskListBlock should detect task list HTML', () => {
      expect(TaskListBlock.canParseHtml('<li data-block-type="sq">Test</li>')).toBe(true);
      expect(TaskListBlock.canParseHtml('<li><input type="checkbox"> Test</li>')).toBe(true);
      expect(TaskListBlock.canParseHtml('<p>Test</p>')).toBe(false);
    });

    test('ParagraphBlock should detect paragraphs and fallback cases', () => {
      expect(ParagraphBlock.canParseHtml('<p>Test</p>')).toBe(true);
      expect(ParagraphBlock.canParseHtml('<h1>Test</h1>')).toBe(false);
    });
  });

  describe('Block creation from parsing', () => {
    test('should create correct block instances from HTML', () => {
      const headingBlock = H1Block.parseFromHtml('<h1>Test Heading</h1>');
      expect(headingBlock).toBeInstanceOf(H1Block);
      expect(headingBlock.content).toBe('Test Heading');

      const taskBlock = TaskListBlock.parseFromHtml('<li data-block-type="sq"><input type="checkbox" checked> Test Task</li>');
      expect(taskBlock).toBeInstanceOf(TaskListBlock);
      expect(taskBlock.content).toBe('Test Task');
      expect(taskBlock.isChecked()).toBe(true);
    });

    test('should create correct block instances from markdown', () => {
      const headingBlock = H1Block.parseFromMarkdown('# Test Heading');
      expect(headingBlock).toBeInstanceOf(H1Block);
      expect(headingBlock.content).toBe('Test Heading');

      const taskBlock = TaskListBlock.parseFromMarkdown('- [x] Test Task');
      expect(taskBlock).toBeInstanceOf(TaskListBlock);
      expect(taskBlock.content).toBe('Test Task');
      expect(taskBlock.isChecked()).toBe(true);
    });
  });
});
