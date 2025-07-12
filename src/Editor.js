'use strict';

/**
 * WYSIWYG editor.
 * Editable area consists of blocks (<div class="block">)
 */

import {Toolbar} from "./Toolbar.js";
import {log, logWarning} from "./utils/log.js";
import showdown from "showdown";
import {eventEmitter} from "@/utils/eventEmitter.js";
import {Block} from "@/Block.js";
import {Parser} from "@/Parser.js";
import {BlockType} from "@/BlockType.js";
import {Utils} from "@/Utils.js";

/**
 * Editor class
 * @class Editor
 * @property {HTMLElement} instance - The editor instance
 * @property {Array.<Block>} blocks - Array of Block objects
 * @property {HTMLElement} currentBlock - The currently focused block
 * @property {Array.<string>} keybuffer - Buffer for tracking key presses
 * @property {Array.<Object>} rules - Custom rules for the editor
 */
export class Editor
{
    /** {?HTMLElement} */
    static instance = null;
    
    /** {array<Block>} */
    static blocks = [];
    
    /** {HTMLElement} */
    static currentBlock;
    
    static rules = [];
    
    /**
     *
     * @type {Array.<string>}
     */
    static keybuffer = [];
    
    /**
     *
     * @param {object} options
     */
    constructor(options = {})
    {
        log('construct()', 'Editor.'); console.log({options});
        
        const elementId = options.id ?? null;
        
        if ( !elementId ) {
            return console.warn('Element id is not set.');
        }
        
        const toolbarOptions = {
            id: options.toolbarId ?? null,
            container: document.querySelector('.editor-container'),
            config: options.toolbar
        };
        Toolbar.init(toolbarOptions);

        Editor.init(options);
    }
    
    /**
     *
     * @param {object} options
     */
    static init(options)
    {
        log('init()', 'Editor.'); console.log({options});

        const editorContainer = document.createElement('div');
        editorContainer.id = 'editor';
        editorContainer.className = 'editor';

        if ( options.container ) {
            if ( Array.isArray(options.container) ) {
                options.container.forEach(container => {
                    container.appendChild(editorContainer);
                });
            } else {
                options.container.appendChild(editorContainer);
            }
        }

        this.instance = document.getElementById(options.id);

        this.instance.setAttribute('contenteditable', 'true');

        let content = options.text || this.instance.innerHTML || '';
        
        let blocks = Parser.parse(content);
        
        if ( 0 === blocks.length ) {
            blocks = [new Block()];
        }

        // @fixme use timestamp(content) for tracking changes
        
        /*$(element).on('focus', (e) => {
            const currentTarget = e.currentTarget;
            currentTarget.data('before', $(this).html());
        }).on('blur keyup paste input', (e) => {
            const currentTarget = e.currentTarget;
            if ( $(this).data('before') !== $(this).html() ) {
                $(this).data('before', $(this).html());
                $(this).trigger('change');
            }
        });*/
        
        //Editor.html2md($(element).html());
        
        /*$(element).on('change', () => {
            Editor.update();
        });*/
    
        //Editor.update();
        
        for ( let block of blocks ) {
            let html = Parser.html(block);
            this.instance.append(html);
        }
        
        this.setCurrentBlock(this.instance.querySelectorAll('.block')[0]);
        
        // Ensure at least one block exists
        if ( 0 === content.length ) {
            const block = document.createElement('div');
            block.classList.add('block')
            block.innerHTML = '<br />';
            this.instance.appendChild(block);
        }
    
        this.addListeners();
        
        // @fixme focus only if empty content
        if ( 0 ) {
            Editor.focus();
        }

        this.initMarkdownContainer();
        this.initHtmlContainer();
    }
    
    /**
     * Adds event listeners
     */
    static addListeners()
    {
        log('addListeners()', 'Editor.');
        
        this.instance.addEventListener('keydown', (e) => {
            if ( 'Tab' === e.key ) {
                e.preventDefault();
                Toolbar.tab();
            }
        });
    
        this.instance.addEventListener('keyup', (e) => {
            Editor.key(e);
        });
    
        this.instance.addEventListener('keydown', (e) => {
            Editor.checkKeys(e);
        });
        
        // PASTE TEXT/HTML Event handler
        this.instance.addEventListener('paste', (e) => {
            Editor.paste(e);
            e.preventDefault();
        });
        
        // mask focused block as currentBlock
        document.addEventListener('click', function(e) {
            // Ignore clicks outside the editor
            if ( !e.target.closest('.editor') ) {
                return;
            }

            let block = e.target.closest('.block');
            if ( !block ) {
                return;
            }
            Editor.setCurrentBlock(block);
        });

        // Add focus event for keyboard navigation
        // @fixme not working
        this.instance.addEventListener('focusin', function(e) {
            //console.log('focusin', e.target);
            // Ignore clicks outside the editor
            if ( !e.target.closest('.editor') ) {
                return;
            }

            let block = e.target.closest('.block');
            if ( !block ) {
                return;
            }
            Editor.setCurrentBlock(block);
        });
    }

    /**
     * Sets focus on given or current editor block.
     * @param {?HTMLElement} element
     */
    static focus(element= null)
    {
        log('focus()', 'Editor.');
        
        if ( !element ) {
            element = Editor.currentBlock;
        }
        
        console.log({element});
    
        // Verify element exists and is attached to DOM
        if ( !element || !element.isConnected ) {
            logWarning('Cannot focus on non-existent or detached element', 'Editor.focus()');
            return;
        }
        
        const range = document.createRange();
        const selection = window.getSelection();
    
        // Clear existing selections
        selection.removeAllRanges();
        
        //range.selectNode(element);
        // Create and set the range
        range.selectNodeContents(element);
        range.collapse(false);
        
        // Set the selection
        selection.addRange(range);
    
        // Ensure element is visible
        element.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     *
     * @param {ClipboardEvent} e
     */
    static paste(e)
    {
        log('paste()', 'Editor.'); console.log({e});
        
        // @fixme refactor with Parser.parse();
        
        let text = (e.clipboardData || window.clipboardData).getData('text');
        
        const selection = window.getSelection();
        
        if ( !selection.rangeCount ) {
            return false;
        }
        
        text = Utils.escapeHTML(text);
        
        let html = Editor.md2html(text);
    
        if ( selection.rangeCount ) {
            const range = selection.getRangeAt(0);
            
            const node = document.createRange().createContextualFragment(html);
            range.insertNode(node);
        } else {
            document.execCommand('insertHTML', false, html);
        }
    }
    
    /**
     * Raises editor updated event
     */
    static update()
    {
        log('update()', 'Editor.');
        
        let editorHtml = this.instance.innerHTML;
        
        //document.querySelector('textarea.editor-text-md').value = Editor.html2md(editorHtml);
        //document.querySelector('textarea.editor-text-html').value = editorHtml;
        
        if ( 0 === this.instance.querySelectorAll('.block').length ) {
            this.instance.innerHTML = '';
            Editor.addEmptyBlock();
        }
    
        eventEmitter.emit('EDITOR.UPDATED_EVENT');
    }
    
    /**
     *
     * @param {string} html
     * @returns {string} md
     */
    static html2md(html)
    {
        log('html2md()', 'Editor.'); //console.log({html});
        
        let converter = new showdown.Converter();
        
        return converter.makeMd(html);
    }
    
    /**
     *
     * @param {string} md
     * @returns {string} html
     */
    static md2html(md)
    {
        log('md2html()', 'Editor.');
    
        const converter = new showdown.Converter();
        
        let html = converter.makeHtml(md);
        
        //html = html.replace(/(<\/code><\/pre>$(?![\r\n]))/gm, '$1<p><br></p>');
        html = html.replace(/(<\/code><\/pre>$(?![\r\n]))/gm, '$1<br>');
        
        return html;
    }
    
    /**
     *
     * @param {KeyboardEvent} e
     */
    static key(e)
    {
        //log('key()', 'Editor.'); console.log({e});
        
        this.keybuffer.push(e.key);
        
        const innerHtml = Editor.currentBlock.innerHTML;
        const text = Utils.stripTags(innerHtml);
    
        // insert unordered list
        if ( '* ' === text || '- ' === text ) {
            Editor.currentBlock.innerHTML = '';
            Toolbar.ul();
        }
        
        // insert ordered list
        if ( '1 ' === text || '1.' === text ) {
            Editor.currentBlock.innerHTML = '';
            Toolbar.ol();
        }
        
        if ( '[] ' === text ) {
            Editor.currentBlock.innerHTML = '';
            Toolbar.sq();
        }
        
        if ( '# ' === text ) {
            Editor.currentBlock.innerHTML = '';
            Toolbar.h1();
        }
    
        if ( '## ' === text ) {
            Editor.currentBlock.innerHTML = '';
            Toolbar.h2();
        }
    
        if ( '### ' === text ) {
            Editor.currentBlock.innerHTML = '';
            Toolbar.h3();
        }
    
        if ( '#### ' === text ) {
            Editor.currentBlock.innerHTML = '';
            Toolbar.h4();
        }
    
        if ( '##### ' === text ) {
            Editor.currentBlock.innerHTML = '';
            Toolbar.h5();
        }
    
        if ( '###### ' === text ) {
            Editor.currentBlock.innerHTML = '';
            Toolbar.h6();
        }
        
        Editor.update();
    }
    
    /**
     * @param {KeyboardEvent} e
     */
    static checkKeys(e)
    {
        log('checkKeys()', 'Editor.');
        
        //const lastKey = this.keybuffer.slice(-1)[0];
        
        if ( 'Enter' === e.key && !e.shiftKey ) {
            const currentBlock = this.currentBlock;
            console.log({currentBlock});
            const target = e.target;
            console.log({target});
            const currentTarget = e.currentTarget;
            console.log({currentTarget});
            this.handleEnterKey(e);
        }
    }
    
    /**
     * @param {KeyboardEvent} e
     */
    static handleEnterKey(e)
    {
        log('handleEnterKey()', 'Editor.');
    
        let ticksCounter = 0;
    
        for ( let i = this.keybuffer.length; i >= 0; i -- ) {
            
            const j = i - 1;
            const sliceKey = this.keybuffer[j];
        
            // Stop characters
            if ( 'Enter' === sliceKey ) {
                break;
            }
        
            if ( '`' === sliceKey ) {
                ticksCounter ++;
            }
        
            if ( 3 === ticksCounter ) {
                Toolbar.code();
                return;
                //break;
            }
        }
        
        if ( 0 === ticksCounter ) {
            this.addEmptyBlock();
            this.focus();
            e.preventDefault();
        }
    }
    
    /**
     * @return HTMLElement
     */
    static addEmptyBlock()
    {
        log('addEmptyBlock()', 'Editor.');
        
        const block = new Block(BlockType.PARAGRAPH);
        const htmlBlock = Parser.html(block)
        
        const currentBlock = Editor.currentBlock;
    
        // Ensure currentBlock exists
        if ( !currentBlock ) {
            Editor.instance.appendChild(htmlBlock);
        } else {
            currentBlock.after(htmlBlock);
        }
    
        // Update currentBlock reference
        this.setCurrentBlock(htmlBlock);
    
        // Ensure the block is attached before focusing
        /*requestAnimationFrame(() => {
            Editor.focus(htmlBlock);
        });*/
    
        htmlBlock.focus();
        
        return htmlBlock;
    }

    /**
     * Sets the current block
     * @param {HTMLElement} block 
     */
    static setCurrentBlock(block)
    {
        if (Editor.currentBlock) {
            Editor.currentBlock.classList.remove('active-block');
        }
        Editor.currentBlock = block;
        Editor.currentBlock.classList.add('active-block');
    }

    /**
     * Creates and initializes the markdown container
     */
    static initMarkdownContainer()
    {
        const markdownContainer = document.createElement('textarea');
        markdownContainer.id = 'editor-markdown';
        markdownContainer.className = 'editor-text-md visually-hidden';
        markdownContainer.style.width = '100%';
        markdownContainer.style.minHeight = '300px';

        const container = document.querySelector('.editor-container');
        if (container) {
            container.appendChild(markdownContainer);
        } else {
            logWarning('Editor container not found for Markdown container initialization.', 'Editor.initMarkdownContainer()');
        }
    }

    /**
     * Creates and initializes the HTML container
     */
    static initHtmlContainer()
    {
        const htmlContainer = document.createElement('div');
        htmlContainer.id = 'editor-html';
        htmlContainer.className = 'editor-text-html visually-hidden';
        htmlContainer.style.width = '100%';
        htmlContainer.style.minHeight = '300px';

        const container = document.querySelector('.editor-container');
        if (container) {
            container.appendChild(htmlContainer);
        } else {
            logWarning('Editor container not found for HTML container initialization.', 'Editor.initHtmlContainer()');
        }
    }
}