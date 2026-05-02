'use strict';

import { Editor } from '../src/Editor.js';

// Mock dependencies so the Editor module loads without DOM side effects
jest.mock('../src/Parser.js');
jest.mock('../src/Toolbar.js');
jest.mock('../src/KeyHandler.js');
jest.mock('../src/utils/eventEmitter.js');
jest.mock('../src/blocks/BlockFactory.js');
jest.mock('../src/Utils.js');
jest.mock('../src/utils/log.js');

describe('Editor Static Methods', () => {
    let mockElement;
    let mockEditorInstance;

    beforeEach(() => {
        // Clear instances between tests
        Editor._instances.clear();

        mockElement = {
            id: 'test-editor',
            innerHTML: '<p>Test content</p>',
            parentElement: null,
            querySelector: jest.fn().mockReturnValue(null),
            querySelectorAll: jest.fn().mockReturnValue([])
        };

        mockEditorInstance = {
            getMarkdown: jest.fn().mockReturnValue('# Test'),
            getHtml: jest.fn().mockReturnValue('<h1>Test</h1>')
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    describe('_instances registry', () => {
        it('should be a Map', () => {
            expect(Editor._instances).toBeInstanceOf(Map);
        });

        it('should start empty', () => {
            expect(Editor._instances.size).toBe(0);
        });

        it('should allow manual registration of instances', () => {
            Editor._instances.set(mockElement, mockEditorInstance);
            expect(Editor._instances.size).toBe(1);
            expect(Editor._instances.get(mockElement)).toBe(mockEditorInstance);
        });

        it('should allow clearing all instances', () => {
            Editor._instances.set(mockElement, mockEditorInstance);
            Editor._instances.clear();
            expect(Editor._instances.size).toBe(0);
        });
    });

    // -------------------------------------------------------------------------
    describe('getInstance(element)', () => {
        it('should return the editor instance for a registered element', () => {
            Editor._instances.set(mockElement, mockEditorInstance);
            expect(Editor.getInstance(mockElement)).toBe(mockEditorInstance);
        });

        it('should return null when the element is not registered', () => {
            expect(Editor.getInstance(mockElement)).toBeNull();
        });

        it('should return null for undefined input', () => {
            expect(Editor.getInstance(undefined)).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    describe('getInstanceFromElement(element)', () => {
        it('should return null for null/undefined input', () => {
            expect(Editor.getInstanceFromElement(null)).toBeNull();
            expect(Editor.getInstanceFromElement(undefined)).toBeNull();
        });

        it('should return the instance when the exact element is registered', () => {
            Editor._instances.set(mockElement, mockEditorInstance);
            const result = Editor.getInstanceFromElement(mockElement);
            expect(result).toBe(mockEditorInstance);
        });

        it('should walk up the DOM tree to find an ancestor instance', () => {
            const childElement = {
                id: 'child',
                parentElement: mockElement
            };
            Editor._instances.set(mockElement, mockEditorInstance);
            const result = Editor.getInstanceFromElement(childElement);
            expect(result).toBe(mockEditorInstance);
        });

        it('should return first instance as fallback when no ancestor is found', () => {
            const unrelatedElement = { id: 'other', parentElement: null };
            Editor._instances.set(mockElement, mockEditorInstance);
            const result = Editor.getInstanceFromElement(unrelatedElement);
            expect(result).toBe(mockEditorInstance);
        });

        it('should return null when no instances exist', () => {
            const unrelatedElement = { id: 'other', parentElement: null };
            expect(Editor.getInstanceFromElement(unrelatedElement)).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    describe('html2md(html)', () => {
        it('should return empty string for null input', () => {
            expect(Editor.html2md(null)).toBe('');
        });

        it('should return empty string for non-string input', () => {
            expect(Editor.html2md(123)).toBe('');
        });

        it('should return empty string for empty string input', () => {
            expect(Editor.html2md('')).toBe('');
        });

        it('should return a string for valid HTML input', () => {
            const result = Editor.html2md('<h1>Hello</h1>');
            expect(typeof result).toBe('string');
        });

        it('should return a string for HTML with formatting', () => {
            const result = Editor.html2md('<p><strong>bold</strong></p>');
            expect(typeof result).toBe('string');
        });
    });

    // -------------------------------------------------------------------------
    describe('md2html(md)', () => {
        it('should return empty string for null input', () => {
            expect(Editor.md2html(null)).toBe('');
        });

        it('should return empty string for non-string input', () => {
            expect(Editor.md2html(42)).toBe('');
        });

        it('should return empty string for empty string input', () => {
            expect(Editor.md2html('')).toBe('');
        });

        it('should convert a markdown heading to HTML', () => {
            const result = Editor.md2html('# Hello');
            expect(result).toContain('Hello');
            expect(result).toMatch(/<h1/i);
        });

        it('should convert bold markdown to HTML', () => {
            const result = Editor.md2html('**bold**');
            expect(result).toContain('bold');
            expect(result).toMatch(/<strong>/i);
        });
    });

    // -------------------------------------------------------------------------
    describe('getBlockInstance(blockType)', () => {
        it('should call BlockFactory.createBlock with the block type', () => {
            const { BlockFactory } = require('../src/blocks/BlockFactory.js');
            const mockBlock = { type: 'p' };
            BlockFactory.createBlock = jest.fn().mockReturnValue(mockBlock);

            const result = Editor.getBlockInstance('p');

            expect(BlockFactory.createBlock).toHaveBeenCalledWith('p', '', '', false);
            expect(result).toBe(mockBlock);
        });

        it('should return null when BlockFactory.createBlock throws', () => {
            const { BlockFactory } = require('../src/blocks/BlockFactory.js');
            BlockFactory.createBlock = jest.fn().mockImplementation(() => {
                throw new Error('Unknown block type');
            });

            const result = Editor.getBlockInstance('unknown');
            expect(result).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    describe('getBlockClass(blockType)', () => {
        it('should call BlockFactory.getBlockClass with the block type', () => {
            const { BlockFactory } = require('../src/blocks/BlockFactory.js');
            class MockBlock {}
            BlockFactory.getBlockClass = jest.fn().mockReturnValue(MockBlock);

            const result = Editor.getBlockClass('p');

            expect(BlockFactory.getBlockClass).toHaveBeenCalledWith('p');
            expect(result).toBe(MockBlock);
        });

        it('should return null when BlockFactory.getBlockClass throws', () => {
            const { BlockFactory } = require('../src/blocks/BlockFactory.js');
            BlockFactory.getBlockClass = jest.fn().mockImplementation(() => {
                throw new Error('Not found');
            });

            const result = Editor.getBlockClass('unknown');
            expect(result).toBeNull();
        });
    });
});
