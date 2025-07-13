'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";
import {Editor} from "@/Editor";

/**
 * Table block for markdown tables
 */
export class TableBlock extends BaseBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.TABLE, content, html, nested);
        this._rows = [];
        this._headers = [];
        
        // Parse content if provided
        if (content) {
            this.parseTableContent(content);
        }
    }

    /**
     * Parse table content from markdown format
     * @param {string} content - Table content in markdown format
     */
    parseTableContent(content) {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length >= 2) {
            // First line is headers
            this._headers = lines[0].split('|').map(cell => cell.trim()).filter(cell => cell);
            
            // Skip separator line (second line with dashes)
            // Remaining lines are data rows
            this._rows = lines.slice(2).map(line => 
                line.split('|').map(cell => cell.trim()).filter(cell => cell)
            );
        }
    }

    /**
     * Handle key press for table blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Handle Tab key for moving between cells
        if (event.key === 'Tab') {
            event.preventDefault();
            this.moveToNextCell(event.shiftKey);
            return true;
        }
        
        // Handle Enter key for adding new rows
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.addNewRow();
            return true;
        }
        
        return false;
    }

    /**
     * Handle Enter key press for table blocks
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // Add new row when Enter is pressed in a table
        event.preventDefault();
        this.addNewRow();
        return true;
    }

    /**
     * Move focus to next/previous cell
     * @param {boolean} backwards - true to move backwards (Shift+Tab)
     */
    moveToNextCell(backwards = false) {
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        const table = currentBlock.closest('table') || currentBlock.querySelector('table');
        if (!table) return;
        
        const cells = table.querySelectorAll('td, th');
        const currentCell = document.activeElement.closest('td, th');
        
        if (currentCell) {
            const currentIndex = Array.from(cells).indexOf(currentCell);
            let nextIndex = backwards ? currentIndex - 1 : currentIndex + 1;
            
            if (nextIndex >= 0 && nextIndex < cells.length) {
                cells[nextIndex].focus();
            }
        }
    }

    /**
     * Add a new row to the table
     */
    addNewRow() {
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        const table = currentBlock.querySelector('table');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        // Create new row with same number of columns as headers
        const newRow = document.createElement('tr');
        for (let i = 0; i < this._headers.length; i++) {
            const cell = document.createElement('td');
            cell.contentEditable = true;
            cell.style.border = '1px solid #ddd';
            cell.style.padding = '8px';
            newRow.appendChild(cell);
        }
        
        tbody.appendChild(newRow);
        
        // Focus on first cell of new row
        const firstCell = newRow.querySelector('td');
        if (firstCell) {
            firstCell.focus();
        }
        
        // Update internal data structure
        this._rows.push(new Array(this._headers.length).fill(''));
        
        Editor.update();
    }

    /**
     * Get markdown triggers for table creation
     * @returns {Array<string>} - Array of trigger strings
     */
    static getMarkdownTriggers() {
        return ['| ', '|--', '|:--'];
    }

    /**
     * Apply table transformation
     */
    applyTransformation() {
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        // Create a basic 2x3 table (header + 2 rows, 3 columns)
        this._headers = ['Column 1', 'Column 2', 'Column 3'];
        this._rows = [
            ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
            ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
        ];
        
        currentBlock.setAttribute('data-block-type', 'table');
        currentBlock.innerHTML = this.generateTableHTML();
        
        // Ensure cells are properly editable
        this.setupCellEditing(currentBlock);
        
        Editor.setCurrentBlock(currentBlock);
        Editor.update();
    }

    /**
     * Set up cell editing for the table
     * @param {HTMLElement} tableBlock - the table block element
     */
    setupCellEditing(tableBlock) {
        const table = tableBlock.querySelector('table');
        if (!table) return;
        
        // Ensure all cells are properly set up for editing
        const cells = table.querySelectorAll('td, th');
        cells.forEach(cell => {
            // Ensure contentEditable is set
            cell.contentEditable = true;
            
            // Add tabindex to make cells focusable
            cell.tabIndex = 0;
            
            // Remove any existing event listeners to avoid duplicates
            cell.removeEventListener('focus', this.handleCellFocus);
            cell.removeEventListener('blur', this.handleCellBlur);
            cell.removeEventListener('input', this.handleCellInput);
            
            // Add event listeners
            cell.addEventListener('focus', this.handleCellFocus.bind(this));
            cell.addEventListener('blur', this.handleCellBlur.bind(this));
            cell.addEventListener('input', this.handleCellInput.bind(this));
        });
        
        // Focus on first cell if it exists
        const firstCell = table.querySelector('td, th');
        if (firstCell) {
            setTimeout(() => {
                firstCell.focus();
            }, 100);
        }
    }

    /**
     * Handle cell focus events
     * @param {Event} event
     */
    handleCellFocus(event) {
        const cell = event.target;
        cell.style.outline = '2px solid #007cba';
        cell.style.backgroundColor = '#f0f8ff';
        
        // Show table controls when any cell is focused
        this.showTableControls(cell);
    }

    /**
     * Handle cell blur events
     * @param {Event} event
     */
    handleCellBlur(event) {
        const cell = event.target;
        cell.style.outline = '';
        cell.style.backgroundColor = '';
        
        // Update internal data structure when cell loses focus
        this.updateDataFromDOM();
        
        // Hide table controls after a short delay (to allow clicking on controls)
        setTimeout(() => {
            this.hideTableControls();
        }, 200);
    }

    /**
     * Handle cell input events
     * @param {Event} event
     */
    handleCellInput(event) {
        // Update internal data structure as user types
        this.updateDataFromDOM();
        Editor.update();
    }

    /**
     * Update internal data structure from current DOM state
     */
    updateDataFromDOM() {
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        const table = currentBlock.querySelector('table');
        if (!table) return;
        
        // Update headers
        const headerCells = table.querySelectorAll('th');
        this._headers = Array.from(headerCells).map(cell => cell.textContent || '');
        
        // Update rows
        const rows = table.querySelectorAll('tbody tr');
        this._rows = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return Array.from(cells).map(cell => cell.textContent || '');
        });
    }

    /**
     * Generate HTML table structure
     * @returns {string} - HTML table string
     */
    generateTableHTML() {
        let html = '<table style="border-collapse: collapse; width: 100%;">';
        
        // Add header
        if (this._headers.length > 0) {
            html += '<thead><tr>';
            this._headers.forEach(header => {
                html += `<th contenteditable="true" style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">${header}</th>`;
            });
            html += '</tr></thead>';
        }
        
        // Add rows
        if (this._rows.length > 0) {
            html += '<tbody>';
            this._rows.forEach(row => {
                html += '<tr>';
                row.forEach(cell => {
                    html += `<td contenteditable="true" style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody>';
        }
        
        html += '</table>';
        return html;
    }

    /**
     * Show table control buttons near the focused table
     * @param {HTMLElement} cell - The focused cell
     */
    showTableControls(cell) {
        // Remove any existing control panel
        this.hideTableControls();
        
        const tableBlock = cell.closest('[data-block-type="table"]');
        if (!tableBlock) return;
        
        const table = tableBlock.querySelector('table');
        if (!table) return;
        
        // Create control panel
        const controlPanel = document.createElement('div');
        controlPanel.className = 'table-controls-panel';
        controlPanel.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            gap: 4px;
        `;
        
        // Create buttons
        const buttons = [
            {
                icon: '➕📋',
                title: 'Add Row',
                action: () => this.addNewRow()
            },
            {
                icon: '➖📋',
                title: 'Remove Row',
                action: () => this.removeRow()
            },
            {
                icon: '➕📄',
                title: 'Add Column',
                action: () => this.addColumn()
            },
            {
                icon: '➖📄',
                title: 'Remove Column',
                action: () => this.removeColumn()
            }
        ];
        
        buttons.forEach(buttonConfig => {
            const button = document.createElement('button');
            button.innerHTML = buttonConfig.icon;
            button.title = buttonConfig.title;
            button.style.cssText = `
                background: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 3px;
                padding: 6px 8px;
                cursor: pointer;
                font-size: 12px;
                min-width: 28px;
                height: 28px;
            `;
            
            button.addEventListener('mouseenter', () => {
                button.style.background = '#e9ecef';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = '#f8f9fa';
            });
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                buttonConfig.action();
            });
            
            controlPanel.appendChild(button);
        });
        
        // Position the control panel
        const tableRect = table.getBoundingClientRect();
        const containerRect = tableBlock.getBoundingClientRect();
        
        controlPanel.style.left = '10px';
        controlPanel.style.top = '-45px';
        
        // Add to table block with relative positioning
        tableBlock.style.position = 'relative';
        tableBlock.appendChild(controlPanel);
        
        // Store reference for cleanup
        this._controlPanel = controlPanel;
    }

    /**
     * Hide table control buttons
     */
    hideTableControls() {
        if (this._controlPanel) {
            this._controlPanel.remove();
            this._controlPanel = null;
        }
        
        // Also remove any orphaned control panels
        document.querySelectorAll('.table-controls-panel').forEach(panel => {
            panel.remove();
        });
    }

    /**
     * Add a new column to the table
     */
    addColumn() {
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        const table = currentBlock.querySelector('table');
        if (!table) return;
        
        // Get current table structure
        const headerRow = table.querySelector('thead tr');
        const bodyRows = table.querySelectorAll('tbody tr');
        
        // Add header for new column
        if (headerRow) {
            const newHeader = document.createElement('th');
            newHeader.contentEditable = true;
            newHeader.style.border = '1px solid #ddd';
            newHeader.style.padding = '8px';
            newHeader.style.background = '#f5f5f5';
            const columnCount = headerRow.children.length;
            newHeader.textContent = `Column ${columnCount + 1}`;
            headerRow.appendChild(newHeader);
        }
        
        // Add cells to all existing rows
        bodyRows.forEach(row => {
            const newCell = document.createElement('td');
            newCell.contentEditable = true;
            newCell.style.border = '1px solid #ddd';
            newCell.style.padding = '8px';
            newCell.textContent = '';
            row.appendChild(newCell);
        });
        
        // Update internal data structure
        this._headers.push(`Column ${this._headers.length + 1}`);
        this._rows.forEach(row => row.push(''));
        
        // Re-setup cell editing
        this.setupCellEditing(currentBlock);
        Editor.update();
    }

    /**
     * Remove the last column from the table
     */
    removeColumn() {
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        const table = currentBlock.querySelector('table');
        if (!table) return;
        
        const headerRow = table.querySelector('thead tr');
        const bodyRows = table.querySelectorAll('tbody tr');
        
        // Don't remove if only one column left
        if (headerRow && headerRow.children.length <= 1) return;
        
        // Remove header
        if (headerRow) {
            const lastHeader = headerRow.lastElementChild;
            if (lastHeader) lastHeader.remove();
        }
        
        // Remove cells from all rows
        bodyRows.forEach(row => {
            const lastCell = row.lastElementChild;
            if (lastCell) lastCell.remove();
        });
        
        // Update internal data structure
        this._headers.pop();
        this._rows.forEach(row => row.pop());
        
        Editor.update();
    }

    /**
     * Remove the last row from the table
     */
    removeRow() {
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        const table = currentBlock.querySelector('table');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        
        if (tbody) {
            // Don't remove if only one row left
            if (tbody.children.length <= 1) return;
            
            // Remove last row
            const lastRow = tbody.lastElementChild;
            if (lastRow) lastRow.remove();
            
            // Update internal data structure
            this._rows.pop();
            
            Editor.update();
        }
    }

    /**
     * Convert this table block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        if (!this._headers.length) return '';
        
        let markdown = '| ' + this._headers.join(' | ') + ' |\n';
        markdown += '| ' + this._headers.map(() => '---').join(' | ') + ' |\n';
        
        this._rows.forEach(row => {
            markdown += '| ' + row.join(' | ') + ' |\n';
        });
        
        return markdown;
    }

    /**
     * Convert this table block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        return this.generateTableHTML();
    }

    /**
     * Get disabled toolbar buttons for table blocks
     * @returns {Array<string>} - Array of disabled button classes
     */
    static getDisabledButtons() {
        return ['editor-toolbar-bold', 'editor-toolbar-italic', 'editor-toolbar-ul', 'editor-toolbar-ol'];
    }

    /**
     * Set table headers
     * @param {Array<string>} headers
     */
    setHeaders(headers) {
        this._headers = headers;
    }

    /**
     * Add row to table
     * @param {Array<string>} rowData
     */
    addRow(rowData) {
        this._rows.push(rowData);
    }

    /**
     * Get table headers
     * @returns {Array<string>}
     */
    getHeaders() {
        return this._headers;
    }

    /**
     * Get table rows
     * @returns {Array<Array<string>>}
     */
    getRows() {
        return this._rows;
    }

    /**
     * Get toolbar configuration for tables
     * @returns {Object} - toolbar button configuration
     */
    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-table',
            icon: 'fa-table',
            title: 'Table',
            group: 'blocks'
        };
    }
}
