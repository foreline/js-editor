/**
 * Test for empty block markdown trigger issue
 */

import { Editor } from '../src/Editor.js';
import { BlockFactory } from '../src/blocks/BlockFactory.js';
import { Utils } from '../src/Utils.js';

describe('Empty Block Markdown Trigger Fix', () => {
    let mockContainer;
    let editor;

    beforeEach(() => {
        // Create mock DOM environment
        document.body.innerHTML = '<div id="test-container"></div>';
        mockContainer = document.getElementById('test-container');
        
        // Initialize editor
        editor = new Editor({
            id: 'test-container'
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('should convert empty block with just header trigger', () => {
        // Get the current paragraph block
        const paragraphBlock = mockContainer.querySelector('[data-block-type="paragraph"]');
        expect(paragraphBlock).toBeTruthy();
        
        // Simulate typing "# " in the block
        paragraphBlock.innerHTML = '# ';
        
        // Set as current block
        editor.setCurrentBlock(paragraphBlock);
        
        // Test conversion
        const result = editor.checkAndConvertBlock(paragraphBlock);
        
        console.log('Conversion result:', result);
        console.log('Block type after conversion:', paragraphBlock.getAttribute('data-block-type'));
        console.log('Block innerHTML after conversion:', paragraphBlock.innerHTML);
        
        expect(result).toBe(true);
        expect(paragraphBlock.getAttribute('data-block-type')).toBe('h1');
    });

    test('should convert empty block with list trigger', () => {
        // Get the current paragraph block
        const paragraphBlock = mockContainer.querySelector('[data-block-type="paragraph"]');
        expect(paragraphBlock).toBeTruthy();
        
        // Simulate typing "- " in the block
        paragraphBlock.innerHTML = '- ';
        
        // Set as current block
        editor.setCurrentBlock(paragraphBlock);
        
        // Test conversion
        const result = editor.checkAndConvertBlock(paragraphBlock);
        
        console.log('List conversion result:', result);
        console.log('Block type after conversion:', paragraphBlock.getAttribute('data-block-type'));
        console.log('Block innerHTML after conversion:', paragraphBlock.innerHTML);
        
        expect(result).toBe(true);
        expect(paragraphBlock.getAttribute('data-block-type')).toBe('ul');
    });

    test('should handle trigger text processing correctly', () => {
        // Test the text processing logic directly
        const testCases = [
            { input: '# ', expected: '# ' },
            { input: '- ', expected: '- ' },
            { input: '* ', expected: '* ' },
            { input: '1. ', expected: '1. ' },
            { input: '  # ', expected: '# ' }, // leading space removed
            { input: '#&nbsp;', expected: '# ' }, // nbsp normalized
        ];

        testCases.forEach(testCase => {
            // Simulate the processing that happens in checkAndConvertBlock
            const rawText = Utils.stripTags(testCase.input);
            const normalizedText = rawText.replace(/&nbsp;/g, ' ').replace(/\u00A0|\xA0|\u00a0/g, ' ');
            const textContent = normalizedText.replace(/^\s+/, '');
            
            console.log(`Input: "${testCase.input}" -> Raw: "${rawText}" -> Normalized: "${normalizedText}" -> Final: "${textContent}"`);
            expect(textContent).toBe(testCase.expected);
        });
    });

    test('should debug why conversion fails for empty blocks', () => {
        const paragraphBlock = mockContainer.querySelector('[data-block-type="paragraph"]');
        paragraphBlock.innerHTML = '# ';
        
        // Manually walk through checkAndConvertBlock logic
        const currentBlockType = paragraphBlock.getAttribute('data-block-type');
        const rawText = Utils.stripTags(paragraphBlock.innerHTML);
        const normalizedText = rawText.replace(/&nbsp;/g, ' ').replace(/\u00A0|\xA0|\u00a0/g, ' ');
        const textContent = normalizedText.replace(/^\s+/, '');
        
        console.log('Debug conversion process:');
        console.log('- currentBlockType:', currentBlockType);
        console.log('- rawText:', `"${rawText}"`);
        console.log('- normalizedText:', `"${normalizedText}"`);
        console.log('- textContent:', `"${textContent}"`);
        console.log('- textContent.length:', textContent.length);
        console.log('- isEmpty check (!textContent):', !textContent);
        
        // Check if the block factory can find a matching class
        const matchingBlockClass = BlockFactory.findBlockClassForTrigger(textContent);
        console.log('- matchingBlockClass:', matchingBlockClass);
        
        if (matchingBlockClass) {
            const targetBlockType = new matchingBlockClass().type;
            console.log('- targetBlockType:', targetBlockType);
        }
        
        // The issue is likely in one of these steps
        expect(textContent).not.toBe('');
        expect(matchingBlockClass).toBeTruthy();
    });
});
