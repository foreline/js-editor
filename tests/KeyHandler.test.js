import { KeyHandler } from '@/KeyHandler.js';
import { Editor } from '@/Editor.js';
import { BlockFactory } from '@/blocks/BlockFactory.js';
import { Utils } from '@/Utils.js';

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
    Editor.focus = jest.fn();
    Editor.setCurrentBlock = jest.fn();
    
    // Reset BlockFactory mock
    BlockFactory.findBlockClassForTrigger.mockClear();
    BlockFactory.createBlock.mockClear();
    
    // Reset Utils mock
    Utils.stripTags.mockClear();
    Utils.stripTags.mockImplementation((html) => html || '');
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

  test('handles Backspace key for empty blocks', () => {
    // Create mock blocks
    const currentBlock = document.createElement('div');
    currentBlock.className = 'block';
    currentBlock.innerHTML = ''; // Empty block
    
    const previousBlock = document.createElement('div');
    previousBlock.className = 'block';
    previousBlock.innerHTML = 'Previous block content';
    
    const nextBlock = document.createElement('div');
    nextBlock.className = 'block';
    nextBlock.innerHTML = 'Next block content';
    
    // Set up DOM structure
    const container = document.createElement('div');
    container.appendChild(previousBlock);
    container.appendChild(currentBlock);
    container.appendChild(nextBlock);
    
    // Mock Editor.instance to contain our blocks
    Editor.instance = container;
    Editor.currentBlock = currentBlock;
    
    // Mock Editor.focus method
    const focusSpy = jest.spyOn(Editor, 'focus').mockImplementation(() => {});
    const setCurrentBlockSpy = jest.spyOn(Editor, 'setCurrentBlock').mockImplementation(() => {});
    const updateSpy = jest.spyOn(Editor, 'update').mockImplementation(() => {});
    
    const event = { 
      key: 'Backspace', 
      preventDefault: jest.fn() 
    };
    
    KeyHandler.handleSpecialKeys(event);
    
    // Verify the current block was removed
    expect(container.children.length).toBe(2);
    expect(container.contains(currentBlock)).toBe(false);
    
    // Verify focus was set to previous block using Editor.focus (not native focus)
    expect(setCurrentBlockSpy).toHaveBeenCalledWith(previousBlock);
    expect(focusSpy).toHaveBeenCalledWith(previousBlock);
    expect(updateSpy).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    
    // Clean up
    focusSpy.mockRestore();
    setCurrentBlockSpy.mockRestore();
    updateSpy.mockRestore();
  });

  test('handles Backspace key when no previous block exists', () => {
    // Create mock blocks
    const currentBlock = document.createElement('div');
    currentBlock.className = 'block';
    currentBlock.innerHTML = ''; // Empty block
    
    const nextBlock = document.createElement('div');
    nextBlock.className = 'block';
    nextBlock.innerHTML = 'Next block content';
    
    // Set up DOM structure (no previous block)
    const container = document.createElement('div');
    container.appendChild(currentBlock);
    container.appendChild(nextBlock);
    
    // Mock Editor.instance to contain our blocks
    Editor.instance = container;
    Editor.currentBlock = currentBlock;
    
    // Mock Editor.focus method
    const focusSpy = jest.spyOn(Editor, 'focus').mockImplementation(() => {});
    const setCurrentBlockSpy = jest.spyOn(Editor, 'setCurrentBlock').mockImplementation(() => {});
    const updateSpy = jest.spyOn(Editor, 'update').mockImplementation(() => {});
    
    const event = { 
      key: 'Backspace', 
      preventDefault: jest.fn() 
    };
    
    KeyHandler.handleSpecialKeys(event);
    
    // Verify the current block was removed
    expect(container.children.length).toBe(1);
    expect(container.contains(currentBlock)).toBe(false);
    
    // Verify focus was set to next block using Editor.focus (not native focus)
    expect(setCurrentBlockSpy).toHaveBeenCalledWith(nextBlock);
    expect(focusSpy).toHaveBeenCalledWith(nextBlock);
    expect(updateSpy).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    
    // Clean up
    focusSpy.mockRestore();
    setCurrentBlockSpy.mockRestore();
    updateSpy.mockRestore();
  });

  test('does not remove last remaining block on Backspace', () => {
    // Create single mock block
    const currentBlock = document.createElement('div');
    currentBlock.className = 'block';
    currentBlock.innerHTML = ''; // Empty block
    
    // Set up DOM structure (only one block)
    const container = document.createElement('div');
    container.appendChild(currentBlock);
    
    // Mock Editor.instance to contain our single block
    Editor.instance = container;
    Editor.currentBlock = currentBlock;
    
    const event = { 
      key: 'Backspace', 
      preventDefault: jest.fn() 
    };
    
    KeyHandler.handleSpecialKeys(event);
    
    // Verify the block was NOT removed (last remaining block)
    expect(container.children.length).toBe(1);
    expect(container.contains(currentBlock)).toBe(true);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
