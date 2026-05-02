'use strict';

// Break circular deps
jest.mock('../src/Editor.js');
jest.mock('@/utils/log.js');
jest.unmock('../src/blocks/BlockFactory');

import * as BlocksIndex from '../src/blocks/index.js';

describe('blocks/index.js barrel export', () => {
    const EXPECTED_EXPORTS = [
        'BaseBlock',
        'ParagraphBlock',
        'HeadingBlock',
        'H1Block',
        'H2Block',
        'H3Block',
        'H4Block',
        'H5Block',
        'H6Block',
        'ListBlock',
        'UnorderedListBlock',
        'OrderedListBlock',
        'TaskListBlock',
        'CodeBlock',
        'QuoteBlock',
        'DelimiterBlock',
        'BlockFactory',
    ];

    it('exports all expected named exports', () => {
        EXPECTED_EXPORTS.forEach(name => {
            expect(BlocksIndex).toHaveProperty(name);
        });
    });

    it('exports are all functions (classes)', () => {
        EXPECTED_EXPORTS.forEach(name => {
            expect(typeof BlocksIndex[name]).toBe('function');
        });
    });

    it('block classes are instantiable', () => {
        const instantiable = [
            'ParagraphBlock', 'H1Block', 'H2Block', 'H3Block', 'H4Block',
            'H5Block', 'H6Block', 'UnorderedListBlock', 'OrderedListBlock',
            'CodeBlock', 'QuoteBlock', 'DelimiterBlock'
        ];
        instantiable.forEach(name => {
            expect(() => new BlocksIndex[name]()).not.toThrow();
        });
    });

    it('BlockFactory.createBlock creates a ParagraphBlock by default', () => {
        const block = BlocksIndex.BlockFactory.createBlock('p');
        expect(block).toBeInstanceOf(BlocksIndex.ParagraphBlock);
    });
});
