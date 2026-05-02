import { H4Block } from '@/blocks/H4Block.js';
import { HeadingBlock } from '@/blocks/HeadingBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';

describe('H4Block', () => {
  let h4Block;

  beforeEach(() => {
    h4Block = new H4Block();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new H4Block();
      expect(block).toBeInstanceOf(H4Block);
      expect(block).toBeInstanceOf(HeadingBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.H4);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
      expect(block.level).toBe(4);
    });

    test('creates instance with custom parameters', () => {
      const content = 'Fourth Level Heading';
      const html = '<h4>Fourth Level Heading</h4>';
      const nested = true;
      
      const block = new H4Block(content, html, nested);
      expect(block.type).toBe(BlockType.H4);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
      expect(block.level).toBe(4);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns correct triggers', () => {
      const triggers = H4Block.getMarkdownTriggers();
      expect(triggers).toHaveLength(1);
      expect(triggers).toContain('#### ');
    });

    test('getToolbarConfig returns correct configuration', () => {
      const config = H4Block.getToolbarConfig();
      expect(config).toEqual({
        class: 'bke-toolbar-header4',
        label: 'Heading 4',
        group: 'headers'
      });
    });
  });

  describe('applyTransformation', () => {
    test('applies h4 attributes to provided targetElement', () => {
      const el = { setAttribute: jest.fn(), textContent: '', innerHTML: '', appendChild: jest.fn(), contains: jest.fn(() => false) };
      Object.defineProperty(el, 'className', { writable: true, value: '' });
      h4Block.applyTransformation(el);
      expect(el.setAttribute).toHaveBeenCalledWith('data-block-type', 'h4');
      expect(el.className).toBe('bke-block bke-block--h4');
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from HeadingBlock', () => {
      expect(h4Block).toBeInstanceOf(HeadingBlock);
    });

    test('has correct block type', () => {
      expect(h4Block.type).toBe(BlockType.H4);
    });

    test('has correct heading level', () => {
      expect(h4Block.level).toBe(4);
    });
  });
});



