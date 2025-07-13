'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";
import {CodeBlock} from "@/blocks/CodeBlock";

// Re-export CodeBlock for backward compatibility
export {CodeBlock};

/**
 * Quote block
 */
export class QuoteBlock extends BaseBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.QUOTE, content, html, nested);
    }

    /**
     * Handle key press for quote blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Quote blocks don't have special key handling
        return false;
    }

    /**
     * Handle Enter key press for quote blocks
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // Continue quote on new line or end quote
        return false;
    }

    static getMarkdownTriggers() {
        return ['> '];
    }

    applyTransformation() {
        Toolbar.quote();
    }
}

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
