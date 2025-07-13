'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";

/**
 * Paragraph block type
 */
export class ParagraphBlock extends BaseBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.PARAGRAPH, content, html, nested);
    }

    /**
     * Handle key press for paragraph blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Paragraph blocks don't have special key handling
        return false;
    }

    /**
     * Handle Enter key press for paragraph blocks
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // Default behavior - create new paragraph
        return false;
    }

    /**
     * Get the markdown triggers that convert to paragraph
     * @returns {string[]} - array of trigger strings
     */
    static getMarkdownTriggers() {
        return [];
    }

    /**
     * Apply paragraph transformation via toolbar
     */
    applyTransformation() {
        Toolbar.paragraph();
    }

    /**
     * Get toolbar configuration for paragraph blocks
     * @returns {Object|null} - toolbar button configuration
     */
    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-paragraph',
            label: 'Paragraph',
            group: 'headers'
        };
    }

    /**
     * Convert this paragraph block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        return this._content;
    }

    /**
     * Convert this paragraph block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        return `<p>${this._content}</p>`;
    }
}
