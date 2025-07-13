'use strict';

import {BlockType} from "@/BlockType";
import {BlockFactory} from "@/blocks/BlockFactory";

/**
 * Editor block - Backward compatibility wrapper
 * This class now delegates to the new block type system
 */
export class Block
{
    /**
     * @param {string} type
     * @param {string} content
     * @param {string} html
     * @param {boolean} nested
     */
    constructor(type = '', content = '', html = '', nested = false) {
        // Create the appropriate block instance using the factory
        const blockInstance = BlockFactory.createBlock(type, content, html, nested);
        
        // Copy properties from the block instance to this instance
        this._type = blockInstance._type;
        this._content = blockInstance._content;
        this._html = blockInstance._html;
        this._nested = blockInstance._nested;
        this._blockInstance = blockInstance;
    }

    get type() {
        return this._type;
    }
    
    set type(value) {
        this._type = value;
        if (this._blockInstance) {
            this._blockInstance._type = value;
        }
    }
    
    get content() {
        return this._content;
    }
    
    set content(value) {
        this._content = value;
        if (this._blockInstance) {
            this._blockInstance._content = value;
        }
    }
    
    get html() {
        return this._html;
    }
    
    set html(value) {
        this._html = value;
        if (this._blockInstance) {
            this._blockInstance._html = value;
        }
    }
    
    get nested() {
        return this._nested;
    }
    
    set nested(value) {
        this._nested = value;
        if (this._blockInstance) {
            this._blockInstance._nested = value;
        }
    }

    /**
     * Get the underlying block instance for advanced operations
     * @returns {BaseBlock}
     */
    getBlockInstance() {
        return this._blockInstance;
    }

    /**
     * Handle key press for this block type
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        if (this._blockInstance && this._blockInstance.handleKeyPress) {
            return this._blockInstance.handleKeyPress(event, text);
        }
        return false;
    }

    /**
     * Handle Enter key press for this block type
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        if (this._blockInstance && this._blockInstance.handleEnterKey) {
            return this._blockInstance.handleEnterKey(event);
        }
        return false;
    }

    /**
     * Apply this block type transformation via toolbar
     */
    applyTransformation() {
        if (this._blockInstance && this._blockInstance.applyTransformation) {
            this._blockInstance.applyTransformation();
        }
    }
}