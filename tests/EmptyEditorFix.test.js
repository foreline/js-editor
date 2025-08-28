/**
 * Test for Empty Editor Edge Case Fix
 * 
 * This test verifies the fix for the infinite console warning issue
 * that occurs when all blocks are removed from the editor.
 */

import { Editor } from '../src/Editor.js';

// Mock the log utility
jest.mock('../src/utils/log.js', () => ({
    log: jest.fn(),
    logWarning: jest.fn(),
    logError: jest.fn()
}));

import { logWarning } from '../src/utils/log.js';

describe('Empty Editor Fix', () => {
    let mockEditor;
    let mockEventEmitter;
    let mockInstance;

    beforeEach(() => {
        // Mock event emitter
        mockEventEmitter = {
            emit: jest.fn(),
            hasListeners: jest.fn().mockReturnValue(false),
            cleanup: jest.fn()
        };

        // Mock DOM element
        mockInstance = {
            id: 'test-editor',
            innerHTML: '',
            isConnected: true,
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn().mockReturnValue(false)
            },
            querySelectorAll: jest.fn().mockReturnValue([]),
            querySelector: jest.fn().mockReturnValue(null),
            appendChild: jest.fn(),
            focus: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            scrollIntoView: jest.fn()
        };

        // Create mock editor with minimal setup
        mockEditor = {
            instance: mockInstance,
            eventEmitter: mockEventEmitter,
            currentBlock: null,
            debugMode: false,
            _updateTimeout: null
        };

        // Bind actual methods to mock editor
        mockEditor.isEditorEmpty = Editor.prototype.isEditorEmpty.bind(mockEditor);
        mockEditor.ensureDefaultBlock = Editor.prototype.ensureDefaultBlock.bind(mockEditor);
        mockEditor.detachBlockEvents = Editor.prototype.detachBlockEvents.bind(mockEditor);
        mockEditor.focus = Editor.prototype.focus.bind(mockEditor);
        mockEditor.focusElement = Editor.prototype.focusElement.bind(mockEditor);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should detect when editor is empty', () => {
        // Test with no blocks
        let blocks = [];
        expect(mockEditor.isEditorEmpty(blocks)).toBe(true);

        // Test with empty blocks
        blocks = [
            { innerHTML: '' },
            { innerHTML: '   ' },
            { innerHTML: '\n\t' }
        ];
        expect(mockEditor.isEditorEmpty(blocks)).toBe(true);

        // Test with content
        blocks = [
            { innerHTML: 'Some content' }
        ];
        expect(mockEditor.isEditorEmpty(blocks)).toBe(false);
    });

    test('should handle ensureDefaultBlock correctly', () => {
        // Mock addDefaultBlock method
        const mockBlock = {
            classList: { contains: jest.fn().mockReturnValue(true) },
            setAttribute: jest.fn(),
            isConnected: true
        };

        mockEditor.addDefaultBlock = jest.fn().mockReturnValue(mockBlock);
        mockInstance.querySelectorAll.mockReturnValue([]);
        
        // Call ensureDefaultBlock
        const result = mockEditor.ensureDefaultBlock();
        
        // Should call addDefaultBlock
        expect(mockEditor.addDefaultBlock).toHaveBeenCalled();
        expect(result).toBe(mockBlock);
    });

    test('should not create blocks when editor has content', () => {
        // Mock existing blocks with content
        const mockBlocks = [
            { innerHTML: 'Some content' }
        ];
        
        mockInstance.querySelectorAll.mockReturnValue(mockBlocks);
        mockEditor.addDefaultBlock = jest.fn();
        
        // Call ensureDefaultBlock
        const result = mockEditor.ensureDefaultBlock();

        // Should not call addDefaultBlock
        expect(mockEditor.addDefaultBlock).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    test('should handle focus on non-existent element gracefully', () => {
        // Clear any previous calls
        logWarning.mockClear();

        // Try to focus on null
        mockEditor.focus(null);
        
        // Should log warning but not throw
        expect(logWarning).toHaveBeenCalledWith(
            'Cannot focus on non-existent or detached element',
            'Editor.focus()'
        );
    });

    test('should handle focus fallback without infinite recursion', () => {
        // Clear any previous calls
        logWarning.mockClear();

        // Create a mock block that is connected
        const mockBlock = {
            isConnected: true,
            classList: { contains: jest.fn() }
        };

        mockInstance.querySelector.mockReturnValue(mockBlock);
        mockEditor.setCurrentBlock = jest.fn();
        mockEditor.focusElement = jest.fn();

        // Try to focus on a detached element
        const detachedElement = { isConnected: false };
        mockEditor.focus(detachedElement);
        
        // Should call setCurrentBlock and focusElement instead of recursive focus
        expect(mockEditor.setCurrentBlock).toHaveBeenCalledWith(mockBlock);
        expect(mockEditor.focusElement).toHaveBeenCalledWith(mockBlock);
    });
});
