// noinspection JSDeprecatedSymbols

'use strict';

import {Editor} from "./Editor.js";
import { ToolbarHandlers } from "./ToolbarHandlers.js";
import { BlockFactory } from "./blocks/BlockFactory.js";
import {log} from "./utils/log.js";

/**
 * Toolbar module for text formatting and block management
 */
export const Toolbar = {
    
    /**
     * 
     * @param {*} options 
     */
    init: (options) =>
    {
        log('init()', 'Toolbar.'); console.log({options});
        const { container, config } = options;
        Toolbar.createToolbar(container, config);
        ToolbarHandlers.init();
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
        
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        // Create task list block using BlockFactory
        const taskBlock = BlockFactory.createBlock('sq');
        taskBlock.applyTransformation();
        
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
     * Inserts table
     */
    table: () =>
    {
        log('table()', 'Toolbar.');
        
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        // Create table block and apply transformation
        const tableBlock = BlockFactory.createBlock('table');
        tableBlock.applyTransformation();
        
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

        const noteText = document.querySelector('.note-text');
        const textMd = document.querySelector('.editor-text-md');
        const textHtml = document.querySelector('.editor-text-html');
        const btnText = document.querySelector('.editor-toolbar-text');
        const btnMarkdown = document.querySelector('.editor-toolbar-markdown');
        const btnHtml = document.querySelector('.editor-toolbar-html');

        noteText?.classList.remove('visually-hidden');
        textMd?.classList.add('visually-hidden');
        textHtml?.classList.add('visually-hidden');

        if (btnText) {
            btnText.disabled = true;
        }
        if (btnMarkdown) {
            btnMarkdown.disabled = false;
        }
        if (btnHtml) {
            btnHtml.disabled = false;
        }
    },

    /**
     * Switch to markdown view
     */
    markdown: () =>
    {
        log('markdown()', 'Toolbar.');

        const noteText = document.querySelector('.note-text');
        const textMd = document.querySelector('.editor-text-md');
        const textHtml = document.querySelector('.editor-text-html');

        const btnText = document.querySelector('.editor-toolbar-text');
        const btnMarkdown = document.querySelector('.editor-toolbar-markdown');
        const btnHtml = document.querySelector('.editor-toolbar-html');

        noteText?.classList.add('visually-hidden');
        textMd?.classList.remove('visually-hidden');
        textHtml?.classList.add('visually-hidden');

        if (btnText) {
            btnText.disabled = false;
        }
        if (btnMarkdown) {
            btnMarkdown.disabled = true;
        }
        if (btnHtml) {
            btnHtml.disabled = false;
        }
    },

    /**
     * Switch to html view
     */
    html: () =>
    {
        log('html()', 'Toolbar.');

        const noteText = document.querySelector('.note-text');
        const textMd = document.querySelector('.editor-text-md');
        const textHtml = document.querySelector('.editor-text-html');
        const btnText = document.querySelector('.editor-toolbar-text');
        const btnMarkdown = document.querySelector('.editor-toolbar-markdown');
        const btnHtml = document.querySelector('.editor-toolbar-html');

        noteText?.classList.add('visually-hidden');
        textMd?.classList.add('visually-hidden');
        textHtml?.classList.remove('visually-hidden');

        if (btnText) {
            btnText.disabled = false;
        }
        if (btnMarkdown) {
            btnMarkdown.disabled = false;
        }
        if (btnHtml) {
            btnHtml.disabled = true;
        }
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

    /**
     * Create a toolbar
     * @param {*} container 
     * @param {*} config 
     */
    createToolbar: (container, config) =>
    {
        log('createToolbar()', 'Toolbar.'); console.log({container, config});

        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';

        // Handle both config.config and direct config array formats
        const sections = config.config || config || [];
        
        sections.forEach((section) => {
            const group = document.createElement('div');
            group.className = 'editor-toolbar-group';
            if (section.dropdown) {
                const dropdown = document.createElement('div');
                dropdown.className = 'dropdown';
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary dropdown-toggle';
                btn.type = 'button';
                btn.id = section.id;
                btn.setAttribute('data-bs-toggle', 'dropdown');
                btn.setAttribute('aria-expanded', 'false');
                btn.innerHTML = `<i class="fa ${section.icon}"></i>`;
                dropdown.appendChild(btn);
                const ul = document.createElement('ul');
                ul.className = 'dropdown-menu';
                ul.setAttribute('aria-labelledby', section.id);
                section.group.forEach(item => {
                    const li = document.createElement('li');
                    const button = document.createElement('button');
                    button.className = item.class;
                    button.textContent = item.label || '';
                    if (item.icon) button.innerHTML = `<i class="fa ${item.icon}"></i> ` + button.textContent;
                    if (item.title) button.title = item.title;
                    if (item.disabled) button.disabled = true;
                    li.appendChild(button);
                    ul.appendChild(li);
                });
                dropdown.appendChild(ul);
                group.appendChild(dropdown);
            } else {
                section.group.forEach(item => {
                    const button = document.createElement('button');
                    button.className = item.class;
                    if (item.icon) button.innerHTML = `<i class="fa ${item.icon}"></i>`;
                    if (item.title) button.title = item.title;
                    if (item.disabled) button.disabled = true;
                    group.appendChild(button);
                });
            }
            toolbar.appendChild(group);
        });
        container.insertBefore(toolbar, container.firstChild);
    },
};
