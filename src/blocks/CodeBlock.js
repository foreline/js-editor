'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";

/**
 * Code block
 */
export class CodeBlock extends BaseBlock
{
    constructor(content = '', html = '', nested = false, language = '') {
        super(BlockType.CODE, content, html, nested);
        this._language = language;
    }

    /**
     * Handle key press for code blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Handle special formatting in code blocks
        if (event.key === 'Tab') {
            // Insert tab character instead of changing focus
            event.preventDefault();
            document.execCommand('insertText', false, '\t');
            return true;
        }
        return false;
    }

    /**
     * Handle Enter key press for code blocks
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // In code blocks, preserve indentation on new lines
        return false;
    }

    /**
     * Get markdown triggers for code blocks
     * @returns {Array<string>} - Array of markdown triggers
     */
    static getMarkdownTriggers() {
        return ['```', '~~~'];
    }

    /**
     * Apply code block transformation via toolbar
     * @returns {void}
     */
    applyTransformation() {
        Toolbar.code();
    }

    /**
     * Convert this code block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        return `\`\`\`\n${this._content}\n\`\`\``;
    }

    /**
     * Convert this code block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        return `<pre><code>${this._content}</code></pre>`;
    }

    /**
     * Render this code block as an HTML element
     * @returns {HTMLElement} - DOM element representation
     */
    renderToElement() {
        let element = document.createElement('div');
        element.classList.add('block');
        element.classList.add('block-code');
        element.setAttribute('data-block-type', this._type);
        element.setAttribute('data-placeholder', 'Type "/" to insert block');
        element.innerHTML = this._html || `<pre><code>${this._content}</code></pre>` || '';
        return element;
    }

    /**
     * Check if this block type can parse the given HTML
     * @param {string} htmlString - HTML to check
     * @returns {boolean} - true if can parse, false otherwise
     */
    static canParseHtml(htmlString) {
        if (!htmlString || typeof htmlString !== 'string') {
            return false;
        }
        return /^<(pre|code)[^>]*>/i.test(htmlString);
    }

    /**
     * Parse HTML string to create a code block instance
     * @param {string} htmlString - HTML to parse
     * @returns {CodeBlock|null} - Block instance or null if can't parse
     */
    static parseFromHtml(htmlString) {
        if (!htmlString || typeof htmlString !== 'string') {
            return null;
        }
        
        // Handle <pre><code>content</code></pre> pattern
        let match = htmlString.match(/^<pre[^>]*><code([^>]*)>(.*?)<\/code><\/pre>/is);
        if (match) {
            const codeAttributes = match[1];
            const content = match[2].trim();
            
            // Extract language from class attribute
            let language = '';
            const classMatch = codeAttributes.match(/class="([^"]*?)"/);
            if (classMatch) {
                // Look for language-* pattern or direct language name
                const classes = classMatch[1].split(' ');
                for (const cls of classes) {
                    if (cls.startsWith('language-')) {
                        language = cls.replace('language-', '');
                        break;
                    } else if (cls && !cls.includes('-') && cls !== 'hljs' && cls !== 'language') {
                        // Likely a direct language class name
                        language = cls;
                    }
                }
            }
            
            return new CodeBlock(content, htmlString, false, language);
        }

        // Handle standalone <code>content</code> pattern
        match = htmlString.match(/^<code([^>]*)>(.*?)<\/code>/is);
        if (match) {
            const codeAttributes = match[1];
            const content = match[2].trim();
            
            // Extract language from class attribute
            let language = '';
            const classMatch = codeAttributes.match(/class="([^"]*?)"/);
            if (classMatch) {
                const classes = classMatch[1].split(' ');
                for (const cls of classes) {
                    if (cls.startsWith('language-')) {
                        language = cls.replace('language-', '');
                        break;
                    } else if (cls && !cls.includes('-') && cls !== 'hljs' && cls !== 'language') {
                        language = cls;
                    }
                }
            }
            
            return new CodeBlock(content, htmlString, false, language);
        }

        // Handle <pre>content</pre> pattern
        match = htmlString.match(/^<pre([^>]*)>(.*?)<\/pre>/is);
        if (match) {
            const preAttributes = match[1];
            const content = match[2].trim();
            
            // Extract language from class attribute if present
            let language = '';
            const classMatch = preAttributes.match(/class="([^"]*?)"/);
            if (classMatch) {
                const classes = classMatch[1].split(' ');
                for (const cls of classes) {
                    if (cls.startsWith('language-')) {
                        language = cls.replace('language-', '');
                        break;
                    } else if (cls && !cls.includes('-') && cls !== 'hljs' && cls !== 'language') {
                        language = cls;
                    }
                }
            }
            
            return new CodeBlock(content, htmlString, false, language);
        }

        return null;
    }

    /**
     * Check if this block type can parse the given markdown
     * @param {string} markdownString - Markdown to check
     * @returns {boolean} - true if can parse, false otherwise
     */
    static canParseMarkdown(markdownString) {
        if (!markdownString || typeof markdownString !== 'string') {
            return false;
        }
        return /^```/.test(markdownString.trim()) || /^~~~/.test(markdownString.trim());
    }

    /**
     * Parse markdown string to create a code block instance
     * @param {string} markdownString - Markdown to parse
     * @returns {CodeBlock|null} - Block instance or null if can't parse
     */
    static parseFromMarkdown(markdownString) {
        if (!markdownString || typeof markdownString !== 'string') {
            return null;
        }
        
        const match = markdownString.trim().match(/^```([\w]*)\n?([\s\S]*?)\n?```$|^~~~([\w]*)\n?([\s\S]*?)\n?~~~$/);
        if (!match) return null;

        // Extract language and content
        const language = match[1] || match[3] || '';
        const content = match[2] || match[4] || '';
        
        const html = `<pre><code class="${language} language-${language}">${content}</code></pre>`;
        return new CodeBlock(content, html, false, language);
    }
}
