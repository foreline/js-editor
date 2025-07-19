'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
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
        let currentBlock = event.target.closest('.block');
        
        // If no block is found but the target is a list item, get the current list item
        let currentListItem = null;
        if (!currentBlock && event.target.tagName === 'LI') {
            currentListItem = event.target;
            currentBlock = currentListItem.closest('ul, ol, div').closest('.block');
        } else if (currentBlock && event.target.tagName === 'LI') {
            currentListItem = event.target;
        } else if (currentBlock) {
            // Try to find the current list item within the block
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const element = range.startContainer.nodeType === Node.TEXT_NODE ? 
                    range.startContainer.parentElement : range.startContainer;
                currentListItem = element.closest('li');
            }
        }
        
        if (!currentBlock || !currentListItem) {
            return false;
        }

        const text = currentListItem.textContent.trim();
        
        // If the current list item is empty, end the list
        if (text === '') {
            // Remove the empty list item and create a new paragraph block
            event.preventDefault();
            currentListItem.remove();
            Editor.addEmptyBlock();
            return true;
        }
        
        // Check if cursor is at the end of the list item
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const isAtEnd = this.isCursorAtEndOfBlock(currentListItem, range);
            
            if (isAtEnd) {
                // Check if this is the last list item in the list
                const listContainer = currentListItem.parentElement; // ul or ol
                const allItems = listContainer ? listContainer.querySelectorAll('li') : [];
                const isLastItem = allItems.length > 0 && allItems[allItems.length - 1] === currentListItem;
                
                if (isLastItem) {
                    // Create a new list item in the same list when at the last item
                    event.preventDefault();
                    this.createNewListItem(currentBlock, currentListItem);
                    return true;
                } else {
                    // For non-last items, let browser handle default behavior (split the item)
                    return false;
                }
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
     * @param {HTMLElement} currentBlock - The block containing the list
     * @param {HTMLElement} currentListItem - The current list item
     */
    createNewListItem(currentBlock, currentListItem) {
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
