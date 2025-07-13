'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";

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
        return false;
    }
}

/**
 * Unordered list block
 */
export class UnorderedListBlock extends ListBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.UL, content, html, nested);
    }

    /**
     * Handle key press for unordered list blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Handle indentation and list continuation
        return false;
    }

    static getMarkdownTriggers() {
        return ['* ', '- '];
    }

    applyTransformation() {
        Toolbar.ul();
    }
}

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
}

/**
 * Task list block (checkbox list)
 */
export class TaskListBlock extends ListBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.SQ, content, html, nested);
    }

    /**
     * Handle key press for task list blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Handle checkbox toggling and task list continuation
        if (event.key === ' ' && event.ctrlKey) {
            // Toggle checkbox state
            // This would need to be implemented
            return true;
        }
        return false;
    }

    static getMarkdownTriggers() {
        return ['[] '];
    }

    applyTransformation() {
        Toolbar.sq();
    }
}
