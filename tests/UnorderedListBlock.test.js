'use strict';

// Break circular deps
jest.mock('@/Editor.js');
jest.mock('@/utils/log.js');

import { UnorderedListBlock } from '@/blocks/UnorderedListBlock.js';
import { ListBlock } from '@/blocks/ListBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';
import { Editor } from '@/Editor.js';

describe('UnorderedListBlock', () => {
  let unorderedListBlock;

  beforeEach(() => {
    unorderedListBlock = new UnorderedListBlock();
    jest.clearAllMocks();
    global.requestAnimationFrame = jest.fn(callback => callback());
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new UnorderedListBlock();
      expect(block).toBeInstanceOf(UnorderedListBlock);
      expect(block).toBeInstanceOf(ListBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.UL);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
    });

    test('creates instance with custom parameters', () => {
      const content = 'Item 1\nItem 2';
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const nested = true;

      const block = new UnorderedListBlock(content, html, nested);
      expect(block.type).toBe(BlockType.UL);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
    });
  });

  describe('Key Handling', () => {
    test('handleKeyPress returns false by default', () => {
      const event = { key: 'Enter' };
      const result = unorderedListBlock.handleKeyPress(event, 'item text');
      expect(result).toBe(false);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns unordered list triggers', () => {
      const triggers = UnorderedListBlock.getMarkdownTriggers();
      expect(Array.isArray(triggers)).toBe(true);
      expect(triggers.length).toBeGreaterThan(0);
      const hasBulletTrigger = triggers.some(t => ['* ', '- ', '+ '].includes(t));
      expect(hasBulletTrigger).toBe(true);
    });

    test('matchesMarkdownTrigger returns true for unordered patterns', () => {
      expect(UnorderedListBlock.matchesMarkdownTrigger('* ')).toBe(true);
      expect(UnorderedListBlock.matchesMarkdownTrigger('- ')).toBe(true);
      expect(UnorderedListBlock.matchesMarkdownTrigger('+ ')).toBe(true);
    });

    test('matchesMarkdownTrigger returns false for ordered patterns', () => {
      expect(UnorderedListBlock.matchesMarkdownTrigger('1. ')).toBe(false);
      expect(UnorderedListBlock.matchesMarkdownTrigger('# ')).toBe(false);
    });

    test('getToolbarConfig returns configuration object', () => {
      const config = UnorderedListBlock.getToolbarConfig();
      expect(config).toBeTruthy();
      expect(config.class).toBeDefined();
    });
  });

  describe('applyTransformation', () => {
    test('does nothing when targetElement is null/undefined', () => {
      expect(() => unorderedListBlock.applyTransformation()).not.toThrow();
      expect(() => unorderedListBlock.applyTransformation(null)).not.toThrow();
    });

    test('applies ul attributes to provided targetElement', () => {
      const el = {
        setAttribute: jest.fn(),
        textContent: 'item text',
        innerHTML: '',
        appendChild: jest.fn(),
      };
      Object.defineProperty(el, 'className', { writable: true, value: '' });
      unorderedListBlock.applyTransformation(el);
      expect(el.setAttribute).toHaveBeenCalledWith('data-block-type', 'ul');
      expect(el.className).toBe('bke-block bke-block--ul');
    });
  });

  describe('createNewListItem', () => {
    test('returns false when currentBlock is null', () => {
      expect(unorderedListBlock.createNewListItem(null, null)).toBe(false);
    });

    test('returns false when no ul element found in block', () => {
      const mockBlock = { querySelector: jest.fn().mockReturnValue(null) };
      expect(unorderedListBlock.createNewListItem(mockBlock, {})).toBe(false);
    });

    test('creates new li and returns true', () => {
      const mockUl = { appendChild: jest.fn() };
      const mockBlock = { querySelector: jest.fn().mockReturnValue(mockUl) };
      const mockEditorInst = { setCurrentBlock: jest.fn() };
      Editor.getInstanceFromElement = jest.fn().mockReturnValue(mockEditorInst);

      const result = unorderedListBlock.createNewListItem(mockBlock, {});
      expect(result).toBe(true);
      expect(mockUl.appendChild).toHaveBeenCalled();
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from ListBlock', () => {
      expect(unorderedListBlock).toBeInstanceOf(ListBlock);
    });

    test('has correct block type', () => {
      expect(unorderedListBlock.type).toBe(BlockType.UL);
    });
  });

  describe('Content and HTML handling', () => {
    test('can set and get content', () => {
      unorderedListBlock.content = 'Item A\nItem B';
      expect(unorderedListBlock.content).toBe('Item A\nItem B');
    });

    test('can set and get HTML', () => {
      const html = '<ul><li>Item A</li></ul>';
      unorderedListBlock.html = html;
      expect(unorderedListBlock.html).toBe(html);
    });
  });
});
