/**
 * Simple test to understand the text processing issue
 */

import { Utils } from '../src/Utils.js';
import { BlockFactory } from '../src/blocks/BlockFactory.js';

describe('Text Processing Debug', () => {
    test('should analyze text processing for trigger sequences', () => {
        const testCases = [
            '# ',
            '- ',
            '* ',
            '1. ',
            '1 ',
            '## ',
            '### ',
        ];

        testCases.forEach(input => {
            console.log(`\nTesting input: "${input}"`);
            
            // Simulate the processing in checkAndConvertBlock
            const rawText = Utils.stripTags(input);
            console.log('  rawText:', `"${rawText}"`);
            
            const normalizedText = rawText.replace(/&nbsp;/g, ' ').replace(/\u00A0|\xA0|\u00a0/g, ' ');
            console.log('  normalizedText:', `"${normalizedText}"`);
            
            const textContent = normalizedText.replace(/^\s+/, '');
            console.log('  textContent:', `"${textContent}"`);
            
            const isEmpty = !textContent;
            console.log('  isEmpty check (!textContent):', isEmpty);
            
            if (!isEmpty) {
                const matchingBlockClass = BlockFactory.findBlockClassForTrigger(textContent);
                console.log('  matchingBlockClass:', matchingBlockClass ? matchingBlockClass.name : 'null');
                
                if (matchingBlockClass) {
                    try {
                        const instance = new matchingBlockClass();
                        console.log('  targetBlockType:', instance.type);
                    } catch (e) {
                        console.log('  Error creating instance:', e.message);
                    }
                }
            }
        });
    });
});
