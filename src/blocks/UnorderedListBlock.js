'use strict';

import {ListBlock} from "@/blocks/ListBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";
import {Editor} from "@/Editor";

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

    /**
     * Create a new unordered list item
     * @param {HTMLElement} currentBlock
     */
    createNewListItem(currentBlock) {
        const newListItem = document.createElement('li');
        newListItem.setAttribute('data-block-type', 'ul');
        newListItem.contentEditable = true;
        
        // Insert after current block
        currentBlock.after(newListItem);
        
        // Focus on the new list item
        Editor.setCurrentBlock(newListItem);
        
        // Use requestAnimationFrame to ensure DOM is updated before focusing
        requestAnimationFrame(() => {
            newListItem.focus();
        });
        
        return true;
    }

    /**
     * Get toolbar configuration for unordered lists
     * @returns {Object} - toolbar button configuration
     */
    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-ul',
            icon: 'fa-list',
            title: 'Bullet List',
            group: 'lists'
        };
    }

    /**
     * Convert this unordered list block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        const items = this._content.split('\n');
        return items.map(item => `- ${item}`).join('\n');
    }

    /**
     * Convert this unordered list block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        const items = this._content.split('\n');
        const listItems = items.map(item => `<li>${item}</li>`).join('\n');
        return `<ul>\n${listItems}\n</ul>`;
    }

    /**
     * Render this unordered list block as an HTML element
     * @returns {HTMLElement} - DOM element representation
     */
    renderToElement() {
        let element = document.createElement('ul');
        element.classList.add('block');
        element.classList.add('block-ul');
        element.setAttribute('data-block-type', 'ul');
        element.setAttribute('data-placeholder', 'List item');
        
        const items = this._content.split('\n').filter(item => item.trim());
        if (items.length === 0) {
            const li = document.createElement('li');
            li.contentEditable = true;
            element.appendChild(li);
        } else {
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                li.contentEditable = true;
                element.appendChild(li);
            });
        }
        
        return element;
    }

    /**
     * Check if this block type can parse the given HTML
     * @param {string} htmlString - HTML to check
     * @returns {boolean} - true if can parse, false otherwise
     */
    static canParseHtml(htmlString) {
        return /^<ul[^>]*>/i.test(htmlString);
    }

    /**
     * Parse HTML string to create an unordered list block instance
     * @param {string} htmlString - HTML to parse
     * @returns {UnorderedListBlock|null} - Block instance or null if can't parse
     */
    static parseFromHtml(htmlString) {
        if (!this.canParseHtml(htmlString)) return null;

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const ul = doc.querySelector('ul');
        
        if (!ul) return null;
        
        const items = Array.from(ul.querySelectorAll('li')).map(li => li.textContent.trim());
        const content = items.join('\n');
        
        return new UnorderedListBlock(content, htmlString);
    }

    /**
     * Check if this block type can parse the given markdown
     * @param {string} markdownString - Markdown to check
     * @returns {boolean} - true if can parse, false otherwise
     */
    static canParseMarkdown(markdownString) {
        const lines = markdownString.trim().split('\n');
        return lines.every(line => /^[-*+]\s/.test(line.trim()));
    }

    /**
     * Parse markdown string to create an unordered list block instance
     * @param {string} markdownString - Markdown to parse
     * @returns {UnorderedListBlock|null} - Block instance or null if can't parse
     */
    static parseFromMarkdown(markdownString) {
        if (!this.canParseMarkdown(markdownString)) return null;
        
        const lines = markdownString.trim().split('\n');
        const items = lines.map(line => line.replace(/^[-*+]\s/, ''));
        const content = items.join('\n');
        
        return new UnorderedListBlock(content);
    }
}
