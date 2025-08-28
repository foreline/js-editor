// noinspection JSDeprecatedSymbols

'use strict';

import {Editor} from "./Editor.js";
import { ToolbarHandlers } from "./ToolbarHandlers.js";
import { BlockFactory } from "./blocks/BlockFactory.js";
import {log} from "./utils/log.js";
import {eventEmitter, EVENTS} from "@/utils/eventEmitter.js";

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
        const { container, config, debug, editorInstance } = options;
        
        // Store editor instance reference for debug functionality
        Toolbar.editorInstance = editorInstance;
        
        Toolbar.createToolbar(container, config, debug);
        ToolbarHandlers.init();
        
        // Emit toolbar initialization event
        eventEmitter.emit(EVENTS.EDITOR_INITIALIZED, {
            toolbarContainer: container,
            toolbarConfig: config,
            timestamp: Date.now()
        }, { source: 'toolbar.init' });
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
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('h1')) {
            document.execCommand('formatBlock', false, '<h1>');
        }
        
        Toolbar.after();
    },
    
    h2: () =>
    {
        log('h2()', 'Toolbar.');
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('h2')) {
            document.execCommand('formatBlock', false, '<h2>');
        }
        
        Toolbar.after();
    },
    
    h3: () =>
    {
        log('h3()', 'Toolbar.');
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('h3')) {
            document.execCommand('formatBlock', false, '<h3>');
        }
        
        Toolbar.after();
    },
    
    h4: () =>
    {
        log('h4()', 'Toolbar.');
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('h4')) {
            document.execCommand('formatBlock', false, '<h4>');
        }
        
        Toolbar.after();
    },
    
    h5: () =>
    {
        log('h5()', 'Toolbar.');
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('h5')) {
            document.execCommand('formatBlock', false, '<h5>');
        }
        
        Toolbar.after();
    },
    
    h6: () =>
    {
        log('h6()', 'Toolbar.');
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('h6')) {
            document.execCommand('formatBlock', false, '<h6>');
        }
        
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
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('ul')) {
            document.execCommand('insertUnorderedList');
        }
        
        Toolbar.after();
    },
    
    /**
     * Inserts ordered list
     */
    ol: () =>
    {
        log('ol()', 'Toolbar.');
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('ol')) {
            document.execCommand('insertOrderedList');
        }
        
        Toolbar.after();
    },
    
    /**
     * Inserts checkbox list
     */
    sq: () =>
    {
        log('sq()', 'Toolbar.');
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('sq')) {
            const currentBlock = Toolbar.editorInstance?.currentBlock;
            if (!currentBlock) return;
            
            // Create task list block using BlockFactory
            const taskBlock = BlockFactory.createBlock('sq');
            taskBlock.applyTransformation();
        }
        
        Toolbar.after();
    },
    
    /**
     * Inserts code block
     */
    code: () =>
    {
        log('code()', 'Toolbar.');
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('code')) {
            const range = window.getSelection().getRangeAt(0);
            const selectedText = range.toString();
            
            if ( 1 || selectedText ) {
                document.execCommand('formatBlock', false, '<pre>');
            } else {
                document.execCommand('insertHTML', false, '<pre></pre><p></p>');
            }
            
            Toolbar.br();
        }
        
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
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('table')) {
            const currentBlock = Toolbar.editorInstance?.currentBlock;
            if (!currentBlock) return;
            
            // Create table block and apply transformation
            const tableBlock = BlockFactory.createBlock('table');
            tableBlock.applyTransformation();
        }
        
        Toolbar.after();
    },
    
    /**
     * Inserts image
     */
    image: () =>
    {
        log('image()', 'Toolbar.');
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('image')) {
            const currentBlock = Toolbar.editorInstance?.currentBlock;
            if (!currentBlock) return;
            
            // Create image block and apply transformation
            const imageBlock = BlockFactory.createBlock('image');
            imageBlock.applyTransformation();
        }
        
        Toolbar.after();
    },

    /**
     * Inserts quote block
     */
    quote: () =>
    {
        log('quote()', 'Toolbar.');
        
        // Try to convert current block, fallback to legacy behavior
        if (!Toolbar.editorInstance?.convertCurrentBlockOrCreate('quote')) {
            const currentBlock = Toolbar.editorInstance?.currentBlock;
            if (!currentBlock) return;
            
            // Create quote block and apply transformation
            const quoteBlock = BlockFactory.createBlock('quote');
            quoteBlock.applyTransformation();
        }
        
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

        // Populate markdown content
        if (textMd && Toolbar.editorInstance) {
            textMd.textContent = Toolbar.editorInstance.getMarkdown();
        }

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

        // Populate HTML content
        if (textHtml && Toolbar.editorInstance) {
            textHtml.textContent = Toolbar.editorInstance.getHtml();
        }

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
     * Toggle debug mode
     */
    debug: () =>
    {
        log('debug()', 'Toolbar.');
        
        if (Toolbar.editorInstance) {
            Toolbar.editorInstance.toggleDebugMode();
            
            // Update button state
            const debugBtn = document.querySelector('.editor-toolbar-debug');
            if (debugBtn) {
                const isActive = Toolbar.editorInstance.debugMode;
                if (isActive) {
                    debugBtn.classList.add('active');
                    debugBtn.title = 'отключить режим отладки';
                } else {
                    debugBtn.classList.remove('active');
                    debugBtn.title = 'включить режим отладки';
                }
            }
        }
    },

    /**
     * @fixme refactor name
     */
    after: () =>
    {
        log('after()', 'Toolbar.');
        //eventEmitter.emit('EDITOR.UPDATED_EVENT');
        Toolbar.editorInstance?.update();
    },

    /**
     * Create a toolbar
     * @param {*} container 
     * @param {*} config 
     * @param {boolean} debug - Whether debug mode is enabled
     */
    createToolbar: (container, config, debug = false) =>
    {
        log('createToolbar()', 'Toolbar.'); console.log({container, config, debug});

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
        
        // Add debug button if debug mode is enabled
        if (debug) {
            const debugGroup = document.createElement('div');
            debugGroup.className = 'editor-toolbar-group';
            
            const debugButton = document.createElement('button');
            debugButton.className = 'editor-toolbar-debug active';
            debugButton.innerHTML = '<i class="fa fa-bug"></i>';
            debugButton.title = 'отключить режим отладки';
            
            debugGroup.appendChild(debugButton);
            toolbar.appendChild(debugGroup);
        }
        
        container.insertBefore(toolbar, container.firstChild);
    },
};
