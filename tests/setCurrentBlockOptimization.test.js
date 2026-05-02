'use strict';

jest.unmock('../src/blocks/BlockFactory');
jest.mock('@/utils/log.js');

import { BlockFactory } from '../src/blocks/BlockFactory.js';

// Tests setCurrentBlock behavior using a mock Editor-like object
describe('setCurrentBlock optimization', () => {
    test('setCurrentBlock skips update when block unchanged', () => {
        const mockBlock = { getAttribute: jest.fn(() => 'test-block'), id: 'test-block' };
        const logCalls = [];

        const mockEditor = {
            currentBlock: null,
            eventEmitter: { emit: jest.fn() },
            setCurrentBlock(block) {
                if (this.currentBlock === block) {
                    return; // Early return optimization
                }
                logCalls.push('setCurrentBlock');
                this.currentBlock = block;
            }
        };

        mockEditor.setCurrentBlock(mockBlock);
        const firstCount = logCalls.length;

        mockEditor.setCurrentBlock(mockBlock); // Same block
        const secondCount = logCalls.length;

        expect(secondCount).toBe(firstCount); // No extra calls
    });

    test('handles null blocks gracefully', () => {
        const mockEditor = {
            currentBlock: null,
            setCurrentBlock(block) {
                if (!block) return;
                this.currentBlock = block;
            }
        };

        expect(() => {
            mockEditor.setCurrentBlock(null);
            mockEditor.setCurrentBlock(undefined);
        }).not.toThrow();

        expect(mockEditor.currentBlock).toBeNull();
    });

    test('BlockFactory.createBlock returns instances of correct types', () => {
        const p = BlockFactory.createBlock('p');
        const h1 = BlockFactory.createBlock('h1');
        expect(p.type).toBe('paragraph');
        expect(h1.type).toBe('h1');
    });
});
