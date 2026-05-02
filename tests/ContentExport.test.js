'use strict';

jest.unmock('../src/blocks/BlockFactory');
jest.mock('@/Editor.js');
jest.mock('@/utils/log.js');

import { ParagraphBlock } from '../src/blocks/ParagraphBlock.js';
import { H1Block } from '../src/blocks/H1Block.js';
import { HeadingBlock } from '../src/blocks/HeadingBlock.js';

describe('Content Export - Block level', () => {
    describe('ParagraphBlock markdown export', () => {
        test('toMarkdown returns content', () => {
            const block = new ParagraphBlock('Hello world', '<p>Hello world</p>');
            expect(block.toMarkdown()).toBe('Hello world');
        });

        test('toMarkdown returns empty string for empty block', () => {
            const block = new ParagraphBlock('', '');
            expect(block.toMarkdown()).toBe('');
        });
    });

    describe('H1Block markdown export', () => {
        test('toMarkdown returns heading format', () => {
            const block = new H1Block('Title', '<h1>Title</h1>');
            expect(block.toMarkdown()).toBe('# Title');
        });

        test('content property works', () => {
            const block = new H1Block('Hello', '<h1>Hello</h1>');
            expect(block.content).toBe('Hello');
        });
    });

    describe('H1Block HTML export', () => {
        test('toHtml returns h1 HTML', () => {
            const block = new H1Block('Title', '<h1>Title</h1>');
            expect(block.toHtml()).toBe('<h1>Title</h1>');
        });
    });

    describe('ParagraphBlock HTML export', () => {
        test('toHtml returns p HTML', () => {
            const block = new ParagraphBlock('Content', 'Content');
            expect(block.toHtml()).toBe('<p>Content</p>');
        });
    });

    describe('Multi-block markdown construction', () => {
        test('combines markdown from multiple blocks', () => {
            const h1 = new H1Block('Title', '<h1>Title</h1>');
            const p = new ParagraphBlock('Content', '<p>Content</p>');
            const blocks = [h1, p];

            const markdown = blocks.map(b => b.toMarkdown()).join('\n\n');
            expect(markdown).toBe('# Title\n\nContent');
        });

        test('handles empty blocks array', () => {
            const blocks = [];
            const markdown = blocks.map(b => b.toMarkdown()).join('\n\n');
            expect(markdown).toBe('');
        });
    });
});
