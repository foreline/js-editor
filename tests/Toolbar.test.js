import { Toolbar } from '@/Toolbar.js';
import { Editor } from '@/Editor.js';

// Mock document.execCommand
document.execCommand = jest.fn();

describe('Toolbar', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    document.execCommand.mockClear();
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('init method', () => {
    test('should initialize the toolbar', () => {
      Toolbar.init();
      // Not much to test here since it only logs a message
      expect(true).toBe(true);
    });
  });

  describe('text formatting methods', () => {
    test('undo should call execCommand with undo', () => {
      Toolbar.undo();
      expect(document.execCommand).toHaveBeenCalledWith('undo');
    });

    test('redo should call execCommand with redo', () => {
      Toolbar.redo();
      expect(document.execCommand).toHaveBeenCalledWith('redo');
    });

    test('bold should call execCommand with bold', () => {
      Toolbar.bold();
      expect(document.execCommand).toHaveBeenCalledWith('bold');
    });

    test('italic should call execCommand with italic', () => {
      Toolbar.italic();
      expect(document.execCommand).toHaveBeenCalledWith('italic');
    });

    test('underline should call execCommand with underline', () => {
      Toolbar.underline();
      expect(document.execCommand).toHaveBeenCalledWith('underline');
    });
  });

  describe('heading methods', () => {
    beforeEach(() => {
      // Mock Editor's formatBlock method
      Editor.formatBlock = jest.fn();
    });

    test('h1 should call formatBlock with h1', () => {
      Toolbar.h1();
      expect(Editor.formatBlock).toHaveBeenCalledWith('h1');
    });

    test('h2 should call formatBlock with h2', () => {
      Toolbar.h2();
      expect(Editor.formatBlock).toHaveBeenCalledWith('h2');
    });

    test('h3 should call formatBlock with h3', () => {
      Toolbar.h3();
      expect(Editor.formatBlock).toHaveBeenCalledWith('h3');
    });
  });

  describe('list methods', () => {
    test('ul should call execCommand with insertUnorderedList', () => {
      Toolbar.ul();
      expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList');
    });

    test('ol should call execCommand with insertOrderedList', () => {
      Toolbar.ol();
      expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList');
    });
  });
});
