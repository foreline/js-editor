import { TableBlock } from '../src/blocks/TableBlock.js';
import { Editor } from '../src/Editor.js';

// Mock Editor for testing
global.Editor = {
  currentBlock: null,
  update: jest.fn(),
  instance: null
};

describe('TableBlock Enhancements', () => {
  let tableBlock;
  let mockCurrentBlock;
  let mockTable;

  beforeEach(() => {
    // Create DOM mock
    document.body.innerHTML = '';
    
    // Create mock table structure
    mockCurrentBlock = document.createElement('div');
    mockCurrentBlock.setAttribute('data-block-type', 'table');
    
    mockTable = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Add 3 headers
    for (let i = 1; i <= 3; i++) {
      const th = document.createElement('th');
      th.textContent = `Column ${i}`;
      th.contentEditable = true;
      th.style.border = '1px solid #ddd';
      th.style.padding = '8px';
      th.style.background = '#f5f5f5';
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    mockTable.appendChild(thead);
    
    // Add tbody with 2 rows
    const tbody = document.createElement('tbody');
    for (let row = 1; row <= 2; row++) {
      const tr = document.createElement('tr');
      for (let col = 1; col <= 3; col++) {
        const td = document.createElement('td');
        td.textContent = `Row ${row} Col ${col}`;
        td.contentEditable = true;
        td.style.border = '1px solid #ddd';
        td.style.padding = '8px';
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    mockTable.appendChild(tbody);
    
    mockCurrentBlock.appendChild(mockTable);
    document.body.appendChild(mockCurrentBlock);
    
    // Set up Editor mock
    Editor.currentBlock = mockCurrentBlock;
    
    // Create TableBlock instance
    tableBlock = new TableBlock();
    tableBlock._headers = ['Column 1', 'Column 2', 'Column 3'];
    tableBlock._rows = [
      ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
      ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Table Controls Panel', () => {
    test('should show table controls when cell is focused', () => {
      const cell = mockTable.querySelector('td');
      
      tableBlock.showTableControls(cell);
      
      const controlPanel = document.querySelector('.table-controls-panel');
      expect(controlPanel).toBeTruthy();
      expect(controlPanel.children.length).toBe(4); // 4 buttons
    });

    test('should hide table controls', () => {
      const cell = mockTable.querySelector('td');
      tableBlock.showTableControls(cell);
      
      tableBlock.hideTableControls();
      
      const controlPanel = document.querySelector('.table-controls-panel');
      expect(controlPanel).toBeFalsy();
    });
  });

  describe('Column Operations', () => {
    test('should add a new column', () => {
      const initialColumnCount = mockTable.querySelectorAll('thead th').length;
      
      tableBlock.addColumn();
      
      const newColumnCount = mockTable.querySelectorAll('thead th').length;
      expect(newColumnCount).toBe(initialColumnCount + 1);
      
      // Check that all rows have the new cell
      const rows = mockTable.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row.children.length).toBe(newColumnCount);
      });
      
      expect(Editor.update).toHaveBeenCalled();
    });

    test('should remove the last column', () => {
      const initialColumnCount = mockTable.querySelectorAll('thead th').length;
      
      tableBlock.removeColumn();
      
      const newColumnCount = mockTable.querySelectorAll('thead th').length;
      expect(newColumnCount).toBe(initialColumnCount - 1);
      
      // Check that all rows have one less cell
      const rows = mockTable.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row.children.length).toBe(newColumnCount);
      });
      
      expect(Editor.update).toHaveBeenCalled();
    });

    test('should not remove column if only one remains', () => {
      // Remove columns until only one remains
      tableBlock.removeColumn(); // 3 -> 2
      tableBlock.removeColumn(); // 2 -> 1
      
      const columnCountBefore = mockTable.querySelectorAll('thead th').length;
      tableBlock.removeColumn(); // Should not remove
      const columnCountAfter = mockTable.querySelectorAll('thead th').length;
      
      expect(columnCountBefore).toBe(1);
      expect(columnCountAfter).toBe(1);
    });
  });

  describe('Row Operations', () => {
    test('should add a new row', () => {
      const initialRowCount = mockTable.querySelectorAll('tbody tr').length;
      
      tableBlock.addNewRow();
      
      const newRowCount = mockTable.querySelectorAll('tbody tr').length;
      expect(newRowCount).toBe(initialRowCount + 1);
      
      // Check that new row has correct number of cells
      const lastRow = mockTable.querySelector('tbody tr:last-child');
      const columnCount = mockTable.querySelectorAll('thead th').length;
      expect(lastRow.children.length).toBe(columnCount);
      
      expect(Editor.update).toHaveBeenCalled();
    });

    test('should remove the last row', () => {
      const initialRowCount = mockTable.querySelectorAll('tbody tr').length;
      
      tableBlock.removeRow();
      
      const newRowCount = mockTable.querySelectorAll('tbody tr').length;
      expect(newRowCount).toBe(initialRowCount - 1);
      
      expect(Editor.update).toHaveBeenCalled();
    });

    test('should not remove row if only one remains', () => {
      // Remove rows until only one remains
      tableBlock.removeRow(); // 2 -> 1
      
      const rowCountBefore = mockTable.querySelectorAll('tbody tr').length;
      tableBlock.removeRow(); // Should not remove
      const rowCountAfter = mockTable.querySelectorAll('tbody tr').length;
      
      expect(rowCountBefore).toBe(1);
      expect(rowCountAfter).toBe(1);
    });
  });

  describe('Cell Event Handling', () => {
    test('should show controls on cell focus', () => {
      const cell = mockTable.querySelector('td');
      const event = new Event('focus');
      Object.defineProperty(event, 'target', { value: cell });
      
      tableBlock.handleCellFocus(event);
      
      expect(cell.style.outline).toBe('2px solid #007cba');
      expect(cell.style.backgroundColor).toBe('rgb(240, 248, 255)');
      
      const controlPanel = document.querySelector('.table-controls-panel');
      expect(controlPanel).toBeTruthy();
    });

    test('should hide controls on cell blur with delay', (done) => {
      const cell = mockTable.querySelector('td');
      
      // First focus to show controls
      tableBlock.showTableControls(cell);
      expect(document.querySelector('.table-controls-panel')).toBeTruthy();
      
      // Then blur
      const event = new Event('blur');
      Object.defineProperty(event, 'target', { value: cell });
      
      tableBlock.handleCellBlur(event);
      
      // Check immediately - controls should still be there
      expect(document.querySelector('.table-controls-panel')).toBeTruthy();
      
      // Check after delay - controls should be hidden
      setTimeout(() => {
        expect(document.querySelector('.table-controls-panel')).toBeFalsy();
        done();
      }, 250);
    });
  });
});
