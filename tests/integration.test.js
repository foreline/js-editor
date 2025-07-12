/**
 * Integration tests for the WYSIWYG editor.
 * Tests the interaction between different components.
 */
import { Editor } from '@/Editor.js';
import { Toolbar } from '@/Toolbar.js';
import { Parser } from '@/Parser.js';
import { Block } from '@/Block.js';
import { BlockType } from '@/BlockType.js';

describe('Integration Tests', () => {
  beforeEach(() => {
    // Create a clean DOM environment for each test
    document.body.innerHTML = '<div id="editor"></div>';
    
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock other browser functions
    document.execCommand = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
    
    // Reset Editor static properties
    Editor.instance = null;
    Editor.blocks = [];
    Editor.currentBlock = null;
    Editor.keybuffer = [];
  });

  afterEach(() => {
    console.log.mockRestore();
    console.warn.mockRestore();
    jest.clearAllMocks();
  });

  test('Editor initialization and toolbar integration', () => {
    // Initialize the editor
    new Editor({ id: 'editor' });
    
    // Verify editor has been properly initialized
    expect(Editor.instance).toBeTruthy();
    expect(Editor.instance.getAttribute('contenteditable')).toBe('true');
    
    // Test integration with toolbar
    Toolbar.bold();
    expect(document.execCommand).toHaveBeenCalledWith('bold');
    
    Toolbar.italic();
    expect(document.execCommand).toHaveBeenCalledWith('italic');
  });

  test('Editor markdown shortcut integration', () => {
    // Mock the Toolbar functions
    const originalToolbar = { ...Toolbar };
    Toolbar.h1 = jest.fn();
    
    // Initialize the editor
    new Editor({ id: 'editor' });
    
    // Set up current block with markdown syntax
    Editor.currentBlock = document.createElement('div');
    Editor.currentBlock.innerHTML = '# ';
    
    // Trigger key event that would normally trigger markdown parsing
    const keyEvent = { key: ' ' };
    Editor.key(keyEvent);
    
    // Check that the toolbar function was called
    expect(Toolbar.h1).toHaveBeenCalled();
    expect(Editor.currentBlock.innerHTML).toBe('');
    
    // Restore original toolbar
    Object.assign(Toolbar, originalToolbar);
  });

  test('Editor enter key handling and new block creation', () => {
    // Initialize the editor
    new Editor({ id: 'editor' });
    
    // Mock addBlock method to verify it's called
    const originalAddBlock = Editor.addBlock;
    Editor.addBlock = jest.fn().mockReturnValue(document.createElement('div'));
    
    // Set up current block
    Editor.currentBlock = document.createElement('div');
    
    // Create an enter key event
    const enterKeyEvent = { 
      key: 'Enter', 
      shiftKey: false,
      preventDefault: jest.fn()
    };
    
    // Trigger the enter key event
    Editor.checkKeys(enterKeyEvent);
    
    // Check that a new block was added
    expect(Editor.addBlock).toHaveBeenCalled();
    expect(enterKeyEvent.preventDefault).toHaveBeenCalled();
    
    // Restore original method
    Editor.addBlock = originalAddBlock;
  });

  test('Editor paste handling', () => {
    // Initialize the editor
    new Editor({ id: 'editor' });
    
    // Mock md2html method
    const originalMd2html = Editor.md2html;
    Editor.md2html = jest.fn().mockReturnValue('<p>Converted HTML</p>');
    
    // Create a paste event
    const pasteEvent = {
      clipboardData: {
        getData: jest.fn().mockReturnValue('# Markdown text')
      },
      preventDefault: jest.fn()
    };
    
    // Set up window.getSelection
    window.getSelection = jest.fn().mockReturnValue({
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        insertNode: jest.fn()
      })
    });
    
    // Create a mock for document.createRange
    document.createRange = jest.fn().mockReturnValue({
      createContextualFragment: jest.fn().mockReturnValue(document.createElement('div'))
    });
    
    // Trigger the paste event
    Editor.paste(pasteEvent);
    
    // Check that the clipboard text was converted to HTML
    expect(pasteEvent.clipboardData.getData).toHaveBeenCalledWith('text');
    expect(Editor.md2html).toHaveBeenCalledWith('# Markdown text');
    expect(pasteEvent.preventDefault).toHaveBeenCalled();
    
    // Restore original method
    Editor.md2html = originalMd2html;
  });
});
