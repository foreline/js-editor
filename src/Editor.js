'use strict';

/**
 * WYSIWYG editor.
 * Editable area consists of blocks (<div class="block">)
 */

import {Toolbar} from "./Toolbar.js";
import {log, logWarning} from "./utils/log.js";
import showdown from "showdown";
import {eventEmitter, EVENTS} from "@/utils/eventEmitter.js";
import {Block} from "@/Block.js";
import {Parser} from "@/Parser.js";
import {BlockType} from "@/BlockType.js";
import {Utils} from "@/Utils.js";
import {BlockFactory} from "@/blocks/BlockFactory.js";
import {KeyHandler} from "@/KeyHandler.js";

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
            KeyHandler.handleSpecialKeys(e);
        });
    
        this.instance.addEventListener('keyup', (e) => {
            KeyHandler.handleKeyPress(e);
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
            
            // If no block is found but the target is a list item, look for the parent list block
            if (!block && e.target.tagName === 'LI') {
                block = e.target.closest('ul, ol, div').closest('.block');
            }
            
            if ( !block ) {
                return;
            }
            Editor.setCurrentBlock(block);
        });

        // Add focus event for keyboard navigation
        this.instance.addEventListener('focusin', function(e) {
            // Ignore focus events outside the editor
            if ( !e.target.closest('.editor') ) {
                return;
            }

            let block = e.target.closest('.block');
            
            // If no block is found but the target is a list item, look for the parent list block
            if (!block && e.target.tagName === 'LI') {
                block = e.target.closest('ul, ol, div').closest('.block');
            }
            
            if ( block ) {
                Editor.setCurrentBlock(block);
            } else {
                // If no block is found but we're in the editor, try to focus on first block
                const firstBlock = Editor.instance.querySelector('.block');
                if ( firstBlock ) {
                    Editor.setCurrentBlock(firstBlock);
                }
            }
        });
        
        // Add mouseup event to catch cursor placement
        this.instance.addEventListener('mouseup', function(e) {
            // Ignore mouse events outside the editor
            if ( !e.target.closest('.editor') ) {
                return;
            }

            // Check if cursor is placed in a block
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const commonAncestor = range.commonAncestorContainer;
                let block = commonAncestor.nodeType === Node.TEXT_NODE ? 
                    commonAncestor.parentElement : commonAncestor;
                
                // Find the closest block element
                block = block.closest('.block');
                
                // If no block is found but the target is within a list item, look for the parent list block
                if (!block && block?.closest('li')) {
                    const listItem = block.closest('li');
                    block = listItem.closest('ul, ol, div').closest('.block');
                }
                
                if ( block ) {
                    Editor.setCurrentBlock(block);
                }
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
            
            // Fallback mechanism: focus on editor instance or first available block
            if ( Editor.instance ) {
                const firstBlock = Editor.instance.querySelector('.block');
                if ( firstBlock ) {
                    // Focus on the first available block
                    Editor.setCurrentBlock(firstBlock);
                    Editor.focus(firstBlock);
                    return;
                } else {
                    // No blocks available, focus on editor instance itself
                    Editor.instance.focus();
                    return;
                }
            }
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
        
        e.preventDefault(); // Prevent default paste behavior
        
        let text = (e.clipboardData || window.clipboardData).getData('text');
        let htmlData = (e.clipboardData || window.clipboardData).getData('text/html');
        
        const selection = window.getSelection();
        
        if ( !selection.rangeCount ) {
            return false;
        }
        
        // Sanitize the input text to prevent XSS attacks
        text = Utils.escapeHTML(text);
        
        // If HTML data is available, sanitize it as well
        let finalHtml = '';
        if ( htmlData && htmlData.trim() !== '' ) {
            // Basic HTML sanitization - remove script tags and event handlers
            htmlData = htmlData
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/on\w+="[^"]*"/gi, '')
                .replace(/on\w+='[^']*'/gi, '')
                .replace(/javascript:/gi, '');
            
            // Use Parser to properly parse HTML into blocks
            try {
                const blocks = Parser.parseHtml(htmlData);
                if ( blocks.length > 0 ) {
                    // Convert blocks back to HTML
                    finalHtml = blocks.map(block => block.html || block.content).join('');
                } else {
                    // Fallback to markdown conversion
                    finalHtml = Editor.md2html(text);
                }
            } catch (error) {
                logWarning('Error parsing HTML data, falling back to markdown conversion', 'Editor.paste()');
                finalHtml = Editor.md2html(text);
            }
        } else {
            // Convert markdown to HTML
            finalHtml = Editor.md2html(text);
        }
    
        if ( selection.rangeCount ) {
            const range = selection.getRangeAt(0);
            
            try {
                const node = document.createRange().createContextualFragment(finalHtml);
                range.deleteContents(); // Clear selected content first
                range.insertNode(node);
                
                // Move cursor to end of inserted content
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch (error) {
                logWarning('Error inserting pasted content', 'Editor.paste()');
                // Fallback to execCommand if modern approach fails
                document.execCommand('insertHTML', false, finalHtml);
            }
        }
        
        // Emit paste event
        eventEmitter.emit(EVENTS.USER_PASTE, {
            text: text,
            html: htmlData,
            processedHtml: finalHtml,
            timestamp: Date.now()
        }, { source: 'user.paste' });
        
        // Update editor after paste
        Editor.update();
    }
    
    /**
     * Raises editor updated event with content change tracking
     */
    static update()
    {
        log('update()', 'Editor.');
        
        let editorHtml = this.instance.innerHTML;
        const markdownContent = Editor.html2md(editorHtml);
        
        // Update timestamps for all blocks
        this.updateBlockTimestamps();
        
        if ( 0 === this.instance.querySelectorAll('.block').length ) {
            this.instance.innerHTML = '';
            Editor.addEmptyBlock();
        }

        // Emit both legacy and new events
        eventEmitter.emit('EDITOR.UPDATED_EVENT'); // Legacy compatibility
        eventEmitter.emit(EVENTS.EDITOR_UPDATED, {
            html: editorHtml,
            markdown: markdownContent,
            blockCount: this.instance.querySelectorAll('.block').length
        });
        
        // Emit debounced content change event for backend synchronization
        eventEmitter.emit(EVENTS.CONTENT_CHANGED, {
            html: editorHtml,
            markdown: markdownContent,
            timestamp: Date.now()
        }, { debounce: 500, source: 'editor.update' });
    }

    /**
     * Update timestamps for all blocks to track content changes
     */
    static updateBlockTimestamps() {
        const blocks = this.instance.querySelectorAll('.block');
        const currentTimestamp = Date.now();
        
        blocks.forEach(block => {
            const content = block.textContent || block.innerHTML;
            const lastContent = block.getAttribute('data-last-content');
            
            // Only update timestamp if content has actually changed
            if (lastContent !== content) {
                block.setAttribute('data-timestamp', currentTimestamp.toString());
                block.setAttribute('data-last-content', content);
                
                // Emit block-specific content change event
                eventEmitter.emit(EVENTS.BLOCK_CONTENT_CHANGED, {
                    blockId: block.getAttribute('data-block-id') || block.id,
                    blockType: block.getAttribute('data-block-type'),
                    content: content,
                    previousContent: lastContent,
                    timestamp: currentTimestamp
                }, { throttle: 200, source: 'block.content' });
            }
        });
    }
      /**
     *
     * @param {string} html
     * @returns {string} md
     */
    static html2md(html)
    {
        log('html2md()', 'Editor.'); //console.log({html});
        
        try {
            // Validate input
            if ( !html || typeof html !== 'string' ) {
                logWarning('Invalid HTML input for conversion', 'Editor.html2md()');
                return '';
            }
            
            let converter = new showdown.Converter({ ghCompatibleHeaderId: false, headerIds: false });
            
            return converter.makeMd(html);
        } catch (error) {
            logWarning('Error converting HTML to markdown: ' + error.message, 'Editor.html2md()');
            return html; // Return original HTML as fallback
        }
    }

    /**
     *
     * @param {string} md
     * @returns {string} html
     */
    static md2html(md)
    {
        log('md2html()', 'Editor.');
        
        try {
            // Validate input
            if ( !md || typeof md !== 'string' ) {
                logWarning('Invalid markdown input for conversion', 'Editor.md2html()');
                return '';
            }
    
            const converter = new showdown.Converter({ ghCompatibleHeaderId: false, headerIds: false });
            
            let html = converter.makeHtml(md);
            
            //html = html.replace(/(<\/code><\/pre>$(?![\r\n]))/gm, '$1<p><br></p>');
            html = html.replace(/(<\/code><\/pre>$(?![\r\n]))/gm, '$1<br>');
            
            return html;
        } catch (error) {
            logWarning('Error converting markdown to HTML: ' + error.message, 'Editor.md2html()');
            return Utils.escapeHTML(md); // Return escaped markdown as fallback
        }
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
            // Note: addEmptyBlock() handles focus internally, no need to call focus again
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
        const htmlBlock = Parser.html(block);
        
        // Generate unique block ID
        const blockId = 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        htmlBlock.setAttribute('data-block-id', blockId);
        htmlBlock.setAttribute('data-timestamp', Date.now().toString());
        
        const currentBlock = Editor.currentBlock;
    
        // Ensure currentBlock exists
        if ( !currentBlock ) {
            Editor.instance.appendChild(htmlBlock);
        } else {
            currentBlock.after(htmlBlock);
        }
    
        // Update currentBlock reference
        this.setCurrentBlock(htmlBlock);
    
        // Emit block creation event
        eventEmitter.emit(EVENTS.BLOCK_CREATED, {
            blockId: blockId,
            blockType: BlockType.PARAGRAPH,
            position: Array.from(Editor.instance.querySelectorAll('.block')).indexOf(htmlBlock),
            timestamp: Date.now()
        }, { source: 'editor.create' });
    
        // Ensure the block is attached before focusing
        requestAnimationFrame(() => {
            Editor.focus(htmlBlock);
            Editor.update();
        });
        
        return htmlBlock;
    }

    /**
     * Updates toolbar button states based on the current block
     */
    static updateToolbarButtonStates()
    {
        log('updateToolbarButtonStates()', 'Editor.');

        if (!Editor.currentBlock) {
            return;
        }

        const blockType = Editor.currentBlock.getAttribute('data-block-type');
        if (!blockType) {
            return;
        }

        // Get the block class to access its static methods
        const blockClass = Editor.getBlockClass(blockType);
        if (!blockClass) {
            return;
        }

        // Get disabled buttons for this block type (static method)
        const disabledButtons = blockClass.getDisabledButtons();
        
        // Reset all toolbar buttons to enabled state
        Editor.enableAllToolbarButtons();
        
        // Disable buttons that shouldn't be available for this block type
        disabledButtons.forEach(buttonClass => {
            const button = document.querySelector(`.${buttonClass}`);
            if (button) {
                button.disabled = true;
                button.classList.add('disabled');
            }
        });

        log('updateToolbarButtonStates()', 'Editor.', { blockType, disabledButtons });
    }

    /**
     * Enables all toolbar buttons (resets their state)
     */
    static enableAllToolbarButtons()
    {
        log('enableAllToolbarButtons()', 'Editor.');

        const toolbarButtons = document.querySelectorAll('.editor-toolbar button');
        toolbarButtons.forEach(button => {
            // Don't re-enable view buttons that are currently disabled for good reason
            const isViewButton = button.classList.contains('editor-toolbar-text') || 
                               button.classList.contains('editor-toolbar-markdown') || 
                               button.classList.contains('editor-toolbar-html');
            
            // Enable all non-view buttons, but preserve view button states
            if (!isViewButton) {
                button.disabled = false;
                button.classList.remove('disabled');
            }
        });
    }

    /**
     * Gets a block instance for the given block type
     * @param {string} blockType The block type identifier
     * @returns {object|null} Block instance or null if not found
     */
    static getBlockInstance(blockType)
    {
        log('getBlockInstance()', 'Editor.', { blockType });

        try {
            // Create a temporary instance to access its methods
            return BlockFactory.createBlock(blockType, '', '', false);
        } catch (error) {
            console.warn(`Could not create block instance for type: ${blockType}`, error);
            return null;
        }
    }

    /**
     * Gets a block class for the given block type
     * @param {string} blockType The block type identifier
     * @returns {Function|null} Block class or null if not found
     */
    static getBlockClass(blockType)
    {
        try {
            // Get the block class from the factory
            return BlockFactory.getBlockClass(blockType);
        } catch (error) {
            console.warn(`Could not get block class for type: ${blockType}`, error);
            return null;
        }
    }

    /**
     * Sets the current block
     * @param {HTMLElement} block 
     */
    static setCurrentBlock(block)
    {
        log('setCurrentBlock()', 'Editor.', { block });

        const previousBlock = Editor.currentBlock;
        
        if (Editor.currentBlock) {
            Editor.currentBlock.classList.remove('active-block');
        }
        
        Editor.currentBlock = block;
        Editor.currentBlock.classList.add('active-block');
        
        // Update toolbar button states based on current block
        Editor.updateToolbarButtonStates();
        
        // Emit block focus event
        eventEmitter.emit(EVENTS.BLOCK_FOCUSED, {
            blockId: block.getAttribute('data-block-id') || block.id,
            blockType: block.getAttribute('data-block-type'),
            previousBlockId: previousBlock ? (previousBlock.getAttribute('data-block-id') || previousBlock.id) : null,
            timestamp: Date.now()
        }, { throttle: 50, source: 'editor.focus' });
    }

    /**
     * Creates and initializes the markdown container
     * @returns {boolean} True if successful, false otherwise
     */
    static initMarkdownContainer()
    {
        log('initMarkdownContainer()', 'Editor.');

        try {
            const markdownContainer = document.createElement('textarea');
            markdownContainer.id = 'editor-markdown';
            markdownContainer.className = 'editor-text-md visually-hidden';
            markdownContainer.style.width = '100%';
            markdownContainer.style.minHeight = '300px';

            const container = document.querySelector('.editor-container');
            if (container) {
                // Check if container already exists to avoid duplicates
                const existing = container.querySelector('#editor-markdown');
                if (existing) {
                    logWarning('Markdown container already exists, skipping initialization.', 'Editor.initMarkdownContainer()');
                    return true;
                }
                container.appendChild(markdownContainer);
                return true;
            } else {
                logWarning('Editor container not found for Markdown container initialization.', 'Editor.initMarkdownContainer()');
                return false;
            }
        } catch (error) {
            logWarning('Error initializing markdown container: ' + error.message, 'Editor.initMarkdownContainer()');
            return false;
        }
    }

    /**
     * Creates and initializes the HTML container
     * @returns {boolean} True if successful, false otherwise
     */
    static initHtmlContainer()
    {
        log('initHtmlContainer()', 'Editor.');
        
        try {
            const htmlContainer = document.createElement('div');
            htmlContainer.id = 'editor-html';
            htmlContainer.className = 'editor-text-html visually-hidden';
            htmlContainer.style.width = '100%';
            htmlContainer.style.minHeight = '300px';

            const container = document.querySelector('.editor-container');
            if (container) {
                // Check if container already exists to avoid duplicates
                const existing = container.querySelector('#editor-html');
                if (existing) {
                    logWarning('HTML container already exists, skipping initialization.', 'Editor.initHtmlContainer()');
                    return true;
                }
                container.appendChild(htmlContainer);
                return true;
            } else {
                logWarning('Editor container not found for HTML container initialization.', 'Editor.initHtmlContainer()');
                return false;
            }
        } catch (error) {
            logWarning('Error initializing HTML container: ' + error.message, 'Editor.initHtmlContainer()');
            return false;
        }
    }

    /**
     * Get all editor content as markdown
     * @returns {string} - markdown representation of all content
     */
    static getMarkdown()
    {
        log('getMarkdown()', 'Editor.');
        
        try {
            if (!this.blocks || this.blocks.length === 0) {
                return '';
            }

            const markdownBlocks = this.blocks.map(block => {
                if (typeof block.toMarkdown === 'function') {
                    return block.toMarkdown();
                }
                // Fallback for blocks that don't implement toMarkdown
                return this.html2md(block.html || block.content || '');
            });

            return markdownBlocks.join('\n\n').trim();
        } catch (error) {
            logWarning('Error getting markdown content: ' + error.message, 'Editor.getMarkdown()');
            return '';
        }
    }

    /**
     * Get all editor content as HTML
     * @returns {string} - HTML representation of all content
     */
    static getHtml()
    {
        log('getHtml()', 'Editor.');
        
        try {
            if (!this.blocks || this.blocks.length === 0) {
                return '';
            }

            const htmlBlocks = this.blocks.map(block => {
                if (typeof block.toHtml === 'function') {
                    return block.toHtml();
                }
                // Fallback for blocks that don't implement toHtml
                return block.html || this.md2html(block.content || '');
            });

            return htmlBlocks.join('\n').trim();
        } catch (error) {
            logWarning('Error getting HTML content: ' + error.message, 'Editor.getHtml()');
            return '';
        }
    }
}