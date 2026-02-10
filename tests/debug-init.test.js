import {Editor} from './src/Editor.js';
import '@testing-library/jest-dom';

describe('Debug Init', () => {
    let container;
    let editor;

    test('should create default block on init', () => {
        // Create container
        container = document.createElement('div');
        container.id = 'test-editor';
        document.body.appendChild(container);

        console.log('Before creating editor');
        console.log('Container innerHTML:', container.innerHTML);

        // Initialize editor
        editor = new Editor({ id: 'test-editor', debug: false });

        console.log('After creating editor');
        console.log('Editor instance innerHTML:', editor.instance.innerHTML);
        console.log('Blocks found:', editor.instance.querySelectorAll('.block').length);
        
        const blocks = editor.instance.querySelectorAll('.block');
        blocks.forEach((block, i) => {
            console.log(`Block ${i}:`, {
                type: block.getAttribute('data-block-type'),
                innerHTML: block.innerHTML,
                textContent: block.textContent
            });
        });

        expect(blocks.length).toBeGreaterThan(0);
    });
});
