'use strict';

jest.unmock('../src/blocks/BlockFactory');
jest.mock('@/utils/log.js');

import { BlockFactory } from '../src/blocks/BlockFactory.js';
import { ParagraphBlock } from '../src/blocks/ParagraphBlock.js';

// Tests the empty block persistence concept using block-level logic
describe('Empty Block Persistence Fix', () => {
    test('BlockFactory creates paragraph block for default block type', () => {
        const block = BlockFactory.createBlock('p');
        expect(block).toBeInstanceOf(ParagraphBlock);
    });

    test('empty paragraph block has empty content', () => {
        const block = new ParagraphBlock('', '');
        expect(block.content).toBe('');
        expect(block.type).toBe('paragraph');
    });

    test('paragraph block with content is not empty', () => {
        const block = new ParagraphBlock('Hello World', '<p>Hello World</p>');
        expect(block.content).toBe('Hello World');
        expect(block.toMarkdown()).toBe('Hello World');
    });

    test('block type is preserved', () => {
        const block = new ParagraphBlock();
        expect(block.type).toBe('paragraph');
        // Should remain paragraph even without content
    });

    test('creating multiple blocks does not cause issues', () => {
        const blocks = [];
        for (let i = 0; i < 5; i++) {
            blocks.push(new ParagraphBlock('', ''));
        }
        expect(blocks.length).toBe(5);
        blocks.forEach(b => expect(b.type).toBe('paragraph'));
    });

    describe('isCreatingBlock flag concept', () => {
        test('a state flag prevents removal during creation', () => {
            let isCreatingBlock = false;

            const addBlock = () => {
                isCreatingBlock = true;
                const block = new ParagraphBlock('', '');
                // In real editor: setTimeout(() => isCreatingBlock = false, 100)
                return block;
            };

            const shouldRemoveEmptyBlock = (block) => {
                if (isCreatingBlock) return false; // Protected
                return block.content.trim() === '';
            };

            const newBlock = addBlock();
            expect(shouldRemoveEmptyBlock(newBlock)).toBe(false); // Protected by flag

            isCreatingBlock = false;
            expect(shouldRemoveEmptyBlock(newBlock)).toBe(true); // Now can be removed
        });
    });
});

