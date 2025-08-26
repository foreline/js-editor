'use strict';

/**
 * WYSIWYG editor.
 * Editable area consists of blocks (<div class="block">)
 */

import {Toolbar} from "./Toolbar.js";
import {log, logWarning} from "./utils/log.js";
import showdown from "showdown";
import {EditorEventEmitter, EVENTS} from "@/utils/eventEmitter.js";
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
 * @property {EditorEventEmitter} eventEmitter - Instance-specific event emitter
 */
export class Editor
{
    // Static registry to track all editor instances
    static _instances = new Map();
    
    // Static fallback properties for backward compatibility when no instances exist
    static _fallbackBlocks = [];
    
    /**
     * @param {object} options
     */
    constructor(options = {})
    {
        log('construct()', 'Editor.'); console.log({options});
        
        const elementId = options.id ?? null;
        
        if ( !elementId ) {
            return console.warn('Element id is not set.');
        }

        // Instance properties
        this.instance = null;
        this.blocks = [];
        this.currentBlock = null;
        this.rules = [];
        this.keybuffer = [];
        this.debug = options.debug || false;
        this.debugMode = this.debug; // Current debug state (can be toggled)
        
        // Create instance-specific event emitter
        this.eventEmitter = new EditorEventEmitter({ debug: options.debug || false });
        
        // Initialize the editor first
        this.init(options);
        
        // Now initialize toolbar after instance is created
        this.initializeToolbar(options);
        
        // Register this instance
        Editor._instances.set(this.instance, this);
    }
    
    /**
     * Initialize toolbar after editor instance is created
     * @param {object} options 
     */
    initializeToolbar(options) {
        // Initialize toolbar - use the editor instance element's parent as container
        const toolbarContainer = this.instance.parentElement || this.instance;
        const defaultToolbarConfig = [
            {
                group: [
                    { class: 'editor-toolbar-undo', icon: 'fa-undo', title: 'undo' },
                    { class: 'editor-toolbar-redo', icon: 'fa-redo', title: 'redo' }
                ]
            },
            {
                group: [
                    { class: 'editor-toolbar-header1', label: 'Header 1' },
                    { class: 'editor-toolbar-header2', label: 'Header 2' },
                    { class: 'editor-toolbar-header3', label: 'Header 3' },
                    { class: 'editor-toolbar-header4', label: 'Header 4' },
                    { class: 'editor-toolbar-header5', label: 'Header 5' },
                    { class: 'editor-toolbar-header6', label: 'Header 6' },
                    { class: 'editor-toolbar-paragraph', label: 'Paragraph' }
                ],
                dropdown: true,
                icon: 'fa-heading',
                id: 'dropdownMenuHeader'
            },
            {
                group: [
                    { class: 'editor-toolbar-bold', icon: 'fa-bold', title: 'bold' },
                    { class: 'editor-toolbar-italic', icon: 'fa-italic', title: 'italic' },
                    { class: 'editor-toolbar-underline', icon: 'fa-underline', title: 'underline' },
                    { class: 'editor-toolbar-strikethrough', icon: 'fa-strikethrough', title: 'strikethrough' }
                ]
            },
            {
                group: [
                    { class: 'editor-toolbar-ul', icon: 'fa-list', title: 'unordered list' },
                    { class: 'editor-toolbar-ol', icon: 'fa-list-ol', title: 'ordered list' },
                    { class: 'editor-toolbar-sq', icon: 'fa-list-check', title: 'task list' }
                ]
            },
            {
                group: [
                    { class: 'editor-toolbar-table', icon: 'fa-table', title: 'insert table' },
                    { class: 'editor-toolbar-image', icon: 'fa-image', title: 'insert image' }
                ]
            },
            {
                group: [
                    { class: 'editor-toolbar-code', icon: 'fa-code', title: 'code block' }
                ]
            },
            {
                group: [
                    { class: 'editor-toolbar-text', icon: 'fa-paragraph', title: 'text view', disabled: true },
                    { class: 'editor-toolbar-markdown', icon: 'fa-brands fa-markdown', title: 'markdown view' },
                    { class: 'editor-toolbar-html', icon: 'fa-brands fa-html5', title: 'html view' }
                ]
            }
        ];
        
        // Use provided toolbar config or default, only initialize if toolbar is not disabled
        const toolbarConfig = options.toolbar === false ? null : (
            typeof options.toolbar === 'object' && options.toolbar.config ? options.toolbar.config :
            typeof options.toolbar === 'object' && Array.isArray(options.toolbar) ? options.toolbar :
            defaultToolbarConfig
        );
        
        if (toolbarConfig) {
            const toolbarOptions = {
                id: options.toolbarId ?? null,
                container: toolbarContainer,
                config: toolbarConfig,
                debug: this.debug,
                editorInstance: this
            };
            Toolbar.init(toolbarOptions);
        }
    }
    
    /**
     * Initialize the editor instance
     * @param {object} options
     */
    init(options)
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
        
        this.blocks = blocks;
        
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
            this.focus();
        }

        this.initMarkdownContainer();
        this.initHtmlContainer();
        
        // Emit editor initialization event
        this.eventEmitter.emit(EVENTS.EDITOR_INITIALIZED, {
            elementId: options.id,
            blockCount: this.blocks.length,
            timestamp: Date.now()
        }, { source: 'editor.init' });
        
        // Initialize debug mode if enabled
        if (this.debugMode) {
            this.initDebugMode();
        }
    }
    
    /**
     * Initialize debug mode
     */
    initDebugMode() {
        this.createDebugTooltips();
        this.startDebugUpdateLoop();
        this.addDebugEventListeners();
        
        // Add debug mode class to editor instance
        this.instance.classList.add('debug-mode');
    }
    
    /**
     * Add event listeners for debug mode
     */
    addDebugEventListeners() {
        // Update tooltip positions on scroll and resize
        this.debugScrollHandler = () => {
            if (this.debugMode) {
                this.updateDebugTooltipPositions();
            }
        };
        
        this.debugResizeHandler = () => {
            if (this.debugMode) {
                this.updateDebugTooltipPositions();
            }
        };
        
        window.addEventListener('scroll', this.debugScrollHandler);
        window.addEventListener('resize', this.debugResizeHandler);
    }
    
    /**
     * Remove debug event listeners
     */
    removeDebugEventListeners() {
        if (this.debugScrollHandler) {
            window.removeEventListener('scroll', this.debugScrollHandler);
            this.debugScrollHandler = null;
        }
        
        if (this.debugResizeHandler) {
            window.removeEventListener('resize', this.debugResizeHandler);
            this.debugResizeHandler = null;
        }
    }
    
    /**
     * Update tooltip positions only (without content)
     */
    updateDebugTooltipPositions() {
        if (!this.debugMode || !this.currentBlock) return;
        
        // Only update position for the active block's tooltip
        const blocks = this.instance.querySelectorAll('.block');
        const currentIndex = Array.from(blocks).indexOf(this.currentBlock);
        
        if (currentIndex !== -1) {
            const tooltip = document.querySelector(`.debug-tooltip[data-block-index="${currentIndex}"]`);
            if (tooltip) {
                this.positionDebugTooltip(tooltip, this.currentBlock);
            }
        }
    }
    
    /**
     * Toggle debug mode
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        
        if (this.debugMode) {
            this.initDebugMode();
        } else {
            this.removeDebugTooltips();
            this.stopDebugUpdateLoop();
            this.removeDebugEventListeners();
            
            // Remove debug mode class from editor instance
            this.instance.classList.remove('debug-mode');
        }
        
        // Emit debug mode change event
        this.eventEmitter.emit(EVENTS.DEBUG_MODE_CHANGED, {
            debugMode: this.debugMode,
            timestamp: Date.now()
        }, { source: 'editor.toggleDebugMode' });
    }
    
    /**
     * Create debug tooltips for all blocks
     */
    createDebugTooltips() {
        // Only create tooltip for the active block
        this.updateActiveBlockTooltip();
    }
    
    /**
     * Create debug tooltip for a specific block
     */
    createDebugTooltip(blockElement, index) {
        // Remove existing tooltip if present
        const existingTooltip = document.querySelector(`.debug-tooltip[data-block-index="${index}"]`);
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        const tooltip = document.createElement('div');
        tooltip.className = 'debug-tooltip';
        tooltip.setAttribute('data-block-index', index);
        
        // Position tooltip to the right of the block using fixed positioning
        this.updateDebugTooltipContent(tooltip, blockElement, index);
        this.positionDebugTooltip(tooltip, blockElement);
        
        // Add to document body for fixed positioning
        document.body.appendChild(tooltip);
    }
    
    /**
     * Position debug tooltip relative to block
     */
    positionDebugTooltip(tooltip, blockElement) {
        const blockRect = blockElement.getBoundingClientRect();
        const tooltipWidth = 280;
        const gap = 10;
        
        // Position to the right of the block
        let left = blockRect.right + gap;
        let top = blockRect.top;
        
        // Ensure tooltip doesn't go off screen
        if (left + tooltipWidth > window.innerWidth) {
            left = blockRect.left - tooltipWidth - gap; // Position to the left
        }
        
        // Ensure tooltip doesn't go off top of screen
        if (top < 0) {
            top = 10;
        }
        
        // Ensure tooltip doesn't go off bottom of screen
        if (top + tooltip.offsetHeight > window.innerHeight) {
            top = window.innerHeight - tooltip.offsetHeight - 10;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }
    
    /**
     * Update debug tooltip content
     */
    updateDebugTooltipContent(tooltip, blockElement, index) {
        const block = this.blocks[index];
        const isActive = blockElement.classList.contains('active-block');
        const currentTimestamp = Date.now();
        
        // Get block type from multiple sources
        let blockType = 'unknown';
        if (blockElement.getAttribute('data-block-type')) {
            blockType = blockElement.getAttribute('data-block-type');
        } else if (block && block.type) {
            blockType = block.type;
        } else {
            // Infer type from tag name
            const tagName = blockElement.tagName.toLowerCase();
            if (tagName === 'h1') blockType = 'h1';
            else if (tagName === 'h2') blockType = 'h2';
            else if (tagName === 'h3') blockType = 'h3';
            else if (tagName === 'h4') blockType = 'h4';
            else if (tagName === 'h5') blockType = 'h5';
            else if (tagName === 'h6') blockType = 'h6';
            else if (tagName === 'p') blockType = 'paragraph';
            else if (tagName === 'pre') blockType = 'code';
            else if (tagName === 'blockquote') blockType = 'quote';
            else if (tagName === 'ul') blockType = 'ul';
            else if (tagName === 'ol') blockType = 'ol';
            else if (tagName === 'table') blockType = 'table';
            else if (tagName === 'img') blockType = 'image';
            else if (tagName === 'hr') blockType = 'delimiter';
            else blockType = tagName;
        }
        
        // Get markdown content
        let markdownContent = '';
        if (block && block.content) {
            // Use the block's markdown content if available
            markdownContent = block.content;
        } else {
            // Try to get markdown from the block instance
            if (block && block._blockInstance && typeof block._blockInstance.toMarkdown === 'function') {
                markdownContent = block._blockInstance.toMarkdown();
            } else {
                // Convert HTML content to markdown as fallback
                const htmlContent = blockElement.innerHTML || blockElement.outerHTML;
                try {
                    markdownContent = Editor.html2md(htmlContent);
                } catch (error) {
                    // If conversion fails, use text content as fallback
                    markdownContent = blockElement.textContent || blockElement.innerHTML || '';
                }
            }
        }
        
        // Clean up the markdown content
        markdownContent = markdownContent.trim();
        
        // Remove any HTML tags that might have leaked through
        markdownContent = markdownContent.replace(/<[^>]*>/g, '');
        
        // Truncate long content
        if (markdownContent.length > 50) {
            markdownContent = markdownContent.substring(0, 50) + '...';
        }
        
        // Get last updated timestamp from element, fallback to current time
        const lastUpdatedStr = blockElement.getAttribute('data-timestamp');
        let lastUpdatedDate;
        let timeDisplay;
        
        if (lastUpdatedStr) {
            lastUpdatedDate = new Date(parseInt(lastUpdatedStr));
            timeDisplay = lastUpdatedDate.toLocaleTimeString();
        } else {
            // If no timestamp is set, show "not modified"
            timeDisplay = 'not modified';
        }
        
        tooltip.innerHTML = `
            <div class="debug-tooltip-header">Block ${index} (Active)</div>
            <div class="debug-tooltip-row"><strong>Type:</strong> ${blockType}</div>
            <div class="debug-tooltip-row"><strong>Active:</strong> ✓ Yes</div>
            <div class="debug-tooltip-row"><strong>Updated:</strong> ${timeDisplay}</div>
            <div class="debug-tooltip-row"><strong>Content:</strong></div>
            <div class="debug-tooltip-content">${markdownContent || '(empty)'}</div>
        `;
    }
    
    /**
     * Remove all debug tooltips
     */
    removeDebugTooltips() {
        const tooltips = document.querySelectorAll('.debug-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }
    
    /**
     * Start debug update loop
     */
    startDebugUpdateLoop() {
        if (this.debugUpdateInterval) {
            clearInterval(this.debugUpdateInterval);
        }
        
        this.debugUpdateInterval = setInterval(() => {
            this.updateActiveBlockTooltip();
        }, 1000); // Update every second
    }
    
    /**
     * Stop debug update loop
     */
    stopDebugUpdateLoop() {
        if (this.debugUpdateInterval) {
            clearInterval(this.debugUpdateInterval);
            this.debugUpdateInterval = null;
        }
    }
    
    /**
     * Update all debug tooltips
     */
    updateDebugTooltips() {
        if (!this.debugMode) return;
        
        // Only show tooltip for the active block
        this.updateActiveBlockTooltip();
    }
    
    /**
     * Update tooltip for the currently active block only
     */
    updateActiveBlockTooltip() {
        if (!this.debugMode || !this.currentBlock) return;
        
        // Remove all existing tooltips first
        this.removeDebugTooltips();
        
        // Find the index of the current block
        const blocks = this.instance.querySelectorAll('.block');
        const currentIndex = Array.from(blocks).indexOf(this.currentBlock);
        
        if (currentIndex !== -1) {
            this.createDebugTooltip(this.currentBlock, currentIndex);
        }
    }
    
    /**
     * Subscribe to events on this editor instance
     * @param {string} eventType - The event type to subscribe to
     * @param {Function} callback - The callback function
     * @param {Object} options - Subscription options
     * @returns {Object} Subscription object with unsubscribe method
     */
    on(eventType, callback, options = {}) {
        return this.eventEmitter.subscribe(eventType, callback, options);
    }
    
    /**
     * Unsubscribe from events (alias for more intuitive API)
     * @param {string} eventType - The event type
     * @param {Function} callback - The callback function to remove
     */
    off(eventType, callback) {
        // Find and remove the specific callback
        const listeners = this.eventEmitter.events.get(eventType);
        if (listeners) {
            for (const listener of listeners) {
                if (listener.callback === callback) {
                    listeners.delete(listener);
                    break;
                }
            }
            if (listeners.size === 0) {
                this.eventEmitter.events.delete(eventType);
            }
        }
    }
    
    /**
     * Subscribe to event that fires only once
     * @param {string} eventType - The event type
     * @param {Function} callback - The callback function
     * @param {Object} options - Subscription options
     * @returns {Object} Subscription object with unsubscribe method
     */
    once(eventType, callback, options = {}) {
        return this.eventEmitter.subscribe(eventType, callback, { ...options, once: true });
    }
    
    /**
     * Emit events from this editor instance
     * @param {string} eventType - The event type
     * @param {*} data - Event data
     * @param {Object} options - Emission options
     */
    emit(eventType, data, options = {}) {
        this.eventEmitter.emit(eventType, data, options);
    }
    
    /**
     * Get the editor instance from a DOM element
     * @param {HTMLElement} element - The editor DOM element
     * @returns {Editor|null} The editor instance or null if not found
     */
    static getInstance(element) {
        return Editor._instances.get(element) || null;
    }
    
    /**
     * Destroy the editor instance and cleanup
     */
    destroy() {
        // Stop debug update loop and remove tooltips
        this.stopDebugUpdateLoop();
        this.removeDebugTooltips();
        this.removeDebugEventListeners();
        
        // Remove debug mode class
        if (this.instance) {
            this.instance.classList.remove('debug-mode');
        }
        
        // Cleanup event emitter
        this.eventEmitter.cleanup();
        
        // Remove from instances registry
        Editor._instances.delete(this.instance);
        
        // Remove DOM event listeners
        // (Event listeners will be cleaned up when element is removed)
        
        // Clear instance properties
        this.instance = null;
        this.blocks = [];
        this.currentBlock = null;
        this.rules = [];
        this.keybuffer = [];
    }
    
    /**
     * Adds event listeners to this editor instance
     */
    addListeners()
    {
        log('addListeners()', 'Editor.');
        
        this.instance.addEventListener('keydown', (e) => {
            KeyHandler.handleSpecialKeys(e, this);
        });
    
        this.instance.addEventListener('keyup', (e) => {
            KeyHandler.handleKeyPress(e, this);
        });
        
        // PASTE TEXT/HTML Event handler
        this.instance.addEventListener('paste', (e) => {
            this.paste(e);
            e.preventDefault();
        });
        
        // INPUT Event handler - catch content changes for block conversion
        this.instance.addEventListener('input', (e) => {
            // Only handle input events for this editor instance
            if (!e.target.closest(`#${this.instance.id}`)) {
                return;
            }
            
            // Find the block that contains the input target
            let block = e.target.closest('.block');
            
            // If no block is found but the target is a list item, look for the parent list block
            if (!block && e.target.tagName === 'LI') {
                block = e.target.closest('ul, ol, div').closest('.block');
            }
            
            // Check if editor is effectively empty after content deletion
            const allBlocks = this.instance.querySelectorAll('.block');
            if (this.isEditorEmpty(allBlocks)) {
                // Editor is empty, ensure at least one default block exists
                this.ensureDefaultBlock();
                return;
            }
            
            if (block) {
                // Only check for conversion on paragraph blocks to avoid performance issues
                const blockType = block.getAttribute('data-block-type');
                if (blockType === 'p' || blockType === 'paragraph') {
                    // Get current text content
                    const textContent = Utils.stripTags(block.innerHTML).trim();
                    
                    // Only check for conversion if text contains potential triggers
                    if (textContent.match(/^(#{1,6}\s|[\*\-]\s|[\*\-]\s*\[[x\s]\]\s*|\d+\.?\s|>\s|```|~~~)/)) {
                        // Check if this block should be converted to a different type
                        // Use a small timeout to let the DOM update first
                        setTimeout(() => {
                            if (this.checkAndConvertBlock(block)) {
                                this.update();
                            }
                        }, 50);
                    }
                }
            }
        });
        
        // mask focused block as currentBlock
        document.addEventListener('click', (e) => {
            // Only handle clicks for this editor instance
            if (!e.target.closest(`#${this.instance.id}`)) {
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
            this.setCurrentBlock(block);
        });

        // Add focus event for keyboard navigation
        this.instance.addEventListener('focusin', (e) => {
            // Only handle focus events for this editor instance
            if (!e.target.closest(`#${this.instance.id}`)) {
                return;
            }

            let block = e.target.closest('.block');
            
            // If no block is found but the target is a list item, look for the parent list block
            if (!block && e.target.tagName === 'LI') {
                block = e.target.closest('ul, ol, div').closest('.block');
            }
            
            if ( block ) {
                this.setCurrentBlock(block);
            } else {
                // If no block is found but we're in the editor, try to focus on first block
                const firstBlock = this.instance.querySelector('.block');
                if ( firstBlock ) {
                    this.setCurrentBlock(firstBlock);
                }
            }
        });
        
        // Add mouseup event to catch cursor placement
        this.instance.addEventListener('mouseup', (e) => {
            // Only handle mouse events for this editor instance
            if (!e.target.closest(`#${this.instance.id}`)) {
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
                    this.setCurrentBlock(block);
                }
            }
        });
    }

    /**
     * Sets focus on given or current editor block.
     * @param {?HTMLElement} element
     */
    focus(element= null)
    {
        log('focus()', 'Editor.');
        
        if ( !element ) {
            element = this.currentBlock;
        }
        
        console.log({element});
    
        // Verify element exists and is attached to DOM
        if ( !element || !element.isConnected ) {
            logWarning('Cannot focus on non-existent or detached element', 'Editor.focus()');
            
            // Fallback mechanism: focus on editor instance or first available block
            // Use instance method instead of static to avoid recursion
            const firstBlock = this.instance.querySelector('.block');
            if ( firstBlock && firstBlock.isConnected ) {
                // Set current block and try to focus again, but prevent infinite recursion
                this.setCurrentBlock(firstBlock);
                // Direct focus without recursive call
                this.focusElement(firstBlock);
                return;
            } else {
                // No blocks available, focus on editor instance itself
                if (this.instance && this.instance.isConnected) {
                    this.instance.focus();
                }
                return;
            }
        }
        
        this.focusElement(element);
    }

    /**
     * Helper method to focus on an element without recursion
     * @param {HTMLElement} element - The element to focus on
     */
    focusElement(element) {
        if (!element || !element.isConnected) {
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
    paste(e)
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
        this.eventEmitter.emit(EVENTS.USER_PASTE, {
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
    update()
    {
        log('update()', 'Editor.');
        
        // Cancel any pending update to avoid multiple rapid calls
        if (this._updateTimeout) {
            clearTimeout(this._updateTimeout);
        }
        
        // Debounce the actual update to improve performance
        this._updateTimeout = setTimeout(() => {
            this._performUpdate();
        }, 50);
    }

    /**
     * Perform the actual update operation (private method)
     * @private
     */
    _performUpdate() {
        let editorHtml = this.instance.innerHTML;
        
        // Only compute markdown if it's actually needed (performance optimization)
        let markdownContent = '';
        if (this.eventEmitter.hasListeners(EVENTS.EDITOR_UPDATED) || 
            this.eventEmitter.hasListeners(EVENTS.CONTENT_CHANGED)) {
            markdownContent = Editor.html2md(editorHtml);
        }
        
        // Update timestamps for all blocks
        this.updateBlockTimestamps();
        
        // Check if editor has no blocks or all blocks are empty
        const blocks = this.instance.querySelectorAll('.block');
        if (blocks.length === 0 || this.isEditorEmpty(blocks)) {
            // Use the safe method to ensure default block
            this.ensureDefaultBlock();
        }

        // Emit both legacy and new events
        this.eventEmitter.emit('EDITOR.UPDATED_EVENT'); // Legacy compatibility
        this.eventEmitter.emit(EVENTS.EDITOR_UPDATED, {
            html: editorHtml,
            markdown: markdownContent,
            blockCount: this.instance.querySelectorAll('.block').length
        });
        
        // Emit debounced content change event for backend synchronization
        this.eventEmitter.emit(EVENTS.CONTENT_CHANGED, {
            html: editorHtml,
            markdown: markdownContent,
            timestamp: Date.now()
        }, { debounce: 500, source: 'editor.update' });
        
        // Update debug tooltips if debug mode is active
        if (this.debugMode) {
            // Use a slight delay to ensure DOM updates are complete
            setTimeout(() => this.updateActiveBlockTooltip(), 10);
        }
    }

    /**
     * Update timestamps for all blocks to track content changes
     */
    updateBlockTimestamps() {
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
                this.eventEmitter.emit(EVENTS.BLOCK_CONTENT_CHANGED, {
                    blockId: block.getAttribute('data-block-id') || block.id,
                    blockType: block.getAttribute('data-block-type'),
                    content: content,
                    previousContent: lastContent,
                    timestamp: currentTimestamp
                }, { throttle: 200, source: 'block.content' });
                
                // Update debug tooltip if this is the active block
                if (this.debugMode && block === this.currentBlock) {
                    setTimeout(() => this.updateActiveBlockTooltip(), 10);
                }
            }
        });
    }

    /**
     * Check if the editor is effectively empty (all blocks contain no meaningful content)
     * @param {NodeList} blocks - Collection of block elements
     * @returns {boolean}
     */
    isEditorEmpty(blocks) {
        log('isEditorEmpty()', 'Editor.');
        
        if (blocks.length === 0) {
            return true;
        }
        
        // Check if all blocks are empty (contain only whitespace or no content)
        for (let block of blocks) {
            const textContent = Utils.stripTags(block.innerHTML).trim();
            if (textContent.length > 0) {
                return false; // Found non-empty block
            }
        }
        
        return true; // All blocks are empty
    }

    /**
     * Ensures the editor has at least one default block
     * Handles the empty editor edge case safely
     */
    ensureDefaultBlock() {
        log('ensureDefaultBlock()', 'Editor.');
        
        // Get all current blocks
        const allBlocks = this.instance.querySelectorAll('.block');
        
        // If editor is empty, create a default block
        if (allBlocks.length === 0 || this.isEditorEmpty(allBlocks)) {
            // Detach events from existing blocks first
            if (allBlocks.length > 0) {
                this.detachBlockEvents(allBlocks);
            }
            
            // Clear the editor content
            this.instance.innerHTML = '';
            
            // Reset current block reference to prevent focus issues
            this.currentBlock = null;
            
            // Create and add a new default block
            const newBlock = this.addEmptyBlock();
            
            // No need to call update() here as this method is already called from within the update cycle
            // The newly created block will be processed by the current update cycle
            
            return newBlock;
        }
        
        return null;
    }

    /**
     * Detach events from blocks before removing them
     * @param {NodeList} blocks - Collection of block elements to clean up
     */
    detachBlockEvents(blocks) {
        log('detachBlockEvents()', 'Editor.');
        
        blocks.forEach(block => {
            // Clone the block to remove all event listeners
            const clonedBlock = block.cloneNode(true);
            
            // Emit a block destroy event for any cleanup needed
            if (block.getAttribute('data-block-id')) {
                this.eventEmitter.emit(EVENTS.BLOCK_DESTROYED, {
                    blockId: block.getAttribute('data-block-id'),
                    blockType: block.getAttribute('data-block-type'),
                    timestamp: Date.now()
                }, { source: 'editor.cleanup' });
            }
            
            // Replace the block with its clone (removes all event listeners)
            if (block.parentNode) {
                block.parentNode.replaceChild(clonedBlock, block);
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
     * @return HTMLElement
     */
    addEmptyBlock()
    {
        log('addEmptyBlock()', 'Editor.');
        
        const block = new Block(BlockType.PARAGRAPH);
        const htmlBlock = Parser.html(block);
        
        // Generate unique block ID
        const blockId = 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        htmlBlock.setAttribute('data-block-id', blockId);
        htmlBlock.setAttribute('data-timestamp', Date.now().toString());
        
        const currentBlock = this.currentBlock;
    
        // Ensure currentBlock exists
        if ( !currentBlock ) {
            this.instance.appendChild(htmlBlock);
        } else {
            currentBlock.after(htmlBlock);
        }
    
        // Update currentBlock reference
        this.setCurrentBlock(htmlBlock);
    
        // Emit block creation event
        this.eventEmitter.emit(EVENTS.BLOCK_CREATED, {
            blockId: blockId,
            blockType: BlockType.PARAGRAPH,
            position: Array.from(this.instance.querySelectorAll('.block')).indexOf(htmlBlock),
            timestamp: Date.now()
        }, { source: 'editor.create' });
    
        // Ensure the block is attached before focusing
        // Use double requestAnimationFrame to ensure DOM is fully updated
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (htmlBlock.isConnected) {
                    this.focus(htmlBlock);
                }
            });
        });
        
        return htmlBlock;
    }

    /**
     * Updates toolbar button states based on the current block
     */
    updateToolbarButtonStates()
    {
        log('updateToolbarButtonStates()', 'Editor.');

        if (!this.currentBlock) {
            return;
        }

        const blockType = this.currentBlock.getAttribute('data-block-type');
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
        this.enableAllToolbarButtons();
        
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
    enableAllToolbarButtons()
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
    setCurrentBlock(block)
    {
        log('setCurrentBlock()', 'Editor.', { block });

        const previousBlock = this.currentBlock;
        
        if (this.currentBlock) {
            this.currentBlock.classList.remove('active-block');
        }
        
        this.currentBlock = block;
        this.currentBlock.classList.add('active-block');
        
        // Update toolbar button states based on current block
        this.updateToolbarButtonStates();
        
        // Emit block focus event
        this.eventEmitter.emit(EVENTS.BLOCK_FOCUSED, {
            blockId: block.getAttribute('data-block-id') || block.id,
            blockType: block.getAttribute('data-block-type'),
            previousBlockId: previousBlock ? (previousBlock.getAttribute('data-block-id') || previousBlock.id) : null,
            timestamp: Date.now()
        }, { throttle: 50, source: 'editor.focus' });
        
        // Update debug tooltip for the active block only
        if (this.debugMode) {
            this.updateActiveBlockTooltip();
        }
    }

    /**
     * Creates and initializes the markdown container
     * @returns {boolean} True if successful, false otherwise
     */
    initMarkdownContainer()
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
    initHtmlContainer()
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
    getMarkdown()
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
                return Editor.html2md(block.html || block.content || '');
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
    getHtml()
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
                return block.html || Editor.md2html(block.content || '');
            });

            return htmlBlocks.join('\n').trim();
        } catch (error) {
            logWarning('Error getting HTML content: ' + error.message, 'Editor.getHtml()');
            return '';
        }
    }

    /**
     * Check if a block should be converted to a different type based on its content
     * @param {HTMLElement} blockElement - The block element to check
     * @returns {boolean} - true if block was converted, false otherwise
     */
    checkAndConvertBlock(blockElement) {
        log('checkAndConvertBlock()', 'Editor.');
        
        if (!blockElement || !blockElement.hasAttribute('data-block-type')) {
            return false;
        }

        const currentBlockType = blockElement.getAttribute('data-block-type');
        const textContent = Utils.stripTags(blockElement.innerHTML).trim();
        
        // Don't convert if content is empty
        if (!textContent) {
            return false;
        }

        // Find matching block class for the current text content
        const matchingBlockClass = BlockFactory.findBlockClassForTrigger(textContent);
        
        if (!matchingBlockClass) {
            return false;
        }

        // Get the block type that should be created
        const targetBlockType = new matchingBlockClass().type;
        
        // Don't convert if it's already the correct type
        if (currentBlockType === targetBlockType) {
            return false;
        }

        // Don't convert non-paragraph blocks (to avoid conflicts)
        // Handle both 'p' (legacy/HTML) and 'paragraph' (current) formats
        if (currentBlockType !== 'p' && currentBlockType !== 'paragraph') {
            return false;
        }

        // Perform the conversion
        return this.convertBlockType(blockElement, targetBlockType, textContent);
    }

    /**
     * Convert a block from one type to another
     * @param {HTMLElement} blockElement - The block element to convert
     * @param {string} targetBlockType - The target block type
     * @param {string} triggerText - The text that triggered the conversion
     * @returns {boolean} - true if conversion was successful, false otherwise
     */
    convertBlockType(blockElement, targetBlockType, triggerText) {
        log('convertBlockType()', 'Editor.');
        
        try {
            // Create new block instance
            const newBlock = BlockFactory.createBlock(targetBlockType);
            
            if (!newBlock) {
                return false;
            }

            // Clear the trigger text from the block element
            // For list triggers like "- " or "* ", we want to remove the trigger and keep any additional content
            const triggers = newBlock.constructor.getMarkdownTriggers();
            let remainingContent = triggerText;
            
            // Find and remove the matching trigger
            for (const trigger of triggers) {
                if (triggerText.startsWith(trigger)) {
                    remainingContent = triggerText.substring(trigger.length);
                    break;
                }
            }

            // Clear the current block content
            blockElement.innerHTML = '';
            
            // Set the cursor position before applying transformation
            const wasFocused = blockElement === this.currentBlock;
            
            // Apply the transformation (this will call the appropriate Toolbar method)
            newBlock.applyTransformation();
            
            // If there was remaining content after the trigger, add it to the new block structure
            if (remainingContent.trim()) {
                // Find the appropriate element to add the content to
                const editableElement = this.findEditableElementInBlock(blockElement);
                if (editableElement) {
                    editableElement.textContent = remainingContent.trim();
                    
                    // Position cursor at the end of the content
                    if (wasFocused) {
                        requestAnimationFrame(() => {
                            editableElement.focus();
                            this.placeCursorAtEnd(editableElement);
                        });
                    }
                }
            } else {
                // No remaining content, just focus the appropriate element
                if (wasFocused) {
                    requestAnimationFrame(() => {
                        const editableElement = this.findEditableElementInBlock(blockElement);
                        if (editableElement) {
                            editableElement.focus();
                        }
                    });
                }
            }
            
            // Emit block conversion event
            this.eventEmitter.emit(EVENTS.BLOCK_CONVERTED, {
                blockId: blockElement.getAttribute('data-block-id') || blockElement.id,
                fromType: blockElement.getAttribute('data-block-type'),
                toType: targetBlockType,
                triggerText: triggerText,
                remainingContent: remainingContent,
                timestamp: Date.now()
            });
            
            return true;
            
        } catch (error) {
            logWarning('Error converting block type: ' + error.message, 'Editor.convertBlockType()');
            return false;
        }
    }

    /**
     * Find the editable element within a block (for lists, this might be an <li>, for others the block itself)
     * @param {HTMLElement} blockElement - The block element to search in
     * @returns {HTMLElement|null} - The editable element or null if not found
     */
    findEditableElementInBlock(blockElement) {
        // For list blocks, find the first list item
        const firstListItem = blockElement.querySelector('li');
        if (firstListItem) {
            return firstListItem;
        }
        
        // For other blocks, the block itself is editable
        if (blockElement.hasAttribute('contenteditable') || 
            blockElement.getAttribute('contenteditable') !== 'false') {
            return blockElement;
        }
        
        // Look for any contenteditable child
        const editableChild = blockElement.querySelector('[contenteditable="true"]');
        if (editableChild) {
            return editableChild;
        }
        
        return blockElement;
    }

    /**
     * Place cursor at the end of the given element
     * @param {HTMLElement} element - The element to place cursor in
     */
    placeCursorAtEnd(element) {
        if (!element) return;
        
        try {
            const selection = window.getSelection();
            const range = document.createRange();
            
            // If element has text content, place cursor at the end
            if (element.childNodes.length > 0) {
                const lastChild = element.childNodes[element.childNodes.length - 1];
                if (lastChild.nodeType === Node.TEXT_NODE) {
                    range.setStart(lastChild, lastChild.textContent.length);
                } else {
                    range.setStart(element, element.childNodes.length);
                }
            } else {
                range.setStart(element, 0);
            }
            
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (error) {
            // Silently fail for cursor positioning
        }
    }

    /**
     * Convert current block to target type or create new block if conversion is not possible
     * @param {string} targetBlockType - The target block type to convert to
     * @param {Object} options - Optional parameters for block creation
     * @returns {boolean} - true if conversion or creation was successful
     */
    convertCurrentBlockOrCreate(targetBlockType, options = {}) {
        log('convertCurrentBlockOrCreate()', 'Editor.');
        console.log('convertCurrentBlockOrCreate called with:', targetBlockType);
        
        const currentBlock = this.currentBlock;
        console.log('Current block:', currentBlock);
        
        if (!currentBlock) {
            // No current block, create a new one
            console.log('No current block, calling createNewBlock');
            return this.createNewBlock(targetBlockType, options);
        }

        const currentBlockType = currentBlock.getAttribute('data-block-type');
        console.log('Current block type:', currentBlockType);
        
        // If current block is a paragraph with content, convert it
        if (currentBlockType === BlockType.PARAGRAPH) {
            // Get current content
            const textContent = currentBlock.textContent || '';
            
            // For conversion, we simulate a trigger that matches the target type
            const triggerText = this.generateTriggerForBlockType(targetBlockType, textContent);
            
            // Use existing conversion logic
            return this.convertBlockType(currentBlock, targetBlockType, triggerText);
        }
        
        // For non-paragraph blocks or empty paragraphs, create a new block after current
        console.log('Creating new block after current');
        return this.createNewBlock(targetBlockType, options);
    }

    /**
     * Generate appropriate trigger text for a given block type
     * @param {string} blockType - The block type to generate trigger for
     * @param {string} existingContent - Existing content to preserve
     * @returns {string} - The trigger text with existing content
     */
    generateTriggerForBlockType(blockType, existingContent = '') {
        const blockClass = BlockFactory.getBlockClass(blockType);
        if (!blockClass || typeof blockClass.getMarkdownTriggers !== 'function') {
            return existingContent;
        }
        
        const triggers = blockClass.getMarkdownTriggers();
        if (triggers.length === 0) {
            return existingContent;
        }
        
        // Use the first trigger and append existing content
        return triggers[0] + existingContent;
    }

    /**
     * Create a new block of the specified type
     * @param {string} blockType - The type of block to create
     * @param {Object} options - Optional parameters for block creation
     * @returns {boolean} - true if creation was successful
     */
    createNewBlock(blockType, options = {}) {
        try {
            console.log('createNewBlock called with:', blockType);
            
            // Ensure there's a current block context
            if (!this.currentBlock) {
                console.log('No current block, ensuring default block');
                this.ensureDefaultBlock();
            }
            
            // Create the block object
            const newBlock = BlockFactory.createBlock(blockType);
            console.log('Created block object:', newBlock);
            if (!newBlock) {
                console.log('BlockFactory.createBlock returned null');
                return false;
            }
            
            // Convert block to HTML element
            const htmlBlock = Parser.html(newBlock);
            console.log('Converted to HTML block:', htmlBlock);
            if (!htmlBlock) {
                console.log('Parser.html returned null');
                return false;
            }
            
            // Generate unique block ID
            const blockId = 'block-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            htmlBlock.setAttribute('data-block-id', blockId);
            htmlBlock.setAttribute('data-timestamp', Date.now().toString());
            
            // Add the block to the DOM
            const currentBlock = this.currentBlock;
            if (!currentBlock) {
                console.log('Appending to instance');
                this.instance.appendChild(htmlBlock);
            } else {
                console.log('Adding after current block');
                currentBlock.after(htmlBlock);
            }
            
            // Update current block reference
            this.setCurrentBlock(htmlBlock);
            
            // For list blocks, focus on the first list item
            if (blockType === 'ul' || blockType === 'ol') {
                const listItem = htmlBlock.querySelector('li');
                if (listItem) {
                    listItem.focus();
                }
            }
            
            // Emit block creation event
            this.eventEmitter.emit(EVENTS.BLOCK_CREATED, {
                blockId: blockId,
                blockType: blockType,
                options: options,
                position: Array.from(this.instance.querySelectorAll('.block')).indexOf(htmlBlock),
                timestamp: Date.now()
            }, { source: 'editor.create' });
            
            console.log('Block creation successful');
            return true;
        } catch (error) {
            console.error('Error in createNewBlock:', error);
            logWarning('Error creating new block: ' + error.message, 'Editor.createNewBlock()');
            return false;
        }
    }
    
    // Static backward compatibility methods - these delegate to the first editor instance
    static getMarkdown() {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            return firstInstance.getMarkdown();
        }
        
        // Fallback for when no instances exist (for testing compatibility)
        try {
            if (!Editor._fallbackBlocks || Editor._fallbackBlocks.length === 0) {
                return '';
            }

            const markdownBlocks = Editor._fallbackBlocks.map(block => {
                if (typeof block.toMarkdown === 'function') {
                    return block.toMarkdown();
                }
                // Fallback for blocks that don't implement toMarkdown
                return Editor.html2md(block.html || block.content || '');
            });

            return markdownBlocks.join('\n\n').trim();
        } catch (error) {
            return '';
        }
    }
    
    static getHtml() {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            return firstInstance.getHtml();
        }
        
        // Fallback for when no instances exist (for testing compatibility)
        try {
            if (!Editor._fallbackBlocks || Editor._fallbackBlocks.length === 0) {
                return '';
            }

            const htmlBlocks = Editor._fallbackBlocks.map(block => {
                if (typeof block.toHtml === 'function') {
                    return block.toHtml();
                }
                // Fallback for blocks that don't implement toHtml
                return block.html || Editor.md2html(block.content || '');
            });

            return htmlBlocks.join('\n').trim();
        } catch (error) {
            return '';
        }
    }
    
    // Add convenience properties for backward compatibility with tests
    static get instance() {
        const firstInstance = Array.from(Editor._instances.keys())[0];
        return firstInstance || null;
    }
    
    static set instance(value) {
        // This is for test compatibility - in real use cases, instances are managed automatically
        if (value === null) {
            Editor._instances.clear();
        }
    }
    
    static get currentBlock() {
        const firstInstance = Array.from(Editor._instances.values())[0];
        return firstInstance ? firstInstance.currentBlock : null;
    }
    
    static set currentBlock(value) {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            firstInstance.currentBlock = value;
        }
    }
    
    // Static backward compatibility methods for KeyHandler and other components
    static addEmptyBlock() {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            return firstInstance.addEmptyBlock();
        }
    }
    
    static update() {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            firstInstance.update();
        }
    }
    
    static setCurrentBlock(block) {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            firstInstance.setCurrentBlock(block);
        }
    }
    
    static focus(element) {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            firstInstance.focus(element);
        }
    }
    
    static get keybuffer() {
        const firstInstance = Array.from(Editor._instances.values())[0];
        return firstInstance ? firstInstance.keybuffer : [];
    }
    
    static set keybuffer(value) {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            firstInstance.keybuffer = value;
        }
    }
    
    static checkAndConvertBlock(blockElement) {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            return firstInstance.checkAndConvertBlock(blockElement);
        }
        return false;
    }
    
    static convertCurrentBlockOrCreate(targetBlockType, options = {}) {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            return firstInstance.convertCurrentBlockOrCreate(targetBlockType, options);
        }
        return false;
    }
    
    static get blocks() {
        const firstInstance = Array.from(Editor._instances.values())[0];
        return firstInstance ? firstInstance.blocks : Editor._fallbackBlocks;
    }
    
    static set blocks(value) {
        const firstInstance = Array.from(Editor._instances.values())[0];
        if (firstInstance) {
            firstInstance.blocks = value;
        } else {
            Editor._fallbackBlocks = value;
        }
    }
}