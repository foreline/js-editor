'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";

/**
 * Heading block types (H1-H6)
 */
export class HeadingBlock extends BaseBlock
{
    constructor(level, content = '', html = '', nested = false) {
        const type = `h${level}`;
        super(type, content, html, nested);
        this.level = level;
    }

    /**
     * Handle key press for heading blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Headings don't have special key handling beyond markdown triggers
        return false;
    }

    /**
     * Handle Enter key press for heading blocks
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // After heading, create new paragraph
        return false;
    }

    /**
     * Apply heading transformation via toolbar
     */
    applyTransformation() {
        switch(this.level) {
            case 1: Toolbar.h1(); break;
            case 2: Toolbar.h2(); break;
            case 3: Toolbar.h3(); break;
            case 4: Toolbar.h4(); break;
            case 5: Toolbar.h5(); break;
            case 6: Toolbar.h6(); break;
        }
    }

    /**
     * Get toolbar configuration for heading blocks
     * @returns {Object|null} - toolbar button configuration
     */
    static getToolbarConfig() {
        return null; // Individual heading classes will provide their own config
    }

    /**
     * Get buttons that should be disabled when heading is active
     * Headers can't be bold, italic, or contain lists
     * @returns {string[]} - array of button class names that should be disabled
     */
    static getDisabledButtons() {
        return [
            'editor-toolbar-bold',
            'editor-toolbar-italic', 
            'editor-toolbar-underline',
            'editor-toolbar-strikethrough',
            'editor-toolbar-quote',
            'editor-toolbar-ul',
            'editor-toolbar-ol',
            'editor-toolbar-sq',
            'editor-toolbar-code',
            'editor-toolbar-delimiter',
            'editor-toolbar-table',
            'editor-toolbar-image'
        ];
    }

    /**
     * Convert this heading block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        const hashes = '#'.repeat(this.level);
        return `${hashes} ${this._content}`;
    }

    /**
     * Convert this heading block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        return `<h${this.level}>${this._content}</h${this.level}>`;
    }

    /**
     * Render this heading block as an HTML element
     * @returns {HTMLElement} - DOM element representation
     */
    renderToElement() {
        let element = document.createElement('div');
        element.classList.add('block');
        element.classList.add(`block-h${this.level}`);
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
        return /^<h[1-6][^>]*>/i.test(htmlString);
    }

    /**
     * Parse HTML string to create a heading block instance
     * @param {string} htmlString - HTML to parse
     * @returns {HeadingBlock|null} - Block instance or null if can't parse
     */
    static parseFromHtml(htmlString) {
        const match = htmlString.match(/^<h([1-6])[^>]*>(.*?)<\/h\1>/i);
        if (!match) return null;

        const level = parseInt(match[1]);
        const content = match[2].trim();
        
        switch (level) {
            case 1: return new H1Block(content, htmlString);
            case 2: return new H2Block(content, htmlString);
            case 3: return new H3Block(content, htmlString);
            case 4: return new H4Block(content, htmlString);
            case 5: return new H5Block(content, htmlString);
            case 6: return new H6Block(content, htmlString);
            default: return null;
        }
    }

    /**
     * Check if this block type can parse the given markdown
     * @param {string} markdownString - Markdown to check
     * @returns {boolean} - true if can parse, false otherwise
     */
    static canParseMarkdown(markdownString) {
        return /^#{1,6}\s+/.test(markdownString.trim());
    }

    /**
     * Parse markdown string to create a heading block instance
     * @param {string} markdownString - Markdown to parse
     * @returns {HeadingBlock|null} - Block instance or null if can't parse
     */
    static parseFromMarkdown(markdownString) {
        const match = markdownString.trim().match(/^(#{1,6})\s+(.*)$/);
        if (!match) return null;

        const level = match[1].length;
        const content = match[2].trim();
        const html = `<h${level}>${content}</h${level}>`;
        
        switch (level) {
            case 1: return new H1Block(content, html);
            case 2: return new H2Block(content, html);
            case 3: return new H3Block(content, html);
            case 4: return new H4Block(content, html);
            case 5: return new H5Block(content, html);
            case 6: return new H6Block(content, html);
            default: return null;
        }
    }
}

/**
 * H1 block
 */
export class H1Block extends HeadingBlock
{
    constructor(content = '', html = '', nested = false) {
        super(1, content, html, nested);
    }

    static getMarkdownTriggers() {
        return ['# '];
    }

    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-header1',
            label: 'Heading 1',
            group: 'headers'
        };
    }
}

/**
 * H2 block
 */
export class H2Block extends HeadingBlock
{
    constructor(content = '', html = '', nested = false) {
        super(2, content, html, nested);
    }

    static getMarkdownTriggers() {
        return ['## '];
    }

    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-header2',
            label: 'Heading 2',
            group: 'headers'
        };
    }
}

/**
 * H3 block
 */
export class H3Block extends HeadingBlock
{
    constructor(content = '', html = '', nested = false) {
        super(3, content, html, nested);
    }

    static getMarkdownTriggers() {
        return ['### '];
    }

    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-header3',
            label: 'Heading 3',
            group: 'headers'
        };
    }
}

/**
 * H4 block
 */
export class H4Block extends HeadingBlock
{
    constructor(content = '', html = '', nested = false) {
        super(4, content, html, nested);
    }

    static getMarkdownTriggers() {
        return ['#### '];
    }

    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-header4',
            label: 'Heading 4',
            group: 'headers'
        };
    }
}

/**
 * H5 block
 */
export class H5Block extends HeadingBlock
{
    constructor(content = '', html = '', nested = false) {
        super(5, content, html, nested);
    }

    static getMarkdownTriggers() {
        return ['##### '];
    }

    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-header5',
            label: 'Heading 5',
            group: 'headers'
        };
    }
}

/**
 * H6 block
 */
export class H6Block extends HeadingBlock
{
    constructor(content = '', html = '', nested = false) {
        super(6, content, html, nested);
    }

    static getMarkdownTriggers() {
        return ['###### '];
    }

    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-header6',
            label: 'Heading 6',
            group: 'headers'
        };
    }
}
