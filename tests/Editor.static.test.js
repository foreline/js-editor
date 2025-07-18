'use strict';

import { Editor } from '../src/Editor.js';
import { Parser } from '../src/Parser.js';

// Mock dependencies  
jest.mock('../src/Parser.js');
jest.mock('../src/Toolbar.js');
jest.mock('../src/KeyHandler.js');
jest.mock('../src/utils/eventEmitter.js');
jest.mock('../src/blocks/BlockFactory.js');
jest.mock('../src/Utils.js');
jest.mock('../src/utils/log.js');

describe('Editor Static Methods', () => {
    let mockElement;
    let mockEditor;

    beforeEach(() => {
        // Clear the instances registry
        Editor._instances.clear();
        Editor._fallbackBlocks = [];

        mockElement = {
            id: 'test-editor',
            innerHTML: '<p>Test content</p>',
            querySelector: jest.fn(),
            querySelectorAll: jest.fn().mockReturnValue([])
        };

        mockEditor = {
            keybuffer: ['a', 'b'],
            currentBlock: mockElement,
            blocks: [{ type: 'p' }],
            addEmptyBlock: jest.fn().mockReturnValue(mockElement),
            setCurrentBlock: jest.fn(),
            update: jest.fn()
        };

        // Setup document mocks
        document.getElementById = jest.fn().mockReturnValue(mockElement);
        document.createElement = jest.fn().mockReturnValue({
            id: '',
            className: '',
            appendChild: jest.fn()
        });
        document.querySelector = jest.fn();

        // Setup Parser mocks
        Parser.md2html = jest.fn().mockReturnValue('<h1>Test HTML</h1>');
        Parser.html2md = jest.fn().mockReturnValue('# Test Markdown');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('static property getters with instances', () => {
        beforeEach(() => {
            Editor._instances.set(mockElement, mockEditor);
        });

        it('should get instance from first registered editor', () => {
            const result = Editor.instance;
            expect(result).toBe(mockElement);
        });

        it('should set instance on first registered editor', () => {
            const newElement = { id: 'new-editor' };
            Editor.instance = newElement;
            
            expect(mockEditor.instance).toBe(newElement);
        });

        it('should get currentBlock from first registered editor', () => {
            const result = Editor.currentBlock;
            expect(result).toBe(mockElement);
        });

        it('should set currentBlock on first registered editor', () => {
            const newBlock = { id: 'new-block' };
            Editor.currentBlock = newBlock;
            
            expect(mockEditor.currentBlock).toBe(newBlock);
        });

        it('should get keybuffer from first registered editor', () => {
            const result = Editor.keybuffer;
            expect(result).toEqual(['a', 'b']);
        });

        it('should set keybuffer on first registered editor', () => {
            const newBuffer = ['x', 'y', 'z'];
            Editor.keybuffer = newBuffer;
            
            expect(mockEditor.keybuffer).toEqual(newBuffer);
        });

        it('should get blocks from first registered editor', () => {
            const result = Editor.blocks;
            expect(result).toEqual([{ type: 'p' }]);
        });

        it('should set blocks on first registered editor', () => {
            const newBlocks = [{ type: 'h1' }];
            Editor.blocks = newBlocks;
            
            expect(mockEditor.blocks).toEqual(newBlocks);
        });
    });

    describe('static property getters without instances', () => {
        it('should return null for instance when no editors exist', () => {
            const result = Editor.instance;
            expect(result).toBeNull();
        });

        it('should do nothing when setting instance with no editors', () => {
            Editor.instance = mockElement;
            // Should not throw error
        });

        it('should return null for currentBlock when no editors exist', () => {
            const result = Editor.currentBlock;
            expect(result).toBeNull();
        });

        it('should do nothing when setting currentBlock with no editors', () => {
            Editor.currentBlock = mockElement;
            // Should not throw error
        });

        it('should return empty array for keybuffer when no editors exist', () => {
            const result = Editor.keybuffer;
            expect(result).toEqual([]);
        });

        it('should do nothing when setting keybuffer with no editors', () => {
            Editor.keybuffer = ['a', 'b'];
            // Should not throw error
        });

        it('should return fallback blocks when no editors exist', () => {
            Editor._fallbackBlocks = [{ type: 'fallback' }];
            const result = Editor.blocks;
            expect(result).toEqual([{ type: 'fallback' }]);
        });

        it('should set fallback blocks when no editors exist', () => {
            const newBlocks = [{ type: 'new-fallback' }];
            Editor.blocks = newBlocks;
            expect(Editor._fallbackBlocks).toEqual(newBlocks);
        });
    });

    describe('static backward compatibility methods', () => {
        beforeEach(() => {
            Editor._instances.set(mockElement, mockEditor);
        });

        it('should call addEmptyBlock on first editor instance', () => {
            const result = Editor.addEmptyBlock();
            
            expect(mockEditor.addEmptyBlock).toHaveBeenCalled();
            expect(result).toBe(mockElement);
        });

        it('should return undefined when no editor instances exist', () => {
            Editor._instances.clear();
            
            const result = Editor.addEmptyBlock();
            
            expect(result).toBeUndefined();
        });

        it('should call setCurrentBlock on first editor instance', () => {
            const newBlock = { id: 'new-block' };
            
            Editor.setCurrentBlock(newBlock);
            
            expect(mockEditor.setCurrentBlock).toHaveBeenCalledWith(newBlock);
        });

        it('should do nothing when setCurrentBlock called with no instances', () => {
            Editor._instances.clear();
            
            Editor.setCurrentBlock(mockElement);
            // Should not throw error
        });

        it('should call update on first editor instance', () => {
            Editor.update();
            
            expect(mockEditor.update).toHaveBeenCalled();
        });

        it('should do nothing when update called with no instances', () => {
            Editor._instances.clear();
            
            Editor.update();
            // Should not throw error
        });
    });

    describe('getMarkdown', () => {
        beforeEach(() => {
            Editor._instances.set(mockElement, mockEditor);
            mockElement.innerHTML = '<h1>Test HTML</h1>';
        });

        it('should convert HTML to markdown using Parser', () => {
            const result = Editor.getMarkdown();
            
            expect(Parser.html2md).toHaveBeenCalledWith('<h1>Test HTML</h1>');
            expect(result).toBe('# Test Markdown');
        });

        it('should use instance HTML when available', () => {
            Editor.getMarkdown();
            
            expect(Parser.html2md).toHaveBeenCalledWith('<h1>Test HTML</h1>');
        });

        it('should return empty string when no instances', () => {
            Editor._instances.clear();
            
            const result = Editor.getMarkdown();
            
            expect(result).toBe('');
        });
    });

    describe('getHtml', () => {
        beforeEach(() => {
            Editor._instances.set(mockElement, mockEditor);
            mockElement.innerHTML = '<h1>Test HTML</h1>';
        });

        it('should return HTML content from instance', () => {
            const result = Editor.getHtml();
            
            expect(result).toBe('<h1>Test HTML</h1>');
        });

        it('should return empty string when no instances', () => {
            Editor._instances.clear();
            
            const result = Editor.getHtml();
            
            expect(result).toBe('');
        });
    });

    describe('getBlockInstance', () => {
        it('should return block instance for given block type', () => {
            const mockBlockClass = jest.fn().mockImplementation(() => ({ type: 'test' }));
            
            const getBlockClassSpy = jest.spyOn(Editor, 'getBlockClass').mockReturnValue(mockBlockClass);
            
            const result = Editor.getBlockInstance('test-block');
            
            expect(getBlockClassSpy).toHaveBeenCalledWith('test-block');
            expect(mockBlockClass).toHaveBeenCalled();
            expect(result).toEqual({ type: 'test' });
        });

        it('should return null when block class not found', () => {
            const getBlockClassSpy = jest.spyOn(Editor, 'getBlockClass').mockReturnValue(null);
            
            const result = Editor.getBlockInstance('unknown-block');
            
            expect(getBlockClassSpy).toHaveBeenCalledWith('unknown-block');
            expect(result).toBeNull();
        });
    });

    describe('getBlockClass', () => {
        it('should return block class for paragraph', () => {
            const BlockFactory = require('../src/blocks/BlockFactory.js').BlockFactory;
            const mockParagraphBlock = class ParagraphBlock {};
            BlockFactory.getBlockClass = jest.fn().mockReturnValue(mockParagraphBlock);
            
            const result = Editor.getBlockClass('p');
            
            expect(BlockFactory.getBlockClass).toHaveBeenCalledWith('p');
            expect(result).toBe(mockParagraphBlock);
        });

        it('should return null for unknown block type', () => {
            const BlockFactory = require('../src/blocks/BlockFactory.js').BlockFactory;
            BlockFactory.getBlockClass = jest.fn().mockReturnValue(null);
            
            const result = Editor.getBlockClass('unknown');
            
            expect(BlockFactory.getBlockClass).toHaveBeenCalledWith('unknown');
            expect(result).toBeNull();
        });
    });

    describe('legacy static methods (deprecated)', () => {
        beforeEach(() => {
            Editor._instances.set(mockElement, mockEditor);
            
            // Mock Toolbar for legacy methods
            const Toolbar = require('../src/Toolbar.js').Toolbar;
            Toolbar.ul = jest.fn();
            Toolbar.ol = jest.fn();
            Toolbar.sq = jest.fn();
            Toolbar.h1 = jest.fn();
            Toolbar.h2 = jest.fn();
            Toolbar.h3 = jest.fn();
            Toolbar.h4 = jest.fn();
            Toolbar.h5 = jest.fn();
            Toolbar.h6 = jest.fn();
            Toolbar.code = jest.fn();
            
            // Mock Utils
            const Utils = require('../src/Utils.js').Utils;
            Utils.stripTags = jest.fn().mockReturnValue('test content');
        });

        describe('key method', () => {
            it('should handle unordered list trigger', () => {
                const Toolbar = require('../src/Toolbar.js').Toolbar;
                const Utils = require('../src/Utils.js').Utils;
                Utils.stripTags.mockReturnValue('* ');
                
                const mockEvent = { key: ' ' };
                Editor.currentBlock = { innerHTML: '* ' };
                
                Editor.key(mockEvent);
                
                expect(Toolbar.ul).toHaveBeenCalled();
                expect(Editor.currentBlock.innerHTML).toBe('');
            });

            it('should handle ordered list trigger', () => {
                const Toolbar = require('../src/Toolbar.js').Toolbar;
                const Utils = require('../src/Utils.js').Utils;
                Utils.stripTags.mockReturnValue('1 ');
                
                const mockEvent = { key: ' ' };
                Editor.currentBlock = { innerHTML: '1 ' };
                
                Editor.key(mockEvent);
                
                expect(Toolbar.ol).toHaveBeenCalled();
            });

            it('should handle task list trigger', () => {
                const Toolbar = require('../src/Toolbar.js').Toolbar;
                const Utils = require('../src/Utils.js').Utils;
                Utils.stripTags.mockReturnValue('[] ');
                
                const mockEvent = { key: ' ' };
                Editor.currentBlock = { innerHTML: '[] ' };
                
                Editor.key(mockEvent);
                
                expect(Toolbar.sq).toHaveBeenCalled();
            });

            it('should handle h1 trigger', () => {
                const Toolbar = require('../src/Toolbar.js').Toolbar;
                const Utils = require('../src/Utils.js').Utils;
                Utils.stripTags.mockReturnValue('# ');
                
                const mockEvent = { key: ' ' };
                Editor.currentBlock = { innerHTML: '# ' };
                
                Editor.key(mockEvent);
                
                expect(Toolbar.h1).toHaveBeenCalled();
            });

            it('should handle h2 trigger', () => {
                const Toolbar = require('../src/Toolbar.js').Toolbar;
                const Utils = require('../src/Utils.js').Utils;
                Utils.stripTags.mockReturnValue('## ');
                
                const mockEvent = { key: ' ' };
                Editor.currentBlock = { innerHTML: '## ' };
                
                Editor.key(mockEvent);
                
                expect(Toolbar.h2).toHaveBeenCalled();
            });

            it('should handle h6 trigger', () => {
                const Toolbar = require('../src/Toolbar.js').Toolbar;
                const Utils = require('../src/Utils.js').Utils;
                Utils.stripTags.mockReturnValue('###### ');
                
                const mockEvent = { key: ' ' };
                Editor.currentBlock = { innerHTML: '###### ' };
                
                Editor.key(mockEvent);
                
                expect(Toolbar.h6).toHaveBeenCalled();
            });

            it('should call update after processing', () => {
                const mockEvent = { key: 'a' };
                
                Editor.key(mockEvent);
                
                expect(mockEditor.update).toHaveBeenCalled();
            });
        });

        describe('checkKeys method', () => {
            it('should handle Enter key', () => {
                const mockEvent = { key: 'Enter', shiftKey: false };
                const handleEnterKeySpy = jest.spyOn(Editor, 'handleEnterKey').mockImplementation();
                
                Editor.checkKeys(mockEvent);
                
                expect(handleEnterKeySpy).toHaveBeenCalledWith(mockEvent);
            });

            it('should not handle Enter with shift key', () => {
                const mockEvent = { key: 'Enter', shiftKey: true };
                const handleEnterKeySpy = jest.spyOn(Editor, 'handleEnterKey').mockImplementation();
                
                Editor.checkKeys(mockEvent);
                
                expect(handleEnterKeySpy).not.toHaveBeenCalled();
            });
        });

        describe('handleEnterKey method', () => {
            beforeEach(() => {
                const Toolbar = require('../src/Toolbar.js').Toolbar;
                Toolbar.code = jest.fn();
            });

            it('should create code block when triple backticks detected', () => {
                const Toolbar = require('../src/Toolbar.js').Toolbar;
                Editor.keybuffer = ['`', '`', '`'];
                
                const mockEvent = { key: 'Enter' };
                
                Editor.handleEnterKey(mockEvent);
                
                expect(Toolbar.code).toHaveBeenCalled();
            });

            it('should add empty block when no backticks', () => {
                Editor.keybuffer = [];
                
                const mockEvent = { 
                    key: 'Enter',
                    preventDefault: jest.fn()
                };
                
                Editor.handleEnterKey(mockEvent);
                
                expect(mockEditor.addEmptyBlock).toHaveBeenCalled();
                expect(mockEvent.preventDefault).toHaveBeenCalled();
            });

            it('should handle mixed keybuffer with backticks', () => {
                const Toolbar = require('../src/Toolbar.js').Toolbar;
                Editor.keybuffer = ['a', '`', '`', '`', 'b'];
                
                const mockEvent = { key: 'Enter' };
                
                Editor.handleEnterKey(mockEvent);
                
                expect(Toolbar.code).toHaveBeenCalled();
            });

            it('should stop counting at Enter key', () => {
                Editor.keybuffer = ['`', '`', 'Enter', '`'];
                
                const mockEvent = { 
                    key: 'Enter',
                    preventDefault: jest.fn()
                };
                
                Editor.handleEnterKey(mockEvent);
                
                expect(mockEditor.addEmptyBlock).toHaveBeenCalled();
            });
        });
    });
});
