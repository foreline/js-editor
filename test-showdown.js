const showdown = require('showdown');

// Test Showdown's task list handling
const converter = new showdown.Converter({ 
    ghCompatibleHeaderId: false, 
    headerIds: false,
    tasklists: true,
    tables: true,
    simplifiedAutoLink: true,
    literalMidWordUnderscores: true,
    strikethrough: true,
    emoji: true
});

const testMarkdown = `# Task Test

Here are some tasks:

- [ ] First unchecked task
- [x] First checked task  
- [ ] Second unchecked task

And some more text.`;

console.log('Original markdown:');
console.log(testMarkdown);
console.log('\n=== Showdown HTML Output ===');
const html = converter.makeHtml(testMarkdown);
console.log(html);

// Also test the preprocessing
function preprocessMarkdown(markdownString) {
    let processed = markdownString;
    
    // Pre-process task lists
    processed = processed.replace(/^- \[([x ])\] (.+)$/gm, (match, checked, text) => {
        const isChecked = checked === 'x';
        return `<task-item data-checked="${isChecked}">${text}</task-item>`;
    });

    return processed;
}

console.log('\n=== After preprocessing ===');
const preprocessed = preprocessMarkdown(testMarkdown);
console.log(preprocessed);

console.log('\n=== Showdown after preprocessing ===');
const htmlAfterPreprocess = converter.makeHtml(preprocessed);
console.log(htmlAfterPreprocess);
