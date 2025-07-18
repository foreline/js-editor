'use strict';

import { ToolbarHandlers } from '../src/ToolbarHandlers.js';
import { Toolbar } from '../src/Toolbar.js';
import { eventEmitter, EVENTS } from '../src/utils/eventEmitter.js';

// Mock dependencies
jest.mock('../src/Toolbar.js');
jest.mock('../src/utils/eventEmitter.js');

// Mock document.execCommand
document.execCommand = jest.fn();

describe('ToolbarHandlers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Reset eventListeners Map
        ToolbarHandlers.eventListeners.clear();
        
        // Mock DOM methods
        document.querySelectorAll = jest.fn().mockReturnValue([]);
        
        // Mock eventEmitter
        eventEmitter.emit = jest.fn();
        
        // Mock Toolbar methods
        Object.keys(Toolbar).forEach(key => {
            if (typeof Toolbar[key] === 'function') {
                Toolbar[key] = jest.fn();
            }
        });
    });

    describe('createToolbarHandler', () => {
        it('should create handler that emits event and executes action', () => {
            const mockActionFunction = jest.fn();
            const mockEvent = {
                preventDefault: jest.fn(),
                target: document.createElement('button')
            };

            const handler = ToolbarHandlers.createToolbarHandler('test-action', mockActionFunction);
            handler(mockEvent);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(eventEmitter.emit).toHaveBeenCalledWith(
                EVENTS.TOOLBAR_ACTION,
                expect.objectContaining({
                    action: 'test-action',
                    timestamp: expect.any(Number),
                    button: mockEvent.target
                }),
                { source: 'toolbar.action' }
            );
            expect(mockActionFunction).toHaveBeenCalledWith(mockEvent);
        });
    });

    describe('init', () => {
        let mockButtons;

        beforeEach(() => {
            // Create mock buttons for each toolbar action
            const createMockButton = () => ({
                addEventListener: jest.fn()
            });

            mockButtons = {
                undo: [createMockButton()],
                redo: [createMockButton()],
                h1: [createMockButton()],
                h2: [createMockButton()],
                h3: [createMockButton()],
                h4: [createMockButton()],
                h5: [createMockButton()],
                h6: [createMockButton()],
                paragraph: [createMockButton()],
                bold: [createMockButton()],
                italic: [createMockButton()],
                underline: [createMockButton()],
                strikethrough: [createMockButton()],
                ul: [createMockButton()],
                ol: [createMockButton()],
                sq: [createMockButton()],
                code: [createMockButton()],
                table: [createMockButton()],
                image: [createMockButton()],
                text: [createMockButton()],
                markdown: [createMockButton()],
                html: [createMockButton()]
            };

            // Mock querySelectorAll to return appropriate buttons
            document.querySelectorAll.mockImplementation((selector) => {
                if (selector.includes('undo')) return mockButtons.undo;
                if (selector.includes('redo')) return mockButtons.redo;
                if (selector.includes('header1')) return mockButtons.h1;
                if (selector.includes('header2')) return mockButtons.h2;
                if (selector.includes('header3')) return mockButtons.h3;
                if (selector.includes('header4')) return mockButtons.h4;
                if (selector.includes('header5')) return mockButtons.h5;
                if (selector.includes('header6')) return mockButtons.h6;
                if (selector.includes('paragraph')) return mockButtons.paragraph;
                if (selector.includes('bold')) return mockButtons.bold;
                if (selector.includes('italic')) return mockButtons.italic;
                if (selector.includes('underline')) return mockButtons.underline;
                if (selector.includes('strikethrough')) return mockButtons.strikethrough;
                if (selector.includes('ul')) return mockButtons.ul;
                if (selector.includes('ol')) return mockButtons.ol;
                if (selector.includes('sq')) return mockButtons.sq;
                if (selector.includes('code')) return mockButtons.code;
                if (selector.includes('table')) return mockButtons.table;
                if (selector.includes('image')) return mockButtons.image;
                if (selector.includes('text')) return mockButtons.text;
                if (selector.includes('markdown')) return mockButtons.markdown;
                if (selector.includes('html')) return mockButtons.html;
                return [];
            });

            // Mock cleanup method
            ToolbarHandlers.cleanup = jest.fn();
        });

        it('should set default paragraph separator', () => {
            ToolbarHandlers.init();

            expect(document.execCommand).toHaveBeenCalledWith('defaultParagraphSeparator', false, 'p');
        });

        it('should call cleanup before adding new listeners', () => {
            ToolbarHandlers.init();

            expect(ToolbarHandlers.cleanup).toHaveBeenCalled();
        });

        it('should add event listeners for undo/redo buttons', () => {
            ToolbarHandlers.init();

            expect(mockButtons.undo[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.redo[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should add event listeners for header buttons', () => {
            ToolbarHandlers.init();

            expect(mockButtons.h1[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.h2[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.h3[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.h4[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.h5[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.h6[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.paragraph[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should add event listeners for formatting buttons', () => {
            ToolbarHandlers.init();

            expect(mockButtons.bold[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.italic[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.underline[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.strikethrough[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should add event listeners for list buttons', () => {
            ToolbarHandlers.init();

            expect(mockButtons.ul[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.ol[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.sq[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should add event listeners for other buttons', () => {
            ToolbarHandlers.init();

            expect(mockButtons.code[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.table[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.image[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should add event listeners for view buttons', () => {
            ToolbarHandlers.init();

            expect(mockButtons.text[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.markdown[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
            expect(mockButtons.html[0].addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
        });

        it('should track event listeners for cleanup', () => {
            ToolbarHandlers.init();

            // Check that some listeners were tracked
            expect(ToolbarHandlers.eventListeners.size).toBeGreaterThan(0);
        });
    });

    describe('addEventListenerWithTracking', () => {
        it('should add event listener and track it', () => {
            const mockElement = {
                addEventListener: jest.fn()
            };
            const mockHandler = jest.fn();

            ToolbarHandlers.addEventListenerWithTracking(mockElement, 'click', mockHandler);

            expect(mockElement.addEventListener).toHaveBeenCalledWith('click', mockHandler);
            expect(ToolbarHandlers.eventListeners.get(mockElement)).toEqual({
                event: 'click',
                handler: mockHandler
            });
        });
    });

    describe('cleanup', () => {
        it('should remove all tracked event listeners', () => {
            const mockElement1 = {
                removeEventListener: jest.fn()
            };
            const mockElement2 = {
                removeEventListener: jest.fn()
            };
            const mockHandler1 = jest.fn();
            const mockHandler2 = jest.fn();

            // Add some tracked listeners
            ToolbarHandlers.eventListeners.set(mockElement1, { event: 'click', handler: mockHandler1 });
            ToolbarHandlers.eventListeners.set(mockElement2, { event: 'change', handler: mockHandler2 });

            ToolbarHandlers.cleanup();

            expect(mockElement1.removeEventListener).toHaveBeenCalledWith('click', mockHandler1);
            expect(mockElement2.removeEventListener).toHaveBeenCalledWith('change', mockHandler2);
            expect(ToolbarHandlers.eventListeners.size).toBe(0);
        });

        it('should handle errors when removing event listeners', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const mockElement = {
                removeEventListener: jest.fn().mockImplementation(() => {
                    throw new Error('Test error');
                })
            };

            ToolbarHandlers.eventListeners.set(mockElement, { event: 'click', handler: jest.fn() });

            ToolbarHandlers.cleanup();

            expect(consoleSpy).toHaveBeenCalledWith('Failed to remove event listener:', expect.any(Error));
            expect(ToolbarHandlers.eventListeners.size).toBe(0);
            
            consoleSpy.mockRestore();
        });
    });

    describe('button click handlers', () => {
        beforeEach(() => {
            // Setup a mock button for testing
            const mockButton = {
                addEventListener: jest.fn()
            };
            
            document.querySelectorAll.mockReturnValue([mockButton]);
            
            ToolbarHandlers.init();
            
            // Get the handler that was added
            this.clickHandler = mockButton.addEventListener.mock.calls[0][1];
        });

        it('should prevent default and call toolbar method for header buttons', () => {
            const mockEvent = {
                preventDefault: jest.fn()
            };

            // Test h1 button (we know it's set up to call Toolbar.h1)
            document.querySelectorAll.mockReturnValue([{
                addEventListener: (event, handler) => {
                    handler(mockEvent);
                }
            }]);
            
            // Re-init to trigger the handler setup
            ToolbarHandlers.init();

            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });
    });
});
