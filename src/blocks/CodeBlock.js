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
