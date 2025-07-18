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
        this._checked = false; // Track checkbox state - must be after super() call
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
        newListItem.classList.add('task-list-item');
        newListItem.setAttribute('data-block-type', 'sq');
        newListItem.style.listStyle = 'none';
        newListItem.style.display = 'flex';
        newListItem.style.alignItems = 'flex-start';
        
        // Create checkbox input
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '8px';
        checkbox.style.marginTop = '2px';
        checkbox.style.flexShrink = '0';
        
        // Create text container
        const textContainer = document.createElement('span');
        textContainer.contentEditable = true;
        textContainer.style.outline = 'none';
        textContainer.style.flex = '1';
        
        // Add checkbox change event
        checkbox.addEventListener('change', (e) => {
            if (checkbox.checked) {
                newListItem.classList.add('task-completed');
            } else {
                newListItem.classList.remove('task-completed');
            }
        });
        
        newListItem.appendChild(checkbox);
        newListItem.appendChild(textContainer);
        
        // Insert after current block
        currentBlock.after(newListItem);
        
        // Focus on the text container
        Editor.setCurrentBlock(newListItem);
        
        // Use requestAnimationFrame to ensure DOM is updated before focusing
        requestAnimationFrame(() => {
            textContainer.focus();
            // Place cursor at the start of the text container
            const selection = window.getSelection();
            const range = document.createRange();
            range.setStart(textContainer, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        });
        
        return true;
    }

    /**
     * Get markdown triggers for task list blocks
     * @returns {Array<string>} - Array of markdown triggers
     */
    static getMarkdownTriggers() {
        return ['- [ ]', '- [x]', '- [X]', '- []', '[]', '[x]', '[X]', '[ ]'];
    }

    /**
     * Apply transformation to the current block
     * @returns {string} - markdown representation
     */
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

    /**
     * Render this task list block as an HTML element
     * @returns {HTMLElement} - DOM element representation
     */
    renderToElement() {
        let element = document.createElement('li');
        element.classList.add('task-list-item');
        element.setAttribute('data-block-type', 'sq');
        element.setAttribute('data-placeholder', 'Task item');
        element.style.listStyle = 'none';
        element.style.marginLeft = '0';
        element.style.paddingLeft = '0';
        element.style.display = 'flex';
        element.style.alignItems = 'flex-start';
        
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '8px';
        checkbox.style.marginTop = '2px';
        checkbox.style.flexShrink = '0';
        checkbox.checked = this._checked;
        
        // Create text container that is editable
        const textContainer = document.createElement('span');
        textContainer.contentEditable = true;
        textContainer.style.outline = 'none';
        textContainer.style.flex = '1';
        textContainer.textContent = this._content || '';
        
        // Add change event listener
        checkbox.addEventListener('change', (e) => {
            this._checked = checkbox.checked;
            if (this._checked) {
                element.classList.add('task-completed');
            } else {
                element.classList.remove('task-completed');
            }
        });
        
        element.appendChild(checkbox);
        element.appendChild(textContainer);
        
        return element;
    }

    /**
     * Check if this block type can parse the given HTML
     * @param {string} htmlString - HTML to check
     * @returns {boolean} - true if can parse, false otherwise
     */
    static canParseHtml(htmlString) {
        return htmlString.includes('data-block-type="sq"') ||
               (htmlString.includes('<input type="checkbox"') && htmlString.includes('<li'));
    }

    /**
     * Parse HTML string to create a task list block instance
     * @param {string} htmlString - HTML to parse
     * @returns {TaskListBlock|null} - Block instance or null if can't parse
     */
    static parseFromHtml(htmlString) {
        if (!this.canParseHtml(htmlString)) return null;

        // Extract checkbox state and text content
        const checkboxMatch = htmlString.match(/<input type="checkbox"([^>]*)?>/);
        const isChecked = checkboxMatch && checkboxMatch[1] && checkboxMatch[1].includes('checked');
        const textContent = htmlString.replace(/<[^>]+>/g, '').trim();
        
        const taskBlock = new TaskListBlock(textContent, htmlString);
        taskBlock.setChecked(isChecked);
        return taskBlock;
    }

    /**
     * Check if this block type can parse the given markdown
     * @param {string} markdownString - Markdown to check
     * @returns {boolean} - true if can parse, false otherwise
     */
    static canParseMarkdown(markdownString) {
        return /^-\s*\[[xX ]?\]\s*/.test(markdownString.trim());
    }

    /**
     * Parse markdown string to create a task list block instance
     * @param {string} markdownString - Markdown to parse
     * @returns {TaskListBlock|null} - Block instance or null if can't parse
     */
    static parseFromMarkdown(markdownString) {
        const match = markdownString.trim().match(/^-\s*\[([xX ]?)\]\s*(.*)$/);
        if (!match) return null;

        const checkState = match[1].toLowerCase();
        const isChecked = checkState === 'x';
        const content = match[2].trim();
        const checked = isChecked ? ' checked' : '';
        const html = `<li class="task-list-item" data-block-type="sq"><input type="checkbox"${checked}> ${content}</li>`;
        
        const taskBlock = new TaskListBlock(content, html);
        taskBlock.setChecked(isChecked);
        return taskBlock;
    }
}
