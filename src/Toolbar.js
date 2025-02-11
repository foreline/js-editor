// noinspection JSDeprecatedSymbols

'use strict';

import {Editor} from "./Editor.js";
import {log} from "./utils/log.js";

/**
 *
 */
export const Toolbar = {
    
    init: () =>
    {
        log('init()', 'Toolbar.');
    },
    
    /*
     * UNDO | REDO
     */
    undo: () =>
    {
        log('undo()', 'Toolbar.');
        document.execCommand('undo');
        Toolbar.after();
    },
    
    redo: () =>
    {
        log('redo()', 'Toolbar.');
        document.execCommand('redo');
        Toolbar.after();
    },
    
    /*
     * HEADERs | PARAGRAPH
     */
    h1: () =>
    {
        log('h1()', 'Toolbar.');
        document.execCommand('formatBlock', false, '<h1>');
        Toolbar.after();
    },
    
    h2: () =>
    {
        log('h2()', 'Toolbar.');
        document.execCommand('formatBlock', false, '<h2>');
        Toolbar.after();
    },
    
    h3: () =>
    {
        log('h3()', 'Toolbar.');
        document.execCommand('formatBlock', false, '<h3>');
        Toolbar.after();
    },
    
    h4: () =>
    {
        log('h4()', 'Toolbar.');
        document.execCommand('formatBlock', false, '<h4>');
        Toolbar.after();
    },
    
    h5: () =>
    {
        log('h5()', 'Toolbar.');
        document.execCommand('formatBlock', false, '<h5>');
        Toolbar.after();
    },
    
    h6: () =>
    {
        log('h6()', 'Toolbar.');
        document.execCommand('formatBlock', false, '<h6>');
        Toolbar.after();
    },
    
    paragraph: () =>
    {
        log('paragraph()', 'Toolbar.');
        document.execCommand('formatBlock', false, '<p>');
        Toolbar.after();
    },
    
    /*
     * BOLD | ITALIC | UNDERLINE | STRIKETHROUGH
     */
    
    bold: () =>
    {
        log('bold()', 'Toolbar.');
        document.execCommand('bold');
        Toolbar.after();
    },
    
    italic: () =>
    {
        log('italic()', 'Toolbar.');
        document.execCommand('italic');
        Toolbar.after();
    },
    
    underline: () =>
    {
        log('underline()', 'Toolbar.');
        document.execCommand('underline');
        Toolbar.after();
    },
    
    strikethrough: () =>
    {
        log('strikethrough()', 'Toolbar.');
        document.execCommand('strikeThrough');
        Toolbar.after();
    },
    
    /**
     * Inserts unordered list
     */
    ul: () =>
    {
        log('ul()', 'Toolbar.');
        document.execCommand('insertUnorderedList');
        Toolbar.after();
    },
    
    /**
     * Inserts ordered list
     */
    ol: () =>
    {
        log('ol()', 'Toolbar.');
        document.execCommand('insertOrderedList');
        Toolbar.after();
    },
    
    /**
     * Inserts checkbox list
     */
    sq: () =>
    {
        log('sq()', 'Toolbar.');
        // @fixme @todo
        Toolbar.after();
    },
    
    /**
     * Inserts code block
     */
    code: () =>
    {
        log('code()', 'Toolbar.');
    
        const range = window.getSelection().getRangeAt(0);
        const selectedText = range.toString();
        
        if ( 1 || selectedText ) {
            document.execCommand('formatBlock', false, '<pre>');
        } else {
            document.execCommand('insertHTML', false, '<pre></pre><p></p>');
        }
        
        Toolbar.br();
        
        Toolbar.after();
    },
    
    /**
     * Inserts inline block code
     */
    inline: () =>
    {
        log('inline()', 'Toolbar.');
    
        document.execCommand('formatBlock', false, '<code>');
        
        Toolbar.after();
    },
    
    /**
     * Inserts line break <br />
     */
    br: () =>
    {
        log('br()', 'Toolbar.');
        
        let selection = window.getSelection(); // Get the current selection
        
        if ( selection.rangeCount ) { // Check if there is a selection
            let range = selection.getRangeAt(0);
            let preElement = range.commonAncestorContainer.parentNode;
        
            let br = document.createElement('br');
        
            preElement.parentNode.insertBefore(br, preElement.nextSibling);
        } else {
            console.warn({selection});
        }
    },
    
    /**
     * Inserts tab (4 spaces)
     */
    tab: () =>
    {
        log('tab()', 'Toolbar.');
    
        //document.execCommand('insertHTML', false, '&#009');
        document.execCommand('insertText', false, '    ');
        
        Toolbar.after();
    },
    
    /**
     * Switch to text (normal) view
     */
    text: () =>
    {
        log('text()', 'Toolbar.');
    
        document.querySelector('.note-text')?.classList.remove('visually-hidden');
        document.querySelector('.editor-text-md')?.classList.add('visually-hidden');
        document.querySelector('.editor-text-html')?.classList.add('visually-hidden');
    
        document.querySelector('.editor-toolbar-text').disabled = true;
        document.querySelector('.editor-toolbar-markdown').disabled = false;
        document.querySelector('.editor-toolbar-html').disabled = false;
    },
    
    /**
     * Switch to markdown view
     */
    markdown: () =>
    {
        log('markdown()', 'Toolbar.');
    
        document.querySelector('.note-text').classList.add('visually-hidden');
        document.querySelector('.editor-text-md').classList.remove('visually-hidden');
        document.querySelector('.editor-text-html').classList.add('visually-hidden');
    
        document.querySelector('.editor-toolbar-text').disabled = false;
        document.querySelector('.editor-toolbar-markdown').disabled = true;
        document.querySelector('.editor-toolbar-html').disabled = false;
    },
    
    /**
     * Switch to html view
     */
    html: () =>
    {
        log('html()', 'Toolbar.');
    
        document.querySelector('.note-text').classList.add('visually-hidden');
        document.querySelector('.editor-text-md').classList.add('visually-hidden');
        document.querySelector('.editor-text-html').classList.remove('visually-hidden');
    
        document.querySelector('.editor-toolbar-text').disabled = false;
        document.querySelector('.editor-toolbar-markdown').disabled = false;
        document.querySelector('.editor-toolbar-html').disabled = true;
    },
    
    /**
     * @fixme refactor name
     */
    after: () =>
    {
        log('after()', 'Toolbar.');
        //eventEmitter.emit('EDITOR.UPDATED_EVENT');
        Editor.update();
    },
};

// Place <p> instead of <div>
document.execCommand('defaultParagraphSeparator', false, 'p');

/*
 * UNDO | REDO
 */

document
    .querySelector('.editor-toolbar-undo')
    .addEventListener('click', (e) => {

        e.preventDefault();
        Toolbar.undo();
    });

document
    .querySelector('.editor-toolbar-redo')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.redo();
    });

/*
 * HEADERs | PARAGRAPH
 */

document
    .querySelector('.editor-toolbar-header1')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.h1();
    });

document
    .querySelector('.editor-toolbar-header2')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.h2();
    });

document
    .querySelector('.editor-toolbar-header3')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.h3();
    });

document
    .querySelector('.editor-toolbar-header4')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.h4();
    });

document
    .querySelector('.editor-toolbar-header5')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.h5();
    });

document
    .querySelector('.editor-toolbar-header6')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.h6();
    });

document
    .querySelector('.editor-toolbar-paragraph')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.paragraph();
    })
;

/*
 * BOLD | ITALIC | UNDERLINE | STRIKETHROUGH
 */

document
    .querySelector('.editor-toolbar-bold')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.bold();
    });

document
    .querySelector('.editor-toolbar-italic')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.italic();
    });

document
    .querySelector('.editor-toolbar-underline')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.underline();
    });

document
    .querySelector('.editor-toolbar-strikethrough')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.strikethrough();
    });

/*
 * UL | OL |
 */

document
    .querySelector('.editor-toolbar-ul')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.ul();
    });

document
    .querySelector('.editor-toolbar-ol')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.ol();
    });

document
    .querySelector('.editor-toolbar-sq')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.sq();
    });

/*
 * CODE
 */

document
    .querySelector('.editor-toolbar-code')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.code();
    });

/*
 * TEXT | MARKDOWN | HTML
 */

document
    .querySelector('.editor-toolbar-text')
    addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.text();
    });

document
    .querySelector('.editor-toolbar-markdown')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.markdown();
    });

document
    .querySelector('.editor-toolbar-html')
    .addEventListener('click', (e) => {
        e.preventDefault();
        Toolbar.html();
    });
