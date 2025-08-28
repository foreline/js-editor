import { Editor } from '../src/index.js';
import { jest } from '@jest/globals';

describe('setCurrentBlock optimization', () => {
    let editor;
    let mockContainer;

    beforeEach(() => {
        // Mock DOM element
        mockContainer = {
            id: 'test-editor',
            innerHTML: '',
            querySelector: jest.fn(() => null),
            querySelectorAll: jest.fn(() => []),
            appendChild: jest.fn(),
            classList: { add: jest.fn(), remove: jest.fn() },
            setAttribute: jest.fn(),
            getAttribute: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };

        // Mock document methods
        global.document = {
            getElementById: jest.fn(() => mockContainer),
            querySelector: jest.fn(() => null),
            createElement: jest.fn(() => ({
                classList: { add: jest.fn(), remove: jest.fn() },
                setAttribute: jest.fn(),
                getAttribute: jest.fn(),
                appendChild: jest.fn(),
                innerHTML: '',
                style: {}
            })),
            addEventListener: jest.fn(),
        };

        global.window = {
            getSelection: jest.fn(() => ({
                rangeCount: 0,
                getRangeAt: jest.fn()
            }))
        };
    });

    test('should not call log when block is the same', () => {
        const mockBlock = {
            classList: { add: jest.fn(), remove: jest.fn() },
            getAttribute: jest.fn(() => 'test-block'),
            id: 'test-block'
        };

        editor = new Editor({ id: 'test-editor', content: '' });
        
        // Spy on the log function - we'll count calls by tracking console calls
        const originalConsoleLog = console.log;
        let logCallCount = 0;
        console.log = jest.fn(() => logCallCount++);

        // First call should work
        editor.setCurrentBlock(mockBlock);
        const firstCallCount = logCallCount;

        // Second call with same block should return early
        editor.setCurrentBlock(mockBlock);
        const secondCallCount = logCallCount;

        // Restore console.log
        console.log = originalConsoleLog;

        // The second call should not have increased the log count significantly
        expect(secondCallCount).toBe(firstCallCount);
    });

    test('should handle null blocks gracefully', () => {
        editor = new Editor({ id: 'test-editor', content: '' });
        
        // Should not throw error when called with null
        expect(() => {
            editor.setCurrentBlock(null);
            editor.setCurrentBlock(undefined);
        }).not.toThrow();
    });
});
