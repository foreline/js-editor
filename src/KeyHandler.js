'use strict';

import {BlockFactory} from "@/blocks/BlockFactory";
import {Editor} from "@/Editor";
import {Utils} from "@/Utils";
import {log} from "@/utils/log.js";

/**
 * Centralized key handling system for the editor
 */
export class KeyHandler
{
    /**
     * Handle key press events
     * @param {KeyboardEvent} e
     */
    static handleKeyPress(e) {
        log('handleKeyPress()', 'KeyHandler.'); 
        
        Editor.keybuffer.push(e.key);
        
        if (!Editor.currentBlock) {
            return;
        }

        const innerHtml = Editor.currentBlock.innerHTML;
        const text = Utils.stripTags(innerHtml);

        // Try to find a block type that matches the current text as a markdown trigger
        const matchingBlockClass = BlockFactory.findBlockClassForTrigger(text);
        
        if (matchingBlockClass) {
            // Clear the current block content and apply the transformation
            Editor.currentBlock.innerHTML = '';
            const blockInstance = new matchingBlockClass();
            blockInstance.applyTransformation();
            Editor.update();
            return;
        }

        // If no markdown trigger matched, let the current block handle the key press
        const currentBlock = Editor.currentBlock;
        if (currentBlock && currentBlock.dataset && currentBlock.dataset.blockType) {
            const blockType = currentBlock.dataset.blockType;
            const block = BlockFactory.createBlock(blockType);
            
            if (block.handleKeyPress(e, text)) {
                Editor.update();
                return;
            }
        }

        // Default behavior
        Editor.update();
    }

    /**
     * Handle special key combinations
     * @param {KeyboardEvent} e
     */
    static handleSpecialKeys(e) {
        log('handleSpecialKeys()', 'KeyHandler.');
        
        if ('Enter' === e.key && !e.shiftKey) {
            return this.handleEnterKey(e);
        }
        
        if ('Backspace' === e.key) {
            return this.handleBackspaceKey(e);
        }
        
        if ('Tab' === e.key) {
            // Let individual block types handle tab
            const currentBlock = Editor.currentBlock;
            if (currentBlock && currentBlock.dataset && currentBlock.dataset.blockType) {
                const blockType = currentBlock.dataset.blockType;
                const block = BlockFactory.createBlock(blockType);
                
                if (block.handleKeyPress(e, '')) {
                    return;
                }
            }
            
            // Default tab behavior
            e.preventDefault();
            // Could call Toolbar.tab() here if that functionality exists
        }
    }

    /**
     * Handle Enter key press
     * @param {KeyboardEvent} e
     */
    static handleEnterKey(e) {
        log('handleEnterKey()', 'KeyHandler.');

        const currentBlock = Editor.currentBlock;
        if (!currentBlock) {
            return;
        }

        // Check for code block creation trigger (triple backticks)
        let ticksCounter = 0;
        for (let i = Editor.keybuffer.length; i >= 0; i--) {
            const j = i - 1;
            const sliceKey = Editor.keybuffer[j];
            
            // Stop at previous Enter
            if ('Enter' === sliceKey) {
                break;
            }
            
            if ('`' === sliceKey) {
                ticksCounter++;
            }
            
            if (3 === ticksCounter) {
                // Create code block
                const codeBlock = BlockFactory.createBlock('code');
                codeBlock.applyTransformation();
                Editor.update();
                return;
            }
        }

        // Check if cursor is at the end of the block for default behavior
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const isAtEnd = this.isCursorAtEndOfBlock(currentBlock, range);
        
        // Let the current block type handle the Enter key first
        if (currentBlock.dataset && currentBlock.dataset.blockType) {
            const blockType = currentBlock.dataset.blockType;
            const block = BlockFactory.createBlock(blockType);
            
            if (block.handleEnterKey(e)) {
                Editor.update();
                return;
            }
        }
        
        if (isAtEnd) {
            // Default behavior - add new empty block when cursor is at the end
            e.preventDefault();
            Editor.addEmptyBlock();
            Editor.update();
        }
        // If cursor is not at the end, let the browser handle default behavior (line break)
    }

    /**
     * Check if cursor is at the end of the current block
     * @param {HTMLElement} block
     * @param {Range} range
     * @returns {boolean}
     */
    static isCursorAtEndOfBlock(block, range) {
        if (!range || !block) {
            return false;
        }

        // Check if the range is collapsed (cursor position, not selection)
        if (!range.collapsed) {
            return false;
        }

        // Get the text content length of the block
        const textContent = block.textContent || '';
        const textLength = textContent.length;
        
        // Calculate the current cursor position within the block
        const preRange = range.cloneRange();
        preRange.selectNodeContents(block);
        preRange.setEnd(range.endContainer, range.endOffset);
        const cursorPosition = preRange.toString().length;
        
        // Consider cursor at end if it's within 2 characters of the end
        // (accounts for trailing spaces or formatting)
        return cursorPosition >= textLength - 2;
    }

    /**
     * Handle Backspace key press
     * @param {KeyboardEvent} e
     */
    static handleBackspaceKey(e) {
        log('handleBackspaceKey()', 'KeyHandler.');

        const currentBlock = Editor.currentBlock;
        if (!currentBlock) {
            return;
        }

        // Check if current block is empty (only whitespace or no content)
        const text = Utils.stripTags(currentBlock.innerHTML).trim();
        
        // Only handle backspace for empty blocks
        if (text === '') {
            // Find the previous block
            const previousBlock = currentBlock.previousElementSibling;
            
            // Don't remove the last remaining block
            const allBlocks = Editor.instance.querySelectorAll('.block');
            if (allBlocks.length <= 1) {
                return;
            }
            
            // Remove the empty block and focus on previous block
            if (previousBlock && previousBlock.classList.contains('block')) {
                Editor.setCurrentBlock(previousBlock);
                currentBlock.remove();
                previousBlock.focus();
                Editor.update();
                e.preventDefault();
                return;
            } else {
                // If no previous block, focus on next block (if exists)
                const nextBlock = currentBlock.nextElementSibling;
                if (nextBlock && nextBlock.classList.contains('block')) {
                    Editor.setCurrentBlock(nextBlock);
                    currentBlock.remove();
                    nextBlock.focus();
                    Editor.update();
                    e.preventDefault();
                    return;
                }
            }
        }

        // Let the current block type handle the backspace key if not handled above
        if (currentBlock.dataset && currentBlock.dataset.blockType) {
            const blockType = currentBlock.dataset.blockType;
            const block = BlockFactory.createBlock(blockType);
            
            if (block.handleBackspaceKey && block.handleBackspaceKey(e)) {
                Editor.update();
                return;
            }
        }
    }

    /**
     * Clear the key buffer
     */
    static clearKeyBuffer() {
        Editor.keybuffer = [];
    }

    /**
     * Get the current key buffer
     * @returns {string[]}
     */
    static getKeyBuffer() {
        return [...Editor.keybuffer];
    }
}
