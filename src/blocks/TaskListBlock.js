'use strict';

import {ListBlock} from "@/blocks/ListBlock";
import {BlockType} from "@/BlockType";
import {Editor} from "@/Editor";

/**
 * Task list block (checkbox list)
 */
export class TaskListBlock extends ListBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.SQ, content, html, nested);
        this._checked = false; // Track checkbox state
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
            this.toggleCheckbox(event.target.closest('.block'));
            return true;
        }
        return false;
    }

    /**
     * Toggle checkbox state for the task list item
     * @param {HTMLElement} currentBlock
     */
    toggleCheckbox(currentBlock) {
        if (!currentBlock) return;
        
        const checkbox = currentBlock.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
            this._checked = checkbox.checked;
            
            // Update the visual state
            if (checkbox.checked) {
                currentBlock.classList.add('task-completed');
            } else {
                currentBlock.classList.remove('task-completed');
            }
            
            // Trigger editor update
            Editor.update();
        }
    }

    /**
     * Create a new task list item
     * @param {HTMLElement} currentBlock
     */
    createNewListItem(currentBlock) {
        const newListItem = document.createElement('li');
        newListItem.classList.add('block');
        newListItem.setAttribute('data-block-type', 'sq');
        newListItem.contentEditable = true;
        
        // Create checkbox input
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '8px';
        checkbox.addEventListener('change', (e) => {
            this.toggleCheckbox(newListItem);
        });
        
        // Insert checkbox and make room for text
        newListItem.appendChild(checkbox);
        newListItem.appendChild(document.createTextNode(' '));
        
        // Insert after current block
        currentBlock.after(newListItem);
        
        // Focus on the new list item
        Editor.setCurrentBlock(newListItem);
        
        // Use requestAnimationFrame to ensure DOM is updated before focusing
        requestAnimationFrame(() => {
            // Focus after the checkbox
            const textNode = newListItem.childNodes[1];
            if (textNode) {
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(textNode, 1);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            newListItem.focus();
        });
        
        return true;
    }

    static getMarkdownTriggers() {
        return ['- [ ]', '- [x]', '- []'];
    }

    applyTransformation() {
        // Get current block and convert to task list
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        // Set block type
        currentBlock.setAttribute('data-block-type', 'sq');
        
        // Clear existing content
        const existingText = currentBlock.textContent.trim();
        currentBlock.innerHTML = '';
        
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '8px';
        checkbox.addEventListener('change', (e) => {
            this.toggleCheckbox(currentBlock);
        });
        
        currentBlock.appendChild(checkbox);
        currentBlock.appendChild(document.createTextNode(' ' + existingText));
        
        Editor.setCurrentBlock(currentBlock);
        Editor.update();
    }

    /**
     * Get toolbar configuration for task lists
     * @returns {Object} - toolbar button configuration
     */
    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-sq',
            icon: 'fa-list-check',
            title: 'Checklist',
            group: 'lists'
        };
    }

    /**
     * Convert this task list block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        const checkbox = this._checked ? '[x]' : '[ ]';
        return `- ${checkbox} ${this._content}`;
    }

    /**
     * Convert this task list block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        const checked = this._checked ? ' checked' : '';
        return `<li class="task-list-item"><input type="checkbox"${checked}> ${this._content}</li>`;
    }

    /**
     * Set checkbox state
     * @param {boolean} checked
     */
    setChecked(checked) {
        this._checked = checked;
    }

    /**
     * Get checkbox state
     * @returns {boolean}
     */
    isChecked() {
        return this._checked;
    }
}
