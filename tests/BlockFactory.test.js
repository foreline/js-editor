import { BlockFactory } from '@/blocks/BlockFactory.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { ParagraphBlock } from '@/blocks/ParagraphBlock.js';
import { H1Block, H2Block, H3Block } from '@/blocks/HeadingBlock.js';
import { UnorderedListBlock } from '@/blocks/ListBlock.js';
import { OrderedListBlock } from '@/blocks/OrderedListBlock.js';
import { TaskListBlock } from '@/blocks/TaskListBlock.js';
import { CodeBlock, QuoteBlock, DelimiterBlock } from '@/blocks/SpecialBlock.js';
import { BlockType } from '@/BlockType.js';

describe('BlockFactory', () => {
  test('creates paragraph block by default', () => {
    const block = BlockFactory.createBlock();
    expect(block).toBeInstanceOf(ParagraphBlock);
    expect(block.type).toBe(BlockType.PARAGRAPH);
  });

  test('creates specific block types', () => {
    const h1Block = BlockFactory.createBlock(BlockType.H1);
    expect(h1Block).toBeInstanceOf(H1Block);
    expect(h1Block.type).toBe(BlockType.H1);

    const codeBlock = BlockFactory.createBlock(BlockType.CODE);
    expect(codeBlock).toBeInstanceOf(CodeBlock);
    expect(codeBlock.type).toBe(BlockType.CODE);

    const ulBlock = BlockFactory.createBlock(BlockType.UL);
    expect(ulBlock).toBeInstanceOf(UnorderedListBlock);
    expect(ulBlock.type).toBe(BlockType.UL);
  });

  test('finds block class for markdown triggers', () => {
    const h1Class = BlockFactory.findBlockClassForTrigger('# ');
    expect(h1Class).toBe(H1Block);

    const h2Class = BlockFactory.findBlockClassForTrigger('## ');
    expect(h2Class).toBe(H2Block);

    const ulClass = BlockFactory.findBlockClassForTrigger('* ');
    expect(ulClass).toBe(UnorderedListBlock);

    const olClass = BlockFactory.findBlockClassForTrigger('1 ');
    expect(olClass).toBe(OrderedListBlock);

    const quoteClass = BlockFactory.findBlockClassForTrigger('> ');
    expect(quoteClass).toBe(QuoteBlock);

    const taskClass = BlockFactory.findBlockClassForTrigger('- [ ]');
    expect(taskClass).toBe(TaskListBlock);
  });

  test('creates block from trigger', () => {
    const h1Block = BlockFactory.createBlockFromTrigger('# ', 'Heading content');
    expect(h1Block).toBeInstanceOf(H1Block);
    expect(h1Block.content).toBe('Heading content');

    const ulBlock = BlockFactory.createBlockFromTrigger('* ', 'List item');
    expect(ulBlock).toBeInstanceOf(UnorderedListBlock);
    expect(ulBlock.content).toBe('List item');
  });

  test('returns null for unknown triggers', () => {
    const unknownClass = BlockFactory.findBlockClassForTrigger('unknown trigger');
    expect(unknownClass).toBeNull();

    const unknownBlock = BlockFactory.createBlockFromTrigger('unknown trigger');
    expect(unknownBlock).toBeNull();
  });
});

describe('Block types', () => {
  test('H1Block has correct markdown triggers', () => {
    expect(H1Block.getMarkdownTriggers()).toContain('# ');
    expect(H1Block.matchesMarkdownTrigger('# ')).toBe(true);
    expect(H1Block.matchesMarkdownTrigger('## ')).toBe(false);
  });

  test('H2Block has correct markdown triggers', () => {
    expect(H2Block.getMarkdownTriggers()).toContain('## ');
    expect(H2Block.matchesMarkdownTrigger('## ')).toBe(true);
    expect(H2Block.matchesMarkdownTrigger('# ')).toBe(false);
  });

  test('UnorderedListBlock has correct markdown triggers', () => {
    const triggers = UnorderedListBlock.getMarkdownTriggers();
    expect(triggers).toContain('* ');
    expect(triggers).toContain('- ');
    expect(UnorderedListBlock.matchesMarkdownTrigger('* ')).toBe(true);
    expect(UnorderedListBlock.matchesMarkdownTrigger('- ')).toBe(true);
    expect(UnorderedListBlock.matchesMarkdownTrigger('1 ')).toBe(false);
  });

  test('OrderedListBlock has correct markdown triggers', () => {
    const triggers = OrderedListBlock.getMarkdownTriggers();
    expect(triggers).toContain('1 ');
    expect(triggers).toContain('1.');
    expect(OrderedListBlock.matchesMarkdownTrigger('1 ')).toBe(true);
    expect(OrderedListBlock.matchesMarkdownTrigger('1.')).toBe(true);
    expect(OrderedListBlock.matchesMarkdownTrigger('* ')).toBe(false);
  });

  test('TaskListBlock has correct markdown triggers', () => {
    expect(TaskListBlock.getMarkdownTriggers()).toContain('- [ ]');
    expect(TaskListBlock.getMarkdownTriggers()).toContain('- [x]');
    expect(TaskListBlock.getMarkdownTriggers()).toContain('- []');
  });

  test('QuoteBlock has correct markdown triggers', () => {
    expect(QuoteBlock.getMarkdownTriggers()).toContain('> ');
    expect(QuoteBlock.matchesMarkdownTrigger('> ')).toBe(true);
    expect(QuoteBlock.matchesMarkdownTrigger('# ')).toBe(false);
  });

  test('CodeBlock has correct markdown triggers', () => {
    const triggers = CodeBlock.getMarkdownTriggers();
    expect(triggers).toContain('```');
    expect(triggers).toContain('~~~');
    expect(CodeBlock.matchesMarkdownTrigger('```')).toBe(true);
    expect(CodeBlock.matchesMarkdownTrigger('~~~')).toBe(true);
    expect(CodeBlock.matchesMarkdownTrigger('# ')).toBe(false);
  });
});

describe('Block inheritance', () => {
  test('all block types extend BaseBlock', () => {
    const paragraphBlock = new ParagraphBlock();
    const h1Block = new H1Block();
    const ulBlock = new UnorderedListBlock();
    const codeBlock = new CodeBlock();

    expect(paragraphBlock).toBeInstanceOf(BaseBlock);
    expect(h1Block).toBeInstanceOf(BaseBlock);
    expect(ulBlock).toBeInstanceOf(BaseBlock);
    expect(codeBlock).toBeInstanceOf(BaseBlock);
  });

  test('blocks have default handleKeyPress and handleEnterKey methods', () => {
    const paragraphBlock = new ParagraphBlock();
    
    expect(typeof paragraphBlock.handleKeyPress).toBe('function');
    expect(typeof paragraphBlock.handleEnterKey).toBe('function');
    expect(typeof paragraphBlock.applyTransformation).toBe('function');
  });
});
