/**
 * Test for header conversion issue
 */

import { Editor } from '../src/Editor.js';

describe('Header Conversion Debug', () => {
    let editor;

    beforeEach(() => {
        // Set up basic DOM environment
        document.body.innerHTML = '';
        const container = document.createElement('div');
        container.id = 'test-editor';
        document.body.appendChild(container);
        
        editor = new Editor({
            id: 'test-editor',
            debug: true,
            toolbar: true
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('should convert text to header', () => {
        // Add some initial content
        const defaultBlock = editor.addEmptyBlock();
        defaultBlock.textContent = 'Test text to convert';
        editor.setCurrentBlock(defaultBlock);

        console.log('Before conversion:');
        console.log('Current block:', editor.currentBlock);
        console.log('Current block type:', editor.currentBlock?.getAttribute('data-block-type'));
        console.log('Current block content:', editor.currentBlock?.textContent);

        // Try to convert to H1
        const result = editor.convertCurrentBlockOrCreate('h1');
        
        console.log('Conversion result:', result);
        console.log('After conversion:');
        console.log('Current block:', editor.currentBlock);
        console.log('Current block type:', editor.currentBlock?.getAttribute('data-block-type'));
        console.log('Current block content:', editor.currentBlock?.textContent);
        console.log('Block HTML:', editor.currentBlock?.innerHTML);

        expect(result).toBe(true);
        expect(editor.currentBlock?.getAttribute('data-block-type')).toBe('h1');
    });
});
