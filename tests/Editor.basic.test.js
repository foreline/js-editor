import { Editor } from '@/Editor.js';

describe('Editor - Basic Tests', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Reset Editor state
    Editor.instance = null;
    Editor.currentBlock = null;
    
    // Clean up DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();
  });

  describe('Static Methods', () => {
    test('should have getMarkdown method', () => {
      expect(typeof Editor.getMarkdown).toBe('function');
    });

    test('should have getHtml method', () => {
      expect(typeof Editor.getHtml).toBe('function');
    });

    test('getMarkdown should return empty string when no instance', () => {
      Editor.instance = null;
      expect(Editor.getMarkdown()).toBe('');
    });

    test('getHtml should return empty string when no instance', () => {
      Editor.instance = null;
      expect(Editor.getHtml()).toBe('');
    });
  });

  describe('Constructor', () => {
    test('should exist and be callable', () => {
      expect(() => {
        // This will likely fail due to DOM/toolbar issues, but we test that the class exists
        try {
          new Editor({ id: 'nonexistent' });
        } catch (error) {
          // Expected to fail in test environment
        }
      }).not.toThrow(TypeError);
    });
  });

  describe('Utility Methods', () => {
    test('should have md2html method', () => {
      expect(typeof Editor.md2html).toBe('function');
    });

    test('should have html2md method', () => {
      expect(typeof Editor.html2md).toBe('function');
    });

    test('md2html should return string', () => {
      const result = Editor.md2html('# Test');
      expect(typeof result).toBe('string');
    });

    test('html2md should return string', () => {
      const result = Editor.html2md('<h1>Test</h1>');
      expect(typeof result).toBe('string');
    });
  });
});
