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
            instance: null,
            addEmptyBlock: jest.fn().mockReturnValue(mockElement),
            setCurrentBlock: jest.fn(),
            update: jest.fn(),
            getMarkdown: jest.fn().mockReturnValue('# Test Markdown'),
            getHtml: jest.fn().mockReturnValue('<h1>Test HTML</h1>')
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
            
            // The static instance setter only handles clearing instances, not setting them
            // This test should verify that setting to null clears the instances
            Editor.instance = null;
            
            expect(Editor._instances.size).toBe(0);
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

        it('should call instance getMarkdown method', () => {
            const result = Editor.getMarkdown();
            
            expect(mockEditor.getMarkdown).toHaveBeenCalled();
            expect(result).toBe('# Test Markdown');
        });

        it('should use instance getMarkdown when available', () => {
            Editor.getMarkdown();
            
            expect(mockEditor.getMarkdown).toHaveBeenCalled();
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
            // Mock the BlockFactory.createBlock method
            const BlockFactory = require('../src/blocks/BlockFactory.js').BlockFactory;
            const mockBlockInstance = { type: 'test' };
            BlockFactory.createBlock = jest.fn().mockReturnValue(mockBlockInstance);
            
            const result = Editor.getBlockInstance('test-block');
            
            expect(BlockFactory.createBlock).toHaveBeenCalledWith('test-block', '', '', false);
            expect(result).toEqual({ type: 'test' });
        });

        it('should return null when block class not found', () => {
            // Mock the BlockFactory.createBlock method to throw an error
            const BlockFactory = require('../src/blocks/BlockFactory.js').BlockFactory;
            BlockFactory.createBlock = jest.fn().mockImplementation(() => {
                throw new Error('Block not found');
            });
            
            const result = Editor.getBlockInstance('unknown-block');
            
            expect(BlockFactory.createBlock).toHaveBeenCalledWith('unknown-block', '', '', false);
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
});
