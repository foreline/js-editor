import { H2Block } from '@/blocks/H2Block.js';
import { HeadingBlock } from '@/blocks/HeadingBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';

describe('H2Block', () => {
  let h2Block;

  beforeEach(() => {
    h2Block = new H2Block();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new H2Block();
      expect(block).toBeInstanceOf(H2Block);
      expect(block).toBeInstanceOf(HeadingBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.H2);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
      expect(block.level).toBe(2);
    });

    test('creates instance with custom parameters', () => {
      const content = 'Secondary Heading';
      const html = '<h2>Secondary Heading</h2>';
      const nested = true;
      
      const block = new H2Block(content, html, nested);
      expect(block.type).toBe(BlockType.H2);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
      expect(block.level).toBe(2);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns correct triggers', () => {
      const triggers = H2Block.getMarkdownTriggers();
      expect(triggers).toHaveLength(1);
      expect(triggers).toContain('## ');
    });

    test('getToolbarConfig returns correct configuration', () => {
      const config = H2Block.getToolbarConfig();
      expect(config).toEqual({
        class: 'bke-toolbar-header2',
        label: 'Heading 2',
        group: 'headers'
      });
    });
  });

  describe('applyTransformation', () => {
    test('applies h2 attributes to provided targetElement', () => {
      const el = { setAttribute: jest.fn(), textContent: '', innerHTML: '', appendChild: jest.fn(), contains: jest.fn(() => false) };
      Object.defineProperty(el, 'className', { writable: true, value: '' });
      h2Block.applyTransformation(el);
      expect(el.setAttribute).toHaveBeenCalledWith('data-block-type', 'h2');
      expect(el.className).toBe('bke-block bke-block--h2');
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from HeadingBlock', () => {
      expect(h2Block).toBeInstanceOf(HeadingBlock);
    });

    test('has correct block type', () => {
      expect(h2Block.type).toBe(BlockType.H2);
    });

    test('has correct heading level', () => {
      expect(h2Block.level).toBe(2);
    });
  });
});



