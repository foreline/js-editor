import { H6Block } from '@/blocks/H6Block.js';
import { HeadingBlock } from '@/blocks/HeadingBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';

describe('H6Block', () => {
  let h6Block;

  beforeEach(() => {
    h6Block = new H6Block();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new H6Block();
      expect(block).toBeInstanceOf(H6Block);
      expect(block).toBeInstanceOf(HeadingBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.H6);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
      expect(block.level).toBe(6);
    });

    test('creates instance with custom parameters', () => {
      const content = 'Sixth Level Heading';
      const html = '<h6>Sixth Level Heading</h6>';
      const nested = true;
      
      const block = new H6Block(content, html, nested);
      expect(block.type).toBe(BlockType.H6);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
      expect(block.level).toBe(6);
    });
  });

  describe('Static Methods', () => {
    test('getMarkdownTriggers returns correct triggers', () => {
      const triggers = H6Block.getMarkdownTriggers();
      expect(triggers).toHaveLength(1);
      expect(triggers).toContain('###### ');
    });

    test('getToolbarConfig returns correct configuration', () => {
      const config = H6Block.getToolbarConfig();
      expect(config).toEqual({
        class: 'bke-toolbar-header6',
        label: 'Heading 6',
        group: 'headers'
      });
    });
  });

  describe('applyTransformation', () => {
    test('applies h6 attributes to provided targetElement', () => {
      const el = { setAttribute: jest.fn(), textContent: '', innerHTML: '', appendChild: jest.fn(), contains: jest.fn(() => false) };
      Object.defineProperty(el, 'className', { writable: true, value: '' });
      h6Block.applyTransformation(el);
      expect(el.setAttribute).toHaveBeenCalledWith('data-block-type', 'h6');
      expect(el.className).toBe('bke-block bke-block--h6');
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from HeadingBlock', () => {
      expect(h6Block).toBeInstanceOf(HeadingBlock);
    });

    test('has correct block type', () => {
      expect(h6Block.type).toBe(BlockType.H6);
    });

    test('has correct heading level', () => {
      expect(h6Block.level).toBe(6);
    });
  });
});



