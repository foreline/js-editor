import { Block } from '@/Block.js';
import { BlockType } from '@/BlockType.js';

describe('Block', () => {
  test('constructor initializes with default type', () => {
    const block = new Block();
    expect(block.type).toBe(BlockType.PARAGRAPH);
  });

  test('constructor initializes with specified type', () => {
    const block = new Block(BlockType.H1);
    expect(block.type).toBe(BlockType.H1);
  });

  test('can change block type', () => {
    const block = new Block(BlockType.PARAGRAPH);
    block.type = BlockType.H1;
    expect(block.type).toBe(BlockType.H1);
  });

  test('can set and get content', () => {
    const block = new Block();
    block.content = 'Hello World';
    expect(block.content).toBe('Hello World');
  });

  test('can set and get html', () => {
    const block = new Block();
    block.html = '<p>Hello World</p>';
    expect(block.html).toBe('<p>Hello World</p>');
  });

  test('can set and get nested status', () => {
    const block = new Block();
    block.nested = true;
    expect(block.nested).toBe(true);
  });
});
