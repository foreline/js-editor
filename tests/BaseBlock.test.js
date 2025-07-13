import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';

describe('BaseBlock', () => {
  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new BaseBlock();
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.PARAGRAPH);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
    });

    test('creates instance with custom parameters', () => {
      const type = BlockType.H1;
      const content = 'Test content';
      const html = '<h1>Test content</h1>';
      const nested = true;
      
      const block = new BaseBlock(type, content, html, nested);
      expect(block.type).toBe(type);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
    });

    test('defaults to paragraph type when empty type provided', () => {
      const block = new BaseBlock('', 'content', 'html', false);
      expect(block.type).toBe(BlockType.PARAGRAPH);
    });

    test('converts HTML tag to block type when not a valid BlockType', () => {
      const block = new BaseBlock('h1', 'content', 'html', false);
      expect(block.type).toBe(BlockType.H1);
    });

    test('preserves valid BlockType values', () => {
      const validTypes = [
        BlockType.H1, BlockType.H2, BlockType.H3, BlockType.H4, BlockType.H5, BlockType.H6,
        BlockType.PARAGRAPH, BlockType.CODE, BlockType.DELIMITER, BlockType.QUOTE,
        BlockType.UL, BlockType.OL, BlockType.SQ, BlockType.TABLE, BlockType.IMAGE
      ];

      validTypes.forEach(type => {
        const block = new BaseBlock(type);
        expect(block.type).toBe(type);
      });
    });
  });

  describe('Property Getters and Setters', () => {
    let block;

    beforeEach(() => {
      block = new BaseBlock();
    });

    describe('type property', () => {
      test('can get and set type', () => {
        expect(block.type).toBe(BlockType.PARAGRAPH);
        
        block.type = BlockType.H1;
        expect(block.type).toBe(BlockType.H1);
      });

      test('type setter updates internal _type', () => {
        block.type = BlockType.CODE;
        expect(block._type).toBe(BlockType.CODE);
      });
    });

    describe('content property', () => {
      test('can get and set content', () => {
        expect(block.content).toBe('');
        
        const content = 'This is test content';
        block.content = content;
        expect(block.content).toBe(content);
      });

      test('content setter updates internal _content', () => {
        const content = 'Test content';
        block.content = content;
        expect(block._content).toBe(content);
      });
    });

    describe('html property', () => {
      test('can get and set html', () => {
        expect(block.html).toBe('');
        
        const html = '<p>This is test HTML</p>';
        block.html = html;
        expect(block.html).toBe(html);
      });

      test('html setter updates internal _html', () => {
        const html = '<h1>Test HTML</h1>';
        block.html = html;
        expect(block._html).toBe(html);
      });
    });

    describe('nested property', () => {
      test('can get and set nested', () => {
        expect(block.nested).toBe(false);
        
        block.nested = true;
        expect(block.nested).toBe(true);
      });

      test('nested setter updates internal _nested', () => {
        block.nested = true;
        expect(block._nested).toBe(true);
        
        block.nested = false;
        expect(block._nested).toBe(false);
      });
    });
  });

  describe('Default Method Implementations', () => {
    let block;

    beforeEach(() => {
      block = new BaseBlock();
    });

    test('handleKeyPress returns false by default', () => {
      const event = { key: 'Enter' };
      const result = block.handleKeyPress(event, 'some text');
      expect(result).toBe(false);
    });

    test('handleEnterKey returns false by default', () => {
      const event = { key: 'Enter' };
      const result = block.handleEnterKey(event);
      expect(result).toBe(false);
    });

    test('applyTransformation does nothing by default', () => {
      expect(() => block.applyTransformation()).not.toThrow();
    });
  });

  describe('Static Method Defaults', () => {
    test('getMarkdownTriggers returns empty array by default', () => {
      const triggers = BaseBlock.getMarkdownTriggers();
      expect(triggers).toEqual([]);
    });

    test('matchesMarkdownTrigger returns false by default', () => {
      const result = BaseBlock.matchesMarkdownTrigger('# ');
      expect(result).toBe(false);
    });

    test('getToolbarConfig returns null by default', () => {
      const config = BaseBlock.getToolbarConfig();
      expect(config).toBeNull();
    });

    test('getDisabledButtons returns empty array by default', () => {
      const disabled = BaseBlock.getDisabledButtons();
      expect(disabled).toEqual([]);
    });
  });

  describe('Interface Compliance', () => {
    test('has all required instance properties', () => {
      const block = new BaseBlock();
      
      expect(block).toHaveProperty('type');
      expect(block).toHaveProperty('content');
      expect(block).toHaveProperty('html');
      expect(block).toHaveProperty('nested');
    });

    test('has all required instance methods', () => {
      const block = new BaseBlock();
      
      expect(typeof block.handleKeyPress).toBe('function');
      expect(typeof block.handleEnterKey).toBe('function');
      expect(typeof block.applyTransformation).toBe('function');
    });

    test('has all required static methods', () => {
      expect(typeof BaseBlock.getMarkdownTriggers).toBe('function');
      expect(typeof BaseBlock.matchesMarkdownTrigger).toBe('function');
      expect(typeof BaseBlock.getToolbarConfig).toBe('function');
      expect(typeof BaseBlock.getDisabledButtons).toBe('function');
    });
  });

  describe('State Management', () => {
    test('maintains independent state across instances', () => {
      const block1 = new BaseBlock(BlockType.H1, 'Content 1', '<h1>Content 1</h1>', false);
      const block2 = new BaseBlock(BlockType.PARAGRAPH, 'Content 2', '<p>Content 2</p>', true);
      
      expect(block1.type).toBe(BlockType.H1);
      expect(block1.content).toBe('Content 1');
      expect(block1.nested).toBe(false);
      
      expect(block2.type).toBe(BlockType.PARAGRAPH);
      expect(block2.content).toBe('Content 2');
      expect(block2.nested).toBe(true);
      
      // Modifying one shouldn't affect the other
      block1.content = 'Modified Content 1';
      expect(block2.content).toBe('Content 2');
    });

    test('allows property updates after construction', () => {
      const block = new BaseBlock();
      
      block.type = BlockType.CODE;
      block.content = 'const x = 42;';
      block.html = '<pre><code>const x = 42;</code></pre>';
      block.nested = true;
      
      expect(block.type).toBe(BlockType.CODE);
      expect(block.content).toBe('const x = 42;');
      expect(block.html).toBe('<pre><code>const x = 42;</code></pre>');
      expect(block.nested).toBe(true);
    });
  });
});
