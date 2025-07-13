import { Block } from '@/Block.js';
import { BlockType } from '@/BlockType.js';
import { ParagraphBlock } from '@/blocks/ParagraphBlock.js';
import { H1Block } from '@/blocks/H1Block.js';

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

  test('provides access to underlying block instance', () => {
    const paragraphBlock = new Block(BlockType.PARAGRAPH);
    const h1Block = new Block(BlockType.H1);
    
    expect(paragraphBlock.getBlockInstance()).toBeInstanceOf(ParagraphBlock);
    expect(h1Block.getBlockInstance()).toBeInstanceOf(H1Block);
  });

  test('delegates key handling to block instance', () => {
    const block = new Block(BlockType.H1);
    const blockInstance = block.getBlockInstance();
    
    // Mock the handleKeyPress method
    blockInstance.handleKeyPress = jest.fn().mockReturnValue(true);
    
    const event = { key: 'Enter' };
    const result = block.handleKeyPress(event, 'test text');
    
    expect(blockInstance.handleKeyPress).toHaveBeenCalledWith(event, 'test text');
    expect(result).toBe(true);
  });

  test('delegates enter key handling to block instance', () => {
    const block = new Block(BlockType.CODE);
    const blockInstance = block.getBlockInstance();
    
    // Mock the handleEnterKey method
    blockInstance.handleEnterKey = jest.fn().mockReturnValue(true);
    
    const event = { key: 'Enter' };
    const result = block.handleEnterKey(event);
    
    expect(blockInstance.handleEnterKey).toHaveBeenCalledWith(event);
    expect(result).toBe(true);
  });

  test('delegates transformation to block instance', () => {
    const block = new Block(BlockType.UL);
    const blockInstance = block.getBlockInstance();
    
    // Mock the applyTransformation method
    blockInstance.applyTransformation = jest.fn();
    
    block.applyTransformation();
    
    expect(blockInstance.applyTransformation).toHaveBeenCalled();
  });

  test('handles missing block instance gracefully', () => {
    const block = new Block();
    block._blockInstance = null;
    
    expect(block.handleKeyPress({}, 'text')).toBe(false);
    expect(block.handleEnterKey({})).toBe(false);
    expect(() => block.applyTransformation()).not.toThrow();
  });
});
