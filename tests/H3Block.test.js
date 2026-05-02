import { H3Block } from '@/blocks/H3Block.js';
import { HeadingBlock } from '@/blocks/HeadingBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';

describe('H3Block', () => {
  let h3Block;

  beforeEach(() => {
    h3Block = new H3Block();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new H3Block();
      expect(block).toBeInstanceOf(H3Block);
      expect(block).toBeInstanceOf(HeadingBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.H3);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
      expect(block.level).toBe(3);
    });

    test('creates instance with custom parameters', () => {
      const content = 'Tertiary Heading';
      const html = '<h3>Tertiary Heading</h3>';
      const nested = true;
      
      const block = new H3Block(content, html, nested);
      expect(block.type).toBe(BlockType.H3);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
      expect(block.level).toBe(3);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns correct triggers', () => {
      const triggers = H3Block.getMarkdownTriggers();
      expect(triggers).toHaveLength(1);
      expect(triggers).toContain('### ');
    });

    test('getToolbarConfig returns correct configuration', () => {
      const config = H3Block.getToolbarConfig();
      expect(config).toEqual({
        class: 'bke-toolbar-header3',
        label: 'Heading 3',
        group: 'headers'
      });
    });
  });

  describe('applyTransformation', () => {
    test('applies h3 attributes to provided targetElement', () => {
      const el = { setAttribute: jest.fn(), textContent: '', innerHTML: '', appendChild: jest.fn(), contains: jest.fn(() => false) };
      Object.defineProperty(el, 'className', { writable: true, value: '' });
      h3Block.applyTransformation(el);
      expect(el.setAttribute).toHaveBeenCalledWith('data-block-type', 'h3');
      expect(el.className).toBe('bke-block bke-block--h3');
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from HeadingBlock', () => {
      expect(h3Block).toBeInstanceOf(HeadingBlock);
    });

    test('has correct block type', () => {
      expect(h3Block.type).toBe(BlockType.H3);
    });

    test('has correct heading level', () => {
      expect(h3Block.level).toBe(3);
    });
  });
});



