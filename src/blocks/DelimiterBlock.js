'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";

/**
 * Delimiter block (horizontal rule)
 */
export class DelimiterBlock extends BaseBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.DELIMITER, content, html, nested);
    }

    /**
     * Handle key press for delimiter blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Delimiters are typically not editable
        return false;
    }

    /**
     * Handle Enter key press for delimiter blocks
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // Create new paragraph after delimiter
        return false;
    }

    static getMarkdownTriggers() {
        return ['---', '***', '___'];
    }

    applyTransformation() {
        Toolbar.delimiter();
    }
}
