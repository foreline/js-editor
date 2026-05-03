'use strict';

import {log} from "./utils/log.js";

/**
 * Manages cursor placement and editable-element resolution within the editor.
 * All methods are pure DOM operations — they do not mutate editor state or fire events.
 */
export class CursorManager
{
    /**
     * Helper method to focus on an element without recursion
     * @param {HTMLElement} element - The element to focus on
     */
    focusElement(element)
    {
        log('focusElement()', 'CursorManager.');

        if (!element || !element.isConnected) {
            return;
        }
        
        const range = document.createRange();
        const selection = window.getSelection();
    
        // Clear existing selections
        selection.removeAllRanges();
        
        // Create and set the range
        range.selectNodeContents(element);
        range.collapse(false);
        
        // Set the selection
        selection.addRange(range);
    
        // Ensure element is visible
        element.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Resolves the best contenteditable element to target within a block element.
     * @param {HTMLElement} blockElement
     * @returns {HTMLElement}
     */
    findEditableElementInBlock(blockElement)
    {
        log('findEditableElementInBlock()', 'CursorManager.');

        // 1) For list blocks, prefer the first list item (or its editable child)
        const firstListItem = blockElement.querySelector('li');
        if (firstListItem) {
            const editableInLi = firstListItem.querySelector('[contenteditable="true"]');
            return editableInLi || firstListItem;
        }

        // 2) Prefer any explicitly editable descendant (e.g., <h1 contenteditable="true">)
        const editableChild = blockElement.querySelector('[contenteditable="true"]');
        if (editableChild) {
            return editableChild;
        }

        // 3) If the block itself is contenteditable, use it
        if (blockElement.isContentEditable || blockElement.getAttribute('contenteditable') === 'true') {
            return blockElement;
        }

        // 4) Fallback to the block itself
        return blockElement;
    }

    /**
     * Place cursor at the end of the given element
     * @param {HTMLElement} element - The element to place cursor in
     */
    placeCursorAtEnd(element)
    {
        log('placeCursorAtEnd()', 'CursorManager.');

        if (!element) {
            return;
        }

        try {
            const selection = window.getSelection();
            const range = document.createRange();
            
            // If element has text content, place cursor at the end
            if (element.childNodes.length > 0) {
                const lastChild = element.childNodes[element.childNodes.length - 1];
                if (lastChild.nodeType === Node.TEXT_NODE) {
                    range.setStart(lastChild, lastChild.textContent.length);
                } else {
                    range.setStart(element, element.childNodes.length);
                }
            } else {
                range.setStart(element, 0);
            }
            
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (error) {
            // Silently fail for cursor positioning
        }
    }

    /**
     * Place cursor at the start of the given element
     * @param {HTMLElement} element - The element to place cursor in
     */
    placeCursorAtStart(element)
    {
        log('placeCursorAtStart()', 'CursorManager.');

        if (!element) {
            return;
        }

        try {
            const selection = window.getSelection();
            const range = document.createRange();
            range.setStart(element, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (error) {
            // Silently fail for cursor positioning
        }
    }

    /**
     * Place cursor at a specific character offset within an element.
     * Clamps to the element's text length if offset exceeds it.
     * @param {HTMLElement} element - The element to place cursor in
     * @param {number} offset - The desired character offset from the start
     */
    placeCursorAtOffset(element, offset)
    {
        log('placeCursorAtOffset()', 'CursorManager.');

        if (!element) {
            return;
        }

        try {
            const selection = window.getSelection();
            const textLength = (element.textContent || '').length;
            const targetOffset = Math.min(offset, textLength);

            // Walk through text nodes to find the correct node and local offset
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
            let remaining = targetOffset;
            let node = walker.nextNode();

            while (node) {
                const len = node.textContent.length;
                if (remaining <= len) {
                    const range = document.createRange();
                    range.setStart(node, remaining);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return;
                }
                remaining -= len;
                node = walker.nextNode();
            }

            // Fallback — no text nodes (empty element), place at start
            const range = document.createRange();
            range.setStart(element, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (error) {
            // Silently fail for cursor positioning
        }
    }
}
