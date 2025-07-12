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

  describe('BlockType methods', () => {
    test('getBlockTypeFromHtmlTag returns correct block type', () => {
      expect(BlockType.getBlockTypeFromHtmlTag('h1')).toBe(BlockType.H1);
      expect(BlockType.getBlockTypeFromHtmlTag('h2')).toBe(BlockType.H2);
      expect(BlockType.getBlockTypeFromHtmlTag('p')).toBe(BlockType.PARAGRAPH);
      expect(BlockType.getBlockTypeFromHtmlTag('code')).toBe(BlockType.CODE);
      expect(BlockType.getBlockTypeFromHtmlTag('blockquote')).toBe(BlockType.QUOTE);
      expect(BlockType.getBlockTypeFromHtmlTag('ul')).toBe(BlockType.UL);
      expect(BlockType.getBlockTypeFromHtmlTag('unknown')).toBe(BlockType.PARAGRAPH);
    });

    test('isValid returns true for valid block types', () => {
      expect(BlockType.isValid(BlockType.H1)).toBe(true);
      expect(BlockType.isValid('invalid')).toBe(false);
    });

    test('isHeading identifies heading types correctly', () => {
      expect(BlockType.isHeading(BlockType.H1)).toBe(true);
      expect(BlockType.isHeading(BlockType.PARAGRAPH)).toBe(false);
    });

    test('isList identifies list types correctly', () => {
      expect(BlockType.isList(BlockType.UL)).toBe(true);
      expect(BlockType.isList(BlockType.H1)).toBe(false);
    });

    test('isBlock identifies valid block types correctly', () => {
      expect(BlockType.isBlock(BlockType.CODE)).toBe(true);
      expect(BlockType.isBlock('invalid')).toBe(false);
    });

    test('isQuote identifies quote type correctly', () => {
      expect(BlockType.isQuote(BlockType.QUOTE)).toBe(true);
      expect(BlockType.isQuote(BlockType.H1)).toBe(false);
    });

    test('isParagraph identifies paragraph type correctly', () => {
      expect(BlockType.isParagraph(BlockType.PARAGRAPH)).toBe(true);
      expect(BlockType.isParagraph(BlockType.H1)).toBe(false);
    });

    test('isCode identifies code type correctly', () => {
      expect(BlockType.isCode(BlockType.CODE)).toBe(true);
      expect(BlockType.isCode(BlockType.H1)).toBe(false);
    });

    test('isDelimiter identifies delimiter type correctly', () => {
      expect(BlockType.isDelimiter(BlockType.DELIMITER)).toBe(true);
      expect(BlockType.isDelimiter(BlockType.H1)).toBe(false);
    });
  });

  describe('BlockType uncovered lines', () => {
    test('getBlockTypeFromHtmlTag handles pre tag correctly', () => {
      expect(BlockType.getBlockTypeFromHtmlTag('pre')).toBe(BlockType.CODE);
    });

    test('getBlockTypeFromHtmlTag handles default case correctly', () => {
      expect(BlockType.getBlockTypeFromHtmlTag('unknown')).toBe(BlockType.PARAGRAPH);
    });
  });
});
