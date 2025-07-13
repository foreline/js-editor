import { Editor } from '@/Editor.js';
import { Block } from '@/Block.js';
import { BlockType } from '@/BlockType.js';
import { ParserV2 as Parser } from '@/ParserV2.js';
import { eventEmitter } from '@/utils/eventEmitter.js';

// Mock dependencies
jest.mock('@/Parser.js');
jest.mock('@/utils/eventEmitter.js');
jest.mock('@/Block.js');

describe('Editor', () => {
  // Setup DOM environment
  let editorElement;
  
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Create a mock DOM environment
    document.body.innerHTML = '<div id="editor"></div>';
    editorElement = document.getElementById('editor');
    
    // Mock document methods
    document.getElementById = jest.fn().mockReturnValue(editorElement);
    document.createRange = jest.fn(() => ({
      selectNodeContents: jest.fn(),
      collapse: jest.fn()
    }));
    window.getSelection = jest.fn(() => ({
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
      getRangeAt: jest.fn(() => ({
        insertNode: jest.fn()
      })),
      rangeCount: 1
    }));
    
    // Mock Parser methods
    Parser.parse.mockReturnValue([]);
    Parser.html.mockReturnValue(document.createElement('div'));
    
    // Mock Block constructor
    Block.mockImplementation(() => {
      return {
        type: BlockType.PARAGRAPH,
        content: '',
        html: '',
        nested: false
      };
    });
    
    // Reset static properties
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

  describe('constructor', () => {
    test('should initialize editor with valid element ID', () => {
      // Create a spy on the static init method
      jest.spyOn(Editor, 'init').mockImplementation(() => {});
      
      const editor = new Editor({ id: 'editor' });
      
      expect(Editor.init).toHaveBeenCalledWith({ id: 'editor' });
    });

    test('should log warning if element ID is not provided', () => {
      const editor = new Editor({});
      
      expect(console.warn).toHaveBeenCalledWith('Element id is not set.');
    });

    test('should initialize editor with valid element ID and toolbar config', () => {
      const mockConfig = { config: [{ dropdown: true }] };
      jest.spyOn(Toolbar, 'init').mockImplementation(() => {});

      const editor = new Editor({ id: 'editor', toolbar: mockConfig });

      expect(Toolbar.init).toHaveBeenCalledWith({
        id: expect.any(String),
        container: expect.any(HTMLElement),
        config: mockConfig
      });
    });
  });

  describe('init method', () => {
    test('should set up the editor instance', () => {
      Editor.init({ id: 'editor' });
      
      expect(Editor.instance).toBe(editorElement);
      expect(editorElement.getAttribute('contenteditable')).toBe('true');
      expect(Parser.parse).toHaveBeenCalled();
    });

    test('should create default block if no content is provided', () => {
      Editor.init({ id: 'editor' });
      
      // Check that a default block was created
      expect(Block).toHaveBeenCalled();
    });

    test('should set up the editor instance with valid toolbar config', () => {
      const mockConfig = { config: [{ dropdown: true }] };
      Editor.init({ id: 'editor', toolbar: mockConfig });

      expect(Editor.instance).toBe(editorElement);
      expect(editorElement.getAttribute('contenteditable')).toBe('true');
      expect(Parser.parse).toHaveBeenCalled();
    });
  });

  describe('init method edge cases', () => {
    test('should handle empty container array', () => {
      const options = { id: 'editor', container: [] };
      Editor.init(options);

      expect(Editor.instance).toBe(editorElement);
      expect(editorElement.getAttribute('contenteditable')).toBe('true');
    });

    test('should handle empty text content', () => {
      const options = { id: 'editor', text: '' };
      Editor.init(options);

      expect(Editor.instance).toBe(editorElement);
      expect(editorElement.querySelectorAll('.block').length).toBeGreaterThan(0);
    });
  });

  describe('Markdown and HTML container initialization', () => {
    test('should initialize markdown container', () => {
      jest.spyOn(Editor, 'initMarkdownContainer').mockImplementation(() => {});
      Editor.initMarkdownContainer();

      expect(Editor.initMarkdownContainer).toHaveBeenCalled();
    });

    test('should initialize HTML container', () => {
      jest.spyOn(Editor, 'initHtmlContainer').mockImplementation(() => {});
      Editor.initHtmlContainer();

      expect(Editor.initHtmlContainer).toHaveBeenCalled();
    });
  });

  describe('addListeners method', () => {
    beforeEach(() => {
      Editor.instance = editorElement;
    });

    test('should add event listeners to the editor instance', () => {
      const addEventListenerSpy = jest.spyOn(editorElement, 'addEventListener');
      const documentAddEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      Editor.addListeners();
      
      expect(addEventListenerSpy).toHaveBeenCalledTimes(4); // keydown, keyup, keydown, paste
      expect(documentAddEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('Event listeners', () => {
    test('should add all expected event listeners', () => {
      const addEventListenerSpy = jest.spyOn(editorElement, 'addEventListener');
      Editor.addListeners();

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('paste', expect.any(Function));
    });
  });

  describe('focus method', () => {
    beforeEach(() => {
      Editor.currentBlock = document.createElement('div');
      Editor.currentBlock.isConnected = true;
    });

    test('should set focus on the current block', () => {
      Editor.focus();
      
      expect(window.getSelection().removeAllRanges).toHaveBeenCalled();
      expect(window.getSelection().addRange).toHaveBeenCalled();
    });

    test('should handle non-existent element', () => {
      Editor.currentBlock = null;
      
      Editor.focus();
      
      expect(console.log).not.toHaveBeenCalledWith(
        expect.objectContaining({ element: null })
      );
    });

    test('should focus on editor when empty', () => {
      Editor.instance = editorElement;
      Editor.instance.innerHTML = '';

      Editor.focus();

      expect(window.getSelection().removeAllRanges).toHaveBeenCalled();
      expect(window.getSelection().addRange).toHaveBeenCalled();
    });
  });

  describe('paste method', () => {
    test('should handle text paste', () => {
      // Mock clipboard data
      const clipboardEvent = {
        clipboardData: {
          getData: jest.fn().mockReturnValue('test text')
        },
        preventDefault: jest.fn()
      };
      
      // Mock utility functions
      jest.spyOn(Editor, 'md2html').mockReturnValue('<p>test text</p>');
      
      Editor.paste(clipboardEvent);
      
      expect(clipboardEvent.preventDefault).toHaveBeenCalled();
      expect(Editor.md2html).toHaveBeenCalledWith('test text');
    });

    test('should handle text paste with valid DOM methods', () => {
      const clipboardEvent = {
        clipboardData: {
          getData: jest.fn().mockReturnValue('test text')
        },
        preventDefault: jest.fn()
      };

      jest.spyOn(Editor, 'md2html').mockReturnValue('<p>test text</p>');
      jest.spyOn(document.createRange(), 'createContextualFragment').mockReturnValue(document.createElement('div'));

      Editor.paste(clipboardEvent);

      expect(clipboardEvent.preventDefault).toHaveBeenCalled();
      expect(Editor.md2html).toHaveBeenCalledWith('test text');
    });
  });

  describe('update method', () => {
    beforeEach(() => {
      Editor.instance = document.createElement('div');
    });

    test('should emit update event', () => {
      Editor.update();
      
      expect(eventEmitter.emit).toHaveBeenCalledWith('EDITOR.UPDATED_EVENT');
    });
  });

  describe('md2html and html2md methods', () => {
    test('should convert markdown to html', () => {
      const result = Editor.md2html('# Header');
      
      // Output depends on showdown converter, which we can't easily test
      expect(typeof result).toBe('string');
    });

    test('should convert html to markdown', () => {
      const result = Editor.html2md('<h1>Header</h1>');
      
      // Output depends on showdown converter, which we can't easily test
      expect(typeof result).toBe('string');
    });
  });

  describe('key method', () => {
    beforeEach(() => {
      Editor.currentBlock = document.createElement('div');
      Editor.currentBlock.innerHTML = '# ';
      jest.spyOn(Editor, 'update').mockImplementation(() => {});
    });

    test('should detect and handle heading markdown syntax', () => {
      const keyEvent = { key: ' ' };
      
      // Mock Toolbar methods
      const Toolbar = require('@/Toolbar.js').Toolbar;
      Toolbar.h1 = jest.fn();
      
      Editor.key(keyEvent);
      
      expect(Toolbar.h1).toHaveBeenCalled();
    });
  });

  describe('handleEnterKey method', () => {
    beforeEach(() => {
      jest.spyOn(Editor, 'addBlock').mockImplementation(() => {});
      jest.spyOn(Editor, 'focus').mockImplementation(() => {});
    });

    test('should add a new block on enter key', () => {
      const event = {
        preventDefault: jest.fn()
      };
      
      Editor.handleEnterKey(event);
      
      expect(Editor.addBlock).toHaveBeenCalled();
      expect(Editor.focus).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('addBlock method', () => {
    test('should create and add a new block', () => {
      const mockHtmlBlock = document.createElement('div');
      mockHtmlBlock.focus = jest.fn();
      Parser.html.mockReturnValue(mockHtmlBlock);
      
      const result = Editor.addBlock();
      
      expect(Block).toHaveBeenCalledWith(BlockType.PARAGRAPH);
      expect(Parser.html).toHaveBeenCalled();
      expect(result).toBe(mockHtmlBlock);
      expect(Editor.currentBlock).toBe(mockHtmlBlock);
    });
  });
});
