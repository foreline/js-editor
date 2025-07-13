'use strict';

import {BlockType} from "@/BlockType";

/**
 * Base class for all block types
 */
export class BaseBlock
{
    _type = BlockType.PARAGRAPH;
    _content = '';
    _html = '';
    _nested = false;
    
    /**
     * @param {string} type
     * @param {string} content
     * @param {string} html
     * @param {boolean} nested
     */
    constructor(type = '', content = '', html = '', nested = false) {
        if ( 0 === type.length ) {
            type = BlockType.PARAGRAPH;
        }
        type = BlockType.getBlockTypeFromHtmlTag(type);
        this._type = type;
        this._content = content;
        this._html = html;
        this._nested = nested;
    }

    get type() {
        return this._type;
    }
    
    set type(value) {
        this._type = value;
    }
    
    get content() {
        return this._content;
    }
    
    set content(value) {
        this._content = value;
    }
    
    get html() {
        return this._html;
    }
    
    set html(value) {
        this._html = value;
    }
    
    get nested() {
        return this._nested;
    }
    
    set nested(value) {
        this._nested = value;
    }

    /**
     * Handle key press for this block type
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Override in subclasses
        return false;
    }

    /**
     * Handle Enter key press for this block type
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // Override in subclasses
        return false;
    }

    /**
     * Get the markdown triggers that convert to this block type
     * @returns {string[]} - array of trigger strings
     */
    static getMarkdownTriggers() {
        return [];
    }

    /**
     * Check if text matches any of this block's markdown triggers
     * @param {string} text
     * @returns {boolean}
     */
    static matchesMarkdownTrigger(text) {
        const triggers = this.getMarkdownTriggers();
        return triggers.some(trigger => text === trigger);
    }

    /**
     * Apply this block type transformation via toolbar
     * Should be overridden by subclasses to call appropriate Toolbar method
     */
    applyTransformation() {
        // Override in subclasses
    }
}
