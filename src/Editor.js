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
 *
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

        document.querySelectorAll('.editor-container').forEach(container => {
            container.appendChild(editorContainer);
        });

        this.instance = document.getElementById(options.id);

        this.instance.setAttribute('contenteditable', 'true');

        let content = this.instance.innerHTML;
        
        this.instance.innerHTML = '';
        
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
            this.instance.append(Parser.html(block));
        }
        
        this.currentBlock = this.instance.querySelectorAll('.block')[0];
        
        if ( 0 === content.length ) {
            const block = document.createElement('div');
            block.classList.add('block')
            block.innerHTML = '<br />';
            
            console.log({block});
    
            this.instance.appendChild(block);
        }
        
        //$(element).html(Editor.md2html(text));
        //$('textarea.editor-text-html').val($(element).html());
        
        this.addListeners();
        
        // @fixme focus only if empty content
        if ( 0 ) {
            Editor.focus();
        }
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
            if ( e.target.matches('.block') ) {
                Editor.currentBlock = e.target;
            }
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
            Editor.addBlock();
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
            this.addBlock();
            this.focus();
            e.preventDefault();
        }
    }
    
    /**
     * @return HTMLElement
     */
    static addBlock()
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
        Editor.currentBlock = htmlBlock;
    
        // Ensure the block is attached before focusing
        /*requestAnimationFrame(() => {
            Editor.focus(htmlBlock);
        });*/
    
        htmlBlock.focus();
        
        return htmlBlock;
    }
    
}