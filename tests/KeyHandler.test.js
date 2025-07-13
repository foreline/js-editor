import { KeyHandler } from '@/KeyHandler.js';
import { Editor } from '@/Editor.js';
import { BlockFactory } from '@/blocks/BlockFactory.js';

// Mock dependencies
jest.mock('@/Editor.js');
jest.mock('@/blocks/BlockFactory.js');
jest.mock('@/Utils.js', () => ({
  Utils: {
    stripTags: jest.fn()
  }
}));

describe('KeyHandler', () => {
  beforeEach(() => {
    // Reset Editor mock
    Editor.keybuffer = [];
    Editor.currentBlock = null;
    Editor.update = jest.fn();
    Editor.addEmptyBlock = jest.fn();
    
    // Reset BlockFactory mock
    BlockFactory.findBlockClassForTrigger.mockClear();
    BlockFactory.createBlock.mockClear();
  });

  test('adds key to keybuffer on key press', () => {
    const event = { key: 'a' };
    
    KeyHandler.handleKeyPress(event);
    
    expect(Editor.keybuffer).toContain('a');
  });

  test('handles markdown triggers', () => {
    const mockBlockClass = jest.fn();
    const mockBlockInstance = {
      applyTransformation: jest.fn()
    };
    mockBlockClass.mockImplementation(() => mockBlockInstance);
    
    BlockFactory.findBlockClassForTrigger.mockReturnValue(mockBlockClass);
    
    const mockCurrentBlock = {
      innerHTML: '# Test heading'
    };
    Editor.currentBlock = mockCurrentBlock;
    
    const event = { key: ' ' };
    
    KeyHandler.handleKeyPress(event);
    
    expect(BlockFactory.findBlockClassForTrigger).toHaveBeenCalled();
    expect(mockBlockInstance.applyTransformation).toHaveBeenCalled();
    expect(Editor.update).toHaveBeenCalled();
  });

  test('handles Enter key', () => {
    const event = { key: 'Enter', shiftKey: false };
    
    KeyHandler.handleSpecialKeys(event);
    
    expect(Editor.addEmptyBlock).toHaveBeenCalled();
  });

  test('handles Enter key with block-specific logic', () => {
    const mockBlock = {
      handleEnterKey: jest.fn().mockReturnValue(true)
    };
    
    const mockCurrentBlock = {
      dataset: { blockType: 'h1' }
    };
    
    Editor.currentBlock = mockCurrentBlock;
    BlockFactory.createBlock.mockReturnValue(mockBlock);
    
    const event = { key: 'Enter', shiftKey: false };
    
    KeyHandler.handleSpecialKeys(event);
    
    expect(BlockFactory.createBlock).toHaveBeenCalledWith('h1');
    expect(mockBlock.handleEnterKey).toHaveBeenCalledWith(event);
    expect(Editor.update).toHaveBeenCalled();
    expect(Editor.addEmptyBlock).not.toHaveBeenCalled();
  });

  test('handles code block creation with triple backticks', () => {
    Editor.keybuffer = ['`', '`', '`', 'Enter'];
    
    const mockCodeBlock = {
      applyTransformation: jest.fn()
    };
    
    BlockFactory.createBlock.mockReturnValue(mockCodeBlock);
    
    const mockCurrentBlock = {};
    Editor.currentBlock = mockCurrentBlock;
    
    const event = { key: 'Enter', shiftKey: false };
    
    KeyHandler.handleSpecialKeys(event);
    
    expect(BlockFactory.createBlock).toHaveBeenCalledWith('code');
    expect(mockCodeBlock.applyTransformation).toHaveBeenCalled();
    expect(Editor.update).toHaveBeenCalled();
  });

  test('key buffer utilities work correctly', () => {
    Editor.keybuffer = ['a', 'b', 'c'];
    
    const buffer = KeyHandler.getKeyBuffer();
    expect(buffer).toEqual(['a', 'b', 'c']);
    expect(buffer).not.toBe(Editor.keybuffer); // Should be a copy
    
    KeyHandler.clearKeyBuffer();
    expect(Editor.keybuffer).toEqual([]);
  });
});
