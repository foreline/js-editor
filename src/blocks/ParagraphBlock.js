'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";

/**
 * Paragraph block type
 */
export class ParagraphBlock extends BaseBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.PARAGRAPH, content, html, nested);
    }

    /**
     * Handle key press for paragraph blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Paragraph blocks don't have special key handling
        return false;
    }

    /**
     * Handle Enter key press for paragraph blocks
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // Default behavior - create new paragraph
        return false;
    }

    /**
     * Get the markdown triggers that convert to paragraph
     * @returns {string[]} - array of trigger strings
     */
    static getMarkdownTriggers() {
        return [];
    }

    /**
     * Apply paragraph transformation via toolbar
     * @param {HTMLElement} [blockElement] - The block element to transform (currently unused but kept for API consistency).
     */
    applyTransformation(blockElement = null) {
        Toolbar.paragraph();
    }

    /**
     * Get toolbar configuration for paragraph blocks
     * @returns {Object|null} - toolbar button configuration
     */
    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-paragraph',
            label: 'Paragraph',
            group: 'headers'
        };
    }

    /**
     * Convert this paragraph block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        return this._content;
    }

    /**
     * Convert this paragraph block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        return `<p>${this._content}</p>`;
    }

    /**
     * Render this paragraph block as an HTML element
     * @returns {HTMLElement} - DOM element representation
     */
    renderToElement() {
        let element = document.createElement('div');
        element.classList.add('block');
        element.classList.add('block-p');
        element.setAttribute('data-block-type', this._type);
        element.setAttribute('data-placeholder', 'Type "/" to insert block');
        element.innerHTML = this._html || this._content || '';
        return element;
    }

    /**
     * Check if this block type can parse the given HTML
     * @param {string} htmlString - HTML to check
     * @returns {boolean} - true if can parse, false otherwise
     */
    static canParseHtml(htmlString) {
        return /^<p[^>]*>/i.test(htmlString);
    }

    /**
     * Parse HTML string to create a paragraph block instance
     * @param {string} htmlString - HTML to parse
     * @returns {ParagraphBlock|null} - Block instance or null if can't parse
     */
    static parseFromHtml(htmlString) {
        const match = htmlString.match(/^<p[^>]*>(.*?)<\/p>/i);
        if (!match) return null;

        const content = match[1].trim();
        return new ParagraphBlock(content, htmlString);
    }

    /**
     * Check if this block type can parse the given markdown
     * @param {string} markdownString - Markdown to check
     * @returns {boolean} - true if can parse, false otherwise
     */
    static canParseMarkdown(markdownString) {
        // Paragraphs are the fallback, so they can parse most simple text
        // But not if it matches other block types
        const line = markdownString.trim();
        return !(/^#{1,6}\s/.test(line) || 
                /^-\s*\[[x ]\]\s/.test(line) ||
                /^>\s/.test(line) ||
                /^```/.test(line) ||
                /^\|.*\|/.test(line) ||
                /^[-*]\s/.test(line) ||
                /^\d+\.\s/.test(line));
    }

    /**
     * Parse markdown string to create a paragraph block instance
     * @param {string} markdownString - Markdown to parse
     * @returns {ParagraphBlock|null} - Block instance or null if can't parse
     */
    static parseFromMarkdown(markdownString) {
        if (!this.canParseMarkdown(markdownString)) return null;

        const content = markdownString.trim();
        const html = `<p>${content}</p>`;
        return new ParagraphBlock(content, html);
    }
}
