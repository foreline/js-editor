'use strict';

// Break circular deps
jest.mock('@/Editor.js');
jest.mock('@/utils/log.js');

import { OrderedListBlock } from '@/blocks/OrderedListBlock.js';
import { ListBlock } from '@/blocks/ListBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';
import { Editor } from '@/Editor.js';

describe('OrderedListBlock', () => {
  let orderedListBlock;

  beforeEach(() => {
    orderedListBlock = new OrderedListBlock();
    jest.clearAllMocks();
    global.requestAnimationFrame = jest.fn(callback => callback());
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new OrderedListBlock();
      expect(block).toBeInstanceOf(OrderedListBlock);
      expect(block).toBeInstanceOf(ListBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.OL);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
    });

    test('creates instance with custom parameters', () => {
      const content = 'First step\nSecond step';
      const html = '<ol><li>First step</li><li>Second step</li></ol>';
      const nested = true;

      const block = new OrderedListBlock(content, html, nested);
      expect(block.type).toBe(BlockType.OL);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
    });
  });

  describe('Key Handling', () => {
    test('handleKeyPress returns false by default', () => {
      const event = { key: 'Enter' };
      const result = orderedListBlock.handleKeyPress(event, 'list item text');
      expect(result).toBe(false);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns ordered list triggers', () => {
      const triggers = OrderedListBlock.getMarkdownTriggers();
      expect(Array.isArray(triggers)).toBe(true);
      expect(triggers.length).toBeGreaterThan(0);
      // Should include a numbered prefix pattern
      const hasNumberedTrigger = triggers.some(t => /^\d/.test(t));
      expect(hasNumberedTrigger).toBe(true);
    });

    test('matchesMarkdownTrigger returns true for ordered list patterns', () => {
      expect(OrderedListBlock.matchesMarkdownTrigger('1. ')).toBe(true);
      expect(OrderedListBlock.matchesMarkdownTrigger('2. ')).toBe(true);
      expect(OrderedListBlock.matchesMarkdownTrigger('10. ')).toBe(true);
      expect(OrderedListBlock.matchesMarkdownTrigger('1) ')).toBe(true);
    });

    test('matchesMarkdownTrigger returns false for non-ordered patterns', () => {
      expect(OrderedListBlock.matchesMarkdownTrigger('- ')).toBe(false);
      expect(OrderedListBlock.matchesMarkdownTrigger('* ')).toBe(false);
      expect(OrderedListBlock.matchesMarkdownTrigger('# ')).toBe(false);
    });

    test('getToolbarConfig returns configuration object', () => {
      const config = OrderedListBlock.getToolbarConfig();
      expect(config).toBeTruthy();
      expect(config.class).toBeDefined();
    });
  });

  describe('applyTransformation', () => {
    test('does nothing when targetElement is null/undefined', () => {
      expect(() => orderedListBlock.applyTransformation()).not.toThrow();
      expect(() => orderedListBlock.applyTransformation(null)).not.toThrow();
    });

    test('applies ol attributes to provided targetElement', () => {
      const el = {
        setAttribute: jest.fn(),
        textContent: 'item text',
        innerHTML: '',
        appendChild: jest.fn(),
      };
      Object.defineProperty(el, 'className', { writable: true, value: '' });
      orderedListBlock.applyTransformation(el);
      expect(el.setAttribute).toHaveBeenCalledWith('data-block-type', 'ol');
      expect(el.className).toBe('bke-block bke-block--ol');
    });
  });

  describe('createNewListItem', () => {
    test('returns false when currentBlock is null', () => {
      expect(orderedListBlock.createNewListItem(null, null)).toBe(false);
    });

    test('returns false when no ol element found in block', () => {
      const mockBlock = { querySelector: jest.fn().mockReturnValue(null) };
      expect(orderedListBlock.createNewListItem(mockBlock, {})).toBe(false);
    });

    test('creates new li and returns true', () => {
      const mockOl = { appendChild: jest.fn() };
      const mockBlock = { querySelector: jest.fn().mockReturnValue(mockOl) };
      const mockEditorInst = { setCurrentBlock: jest.fn() };
      Editor.getInstanceFromElement = jest.fn().mockReturnValue(mockEditorInst);

      const result = orderedListBlock.createNewListItem(mockBlock, {});
      expect(result).toBe(true);
      expect(mockOl.appendChild).toHaveBeenCalled();
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from ListBlock', () => {
      expect(orderedListBlock).toBeInstanceOf(ListBlock);
    });

    test('has correct block type', () => {
      expect(orderedListBlock.type).toBe(BlockType.OL);
    });
  });

  describe('Content and HTML handling', () => {
    test('can set and get content', () => {
      orderedListBlock.content = 'Step 1\nStep 2';
      expect(orderedListBlock.content).toBe('Step 1\nStep 2');
    });

    test('can set and get HTML', () => {
      const html = '<ol><li>Step 1</li></ol>';
      orderedListBlock.html = html;
      expect(orderedListBlock.html).toBe(html);
    });
  });
});
