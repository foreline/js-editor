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
}
