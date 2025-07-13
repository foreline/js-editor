/**
 * Tests for Block-Toolbar Integration functionality
 */

import { Editor } from '../src/Editor.js';
import { BlockFactory } from '../src/blocks/BlockFactory.js';
import { BlockType } from '../src/BlockType.js';

// Mock dependencies
jest.mock('../src/utils/log.js', () => ({
    log: jest.fn(),
    logWarning: jest.fn()
}));

jest.mock('../src/Toolbar.js', () => ({
    Toolbar: {
        init: jest.fn(),
        createToolbar: jest.fn()
    }
}));

jest.mock('../src/blocks/BlockFactory.js', () => ({
    BlockFactory: {
        createBlock: jest.fn()
    }
}));

global.document.querySelector = jest.fn();
global.document.querySelectorAll = jest.fn();
global.document.createElement = jest.fn();

describe('Block-Toolbar Integration', () => {
    let mockBlock;
    let mockBlockInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup mock DOM elements
        mockBlock = {
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn()
            },
            getAttribute: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn()
        };

        // Setup mock block instance
        mockBlockInstance = {
            getDisabledButtons: jest.fn().mockReturnValue([
                'editor-toolbar-bold',
                'editor-toolbar-italic'
            ]),
            getToolbarConfig: jest.fn().mockReturnValue({
                group: [
                    { class: 'editor-toolbar-header1', label: 'Header 1' }
                ]
            })
        };

        // Mock BlockFactory
        BlockFactory.createBlock.mockReturnValue(mockBlockInstance);

        // Setup DOM mocks
        global.document.querySelector.mockImplementation((selector) => {
            if (selector === '.editor-toolbar-bold' || selector === '.editor-toolbar-italic') {
                return {
                    disabled: false,
                    classList: {
                        add: jest.fn(),
                        remove: jest.fn(),
                        contains: jest.fn().mockReturnValue(false)
                    }
                };
            }
            return null;
        });

        global.document.querySelectorAll.mockImplementation((selector) => {
            if (selector === '.editor-toolbar button') {
                return [
                    {
                        disabled: false,
                        classList: {
                            add: jest.fn(),
                            remove: jest.fn(),
                            contains: jest.fn().mockReturnValue(false)
                        }
                    },
                    {
                        disabled: false,
                        classList: {
                            add: jest.fn(),
                            remove: jest.fn(),
                            contains: jest.fn().mockReturnValue(false)
                        }
                    }
                ];
            }
            return [];
        });
    });

    describe('updateToolbarButtonStates', () => {
        test('should update button states when block changes', () => {
            // Setup
            Editor.currentBlock = mockBlock;
            mockBlock.getAttribute.mockReturnValue(BlockType.H1);

            // Execute
            Editor.updateToolbarButtonStates();

            // Verify
            expect(mockBlock.getAttribute).toHaveBeenCalledWith('data-block-type');
            expect(BlockFactory.createBlock).toHaveBeenCalledWith(BlockType.H1, '', '', false);
            expect(mockBlockInstance.getDisabledButtons).toHaveBeenCalled();
        });

        test('should handle null currentBlock', () => {
            // Setup
            Editor.currentBlock = null;

            // Execute
            Editor.updateToolbarButtonStates();

            // Verify - should not throw and not call factory
            expect(BlockFactory.createBlock).not.toHaveBeenCalled();
        });

        test('should handle block without type attribute', () => {
            // Setup
            Editor.currentBlock = mockBlock;
            mockBlock.getAttribute.mockReturnValue(null);

            // Execute
            Editor.updateToolbarButtonStates();

            // Verify
            expect(BlockFactory.createBlock).not.toHaveBeenCalled();
        });

        test('should disable buttons returned by block', () => {
            // Setup
            Editor.currentBlock = mockBlock;
            mockBlock.getAttribute.mockReturnValue(BlockType.H1);
            
            const boldButton = {
                disabled: false,
                classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() }
            };
            const italicButton = {
                disabled: false,
                classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() }
            };

            global.document.querySelector.mockImplementation((selector) => {
                if (selector === '.editor-toolbar-bold') return boldButton;
                if (selector === '.editor-toolbar-italic') return italicButton;
                return null;
            });

            // Execute
            Editor.updateToolbarButtonStates();

            // Verify buttons are disabled
            expect(boldButton.disabled).toBe(true);
            expect(boldButton.classList.add).toHaveBeenCalledWith('disabled');
            expect(italicButton.disabled).toBe(true);
            expect(italicButton.classList.add).toHaveBeenCalledWith('disabled');
        });
    });

    describe('enableAllToolbarButtons', () => {
        test('should enable all toolbar buttons', () => {
            // Setup
            const buttons = [
                {
                    disabled: true,
                    classList: {
                        add: jest.fn(),
                        remove: jest.fn(),
                        contains: jest.fn().mockReturnValue(false)
                    }
                },
                {
                    disabled: true,
                    classList: {
                        add: jest.fn(),
                        remove: jest.fn(),
                        contains: jest.fn().mockReturnValue(false)
                    }
                }
            ];

            global.document.querySelectorAll.mockReturnValue(buttons);

            // Execute
            Editor.enableAllToolbarButtons();

            // Verify
            buttons.forEach(button => {
                expect(button.disabled).toBe(false);
                expect(button.classList.remove).toHaveBeenCalledWith('disabled');
            });
        });

        test('should not affect view buttons that should stay disabled', () => {
            // Setup
            const viewButton = {
                disabled: true,
                classList: {
                    add: jest.fn(),
                    remove: jest.fn(),
                    contains: jest.fn().mockReturnValue(true)
                }
            };

            global.document.querySelectorAll.mockReturnValue([viewButton]);

            // Execute
            Editor.enableAllToolbarButtons();

            // Verify view button stays disabled if it was disabled
            expect(viewButton.disabled).toBe(true);
        });
    });

    describe('getBlockInstance', () => {
        test('should create block instance for valid type', () => {
            // Execute
            const result = Editor.getBlockInstance(BlockType.H1);

            // Verify
            expect(BlockFactory.createBlock).toHaveBeenCalledWith(BlockType.H1, '', '', false);
            expect(result).toBe(mockBlockInstance);
        });

        test('should handle invalid block type', () => {
            // Setup
            BlockFactory.createBlock.mockImplementation(() => {
                throw new Error('Invalid block type');
            });

            // Execute
            const result = Editor.getBlockInstance('invalid-type');

            // Verify
            expect(result).toBeNull();
        });
    });

    describe('setCurrentBlock integration', () => {
        test('should update toolbar states when setting current block', () => {
            // Setup
            const previousBlock = {
                classList: { remove: jest.fn() }
            };
            Editor.currentBlock = previousBlock;

            // Spy on updateToolbarButtonStates
            jest.spyOn(Editor, 'updateToolbarButtonStates').mockImplementation(() => {});

            // Execute
            Editor.setCurrentBlock(mockBlock);

            // Verify
            expect(previousBlock.classList.remove).toHaveBeenCalledWith('active-block');
            expect(mockBlock.classList.add).toHaveBeenCalledWith('active-block');
            expect(Editor.currentBlock).toBe(mockBlock);
            expect(Editor.updateToolbarButtonStates).toHaveBeenCalled();
        });
    });

    describe('Block type specific toolbar controls', () => {
        test('should have correct integration methods available', () => {
            // Verify the integration methods exist and are properly implemented
            expect(typeof Editor.updateToolbarButtonStates).toBe('function');
            expect(typeof Editor.enableAllToolbarButtons).toBe('function');
            expect(typeof Editor.getBlockInstance).toBe('function');
            expect(typeof Editor.setCurrentBlock).toBe('function');
            
            // Verify blocks have the required methods
            expect(typeof mockBlockInstance.getDisabledButtons).toBe('function');
            expect(typeof mockBlockInstance.getToolbarConfig).toBe('function');
        });
    });
});
