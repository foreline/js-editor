import { H5Block } from '@/blocks/H5Block.js';
import { HeadingBlock } from '@/blocks/HeadingBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';

describe('H5Block', () => {
  let h5Block;

  beforeEach(() => {
    h5Block = new H5Block();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new H5Block();
      expect(block).toBeInstanceOf(H5Block);
      expect(block).toBeInstanceOf(HeadingBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.H5);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
      expect(block.level).toBe(5);
    });

    test('creates instance with custom parameters', () => {
      const content = 'Fifth Level Heading';
      const html = '<h5>Fifth Level Heading</h5>';
      const nested = true;
      
      const block = new H5Block(content, html, nested);
      expect(block.type).toBe(BlockType.H5);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
      expect(block.level).toBe(5);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns correct triggers', () => {
      const triggers = H5Block.getMarkdownTriggers();
      expect(triggers).toHaveLength(1);
      expect(triggers).toContain('##### ');
    });

    test('getToolbarConfig returns correct configuration', () => {
      const config = H5Block.getToolbarConfig();
      expect(config).toEqual({
        class: 'bke-toolbar-header5',
        label: 'Heading 5',
        group: 'headers'
      });
    });
  });

  describe('applyTransformation', () => {
    test('applies h5 attributes to provided targetElement', () => {
      const el = { setAttribute: jest.fn(), textContent: '', innerHTML: '', appendChild: jest.fn(), contains: jest.fn(() => false) };
      Object.defineProperty(el, 'className', { writable: true, value: '' });
      h5Block.applyTransformation(el);
      expect(el.setAttribute).toHaveBeenCalledWith('data-block-type', 'h5');
      expect(el.className).toBe('bke-block bke-block--h5');
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from HeadingBlock', () => {
      expect(h5Block).toBeInstanceOf(HeadingBlock);
    });

    test('has correct block type', () => {
      expect(h5Block.type).toBe(BlockType.H5);
    });

    test('has correct heading level', () => {
      expect(h5Block.level).toBe(5);
    });
  });
});



