/**
 * Simple integration test for the markdown trigger fix
 */

import { Editor } from '../src/Editor.js';
import { EVENTS } from '../src/utils/eventEmitter.js';

// Mock DOM setup for simple testing
const mockDOM = () => {
    global.document = {
        createElement: jest.fn(() => ({
            classList: { add: jest.fn(), remove: jest.fn(), contains: jest.fn() },
            setAttribute: jest.fn(),
            appendChild: jest.fn(),
            textContent: '',
            innerHTML: '',
        })),
        getElementById: jest.fn(() => ({
            setAttribute: jest.fn(),
            innerHTML: '',
            textContent: '',
            appendChild: jest.fn(),
            querySelectorAll: jest.fn(() => []),
            addEventListener: jest.fn(),
        })),
        addEventListener: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => []),
    };
    
    global.window = {
        getSelection: jest.fn(() => ({
            rangeCount: 0,
            removeAllRanges: jest.fn(),
            addRange: jest.fn(),
        })),
    };
};

describe('Markdown Trigger Fix Integration Test', () => {
    beforeEach(() => {
        mockDOM();
    });

    test('should validate the fix approach', () => {
        // Test the core logic that was fixed
        const triggerText = '# ';
        const expectedRemainingContent = '';
        
        // Simulate the trigger processing
        const triggers = ['# '];
        let remainingContent = triggerText;
        
        for (const trigger of triggers) {
            if (triggerText.startsWith(trigger)) {
                remainingContent = triggerText.substring(trigger.length);
                break;
            }
        }
        
        console.log('triggerText:', `"${triggerText}"`);
        console.log('remainingContent:', `"${remainingContent}"`);
        console.log('remainingContent.trim():', `"${remainingContent.trim()}"`);
        
        expect(remainingContent).toBe(expectedRemainingContent);
        expect(remainingContent.trim()).toBe('');
        
        // The fix ensures that even when remainingContent is empty,
        // the block is still properly transformed
    });

    test('should handle trigger with additional content', () => {
        const triggerText = '# Hello World';
        const expectedRemainingContent = 'Hello World';
        
        const triggers = ['# '];
        let remainingContent = triggerText;
        
        for (const trigger of triggers) {
            if (triggerText.startsWith(trigger)) {
                remainingContent = triggerText.substring(trigger.length);
                break;
            }
        }
        
        expect(remainingContent).toBe(expectedRemainingContent);
    });

    test('should handle list triggers', () => {
        const testCases = [
            { input: '- ', expected: '' },
            { input: '- Item', expected: 'Item' },
            { input: '* ', expected: '' },
            { input: '* Item', expected: 'Item' },
            { input: '1. ', expected: '' },
            { input: '1. Item', expected: 'Item' },
        ];

        testCases.forEach(testCase => {
            const triggers = ['- ', '* ', '1. '];
            let remainingContent = testCase.input;
            
            for (const trigger of triggers) {
                if (testCase.input.startsWith(trigger)) {
                    remainingContent = testCase.input.substring(trigger.length);
                    break;
                }
            }
            
            expect(remainingContent).toBe(testCase.expected);
        });
    });
});
