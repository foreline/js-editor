'use strict';

jest.unmock('../src/blocks/BlockFactory');
jest.mock('@/utils/log.js');

import { H1Block } from '../src/blocks/H1Block.js';
import { ParagraphBlock } from '../src/blocks/ParagraphBlock.js';

// Tests the header conversion behavior at the block level, not Editor level
describe('Header Conversion - Block level', () => {
    test('H1Block applyTransformation converts paragraph block attributes', () => {
        const block = new H1Block('Test heading', '<h1>Test heading</h1>');
        const el = {
            setAttribute: jest.fn(),
            textContent: 'Test heading',
            innerHTML: '',
            appendChild: jest.fn(),
            contains: jest.fn(() => false),
        };
        Object.defineProperty(el, 'className', { writable: true, value: '' });

        block.applyTransformation(el);

        expect(el.setAttribute).toHaveBeenCalledWith('data-block-type', 'h1');
        expect(el.className).toBe('bke-block bke-block--h1');
    });

    test('H1Block toMarkdown produces correct output', () => {
        const block = new H1Block('Test heading', '<h1>Test heading</h1>');
        expect(block.toMarkdown()).toBe('# Test heading');
    });

    test('H1Block type is h1', () => {
        const block = new H1Block('', '');
        expect(block.type).toBe('h1');
    });
});
