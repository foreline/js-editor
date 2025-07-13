import { CodeBlock } from '@/blocks/CodeBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';
import { Toolbar } from '@/Toolbar.js';

// Mock the Toolbar module
jest.mock('@/Toolbar.js', () => ({
  Toolbar: {
    code: jest.fn()
  }
}));

// Mock document.execCommand
Object.defineProperty(document, 'execCommand', {
  value: jest.fn(),
  writable: true,
});

describe('CodeBlock', () => {
  let codeBlock;

  beforeEach(() => {
    codeBlock = new CodeBlock();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new CodeBlock();
      expect(block).toBeInstanceOf(CodeBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.CODE);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
    });

    test('creates instance with custom parameters', () => {
      const content = 'console.log("Hello World");';
      const html = '<pre><code>console.log("Hello World");</code></pre>';
      const nested = true;
      
      const block = new CodeBlock(content, html, nested);
      expect(block.type).toBe(BlockType.CODE);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
    });
  });

  describe('handleKeyPress', () => {
    test('handles Tab key by preventing default and inserting tab character', () => {
      const event = {
        key: 'Tab',
        preventDefault: jest.fn()
      };
      const text = 'function example() {';

      const result = codeBlock.handleKeyPress(event, text);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '\t');
      expect(result).toBe(true);
    });

    test('does not handle non-Tab keys', () => {
      const event = {
        key: 'Enter',
        preventDefault: jest.fn()
      };
      const text = 'console.log("test");';

      const result = codeBlock.handleKeyPress(event, text);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(document.execCommand).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('handles other special keys correctly', () => {
      const keys = ['Space', 'Backspace', 'Delete', 'ArrowUp', 'ArrowDown'];
      
      keys.forEach(key => {
        const event = {
          key: key,
          preventDefault: jest.fn()
        };
        const text = 'some code';

        const result = codeBlock.handleKeyPress(event, text);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(result).toBe(false);
      });
    });

    test('handles Tab key with different text content', () => {
      const event = {
        key: 'Tab',
        preventDefault: jest.fn()
      };
      const text = '';

      const result = codeBlock.handleKeyPress(event, text);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '\t');
      expect(result).toBe(true);
    });
  });

  describe('handleEnterKey', () => {
    test('returns false to allow default behavior', () => {
      const event = {
        key: 'Enter',
        preventDefault: jest.fn()
      };

      const result = codeBlock.handleEnterKey(event);

      expect(result).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    test('handles Enter key consistently', () => {
      const events = [
        { key: 'Enter' },
        { key: 'Enter', shiftKey: true },
        { key: 'Enter', ctrlKey: true }
      ];

      events.forEach(event => {
        const result = codeBlock.handleEnterKey(event);
        expect(result).toBe(false);
      });
    });
  });

  describe('getMarkdownTriggers', () => {
    test('returns correct markdown triggers', () => {
      const triggers = CodeBlock.getMarkdownTriggers();
      expect(triggers).toEqual(['```', '~~~']);
      expect(triggers).toHaveLength(2);
      expect(triggers).toContain('```');
      expect(triggers).toContain('~~~');
    });

    test('triggers are static and immutable', () => {
      const triggers1 = CodeBlock.getMarkdownTriggers();
      const triggers2 = CodeBlock.getMarkdownTriggers();
      
      expect(triggers1).toEqual(triggers2);
      expect(triggers1).not.toBe(triggers2); // Different array instances
    });
  });

  describe('applyTransformation', () => {
    test('calls Toolbar.code method', () => {
      codeBlock.applyTransformation();
      expect(Toolbar.code).toHaveBeenCalledTimes(1);
      expect(Toolbar.code).toHaveBeenCalledWith();
    });

    test('can be called multiple times', () => {
      codeBlock.applyTransformation();
      codeBlock.applyTransformation();
      codeBlock.applyTransformation();
      
      expect(Toolbar.code).toHaveBeenCalledTimes(3);
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from BaseBlock', () => {
      expect(codeBlock).toBeInstanceOf(BaseBlock);
    });

    test('has correct block type', () => {
      expect(codeBlock.type).toBe(BlockType.CODE);
    });

    test('maintains type when content changes', () => {
      codeBlock.content = 'const x = 42;';
      expect(codeBlock.type).toBe(BlockType.CODE);
    });
  });

  describe('Content and HTML handling', () => {
    test('can set and get content', () => {
      const code = 'function hello() {\n  return "Hello, World!";\n}';
      codeBlock.content = code;
      expect(codeBlock.content).toBe(code);
    });

    test('can set and get HTML', () => {
      const html = '<pre><code>function hello() {\n  return "Hello, World!";\n}</code></pre>';
      codeBlock.html = html;
      expect(codeBlock.html).toBe(html);
    });

    test('can set and get nested status', () => {
      expect(codeBlock.nested).toBe(false);
      codeBlock.nested = true;
      expect(codeBlock.nested).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    test('handles empty text content with Tab key', () => {
      const event = {
        key: 'Tab',
        preventDefault: jest.fn()
      };

      const result = codeBlock.handleKeyPress(event, '');
      expect(result).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '\t');
    });

    test('handles null text content with Tab key', () => {
      const event = {
        key: 'Tab',
        preventDefault: jest.fn()
      };

      const result = codeBlock.handleKeyPress(event, null);
      expect(result).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '\t');
    });

    test('Tab behavior is consistent across different scenarios', () => {
      const scenarios = [
        { text: '', description: 'empty string' },
        { text: 'some code', description: 'existing code' },
        { text: '  indented', description: 'indented code' },
        { text: 'multi\nline', description: 'multiline code' }
      ];

      scenarios.forEach(({ text, description }) => {
        const event = {
          key: 'Tab',
          preventDefault: jest.fn()
        };

        const result = codeBlock.handleKeyPress(event, text);
        expect(result).toBe(true);
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });
  });
});
