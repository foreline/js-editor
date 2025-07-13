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
     * @param {boolean} checked - For task list items
     * @param {object} blockInstance - Pre-created block instance
     */
    constructor(type = '', content = '', html = '', nested = false, checked = false, blockInstance = null) {
        // If we already have a block instance, use it
        if (blockInstance) {
            this._blockInstance = blockInstance;
            this._type = blockInstance._type;
            this._content = blockInstance._content;
            this._html = blockInstance._html;
            this._nested = blockInstance._nested;
            
            // For task list blocks, make sure checked state is available at Block level
            if (type === BlockType.SQ && blockInstance.isChecked) {
                this._checkedState = blockInstance.isChecked();
            } else {
                this._checkedState = checked;
            }
        } else {
            // Create the appropriate block instance using the factory
            const newBlockInstance = BlockFactory.createBlock(type, content, html, nested);
            
            // For task list blocks, set the checked state
            if (type === BlockType.SQ && newBlockInstance.setChecked) {
                newBlockInstance.setChecked(checked);
                this._checkedState = checked;
            } else {
                this._checkedState = checked;
            }
            
            // Copy properties from the block instance to this instance
            this._type = newBlockInstance._type;
            this._content = newBlockInstance._content;
            this._html = newBlockInstance._html;
            this._nested = newBlockInstance._nested;
            this._blockInstance = newBlockInstance;
        }
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

    get _checked() {
        if (this._blockInstance && this._blockInstance.isChecked) {
            return this._blockInstance.isChecked();
        }
        return this._checkedState || false;
    }

    set _checked(value) {
        this._checkedState = value;
        if (this._blockInstance && this._blockInstance.setChecked) {
            this._blockInstance.setChecked(value);
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