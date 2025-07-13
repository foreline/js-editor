'use strict';

import {ListBlock} from "@/blocks/ListBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";
import {Editor} from "@/Editor";

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
