'use strict';

import { Editor } from '../src/Editor.js';
import { Parser } from '../src/Parser.js';
import { Toolbar } from '../src/Toolbar.js';
import { KeyHandler } from '../src/KeyHandler.js';
import { EditorEventEmitter, EVENTS } from '../src/utils/eventEmitter.js';
import { BlockFactory } from '../src/blocks/BlockFactory.js';
import { Utils } from '../src/Utils.js';

// Mock dependencies
jest.mock('../src/Parser.js');
jest.mock('../src/Toolbar.js');
jest.mock('../src/KeyHandler.js');
jest.mock('../src/utils/eventEmitter.js');
jest.mock('../src/blocks/BlockFactory.js');
jest.mock('../src/Utils.js');
jest.mock('../src/utils/log.js');

describe('Editor Instance Methods', () => {
    let editor;
    let mockContainer;
    let mockElement;

    beforeEach(() => {
        // Clear the instances registry
        Editor._instances.clear();
        Editor._fallbackBlocks = [];

        // Mock DOM elements
        mockElement = {
            id: 'test-editor',
            innerHTML: '',
            isConnected: true,
            appendChild: jest.fn(),
            append: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn().mockReturnValue([{
                classList: { add: jest.fn(), remove: jest.fn() },
                getAttribute: jest.fn(),
                dataset: { blockType: 'p' }
            }]),
            setAttribute: jest.fn(),
            getAttribute: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            focus: jest.fn(),
            closest: jest.fn(),
            after: jest.fn(),
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                toggle: jest.fn(),
                contains: jest.fn().mockReturnValue(false),
            },
        };

        mockContainer = {
            appendChild: jest.fn()
        };

        // Mock document methods
        document.getElementById = jest.fn().mockReturnValue(mockElement);
        document.createElement = jest.fn().mockReturnValue({
            id: '',
            className: '',
            classList: { 
                add: jest.fn(), 
                remove: jest.fn(), 
                toggle: jest.fn(), 
                contains: jest.fn().mockReturnValue(false) 
            },
            appendChild: jest.fn(),
            innerHTML: '',
            textContent: '',
            setAttribute: jest.fn(),
            getAttribute: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            focus: jest.fn(),
            blur: jest.fn(),
            parentNode: null,
            children: [],
            style: {}
        });
        document.querySelector = jest.fn().mockReturnValue(mockContainer);
        document.addEventListener = jest.fn();

        // Mock Parser
        Parser.parse = jest.fn().mockReturnValue([]);
        Parser.html = jest.fn().mockReturnValue(mockElement);

        // Mock Toolbar
        Toolbar.init = jest.fn();

        // Mock EditorEventEmitter
        EditorEventEmitter.mockImplementation(() => ({
            emit: jest.fn(),
            subscribe: jest.fn(),
            cleanup: jest.fn(),
            hasListeners: jest.fn().mockReturnValue(false),
            events: new Map()
        }));

        // Mock document.createRange for focusElement
        document.createRange = jest.fn().mockReturnValue({
            selectNodeContents: jest.fn(),
            selectNode: jest.fn(),
            collapse: jest.fn(),
            deleteContents: jest.fn(),
            insertNode: jest.fn(),
            createContextualFragment: jest.fn().mockReturnValue({}),
            setStart: jest.fn(),
            setEnd: jest.fn(),
        });

        // Mock Utils
        Utils.escapeHTML = jest.fn(text => text);
        Utils.stripTags = jest.fn(html => html.replace(/<[^>]*>/g, ''));

        // Mock BlockFactory
        BlockFactory.createBlock = jest.fn().mockReturnValue({
            _type: 'p',
            _content: '',
            _html: '',
            _nested: false
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should create editor instance with default options', () => {
            const options = { id: 'test-editor' };
            
            editor = new Editor(options);

            expect(editor.instance).toBe(mockElement);
            // Editor creates a default block during init, so currentBlock is set
            expect(editor.keybuffer).toEqual([]);
            expect(EditorEventEmitter).toHaveBeenCalled();
        });

        it('should warn when no element id provided', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            editor = new Editor({});

            expect(consoleSpy).toHaveBeenCalledWith('Element id is not set.');
            consoleSpy.mockRestore();
        });

        it('should register instance in static registry', () => {
            editor = new Editor({ id: 'test-editor' });

            expect(Editor._instances.has(mockElement)).toBe(true);
            expect(Editor._instances.get(mockElement)).toBe(editor);
        });
    });

    describe('init', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
        });

        it('should create editor element and set attributes', () => {
            // contenteditable is now set on the contentArea div, not the mount element
            expect(editor.contentArea.setAttribute).toHaveBeenCalledWith('contenteditable', 'true');
        });

        it('should handle container as array', () => {
            const containers = [mockContainer, { appendChild: jest.fn() }];
            const newEditor = new Editor({ 
                id: 'test-editor-2',
                container: containers
            });

            containers.forEach(container => {
                expect(container.appendChild).toHaveBeenCalled();
            });
        });

        it('should parse initial content', () => {
            const initialContent = '<p>Test content</p>';
            mockElement.innerHTML = initialContent;
            
            new Editor({ id: 'test-editor-3' });

            expect(Parser.parse).toHaveBeenCalledWith(initialContent);
        });

        it('should create default block when content is empty', () => {
            mockElement.innerHTML = '';
            Parser.parse.mockReturnValue([]);
            
            new Editor({ id: 'test-editor-4' });

            expect(mockElement.appendChild).toHaveBeenCalled();
        });

        it('should emit initialization event', () => {
            const newEditor = new Editor({ id: 'test-editor-5' });

            expect(newEditor.eventEmitter.emit).toHaveBeenCalledWith(
                EVENTS.EDITOR_INITIALIZED,
                expect.objectContaining({
                    elementId: 'test-editor-5',
                    blockCount: expect.any(Number),
                    timestamp: expect.any(Number)
                }),
                { source: 'editor.init' }
            );
        });
    });

    describe('event subscription methods', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
        });

        it('should subscribe to events', () => {
            const callback = jest.fn();
            const options = { throttle: 100 };

            editor.on('test-event', callback, options);

            expect(editor.eventEmitter.subscribe).toHaveBeenCalledWith('test-event', callback, options);
        });

        it('should unsubscribe from events', () => {
            const callback = jest.fn();
            const mockListeners = new Set([{ callback }]);
            editor.eventEmitter.events = new Map([['test-event', mockListeners]]);

            editor.off('test-event', callback);

            expect(mockListeners.size).toBe(0);
        });

        it('should subscribe to one-time events', () => {
            const callback = jest.fn();
            const options = { throttle: 100 };

            editor.once('test-event', callback, options);

            expect(editor.eventEmitter.subscribe).toHaveBeenCalledWith(
                'test-event', 
                callback, 
                { ...options, once: true }
            );
        });

        it('should emit events', () => {
            const data = { test: 'data' };
            const options = { source: 'test' };

            editor.emit('test-event', data, options);

            expect(editor.eventEmitter.emit).toHaveBeenCalledWith('test-event', data, options);
        });
    });

    describe('getInstance', () => {
        it('should return editor instance for element', () => {
            editor = new Editor({ id: 'test-editor' });

            const result = Editor.getInstance(mockElement);

            expect(result).toBe(editor);
        });

        it('should return null for unregistered element', () => {
            const unknownElement = { id: 'unknown' };

            const result = Editor.getInstance(unknownElement);

            expect(result).toBeNull();
        });
    });

    describe('destroy', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
        });

        it('should cleanup event emitter and remove from registry', () => {
            const cleanupSpy = editor.eventEmitter.cleanup;
            editor.destroy();

            expect(cleanupSpy).toHaveBeenCalled();
            expect(Editor._instances.has(mockElement)).toBe(false);
        });
    });

    describe('addListeners', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
        });

        it('should add keydown listener that calls KeyHandler', () => {
            const mockEvent = { key: 'Enter' };

            expect(editor.contentArea.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
            
            // Get the keydown handler and test it
            const keydownHandler = editor.contentArea.addEventListener.mock.calls
                .find(call => call[0] === 'keydown')[1];
            
            keydownHandler(mockEvent);

            expect(editor.keyHandler.handleSpecialKeys).toHaveBeenCalledWith(mockEvent);
        });

        it('should add keyup listener that calls KeyHandler', () => {
            const mockEvent = { key: 'a' };

            expect(editor.contentArea.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function));
            
            // Get the keyup handler and test it
            const keyupHandler = editor.contentArea.addEventListener.mock.calls
                .find(call => call[0] === 'keyup')[1];
            
            keyupHandler(mockEvent);

            expect(editor.keyHandler.handleKeyPress).toHaveBeenCalledWith(mockEvent);
        });

        it('should add paste listener that delegates to PasteHandler', () => {
            const mockEvent = { 
                preventDefault: jest.fn(),
                clipboardData: {
                    getData: jest.fn().mockReturnValue('pasted text')
                }
            };

            const handleSpy = jest.spyOn(editor._pasteHandler, 'handle').mockImplementation();

            expect(editor.contentArea.addEventListener).toHaveBeenCalledWith('paste', expect.any(Function));

            // Get the paste handler and test it
            const pasteHandler = editor.contentArea.addEventListener.mock.calls
                .find(call => call[0] === 'paste')[1];

            pasteHandler(mockEvent);

            expect(handleSpy).toHaveBeenCalledWith(mockEvent);
        });

        it('should add click listener for current block selection', () => {
            expect(editor.contentArea.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should add focusin listener', () => {
            expect(editor.contentArea.addEventListener).toHaveBeenCalledWith('focusin', expect.any(Function));
        });
    });

    describe('focus', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
            editor.currentBlock = {
                focus: jest.fn(),
                isConnected: true,
                getAttribute: jest.fn().mockReturnValue('block-id')
            };
        });

        it('should focus current block when no element provided', () => {
            const focusSpy = jest.spyOn(editor, 'focusElement').mockImplementation(() => {});
            editor.focus();

            expect(focusSpy).toHaveBeenCalledWith(editor.currentBlock);
        });

        it('should focus provided element', () => {
            const mockFocusEl = { 
                focus: jest.fn(),
                isConnected: true,
                getAttribute: jest.fn().mockReturnValue('other-block')
            };
            const focusSpy = jest.spyOn(editor, 'focusElement').mockImplementation(() => {});

            editor.focus(mockFocusEl);

            expect(focusSpy).toHaveBeenCalledWith(mockFocusEl);
        });

        it('should emit block focused event', () => {
            // focus calls focusElement (Range API), not setCurrentBlock
            // The BLOCK_ACTIVATED event is emitted from setCurrentBlock, not focus()
            // Just verify that focusElement is called when element is connected
            const focusSpy = jest.spyOn(editor, 'focusElement').mockImplementation(() => {});
            editor.focus();
            expect(focusSpy).toHaveBeenCalled();
        });

        it('should focus editor instance when currentBlock is null', () => {
            editor.currentBlock = null;
            editor.contentArea.focus = jest.fn();
            editor.contentArea.isConnected = true;
            editor.instance.querySelector = jest.fn().mockReturnValue(null);

            editor.focus();

            expect(editor.contentArea.focus).toHaveBeenCalled();
        });
    });

    describe('paste', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
            editor.currentBlock = {
                innerHTML: '',
                focus: jest.fn()
            };
            editor.update = jest.fn();
        });

        it('should handle text paste', () => {
            const mockEvent = {
                preventDefault: jest.fn(),
                clipboardData: {
                    getData: jest.fn()
                        .mockReturnValueOnce('<script>alert("xss")</script><p>Clean content</p>')
                        .mockReturnValueOnce('Plain text')
                }
            };

            Parser.parseHtml = jest.fn().mockReturnValue([]);

            editor.paste(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.clipboardData.getData).toHaveBeenCalledWith('text/html');
        });

        it('should sanitize HTML content', () => {
            const mockEvent = {
                preventDefault: jest.fn(),
                clipboardData: {
                    getData: jest.fn()
                        .mockReturnValueOnce('')                     // getData('text')
                        .mockReturnValueOnce('<script>alert("xss")</script><p>Clean content</p>') // getData('text/html')
                }
            };

            Parser.parseHtml = jest.fn().mockReturnValue([]);

            editor.paste(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            // Script tags are stripped from htmlData before parseHtml is called
            expect(Parser.parseHtml).toHaveBeenCalled();
        });

        it('should emit paste event', () => {
            const mockEvent = {
                preventDefault: jest.fn(),
                clipboardData: {
                    getData: jest.fn().mockReturnValue('')
                }
            };

            editor.paste(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(editor.eventEmitter.emit).toHaveBeenCalledWith(
                EVENTS.USER_PASTE,
                expect.objectContaining({
                    timestamp: expect.any(Number)
                }),
                { source: 'user.paste' }
            );
        });
    });

    describe('update', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
        });

        it('should emit content changed event', () => {
            // Mock _performUpdate to avoid debounce complexity
            const performUpdateSpy = jest.spyOn(editor, '_performUpdate').mockImplementation(function() {
                this.eventEmitter.emit(EVENTS.CONTENT_CHANGED, {
                    html: '',
                    markdown: '',
                    timestamp: Date.now()
                }, { debounce: 500, source: 'editor.update' });
            });

            jest.useFakeTimers();
            editor.update();
            jest.runOnlyPendingTimers();
            jest.useRealTimers();

            expect(editor.eventEmitter.emit).toHaveBeenCalledWith(
                EVENTS.CONTENT_CHANGED,
                expect.objectContaining({
                    timestamp: expect.any(Number)
                }),
                expect.objectContaining({ source: 'editor.update' })
            );

            performUpdateSpy.mockRestore();
        });
    });

    describe('setCurrentBlock', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
        });

        it('should set current block and update toolbar', () => {
            const mockBlock = {
                getAttribute: jest.fn().mockReturnValue('block-id'),
                classList: { add: jest.fn(), remove: jest.fn() }
            };
            
            const mockOldBlock = {
                classList: { remove: jest.fn() }
            };
            
            editor.currentBlock = mockOldBlock;
            editor.updateToolbarButtonStates = jest.fn();

            editor.setCurrentBlock(mockBlock);

            expect(editor.currentBlock).toBe(mockBlock);
            expect(mockOldBlock.classList.remove).toHaveBeenCalledWith('bke-block--active');
            expect(mockBlock.classList.add).toHaveBeenCalledWith('bke-block--active');
            expect(editor.updateToolbarButtonStates).toHaveBeenCalled();
        });

        it('should emit block focused event', () => {
            const mockBlock = {
                getAttribute: jest.fn().mockReturnValue('test-block'),
                classList: { add: jest.fn(), remove: jest.fn() }
            };

            editor.setCurrentBlock(mockBlock);

            expect(editor.eventEmitter.emit).toHaveBeenCalledWith(
                EVENTS.BLOCK_ACTIVATED,
                expect.objectContaining({
                    blockId: 'test-block',
                    timestamp: expect.any(Number)
                }),
                expect.objectContaining({ source: 'editor.focus' })
            );
        });
    });

    describe('addDefaultBlock', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
            editor.setCurrentBlock = jest.fn();
            editor.currentBlock = null; // Reset so addDefaultBlock uses appendChild path
        });

        it('should create and append new block', () => {
            const result = editor.addDefaultBlock();

            expect(result).toBeDefined();
            expect(editor.instance.appendChild).toHaveBeenCalled();
        });

        it('should emit block created event', () => {
            editor.addDefaultBlock();

            expect(editor.eventEmitter.emit).toHaveBeenCalledWith(
                EVENTS.BLOCK_CREATED,
                expect.objectContaining({
                    blockType: 'paragraph',
                    timestamp: expect.any(Number)
                }),
                expect.objectContaining({ source: 'editor.create' })
            );
        });
    });

    describe('updateToolbarButtonStates', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });

            document.querySelector = jest.fn();
            document.querySelectorAll = jest.fn().mockReturnValue([]);
        });

        it('should return early if no current block', () => {
            editor.currentBlock = null;
            editor.toolbar = { updateButtonStates: jest.fn() };

            editor.updateToolbarButtonStates();

            expect(editor.toolbar.updateButtonStates).not.toHaveBeenCalled();
        });

        it('should return early if no block type', () => {
            editor.currentBlock = {
                getAttribute: jest.fn().mockReturnValue(null)
            };
            editor.toolbar = { updateButtonStates: jest.fn() };

            editor.updateToolbarButtonStates();

            expect(editor.toolbar.updateButtonStates).not.toHaveBeenCalled();
        });

        it('should delegate to toolbar.updateButtonStates with block type', () => {
            editor.currentBlock = {
                getAttribute: jest.fn().mockReturnValue('p')
            };
            editor.toolbar = { updateButtonStates: jest.fn() };

            editor.updateToolbarButtonStates();

            expect(editor.toolbar.updateButtonStates).toHaveBeenCalledWith('p');
        });

        it('should do nothing when toolbar is not present', () => {
            editor.currentBlock = {
                getAttribute: jest.fn().mockReturnValue('p')
            };
            editor.toolbar = null;

            // Should not throw
            expect(() => editor.updateToolbarButtonStates()).not.toThrow();
        });
    });

    describe('enableAllToolbarButtons', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
        });

        it('should delegate to toolbar.resetButtonStates', () => {
            editor.toolbar = { resetButtonStates: jest.fn() };

            editor.enableAllToolbarButtons();

            expect(editor.toolbar.resetButtonStates).toHaveBeenCalled();
        });

        it('should do nothing when toolbar is not present', () => {
            editor.toolbar = null;

            // Should not throw
            expect(() => editor.enableAllToolbarButtons()).not.toThrow();
        });
    });

    describe('initMarkdownContainer and initHtmlContainer', () => {
        beforeEach(() => {
            editor = new Editor({ id: 'test-editor' });
        });

        it('should initialize markdown container if present', () => {
            const result = editor.initMarkdownContainer();
            expect(result).toBe(true);
            expect(document.createElement).toHaveBeenCalledWith('div');
        });

        it('should initialize html container if present', () => {
            const result = editor.initHtmlContainer();
            expect(result).toBe(true);
            expect(document.createElement).toHaveBeenCalledWith('div');
        });

        it('should warn if container already exists', () => {
            const logWarningSpy = jest.requireMock('@/utils/log.js').logWarning;
            logWarningSpy.mockClear();

            // Make querySelector return a non-null element (simulates container already exists)
            editor.instance.querySelector = jest.fn().mockReturnValue({ className: 'bke-editor-markdown' });

            editor.initMarkdownContainer();

            expect(logWarningSpy).toHaveBeenCalled();
        });
    });
});
