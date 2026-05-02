'use strict';

jest.unmock('../src/blocks/BlockFactory');
jest.mock('@/utils/log.js');
jest.mock('@/Editor.js');

import { UnorderedListBlock } from '../src/blocks/UnorderedListBlock.js';
import { BlockFactory } from '../src/blocks/BlockFactory.js';

describe('UnorderedList in Empty Editor Fix', () => {
    test('BlockFactory can create UnorderedListBlock', () => {
        const block = BlockFactory.createBlock('ul');
        expect(block).toBeInstanceOf(UnorderedListBlock);
    });

    test('UnorderedListBlock can applyTransformation to a target element', () => {
        const block = BlockFactory.createBlock('ul');
        const el = {
            setAttribute: jest.fn(),
            textContent: '',
            innerHTML: '',
            appendChild: jest.fn(),
        };
        Object.defineProperty(el, 'className', { writable: true, value: '' });
        global.requestAnimationFrame = jest.fn(cb => cb());

        expect(() => block.applyTransformation(el)).not.toThrow();
        expect(el.setAttribute).toHaveBeenCalledWith('data-block-type', 'ul');
    });

    test('UnorderedListBlock createNewListItem returns false with no block', () => {
        const block = new UnorderedListBlock();
        expect(block.createNewListItem(null, null)).toBe(false);
    });

    test('UnorderedListBlock creates list item in ul element', () => {
        const block = new UnorderedListBlock();
        const mockUl = { appendChild: jest.fn() };
        const mockBlock = { querySelector: jest.fn().mockReturnValue(mockUl) };
        global.requestAnimationFrame = jest.fn(cb => cb());

        const result = block.createNewListItem(mockBlock, {});
        expect(result).toBe(true);
        expect(mockUl.appendChild).toHaveBeenCalled();
    });
});
