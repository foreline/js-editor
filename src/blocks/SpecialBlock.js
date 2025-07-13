'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";

/**
 * Code block
 */
export class CodeBlock extends BaseBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.CODE, content, html, nested);
    }

    /**
     * Handle key press for code blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Handle special formatting in code blocks
        if (event.key === 'Tab') {
            // Insert tab character instead of changing focus
            event.preventDefault();
            document.execCommand('insertText', false, '\t');
            return true;
        }
        return false;
    }

    /**
     * Handle Enter key press for code blocks
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // In code blocks, preserve indentation on new lines
        return false;
    }

    static getMarkdownTriggers() {
        return ['```', '~~~'];
    }

    applyTransformation() {
        Toolbar.code();
    }
}

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
