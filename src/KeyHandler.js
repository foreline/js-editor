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

        // Let the current block type handle the Enter key
        if (currentBlock.dataset && currentBlock.dataset.blockType) {
            const blockType = currentBlock.dataset.blockType;
            const block = BlockFactory.createBlock(blockType);
            
            if (block.handleEnterKey(e)) {
                Editor.update();
                return;
            }
        }

        // Default behavior - add new empty block
        Editor.addEmptyBlock();
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
