import { TableBlock } from '@/blocks/TableBlock.js';
import { BaseBlock } from '@/blocks/BaseBlock.js';
import { BlockType } from '@/BlockType.js';
import { Toolbar } from '@/Toolbar.js';
import { Editor } from '@/Editor.js';

// Mock dependencies
jest.mock('@/Toolbar.js', () => ({
  Toolbar: {
    table: jest.fn()
  }
}));

jest.mock('@/Editor.js', () => ({
  Editor: {
    update: jest.fn(),
    currentBlock: null
  }
}));

describe('TableBlock', () => {
  let tableBlock;

  beforeEach(() => {
    tableBlock = new TableBlock();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('creates instance with default parameters', () => {
      const block = new TableBlock();
      expect(block).toBeInstanceOf(TableBlock);
      expect(block).toBeInstanceOf(BaseBlock);
      expect(block.type).toBe(BlockType.TABLE);
      expect(block.content).toBe('');
      expect(block.html).toBe('');
      expect(block.nested).toBe(false);
      expect(block._rows).toEqual([]);
      expect(block._headers).toEqual([]);
    });

    test('creates instance with custom parameters', () => {
      const content = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
      const html = '<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>';
      const nested = true;
      
      const block = new TableBlock(content, html, nested);
      expect(block.type).toBe(BlockType.TABLE);
      expect(block.content).toBe(content);
      expect(block.html).toBe(html);
      expect(block.nested).toBe(nested);
      expect(block._headers).toEqual(['Header 1', 'Header 2']);
      expect(block._rows).toEqual([['Cell 1', 'Cell 2']]);
    });

    test('parses content on construction', () => {
      const content = '| Name | Age | City |\n| --- | --- | --- |\n| John | 25 | NYC |\n| Jane | 30 | LA |';
      const block = new TableBlock(content);
      
      expect(block._headers).toEqual(['Name', 'Age', 'City']);
      expect(block._rows).toEqual([
        ['John', '25', 'NYC'],
        ['Jane', '30', 'LA']
      ]);
    });
  });

  describe('parseTableContent', () => {
    test('parses markdown table with headers and rows', () => {
      const content = '| Product | Price | Stock |\n| --- | --- | --- |\n| Apple | $1.00 | 50 |\n| Banana | $0.50 | 30 |';
      
      tableBlock.parseTableContent(content);
      
      expect(tableBlock._headers).toEqual(['Product', 'Price', 'Stock']);
      expect(tableBlock._rows).toEqual([
        ['Apple', '$1.00', '50'],
        ['Banana', '$0.50', '30']
      ]);
    });

    test('handles simple two-column table', () => {
      const content = '| Key | Value |\n| --- | --- |\n| Name | John |\n| Age | 25 |';
      
      tableBlock.parseTableContent(content);
      
      expect(tableBlock._headers).toEqual(['Key', 'Value']);
      expect(tableBlock._rows).toEqual([
        ['Name', 'John'],
        ['Age', '25']
      ]);
    });

    test('handles table with empty cells', () => {
      const content = '| Col1 | Col2 | Col3 |\n| --- | --- | --- |\n| A |  | C |\n|  | B |  |';
      
      tableBlock.parseTableContent(content);
      
      expect(tableBlock._headers).toEqual(['Col1', 'Col2', 'Col3']);
      expect(tableBlock._rows).toEqual([
        ['A', 'C'],
        ['B']
      ]);
    });

    test('handles malformed table content gracefully', () => {
      const content = 'Not a table';
      
      tableBlock.parseTableContent(content);
      
      expect(tableBlock._headers).toEqual([]);
      expect(tableBlock._rows).toEqual([]);
    });

    test('handles table with only headers', () => {
      const content = '| Header 1 | Header 2 |\n| --- | --- |';
      
      tableBlock.parseTableContent(content);
      
      expect(tableBlock._headers).toEqual(['Header 1', 'Header 2']);
      expect(tableBlock._rows).toEqual([]);
    });
  });

  describe('Key Handling', () => {
    beforeEach(() => {
      // Mock the table navigation methods
      tableBlock.moveToNextCell = jest.fn();
      tableBlock.addNewRow = jest.fn();
    });

    test('handleKeyPress handles Tab key', () => {
      const event = {
        key: 'Tab',
        preventDefault: jest.fn(),
        shiftKey: false
      };
      
      const result = tableBlock.handleKeyPress(event, 'cell content');
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(tableBlock.moveToNextCell).toHaveBeenCalledWith(false);
      expect(result).toBe(true);
    });

    test('handleKeyPress handles Shift+Tab key', () => {
      const event = {
        key: 'Tab',
        preventDefault: jest.fn(),
        shiftKey: true
      };
      
      const result = tableBlock.handleKeyPress(event, 'cell content');
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(tableBlock.moveToNextCell).toHaveBeenCalledWith(true);
      expect(result).toBe(true);
    });

    test('handleKeyPress handles Enter key', () => {
      const event = {
        key: 'Enter',
        preventDefault: jest.fn(),
        shiftKey: false
      };
      
      const result = tableBlock.handleKeyPress(event, 'cell content');
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(tableBlock.addNewRow).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('handleKeyPress ignores Shift+Enter', () => {
      const event = {
        key: 'Enter',
        shiftKey: true
      };
      
      const result = tableBlock.handleKeyPress(event, 'cell content');
      
      expect(result).toBe(false);
    });

    test('handleKeyPress ignores other keys', () => {
      const scenarios = [
        { key: 'a', shiftKey: false },
        { key: 'Backspace', shiftKey: false },
        { key: 'Delete', shiftKey: false },
        { key: 'ArrowUp', shiftKey: false }
      ];

      scenarios.forEach(({ key, shiftKey }) => {
        const event = { key, shiftKey };
        const result = tableBlock.handleKeyPress(event, 'cell content');
        expect(result).toBe(false);
      });
    });

    test('handleEnterKey adds new row', () => {
      const event = {
        preventDefault: jest.fn()
      };
      
      const result = tableBlock.handleEnterKey(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(tableBlock.addNewRow).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Table Data Management', () => {
    test('headers getter returns headers array', () => {
      tableBlock._headers = ['Col1', 'Col2', 'Col3'];
      expect(tableBlock.headers).toEqual(['Col1', 'Col2', 'Col3']);
    });

    test('rows getter returns rows array', () => {
      tableBlock._rows = [['A', 'B', 'C'], ['1', '2', '3']];
      expect(tableBlock.rows).toEqual([['A', 'B', 'C'], ['1', '2', '3']]);
    });

    test('headers setter updates headers array', () => {
      const newHeaders = ['Name', 'Email', 'Phone'];
      tableBlock.headers = newHeaders;
      expect(tableBlock._headers).toEqual(newHeaders);
    });

    test('rows setter updates rows array', () => {
      const newRows = [['John', 'john@example.com', '123-456-7890']];
      tableBlock.rows = newRows;
      expect(tableBlock._rows).toEqual(newRows);
    });
  });

  describe('Inheritance and Type', () => {
    test('inherits from BaseBlock', () => {
      expect(tableBlock).toBeInstanceOf(BaseBlock);
    });

    test('has correct block type', () => {
      expect(tableBlock.type).toBe(BlockType.TABLE);
    });

    test('maintains type when content changes', () => {
      tableBlock.content = '| New | Table |\n| --- | --- |\n| A | B |';
      expect(tableBlock.type).toBe(BlockType.TABLE);
    });
  });

  describe('Content and HTML handling', () => {
    test('can set and get content', () => {
      const content = '| Header 1 | Header 2 |\n| --- | --- |\n| Value 1 | Value 2 |';
      tableBlock.content = content;
      expect(tableBlock.content).toBe(content);
    });

    test('can set and get HTML', () => {
      const html = '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>';
      tableBlock.html = html;
      expect(tableBlock.html).toBe(html);
    });

    test('can set and get nested status', () => {
      expect(tableBlock.nested).toBe(false);
      tableBlock.nested = true;
      expect(tableBlock.nested).toBe(true);
    });
  });
});
