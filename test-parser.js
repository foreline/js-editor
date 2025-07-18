// Test the actual Parser.js implementation
import { Parser } from './src/Parser.js';

const testMarkdown = `# Task Test

Here are some tasks:

- [ ] First unchecked task
- [x] First checked task  
- [ ] Second unchecked task

And some more text.`;

console.log('Testing Parser.js implementation:');
console.log('Input markdown:', testMarkdown);

const blocks = Parser.parse(testMarkdown);
console.log('\nParsed blocks:', blocks.length);

blocks.forEach((block, index) => {
    console.log(`\nBlock ${index + 1}:`);
    console.log('Type:', block.type);
    console.log('Content:', block.content);
    console.log('HTML:', block.html);
    
    if (block.type === 'sq') {
        console.log('Is TaskListBlock:', block.constructor.name);
        console.log('Is checked:', block.isChecked());
        
        // Test rendering
        const element = block.renderToElement();
        console.log('Rendered element HTML:', element.outerHTML);
        
        const checkbox = element.querySelector('input[type="checkbox"]');
        console.log('Checkbox found:', !!checkbox);
        if (checkbox) {
            console.log('Checkbox disabled:', checkbox.disabled);
            console.log('Checkbox checked:', checkbox.checked);
        }
    }
});
