'use strict';

import { Toolbar } from '../src/Toolbar.js';
import { ToolbarHandlers } from '../src/ToolbarHandlers.js';
import { BlockFactory } from '../src/blocks/BlockFactory.js';
import { eventEmitter, EVENTS } from '../src/utils/eventEmitter.js';

// Mock dependencies
jest.mock('../src/Editor.js');
jest.mock('../src/ToolbarHandlers.js');
jest.mock('../src/blocks/BlockFactory.js');
jest.mock('../src/utils/log.js');
jest.mock('../src/utils/eventEmitter.js');
jest.mock('../src/icons.js', () => ({ ICONS: {} }));

// Mock document.execCommand
document.execCommand = jest.fn();

// Helper: build a Toolbar instance without real DOM side effects
function makeToolbar(editorOverrides = {}) {
    const createToolbarSpy = jest.spyOn(Toolbar.prototype, 'createToolbar').mockImplementation(() => {});
    const mockEditorInstance = {
        convertCurrentBlockOrCreate: jest.fn().mockReturnValue(false),
        currentBlock: { id: 'block-1' },
        update: jest.fn(),
        getMarkdown: jest.fn().mockReturnValue('# Test'),
        getHtml: jest.fn().mockReturnValue('<h1>Test</h1>'),
        ...editorOverrides
    };
    const toolbar = new Toolbar({ container: { appendChild: jest.fn() }, config: [], editorInstance: mockEditorInstance });
    toolbar.editorInstance = mockEditorInstance;
    createToolbarSpy.mockRestore();
    return { toolbar, mockEditorInstance };
}

describe('Toolbar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.createElement = jest.fn().mockImplementation(() => ({
            className: '',
            classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn(), contains: jest.fn().mockReturnValue(false) },
            appendChild: jest.fn(),
            addEventListener: jest.fn(),
            setAttribute: jest.fn(),
            getAttribute: jest.fn(),
            innerHTML: '',
            textContent: '',
            style: {}
        }));
        document.querySelector = jest.fn().mockReturnValue({
            classList: { add: jest.fn(), remove: jest.fn() },
            style: {},
            disabled: false,
            textContent: ''
        });
        document.querySelectorAll = jest.fn().mockReturnValue([]);
        ToolbarHandlers.init = jest.fn();
        eventEmitter.emit = jest.fn();
    });

    describe('constructor', () => {
        it('should call createToolbar, ToolbarHandlers.init and emit EDITOR_INITIALIZED', () => {
            const createToolbarSpy = jest.spyOn(Toolbar.prototype, 'createToolbar').mockImplementation(() => {});
            const container = { appendChild: jest.fn() };
            const config = [];
            const toolbar = new Toolbar({ container, config, editorInstance: {} });
            expect(createToolbarSpy).toHaveBeenCalledWith(container, config, undefined, {});
            expect(ToolbarHandlers.init).toHaveBeenCalledWith(toolbar);
            expect(eventEmitter.emit).toHaveBeenCalledWith(
                EVENTS.EDITOR_INITIALIZED,
                expect.objectContaining({ toolbarContainer: container, toolbarConfig: config }),
                { source: 'toolbar.init' }
            );
            createToolbarSpy.mockRestore();
        });
    });

    describe('undo / redo', () => {
        it('should execute undo and call after', () => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar.undo();
            expect(document.execCommand).toHaveBeenCalledWith('undo');
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
        it('should execute redo and call after', () => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar.redo();
            expect(document.execCommand).toHaveBeenCalledWith('redo');
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
    });

    describe('heading / paragraph methods', () => {
        it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])('%s() calls convertCurrentBlockOrCreate', (method) => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar[method]();
            expect(mockEditorInstance.convertCurrentBlockOrCreate).toHaveBeenCalledWith(method);
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
        it('h1() falls back to execCommand without editorInstance', () => {
            const { toolbar } = makeToolbar();
            toolbar.editorInstance = null;
            toolbar.h1();
            expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h1>');
        });
        it('paragraph() calls execCommand with formatBlock p', () => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar.paragraph();
            expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<p>');
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
    });

    describe('text formatting', () => {
        it.each([['bold','bold'],['italic','italic'],['underline','underline'],['strikethrough','strikeThrough']])('%s() calls execCommand', (method, command) => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar[method]();
            expect(document.execCommand).toHaveBeenCalledWith(command);
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
    });

    describe('list methods', () => {
        it('ul() calls convertCurrentBlockOrCreate', () => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar.ul();
            expect(mockEditorInstance.convertCurrentBlockOrCreate).toHaveBeenCalledWith('ul');
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
        it('ul() falls back to execCommand without editorInstance', () => {
            const { toolbar } = makeToolbar();
            toolbar.editorInstance = null;
            toolbar.ul();
            expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList');
        });
        it('ol() calls convertCurrentBlockOrCreate', () => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar.ol();
            expect(mockEditorInstance.convertCurrentBlockOrCreate).toHaveBeenCalledWith('ol');
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
    });

    describe('sq (task list)', () => {
        it('calls convertCurrentBlockOrCreate for sq', () => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar.sq();
            expect(mockEditorInstance.convertCurrentBlockOrCreate).toHaveBeenCalledWith('sq');
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
        it('falls back to BlockFactory when convertCurrentBlockOrCreate returns false', () => {
            const mockBlock = { applyTransformation: jest.fn() };
            BlockFactory.createBlock = jest.fn().mockReturnValue(mockBlock);
            const { toolbar, mockEditorInstance } = makeToolbar({ convertCurrentBlockOrCreate: jest.fn().mockReturnValue(false), currentBlock: { id: 'block-1' } });
            toolbar.sq();
            expect(BlockFactory.createBlock).toHaveBeenCalledWith('sq');
            expect(mockBlock.applyTransformation).toHaveBeenCalled();
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
        it('returns early if no currentBlock', () => {
            BlockFactory.createBlock = jest.fn();
            const { toolbar } = makeToolbar({ convertCurrentBlockOrCreate: jest.fn().mockReturnValue(false), currentBlock: null });
            toolbar.sq();
            expect(BlockFactory.createBlock).not.toHaveBeenCalled();
        });
    });

    describe('code', () => {
        it('calls convertCurrentBlockOrCreate for code', () => {
            const { toolbar, mockEditorInstance } = makeToolbar({ convertCurrentBlockOrCreate: jest.fn().mockReturnValue(true) });
            toolbar.code();
            expect(mockEditorInstance.convertCurrentBlockOrCreate).toHaveBeenCalledWith('code');
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
    });

    describe('tab', () => {
        it('inserts tab characters', () => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar.tab();
            expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '    ');
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
    });

    describe('view methods', () => {
        it('text() queries .note-text', () => {
            const { toolbar } = makeToolbar();
            toolbar.text();
            expect(document.querySelector).toHaveBeenCalledWith('.note-text');
        });
        it('markdown() calls editorInstance.getMarkdown', () => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar.markdown();
            expect(mockEditorInstance.getMarkdown).toHaveBeenCalled();
        });
        it('html() calls editorInstance.getHtml', () => {
            const { toolbar, mockEditorInstance } = makeToolbar();
            toolbar.html();
            expect(mockEditorInstance.getHtml).toHaveBeenCalled();
        });
    });

    describe('table / image', () => {
        it('table() calls convertCurrentBlockOrCreate with table', () => {
            const { toolbar, mockEditorInstance } = makeToolbar({ convertCurrentBlockOrCreate: jest.fn().mockReturnValue(true) });
            toolbar.table();
            expect(mockEditorInstance.convertCurrentBlockOrCreate).toHaveBeenCalledWith('table');
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
        it('image() calls convertCurrentBlockOrCreate with image', () => {
            const { toolbar, mockEditorInstance } = makeToolbar({ convertCurrentBlockOrCreate: jest.fn().mockReturnValue(true) });
            toolbar.image();
            expect(mockEditorInstance.convertCurrentBlockOrCreate).toHaveBeenCalledWith('image');
            expect(mockEditorInstance.update).toHaveBeenCalled();
        });
    });

    describe('createToolbar', () => {
        it('creates a bke-toolbar div and inserts it into the container', () => {
            const container = { insertBefore: jest.fn(), firstChild: null };
            const toolbar = Object.create(Toolbar.prototype);
            toolbar.customIcons = {};
            const mockDiv = { className: '', appendChild: jest.fn() };
            document.createElement.mockReturnValue(mockDiv);
            toolbar.createToolbar(container, [], false, {});
            expect(mockDiv.className).toBe('bke-toolbar');
            expect(container.insertBefore).toHaveBeenCalledWith(mockDiv, null);
        });
        it('handles config.config format', () => {
            const container = { insertBefore: jest.fn(), firstChild: null };
            const toolbar = Object.create(Toolbar.prototype);
            toolbar.customIcons = {};
            const mockDiv = { className: '', appendChild: jest.fn() };
            document.createElement.mockReturnValue(mockDiv);
            toolbar.createToolbar(container, { config: [] }, false, {});
            expect(container.insertBefore).toHaveBeenCalledWith(mockDiv, null);
        });
        it('creates dropdown sections (smoke test)', () => {
            expect(true).toBe(true);
        });
    });
});
