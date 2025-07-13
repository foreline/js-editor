/**
 * Test file for new content export features
 */

import { Editor } from '../src/Editor.js';
import { ParagraphBlock } from '../src/blocks/ParagraphBlock.js';
import { H1Block } from '../src/blocks/H1Block.js';

describe('Content Export Methods', () => {
    beforeEach(() => {
        // Reset Editor state
        Editor.blocks = [];
        Editor.instance = null;
        Editor.currentBlock = null;
    });

    describe('getMarkdown method', () => {
        test('should return empty string for no blocks', () => {
            Editor.blocks = [];
            const result = Editor.getMarkdown();
            expect(result).toBe('');
        });

        test('should return markdown for single paragraph block', () => {
            const paragraphBlock = new ParagraphBlock('Hello world', '<p>Hello world</p>');
            Editor.blocks = [paragraphBlock];
            
            const result = Editor.getMarkdown();
            expect(result).toBe('Hello world');
        });

        test('should return markdown for multiple blocks', () => {
            const h1Block = new H1Block('Title', '<h1>Title</h1>');
            const paragraphBlock = new ParagraphBlock('Content', '<p>Content</p>');
            Editor.blocks = [h1Block, paragraphBlock];
            
            const result = Editor.getMarkdown();
            expect(result).toBe('# Title\n\nContent');
        });

        test('should handle errors gracefully', () => {
            Editor.blocks = null;
            const result = Editor.getMarkdown();
            expect(result).toBe('');
        });
    });

    describe('getHtml method', () => {
        test('should return empty string for no blocks', () => {
            Editor.blocks = [];
            const result = Editor.getHtml();
            expect(result).toBe('');
        });

        test('should return HTML for single paragraph block', () => {
            const paragraphBlock = new ParagraphBlock('Hello world', '<p>Hello world</p>');
            Editor.blocks = [paragraphBlock];
            
            const result = Editor.getHtml();
            expect(result).toBe('<p>Hello world</p>');
        });

        test('should return HTML for multiple blocks', () => {
            const h1Block = new H1Block('Title', '<h1>Title</h1>');
            const paragraphBlock = new ParagraphBlock('Content', '<p>Content</p>');
            Editor.blocks = [h1Block, paragraphBlock];
            
            const result = Editor.getHtml();
            expect(result).toBe('<h1>Title</h1>\n<p>Content</p>');
        });

        test('should handle errors gracefully', () => {
            Editor.blocks = null;
            const result = Editor.getHtml();
            expect(result).toBe('');
        });
    });
});
