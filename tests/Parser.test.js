import { Parser } from '@/Parser.js';
import { Block } from '@/Block.js';
import { BlockType } from '@/BlockType.js';

// Mock DOM elements for testing
global.document = {
  createElement: jest.fn(() => ({
    classList: {
      add: jest.fn()
    },
    setAttribute: jest.fn(),
    innerHTML: ''
  }))
};

describe('Parser', () => {
  beforeEach(() => {
    // Reset the mock implementation for each test
    document.createElement.mockClear();
  });

  describe('parse method', () => {
    test('should parse simple paragraph HTML', () => {
      // Mock log function to prevent console outputs during tests
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const htmlString = '<p>Hello World</p>';
      const result = Parser.parse(htmlString);
      
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
      const result = Parser.parse(htmlString);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('h1');
      expect(result[0].content).toBe('Title');
      
      console.log.mockRestore();
    });

    test('should parse multiple blocks', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const htmlString = '<h1>Title</h1><p>Paragraph</p>';
      const result = Parser.parse(htmlString);
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('h1');
      expect(result[1].type).toBe('p');
      
      console.log.mockRestore();
    });

    test('should handle empty HTML', () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const htmlString = '';
      const result = Parser.parse(htmlString);
      
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
