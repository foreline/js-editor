'use strict';

import Prism from 'prismjs';

// Import core languages that are commonly available and stable
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // HTML
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';

/**
 * Syntax Highlighter utility using Prism.js
 */
export class SyntaxHighlighter {
    
    /**
     * Available languages for syntax highlighting
     */
    static SUPPORTED_LANGUAGES = {
        'javascript': { name: 'JavaScript', aliases: ['js'] },
        'typescript': { name: 'TypeScript', aliases: ['ts'] },
        'python': { name: 'Python', aliases: ['py'] },
        'java': { name: 'Java', aliases: [] },
        'csharp': { name: 'C#', aliases: ['cs'] },
        'php': { name: 'PHP', aliases: [] },
        'css': { name: 'CSS', aliases: [] },
        'markup': { name: 'HTML', aliases: ['html'] },
        'json': { name: 'JSON', aliases: [] },
        'sql': { name: 'SQL', aliases: [] },
        'bash': { name: 'Bash', aliases: ['sh', 'shell'] }
    };

    /**
     * Normalize language name to Prism.js language key
     * @param {string} language - Language name or alias
     * @returns {string} - Normalized language key
     */
    static normalizeLanguage(language) {
        if (!language) return '';
        
        const lang = language.toLowerCase();
        
        // Handle special cases
        if (lang === 'html') return 'markup';
        
        // Check if it's already a supported language
        if (this.SUPPORTED_LANGUAGES[lang]) {
            return lang;
        }
        
        // Check aliases
        for (const [key, config] of Object.entries(this.SUPPORTED_LANGUAGES)) {
            if (config.aliases.includes(lang)) {
                return key;
            }
        }
        
        return '';
    }

    /**
     * Check if a language is supported
     * @param {string} language - Language to check
     * @returns {boolean} - True if supported
     */
    static isLanguageSupported(language) {
        return this.normalizeLanguage(language) !== '';
    }

    /**
     * Highlight code using Prism.js
     * @param {string} code - Code to highlight
     * @param {string} language - Programming language
     * @returns {string} - Highlighted HTML
     */
    static highlight(code, language = '') {
        if (!code) return '';
        
        const normalizedLang = this.normalizeLanguage(language);
        
        if (!normalizedLang || !Prism.languages[normalizedLang]) {
            // Return escaped plain text if language not supported
            return this.escapeHtml(code);
        }
        
        try {
            return Prism.highlight(code, Prism.languages[normalizedLang], normalizedLang);
        } catch (error) {
            console.warn('Prism highlighting failed:', error);
            return this.escapeHtml(code);
        }
    }

    /**
     * Escape HTML entities
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get list of supported languages for UI
     * @returns {Array} - Array of language objects
     */
    static getSupportedLanguages() {
        return Object.entries(this.SUPPORTED_LANGUAGES).map(([key, config]) => ({
            key,
            name: config.name,
            aliases: config.aliases
        }));
    }

    /**
     * Get language display name
     * @param {string} language - Language key
     * @returns {string} - Display name
     */
    static getLanguageDisplayName(language) {
        const normalizedLang = this.normalizeLanguage(language);
        return this.SUPPORTED_LANGUAGES[normalizedLang]?.name || language;
    }
}
