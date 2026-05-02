'use strict';

// Break circular dep: ListBlock -> Editor -> BlockFactory -> ListBlock
jest.mock('../src/Editor.js');
jest.mock('@/utils/log.js');

import { ListBlock } from '../src/blocks/ListBlock.js';
import { UnorderedListBlock } from '../src/blocks/UnorderedListBlock.js';
import { BaseBlock } from '../src/blocks/BaseBlock.js';
import { BlockType } from '../src/BlockType.js';
import { Editor } from '../src/Editor.js';

describe('ListBlock', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('extends BaseBlock', () => {
            const block = new UnorderedListBlock();
            expect(block).toBeInstanceOf(ListBlock);
            expect(block).toBeInstanceOf(BaseBlock);
        });

        it('sets the correct block type via subclass', () => {
            const block = new UnorderedListBlock();
            expect(block.type).toBe(BlockType.UL);
        });

        it('initialises with empty content by default', () => {
            const block = new UnorderedListBlock();
            expect(block.content).toBe('');
            expect(block.html).toBe('');
            expect(block.nested).toBe(false);
        });
    });

    describe('toMarkdown', () => {
        it('returns a string', () => {
            const block = new UnorderedListBlock('- item one', '<ul><li>item one</li></ul>');
            expect(typeof block.toMarkdown()).toBe('string');
        });
    });

    describe('toHtml', () => {
        it('returns a string', () => {
            const block = new UnorderedListBlock('', '<ul><li>item one</li></ul>');
            expect(typeof block.toHtml()).toBe('string');
        });
    });

    describe('getToolbarConfig', () => {
        it('returns null', () => {
            expect(ListBlock.getToolbarConfig()).toBeNull();
        });
    });

    describe('isAtEnd', () => {
        it('returns false when range is null', () => {
            const block = new UnorderedListBlock();
            expect(block.isAtEnd(null, null)).toBe(false);
        });

        it('returns false when blockElement is null', () => {
            const block = new UnorderedListBlock();
            expect(block.isAtEnd(null, { collapsed: true })).toBe(false);
        });

        it('returns false when range is not collapsed', () => {
            const block = new UnorderedListBlock();
            const mockBlock = { tagName: 'DIV' };
            expect(block.isAtEnd(mockBlock, { collapsed: false })).toBe(false);
        });
    });

    describe('createNewListItem', () => {
        it('returns false (base stub)', () => {
            const block = new UnorderedListBlock();
            expect(block.createNewListItem(null, null)).toBe(false);
        });
    });

    describe('handleEnterKey', () => {
        it('returns false when event target is null', () => {
            const block = new UnorderedListBlock();
            expect(block.handleEnterKey({ target: null, preventDefault: jest.fn() })).toBe(false);
        });

        it('returns false when no list item resolved', () => {
            const block = new UnorderedListBlock();
            const event = { target: { closest: jest.fn().mockReturnValue(null) }, preventDefault: jest.fn() };
            expect(block.handleEnterKey(event)).toBe(false);
        });

        it('returns true and calls addDefaultBlock for empty last list item', () => {
            const block = new UnorderedListBlock();
            const mockAddDefaultBlock = jest.fn();
            Editor.getInstanceFromElement = jest.fn().mockReturnValue({ addDefaultBlock: mockAddDefaultBlock });

            const li = document.createElement('li');
            li.textContent = '';
            const ul = document.createElement('ul');
            ul.appendChild(li);
            const bkeBlock = document.createElement('div');
            bkeBlock.appendChild(ul);
            li.parentElement = ul;
            ul.parentElement = bkeBlock;
            ul.querySelectorAll = jest.fn().mockReturnValue([li]);
            li.remove = jest.fn();
            li.closest = jest.fn((sel) => {
                if (sel === '.bke-block') return bkeBlock;
                if (sel === 'li') return li;
                return null;
            });

            const result = block.handleEnterKey({ target: li, preventDefault: jest.fn() });
            expect(result).toBe(true);
            expect(mockAddDefaultBlock).toHaveBeenCalled();
        });
    });
});
