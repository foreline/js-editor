'use strict';

import { SyntaxHighlighter } from '../src/utils/syntaxHighlighter.js';

// Mock Prism
global.Prism = {
    highlight: jest.fn(),
    languages: {
        javascript: {},
        python: {},
        markup: {},
        css: {},
        typescript: {},
        java: {},
        csharp: {},
        php: {},
        json: {},
        sql: {},
        bash: {}
    }
};

// Mock document for escapeHtml tests
global.document = {
    createElement: jest.fn(() => ({
        get textContent() { return this._textContent; },
        set textContent(value) { 
            this._textContent = value;
            // Simulate HTML escaping
            this.innerHTML = value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },
        innerHTML: ''
    }))
};

describe('SyntaxHighlighter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.Prism.highlight.mockReturnValue('<span class="token">highlighted</span>');
    });

    describe('SUPPORTED_LANGUAGES', () => {
        it('should have all expected languages', () => {
            const languages = SyntaxHighlighter.SUPPORTED_LANGUAGES;
            
            expect(languages).toHaveProperty('javascript');
            expect(languages).toHaveProperty('typescript');
            expect(languages).toHaveProperty('python');
            expect(languages).toHaveProperty('java');
            expect(languages).toHaveProperty('csharp');
            expect(languages).toHaveProperty('php');
            expect(languages).toHaveProperty('css');
            expect(languages).toHaveProperty('markup');
            expect(languages).toHaveProperty('json');
            expect(languages).toHaveProperty('sql');
            expect(languages).toHaveProperty('bash');
        });

        it('should have correct language configurations', () => {
            const js = SyntaxHighlighter.SUPPORTED_LANGUAGES.javascript;
            expect(js.name).toBe('JavaScript');
            expect(js.aliases).toContain('js');

            const markup = SyntaxHighlighter.SUPPORTED_LANGUAGES.markup;
            expect(markup.name).toBe('HTML');
            expect(markup.aliases).toContain('html');
        });
    });

    describe('normalizeLanguage', () => {
        it('should normalize supported languages', () => {
            expect(SyntaxHighlighter.normalizeLanguage('javascript')).toBe('javascript');
            expect(SyntaxHighlighter.normalizeLanguage('python')).toBe('python');
            expect(SyntaxHighlighter.normalizeLanguage('css')).toBe('css');
        });

        it('should handle aliases correctly', () => {
            expect(SyntaxHighlighter.normalizeLanguage('js')).toBe('javascript');
            expect(SyntaxHighlighter.normalizeLanguage('ts')).toBe('typescript');
            expect(SyntaxHighlighter.normalizeLanguage('py')).toBe('python');
            expect(SyntaxHighlighter.normalizeLanguage('cs')).toBe('csharp');
            expect(SyntaxHighlighter.normalizeLanguage('sh')).toBe('bash');
            expect(SyntaxHighlighter.normalizeLanguage('shell')).toBe('bash');
        });

        it('should handle special cases', () => {
            expect(SyntaxHighlighter.normalizeLanguage('html')).toBe('markup');
        });

        it('should handle case insensitivity', () => {
            expect(SyntaxHighlighter.normalizeLanguage('JAVASCRIPT')).toBe('javascript');
            expect(SyntaxHighlighter.normalizeLanguage('JavaScript')).toBe('javascript');
            expect(SyntaxHighlighter.normalizeLanguage('JS')).toBe('javascript');
        });

        it('should handle unsupported languages', () => {
            expect(SyntaxHighlighter.normalizeLanguage('unknown')).toBe('');
            expect(SyntaxHighlighter.normalizeLanguage('fakeLanguage')).toBe('');
        });

        it('should handle empty/null inputs', () => {
            expect(SyntaxHighlighter.normalizeLanguage('')).toBe('');
            expect(SyntaxHighlighter.normalizeLanguage(null)).toBe('');
            expect(SyntaxHighlighter.normalizeLanguage(undefined)).toBe('');
        });
    });

    describe('isLanguageSupported', () => {
        it('should return true for supported languages', () => {
            expect(SyntaxHighlighter.isLanguageSupported('javascript')).toBe(true);
            expect(SyntaxHighlighter.isLanguageSupported('python')).toBe(true);
            expect(SyntaxHighlighter.isLanguageSupported('css')).toBe(true);
        });

        it('should return true for aliases', () => {
            expect(SyntaxHighlighter.isLanguageSupported('js')).toBe(true);
            expect(SyntaxHighlighter.isLanguageSupported('py')).toBe(true);
            expect(SyntaxHighlighter.isLanguageSupported('html')).toBe(true);
        });

        it('should return false for unsupported languages', () => {
            expect(SyntaxHighlighter.isLanguageSupported('unknown')).toBe(false);
            expect(SyntaxHighlighter.isLanguageSupported('fakeLanguage')).toBe(false);
        });

        it('should return false for empty/null inputs', () => {
            expect(SyntaxHighlighter.isLanguageSupported('')).toBe(false);
            expect(SyntaxHighlighter.isLanguageSupported(null)).toBe(false);
            expect(SyntaxHighlighter.isLanguageSupported(undefined)).toBe(false);
        });
    });

    describe('highlight', () => {
        it('should highlight supported languages', () => {
            const code = 'const x = 10;';
            const result = SyntaxHighlighter.highlight(code, 'javascript');

            expect(global.Prism.highlight).toHaveBeenCalledWith(
                code,
                global.Prism.languages.javascript,
                'javascript'
            );
            expect(result).toBe('<span class="token">highlighted</span>');
        });

        it('should handle language aliases', () => {
            const code = 'const x = 10;';
            const result = SyntaxHighlighter.highlight(code, 'js');

            expect(global.Prism.highlight).toHaveBeenCalledWith(
                code,
                global.Prism.languages.javascript,
                'javascript'
            );
            expect(result).toBe('<span class="token">highlighted</span>');
        });

        it('should handle html alias correctly', () => {
            const code = '<div>test</div>';
            const result = SyntaxHighlighter.highlight(code, 'html');

            expect(global.Prism.highlight).toHaveBeenCalledWith(
                code,
                global.Prism.languages.markup,
                'markup'
            );
            expect(result).toBe('<span class="token">highlighted</span>');
        });

        it('should return escaped text for unsupported languages', () => {
            const code = '<script>alert("test")</script>';
            const mockDiv = {
                get textContent() { return this._textContent; },
                set textContent(value) { 
                    this._textContent = value;
                    this.innerHTML = '&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;';
                },
                innerHTML: ''
            };
            global.document.createElement.mockReturnValue(mockDiv);

            const result = SyntaxHighlighter.highlight(code, 'unknown');

            expect(result).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;');
            expect(global.Prism.highlight).not.toHaveBeenCalled();
        });

        it('should handle empty code', () => {
            const result = SyntaxHighlighter.highlight('', 'javascript');

            expect(result).toBe('');
            expect(global.Prism.highlight).not.toHaveBeenCalled();
        });

        it('should handle null/undefined code', () => {
            expect(SyntaxHighlighter.highlight(null, 'javascript')).toBe('');
            expect(SyntaxHighlighter.highlight(undefined, 'javascript')).toBe('');
            expect(global.Prism.highlight).not.toHaveBeenCalled();
        });

        it('should handle missing language parameter', () => {
            const code = 'const x = 10;';
            const mockDiv = {
                get textContent() { return this._textContent; },
                set textContent(value) { 
                    this._textContent = value;
                    this.innerHTML = value;
                },
                innerHTML: ''
            };
            global.document.createElement.mockReturnValue(mockDiv);

            const result = SyntaxHighlighter.highlight(code);

            expect(result).toBe(code);
            expect(global.Prism.highlight).not.toHaveBeenCalled();
        });

        it('should handle language not available in Prism.languages', () => {
            const code = 'const x = 10;';
            delete global.Prism.languages.javascript;
            
            const mockDiv = {
                get textContent() { return this._textContent; },
                set textContent(value) { 
                    this._textContent = value;
                    this.innerHTML = value;
                },
                innerHTML: ''
            };
            global.document.createElement.mockReturnValue(mockDiv);

            const result = SyntaxHighlighter.highlight(code, 'javascript');

            expect(result).toBe(code);
            expect(global.Prism.highlight).not.toHaveBeenCalled();

            // Restore for other tests
            global.Prism.languages.javascript = {};
        });

        it('should handle Prism.highlight throwing error', () => {
            const code = 'const x = 10;';
            global.Prism.highlight.mockImplementation(() => {
                throw new Error('Prism error');
            });

            const mockDiv = {
                get textContent() { return this._textContent; },
                set textContent(value) { 
                    this._textContent = value;
                    this.innerHTML = value;
                },
                innerHTML: ''
            };
            global.document.createElement.mockReturnValue(mockDiv);

            const result = SyntaxHighlighter.highlight(code, 'javascript');

            expect(result).toBe(code);
        });
    });

    describe('escapeHtml', () => {
        it('should escape HTML entities', () => {
            const mockDiv = {
                get textContent() { return this._textContent; },
                set textContent(value) { 
                    this._textContent = value;
                    this.innerHTML = '&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;';
                },
                innerHTML: ''
            };
            global.document.createElement.mockReturnValue(mockDiv);

            const result = SyntaxHighlighter.escapeHtml('<script>alert("test")</script>');
            expect(result).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;');
        });

        it('should handle empty text', () => {
            const mockDiv = {
                get textContent() { return this._textContent; },
                set textContent(value) { 
                    this._textContent = value;
                    this.innerHTML = '';
                },
                innerHTML: ''
            };
            global.document.createElement.mockReturnValue(mockDiv);

            const result = SyntaxHighlighter.escapeHtml('');
            expect(result).toBe('');
        });
    });

    describe('getSupportedLanguages', () => {
        it('should return array of language objects', () => {
            const languages = SyntaxHighlighter.getSupportedLanguages();

            expect(Array.isArray(languages)).toBe(true);
            expect(languages.length).toBeGreaterThan(0);
            
            // Check structure of returned objects
            const jsLang = languages.find(lang => lang.key === 'javascript');
            expect(jsLang).toBeDefined();
            expect(jsLang.name).toBe('JavaScript');
            expect(jsLang.aliases).toContain('js');
            expect(jsLang.key).toBe('javascript');
        });

        it('should include all supported languages', () => {
            const languages = SyntaxHighlighter.getSupportedLanguages();
            const keys = languages.map(lang => lang.key);

            expect(keys).toContain('javascript');
            expect(keys).toContain('python');
            expect(keys).toContain('markup');
            expect(keys).toContain('css');
            expect(keys).toContain('typescript');
            expect(keys).toContain('java');
            expect(keys).toContain('csharp');
            expect(keys).toContain('php');
            expect(keys).toContain('json');
            expect(keys).toContain('sql');
            expect(keys).toContain('bash');
        });
    });

    describe('getLanguageDisplayName', () => {
        it('should return display names for supported languages', () => {
            expect(SyntaxHighlighter.getLanguageDisplayName('javascript')).toBe('JavaScript');
            expect(SyntaxHighlighter.getLanguageDisplayName('python')).toBe('Python');
            expect(SyntaxHighlighter.getLanguageDisplayName('markup')).toBe('HTML');
            expect(SyntaxHighlighter.getLanguageDisplayName('css')).toBe('CSS');
        });

        it('should handle aliases correctly', () => {
            expect(SyntaxHighlighter.getLanguageDisplayName('js')).toBe('JavaScript');
            expect(SyntaxHighlighter.getLanguageDisplayName('py')).toBe('Python');
            expect(SyntaxHighlighter.getLanguageDisplayName('html')).toBe('HTML');
        });

        it('should return original name for unsupported languages', () => {
            expect(SyntaxHighlighter.getLanguageDisplayName('unknown')).toBe('unknown');
            expect(SyntaxHighlighter.getLanguageDisplayName('fakeLanguage')).toBe('fakeLanguage');
        });

        it('should handle empty/null inputs', () => {
            expect(SyntaxHighlighter.getLanguageDisplayName('')).toBe('');
            expect(SyntaxHighlighter.getLanguageDisplayName(null)).toBe(null);
            expect(SyntaxHighlighter.getLanguageDisplayName(undefined)).toBe(undefined);
        });
    });
});
