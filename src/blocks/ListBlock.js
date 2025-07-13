'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";
import {Editor} from "@/Editor";

/**
 * List block types
 */
export class ListBlock extends BaseBlock
{
    /**
     * Handle Enter key press for list blocks
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // List blocks should create new list items or end the list if empty
        const currentBlock = event.target.closest('.block');
        if (!currentBlock) {
            return false;
        }

        const text = currentBlock.textContent.trim();
        
        // If the current list item is empty, end the list
        if (text === '') {
            // Remove the empty list item and create a new paragraph block
            event.preventDefault();
            currentBlock.remove();
            Editor.addEmptyBlock();
            return true;
        }
        
        // Check if cursor is at the end of the list item
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const isAtEnd = this.isCursorAtEndOfBlock(currentBlock, range);
            
            if (isAtEnd) {
                // Create a new list item of the same type when cursor is at the end
                event.preventDefault();
                this.createNewListItem(currentBlock);
                return true;
            }
        }
        
        // If cursor is not at the end, let browser handle default behavior (line break)
        return false;
    }

    /**
     * Check if cursor is at the end of the current block
     * @param {HTMLElement} block
     * @param {Range} range
     * @returns {boolean}
     */
    isCursorAtEndOfBlock(block, range) {
        if (!range || !block) {
            return false;
        }

        // Check if the range is collapsed (cursor position, not selection)
        if (!range.collapsed) {
            return false;
        }

        // Get the text content length of the block
        const textContent = block.textContent || '';
        const textLength = textContent.length;
        
        // Calculate the current cursor position within the block
        const preRange = range.cloneRange();
        preRange.selectNodeContents(block);
        preRange.setEnd(range.endContainer, range.endOffset);
        const cursorPosition = preRange.toString().length;
        
        // Consider cursor at end if it's within 2 characters of the end
        // (accounts for trailing spaces or formatting)
        return cursorPosition >= textLength - 2;
    }

    /**
     * Create a new list item of the same type
     * @param {HTMLElement} currentBlock
     */
    createNewListItem(currentBlock) {
        // This will be implemented by subclasses
        return false;
    }

    /**
     * Get toolbar configuration for list blocks
     * @returns {Object|null} - toolbar button configuration
     */
    static getToolbarConfig() {
        return null; // Individual list classes will provide their own config
    }

    /**
     * Convert this list block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        // This will be implemented by subclasses
        return this._content;
    }

    /**
     * Convert this list block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        // This will be implemented by subclasses
        return this._html;
    }
}

/**
 * Unordered list block
 */
export class UnorderedListBlock extends ListBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.UL, content, html, nested);
    }

    /**
     * Handle key press for unordered list blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Handle indentation and list continuation
        return false;
    }

    static getMarkdownTriggers() {
        return ['* ', '- '];
    }

    applyTransformation() {
        Toolbar.ul();
    }

    /**
     * Create a new unordered list item
     * @param {HTMLElement} currentBlock
     */
    createNewListItem(currentBlock) {
        const newListItem = document.createElement('li');
        newListItem.classList.add('block');
        newListItem.setAttribute('data-block-type', 'ul');
        newListItem.contentEditable = true;
        
        // Insert after current block
        currentBlock.after(newListItem);
        
        // Focus on the new list item
        Editor.setCurrentBlock(newListItem);
        
        // Use requestAnimationFrame to ensure DOM is updated before focusing
        requestAnimationFrame(() => {
            newListItem.focus();
        });
        
        return true;
    }

    /**
     * Get toolbar configuration for unordered lists
     * @returns {Object} - toolbar button configuration
     */
    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-ul',
            icon: 'fa-list',
            title: 'Bullet List',
            group: 'lists'
        };
    }

    /**
     * Convert this unordered list block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        const items = this._content.split('\n');
        return items.map(item => `- ${item}`).join('\n');
    }

    /**
     * Convert this unordered list block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        const items = this._content.split('\n');
        const listItems = items.map(item => `<li>${item}</li>`).join('\n');
        return `<ul>\n${listItems}\n</ul>`;
    }
}

/**
 * Ordered list block
 */
export class OrderedListBlock extends ListBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.OL, content, html, nested);
    }

    /**
     * Handle key press for ordered list blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Handle numbering and list continuation
        return false;
    }

    static getMarkdownTriggers() {
        return ['1 ', '1.'];
    }

    applyTransformation() {
        Toolbar.ol();
    }

    /**
     * Create a new ordered list item
     * @param {HTMLElement} currentBlock
     */
    createNewListItem(currentBlock) {
        const newListItem = document.createElement('li');
        newListItem.classList.add('block');
        newListItem.setAttribute('data-block-type', 'ol');
        newListItem.contentEditable = true;
        
        // Insert after current block
        currentBlock.after(newListItem);
        
        // Focus on the new list item
        Editor.setCurrentBlock(newListItem);
        
        // Use requestAnimationFrame to ensure DOM is updated before focusing
        requestAnimationFrame(() => {
            newListItem.focus();
        });
        
        return true;
    }

    /**
     * Get toolbar configuration for ordered lists
     * @returns {Object} - toolbar button configuration
     */
    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-ol',
            icon: 'fa-list-ol',
            title: 'Numbered List',
            group: 'lists'
        };
    }

    /**
     * Convert this ordered list block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        const items = this._content.split('\n');
        return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
    }

    /**
     * Convert this ordered list block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        const items = this._content.split('\n');
        const listItems = items.map(item => `<li>${item}</li>`).join('\n');
        return `<ol>\n${listItems}\n</ol>`;
    }
}
