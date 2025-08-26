import { Editor } from '../src/Editor.js';
import { BlockType } from '../src/BlockType.js';

// Mock the log function to avoid console output during tests
jest.mock('../src/utils/log.js', () => ({
    log: jest.fn(),
    logWarning: jest.fn(),
    logError: jest.fn()
}));

describe('Infinite Loop Fix for ensureDefaultBlock', () => {
    
    test('ensureDefaultBlock should not call update() when called', () => {
        // Create a mock editor instance with required methods
        const mockEditor = {
            instance: {
                querySelectorAll: jest.fn().mockReturnValue([]),
                innerHTML: ''
            },
            currentBlock: null,
            addEmptyBlock: jest.fn().mockReturnValue({
                classList: { add: jest.fn(), contains: jest.fn() },
                getAttribute: jest.fn(),
                setAttribute: jest.fn()
            }),
            detachBlockEvents: jest.fn(),
            isEditorEmpty: jest.fn().mockReturnValue(true),
            update: jest.fn()
        };

        // Bind the actual ensureDefaultBlock method to our mock
        const ensureDefaultBlock = Editor.prototype.ensureDefaultBlock.bind(mockEditor);

        // Call the method
        ensureDefaultBlock();

        // Verify that update was NOT called
        expect(mockEditor.update).not.toHaveBeenCalled();
        
        // Verify that addEmptyBlock was called (proving the method works)
        expect(mockEditor.addEmptyBlock).toHaveBeenCalled();
    });

    test('should verify the fix by checking the source code', () => {
        // Read the ensureDefaultBlock method source and verify it doesn't call update()
        const ensureDefaultBlockSource = Editor.prototype.ensureDefaultBlock.toString();
        
        // The method should not contain a call to this.update()
        expect(ensureDefaultBlockSource).not.toMatch(/this\.update\(\)/);
        
        // It should still call addEmptyBlock
        expect(ensureDefaultBlockSource).toMatch(/this\.addEmptyBlock\(\)/);
        
        // It should have a comment explaining why update is not called
        expect(ensureDefaultBlockSource).toMatch(/No need to call update/);
    });

    test('update method should call ensureDefaultBlock when editor is empty', () => {
        // Create a mock editor instance
        const mockEditor = {
            instance: {
                innerHTML: '',
                querySelectorAll: jest.fn().mockReturnValue([])
            },
            updateBlockTimestamps: jest.fn(),
            isEditorEmpty: jest.fn().mockReturnValue(true),
            ensureDefaultBlock: jest.fn(),
            eventEmitter: {
                hasListeners: jest.fn().mockReturnValue(false),
                emit: jest.fn()
            },
            debugMode: false
        };

        // Bind the actual _performUpdate method to our mock
        const performUpdate = Editor.prototype._performUpdate.bind(mockEditor);

        // Call the method
        performUpdate();

        // Verify that ensureDefaultBlock was called
        expect(mockEditor.ensureDefaultBlock).toHaveBeenCalled();
    });
});
