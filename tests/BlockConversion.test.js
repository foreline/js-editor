'use strict';

jest.unmock('../src/blocks/BlockFactory');
jest.mock('@/utils/log.js');

import { BlockFactory } from '../src/blocks/BlockFactory.js';
import { ParagraphBlock } from '../src/blocks/ParagraphBlock.js';
import { H1Block } from '../src/blocks/H1Block.js';
import { UnorderedListBlock } from '../src/blocks/UnorderedListBlock.js';

describe('Block Conversion Feature', () => {
    let mockBlock;

    beforeEach(() => {
        mockBlock = document.createElement('div');
        mockBlock.className = 'bke-block bke-block--p';
        mockBlock.setAttribute('data-block-type', 'p');
        mockBlock.setAttribute('contenteditable', 'true');
        mockBlock.textContent = 'test content';
        jest.clearAllMocks();
    });

    describe('BlockFactory.findBlockClassForTrigger', () => {
        it('should return null when no trigger matches', () => {
            const result = BlockFactory.findBlockClassForTrigger('no trigger here');
            expect(result).toBeNull();
        });

        it('should return H1Block for h1 trigger', () => {
            const result = BlockFactory.findBlockClassForTrigger('# heading text');
            expect(result).not.toBeNull();
            const instance = new result();
            expect(instance.type).toBe('h1');
        });

        it('should return UnorderedListBlock for dash trigger', () => {
            const result = BlockFactory.findBlockClassForTrigger('- list item');
            expect(result).not.toBeNull();
            const instance = new result();
            expect(instance.type).toBe('ul');
        });

        it('should return UnorderedListBlock for asterisk trigger', () => {
            const result = BlockFactory.findBlockClassForTrigger('* list item');
            expect(result).not.toBeNull();
            const instance = new result();
            expect(instance.type).toBe('ul');
        });

        it('should return null for partial matches', () => {
            const result = BlockFactory.findBlockClassForTrigger('#heading without space');
            expect(result).toBeNull();
        });
    });

    describe('checkAndConvertBlock via prototype binding', () => {
        let mockEditor;

        beforeEach(() => {
            mockEditor = {
                currentBlock: mockBlock,
                _blockMap: new Map(),
                _stateMachine: {
                    startConverting: jest.fn(),
                    finishConverting: jest.fn(),
                },
                eventEmitter: { emit: jest.fn() },
                findEditableElementInBlock: jest.fn().mockReturnValue(mockBlock),
                placeCursorAtEnd: jest.fn(),
            };
            const EditorModule = require('../src/Editor.js');
            const EditorClass = EditorModule.Editor;
            mockEditor.checkAndConvertBlock = EditorClass.prototype.checkAndConvertBlock.bind(mockEditor);
            mockEditor.convertBlockType = EditorClass.prototype.convertBlockType.bind(mockEditor);
        });

        it('should return false when no block element provided', () => {
            expect(mockEditor.checkAndConvertBlock(null)).toBe(false);
        });

        it('should return false when block has no data-block-type', () => {
            const plain = document.createElement('div');
            expect(mockEditor.checkAndConvertBlock(plain)).toBe(false);
        });

        it('should return false when content has no trigger', () => {
            mockBlock.textContent = 'no trigger here';
            expect(mockEditor.checkAndConvertBlock(mockBlock)).toBe(false);
        });

        it('should return false when already matching type', () => {
            const h1El = document.createElement('div');
            h1El.setAttribute('data-block-type', 'h1');
            h1El.textContent = '# heading';
            expect(mockEditor.checkAndConvertBlock(h1El)).toBe(false);
        });

        it('should return false when block is not a paragraph', () => {
            const h2El = document.createElement('div');
            h2El.setAttribute('data-block-type', 'h2');
            h2El.textContent = '# heading';
            expect(mockEditor.checkAndConvertBlock(h2El)).toBe(false);
        });

        it('should convert paragraph with heading trigger to h1', () => {
            mockBlock.innerHTML = '# heading text';
            expect(mockEditor.checkAndConvertBlock(mockBlock)).toBe(true);
        });

        it('should convert paragraph with dash trigger to ul', () => {
            mockBlock.innerHTML = '- list item';
            expect(mockEditor.checkAndConvertBlock(mockBlock)).toBe(true);
        });
    });

    describe('convertBlockType via prototype binding', () => {
        let mockEditor;

        beforeEach(() => {
            mockEditor = {
                currentBlock: null,
                _blockMap: new Map(),
                _stateMachine: {
                    startConverting: jest.fn(),
                    finishConverting: jest.fn(),
                },
                eventEmitter: { emit: jest.fn() },
                findEditableElementInBlock: jest.fn().mockReturnValue(mockBlock),
                placeCursorAtEnd: jest.fn(),
            };
            const EditorModule = require('../src/Editor.js');
            const EditorClass = EditorModule.Editor;
            mockEditor.convertBlockType = EditorClass.prototype.convertBlockType.bind(mockEditor);
        });

        it('should return false for unknown block type', () => {
            expect(mockEditor.convertBlockType(mockBlock, 'invalid-type', 'text')).toBe(false);
        });

        it('should return true when converting p to h1', () => {
            expect(mockEditor.convertBlockType(mockBlock, 'h1', '# heading text')).toBe(true);
        });

        it('should update block data-block-type on conversion', () => {
            mockEditor.convertBlockType(mockBlock, 'h1', '# heading text');
            expect(mockBlock.getAttribute('data-block-type')).toBe('h1');
        });

        it('should strip trigger prefix from remaining content', () => {
            mockEditor.convertBlockType(mockBlock, 'h1', '# heading text');
            // After applyTransformation, the inner heading element has the remaining content
            expect(mockBlock.textContent.trim()).toBe('heading text');
        });

        it('should emit BLOCK_CONVERTED event with correct payload', () => {
            mockEditor.convertBlockType(mockBlock, 'h1', '# heading text');
            expect(mockEditor.eventEmitter.emit).toHaveBeenCalledWith(
                expect.stringContaining('block'),
                expect.objectContaining({ toType: 'h1' })
            );
        });
    });

    describe('Block applyTransformation', () => {
        it('H1Block.applyTransformation updates element attributes', () => {
            const block = new H1Block('Test', '<h1>Test</h1>');
            block.applyTransformation(mockBlock);
            expect(mockBlock.getAttribute('data-block-type')).toBe('h1');
            expect(mockBlock.className).toContain('bke-block--h1');
        });

        it('UnorderedListBlock.applyTransformation updates element attributes', () => {
            const block = new UnorderedListBlock('item', '<li>item</li>');
            block.applyTransformation(mockBlock);
            expect(mockBlock.getAttribute('data-block-type')).toBe('ul');
        });
    });

    describe('ParagraphBlock as default', () => {
        it('BlockFactory.createBlock p returns ParagraphBlock', () => {
            const block = BlockFactory.createBlock('p');
            expect(block).toBeInstanceOf(ParagraphBlock);
        });

        it('plain text does not match any trigger', () => {
            expect(BlockFactory.findBlockClassForTrigger('plain text')).toBeNull();
        });
    });
});
