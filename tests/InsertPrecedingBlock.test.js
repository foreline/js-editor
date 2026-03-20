/**
 * Tests for the Insert Preceding Block feature.
 * Verifies that pressing Enter at the beginning of a non-empty block
 * inserts a new paragraph block before the current block.
 * 
 * @see docs/adr/01. INSERT_PRECEDING_BLOCK.md
 */

import { Editor } from '../src/Editor.js';
import { KeyHandler } from '../src/KeyHandler.js';
import { BlockType } from '../src/BlockType.js';

describe('Insert Preceding Block', () => {
    describe('KeyHandler.isCursorAtStartOfBlock', () => {
        it('should return false when range is null', () => {
            const block = document.createElement('div');
            expect(KeyHandler.isCursorAtStartOfBlock(block, null)).toBe(false);
        });

        it('should return false when block is null', () => {
            const range = {
                collapsed: true,
                cloneRange: jest.fn()
            };
            expect(KeyHandler.isCursorAtStartOfBlock(null, range)).toBe(false);
        });

        it('should return false when range is not collapsed', () => {
            const block = document.createElement('div');
            const range = {
                collapsed: false,
                cloneRange: jest.fn()
            };
            expect(KeyHandler.isCursorAtStartOfBlock(block, range)).toBe(false);
        });

        it('should return true when cursor position is 0', () => {
            const block = document.createElement('div');
            const range = {
                collapsed: true,
                startContainer: block,
                startOffset: 0,
                cloneRange: () => ({
                    selectNodeContents: jest.fn(),
                    setEnd: jest.fn(),
                    toString: () => ''
                })
            };
            expect(KeyHandler.isCursorAtStartOfBlock(block, range)).toBe(true);
        });

        it('should return false when cursor is not at start', () => {
            const block = document.createElement('div');
            const range = {
                collapsed: true,
                startContainer: block,
                startOffset: 5,
                cloneRange: () => ({
                    selectNodeContents: jest.fn(),
                    setEnd: jest.fn(),
                    toString: () => 'Hello'
                })
            };
            expect(KeyHandler.isCursorAtStartOfBlock(block, range)).toBe(false);
        });
    });

    describe('Editor.addDefaultBlockBefore', () => {
        let mockEditor;
        let mockStateMachine;
        let mockEventEmitter;
        let mockInstance;
        let mockCurrentBlock;

        beforeEach(() => {
            jest.spyOn(console, 'log').mockImplementation(() => {});
            jest.spyOn(console, 'warn').mockImplementation(() => {});

            mockStateMachine = {
                isCreating: false,
                startCreating: jest.fn(function() { this.isCreating = true; }),
                finishCreating: jest.fn(function() { this.isCreating = false; }),
                isBusy: jest.fn(() => false)
            };

            mockEventEmitter = {
                emit: jest.fn()
            };

            mockCurrentBlock = document.createElement('div');
            mockCurrentBlock.textContent = 'Existing content';

            mockInstance = document.createElement('div');
            mockInstance.appendChild(mockCurrentBlock);

            mockEditor = Object.create(Editor.prototype);
            mockEditor._stateMachine = mockStateMachine;
            mockEditor.eventEmitter = mockEventEmitter;
            mockEditor._blockMap = new WeakMap();
            mockEditor.instance = mockInstance;
            mockEditor.currentBlock = mockCurrentBlock;
        });

        afterEach(() => {
            console.log.mockRestore();
            console.warn.mockRestore();
        });

        it('should return a new block element', () => {
            const newBlock = mockEditor.addDefaultBlockBefore();
            expect(newBlock).toBeTruthy();
        });

        it('should set data-block-id and data-timestamp on the new block', () => {
            const newBlock = mockEditor.addDefaultBlockBefore();
            expect(newBlock.getAttribute('data-block-id')).toBeTruthy();
            expect(newBlock.getAttribute('data-timestamp')).toBeTruthy();
        });

        it('should start and finish the state machine creating flag', async () => {
            mockEditor.addDefaultBlockBefore();
            expect(mockStateMachine.startCreating).toHaveBeenCalled();

            // finishCreating is called in requestAnimationFrame
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(mockStateMachine.finishCreating).toHaveBeenCalled();
        });

        it('should emit BLOCK_CREATED event', () => {
            mockEditor.addDefaultBlockBefore();
            expect(mockEventEmitter.emit).toHaveBeenCalledWith(
                'block.created',
                expect.objectContaining({
                    blockId: expect.any(String),
                    blockType: BlockType.PARAGRAPH,
                    timestamp: expect.any(Number)
                }),
                expect.objectContaining({ source: 'editor.create' })
            );
        });

        it('should not change currentBlock (focus stays on current block)', () => {
            mockEditor.addDefaultBlockBefore();
            expect(mockEditor.currentBlock).toBe(mockCurrentBlock);
        });

        it('should call insertBefore on the parent node', () => {
            const insertBeforeSpy = jest.spyOn(mockInstance, 'insertBefore');
            mockCurrentBlock.parentNode = mockInstance;

            mockEditor.addDefaultBlockBefore();

            // Should have been called to insert the new block before currentBlock
            expect(insertBeforeSpy.mock.calls.length).toBeGreaterThan(0);
        });

        it('should insert into instance when no current block exists', () => {
            mockEditor.currentBlock = null;
            const insertBeforeSpy = jest.spyOn(mockInstance, 'insertBefore');

            mockEditor.addDefaultBlockBefore();

            expect(insertBeforeSpy).toHaveBeenCalled();
        });

        it('should register the block in _blockMap', () => {
            const newBlock = mockEditor.addDefaultBlockBefore();
            expect(mockEditor._blockMap.has(newBlock)).toBe(true);
        });
    });

    describe('handleEnterKey insert-before integration', () => {
        it('should call addDefaultBlockBefore when cursor is at start of non-empty block', () => {
            const mockEditorInstance = {
                currentBlock: (() => {
                    const el = document.createElement('div');
                    el.dataset = { blockType: 'p' };
                    el.textContent = 'Some content';
                    el.isConnected = true;
                    return el;
                })(),
                keybuffer: [],
                addDefaultBlockBefore: jest.fn(),
                addDefaultBlock: jest.fn(),
                update: jest.fn(),
                setCurrentBlock: jest.fn(),
                instance: document.createElement('div')
            };

            const { BlockFactory } = require('../src/blocks/BlockFactory.js');
            BlockFactory.createBlock = jest.fn().mockReturnValue({
                handleEnterKey: jest.fn().mockReturnValue(false),
                isAtEnd: jest.fn().mockReturnValue(false)
            });

            // Mock selection at position 0
            window.getSelection = jest.fn().mockReturnValue({
                rangeCount: 1,
                getRangeAt: jest.fn().mockReturnValue({
                    collapsed: true,
                    startContainer: mockEditorInstance.currentBlock,
                    startOffset: 0,
                    cloneRange: () => ({
                        selectNodeContents: jest.fn(),
                        setEnd: jest.fn(),
                        toString: () => ''
                    })
                })
            });

            // Mock isCursorAtStartOfBlock to return true
            const startSpy = jest.spyOn(KeyHandler, 'isCursorAtStartOfBlock').mockReturnValue(true);

            const mockEvent = { key: 'Enter', preventDefault: jest.fn() };
            const keyHandler = new KeyHandler(mockEditorInstance);
            keyHandler.handleEnterKey(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEditorInstance.addDefaultBlockBefore).toHaveBeenCalled();
            expect(mockEditorInstance.addDefaultBlock).not.toHaveBeenCalled();

            startSpy.mockRestore();
        });

        it('should NOT call addDefaultBlockBefore when block is empty', () => {
            const mockEditorInstance = {
                currentBlock: (() => {
                    const el = document.createElement('div');
                    el.dataset = { blockType: 'p' };
                    el.textContent = '';
                    el.isConnected = true;
                    return el;
                })(),
                keybuffer: [],
                addDefaultBlockBefore: jest.fn(),
                addDefaultBlock: jest.fn(),
                update: jest.fn(),
                setCurrentBlock: jest.fn(),
                instance: document.createElement('div')
            };

            const { BlockFactory } = require('../src/blocks/BlockFactory.js');
            BlockFactory.createBlock = jest.fn().mockReturnValue({
                handleEnterKey: jest.fn().mockReturnValue(false),
                isAtEnd: jest.fn().mockReturnValue(true)
            });

            // Mock selection at position 0
            window.getSelection = jest.fn().mockReturnValue({
                rangeCount: 1,
                getRangeAt: jest.fn().mockReturnValue({
                    collapsed: true,
                    startContainer: mockEditorInstance.currentBlock,
                    startOffset: 0,
                    cloneRange: () => ({
                        selectNodeContents: jest.fn(),
                        setEnd: jest.fn(),
                        toString: () => ''
                    })
                })
            });

            const startSpy = jest.spyOn(KeyHandler, 'isCursorAtStartOfBlock').mockReturnValue(true);

            const mockEvent = { key: 'Enter', preventDefault: jest.fn() };
            const keyHandler = new KeyHandler(mockEditorInstance);
            keyHandler.handleEnterKey(mockEvent);

            // Should NOT insert before because block is empty
            expect(mockEditorInstance.addDefaultBlockBefore).not.toHaveBeenCalled();

            startSpy.mockRestore();
        });
    });
});
