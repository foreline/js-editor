import { BlockType } from '@/BlockType.js';

describe('BlockType', () => {
  test('contains all expected block types', () => {
    expect(BlockType.H1).toBe('h1');
    expect(BlockType.H2).toBe('h2');
    expect(BlockType.H3).toBe('h3');
    expect(BlockType.H4).toBe('h4');
    expect(BlockType.H5).toBe('h5');
    expect(BlockType.H6).toBe('h6');
    expect(BlockType.PARAGRAPH).toBe('paragraph');
    expect(BlockType.CODE).toBe('code');
    expect(BlockType.DELIMITER).toBe('delimiter');
    expect(BlockType.UL).toBe('ul');
    expect(BlockType.OL).toBe('ol');
    expect(BlockType.SQ).toBe('sq');
  });
});
