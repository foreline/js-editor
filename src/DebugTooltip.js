/**
 * DebugTooltip.js
 * 
 * Handles all debug tooltip functionality for the Editor.
 * This class is responsible for creating, updating, positioning, and managing debug tooltips
 * that display block information when debug mode is enabled.
 */

import { log } from './utils/log.js';
import { Editor } from './Editor.js';

export class DebugTooltip {
    /**
     * Constructor for DebugTooltip
     * @param {Object} options - Configuration options
     * @param {HTMLElement} options.editorInstance - The editor DOM element
     * @param {Object} options.eventEmitter - Event emitter for debug events
     */
    constructor(options = {}) {
        this.editorInstance = options.editorInstance;
        this.eventEmitter = options.eventEmitter;
        this.enabled = false;
        
        // Event listeners references for cleanup
        this.scrollHandler = null;
        this.resizeHandler = null;
        this.updateInterval = null;
        
        log('DebugTooltip initialized', 'DebugTooltip');
    }
    
    /**
     * Enable debug tooltips
     * @param {Editor} editor - The editor instance for accessing current block and blocks array
     */
    enable(editor) {
        if (this.enabled) return;
        
        this.enabled = true;
        this.editor = editor;
        
        this.createTooltips();
        this.startUpdateLoop();
        this.addEventListeners();
        
        // Add debug mode class to editor instance
        this.editorInstance.classList.add('debug-mode');
        
        log('Debug tooltips enabled', 'DebugTooltip');
    }
    
    /**
     * Disable debug tooltips
     */
    disable() {
        if (!this.enabled) return;
        
        this.enabled = false;
        
        this.removeTooltips();
        this.stopUpdateLoop();
        this.removeEventListeners();
        
        // Remove debug mode class from editor instance
        this.editorInstance.classList.remove('debug-mode');
        
        log('Debug tooltips disabled', 'DebugTooltip');
    }
    
    /**
     * Toggle debug tooltips on/off
     * @param {Editor} editor - The editor instance
     */
    toggle(editor) {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable(editor);
        }
    }
    
    /**
     * Add event listeners for tooltip positioning
     */
    addEventListeners() {
        // Update tooltip positions on scroll and resize
        this.scrollHandler = () => {
            if (this.enabled) {
                this.updateTooltipPositions();
            }
        };
        
        this.resizeHandler = () => {
            if (this.enabled) {
                this.updateTooltipPositions();
            }
        };
        
        window.addEventListener('scroll', this.scrollHandler);
        window.addEventListener('resize', this.resizeHandler);
    }
    
    /**
     * Remove event listeners
     */
    removeEventListeners() {
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
            this.scrollHandler = null;
        }
        
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
    }
    
    /**
     * Update tooltip positions only (without content)
     */
    updateTooltipPositions() {
        if (!this.enabled || !this.editor || !this.editor.currentBlock) return;
        
        // Only update position for the active block's tooltip
        const blocks = this.editorInstance.querySelectorAll('.block');
        const currentIndex = Array.from(blocks).indexOf(this.editor.currentBlock);
        
        if (currentIndex !== -1) {
            const tooltip = document.querySelector(`.debug-tooltip[data-block-index="${currentIndex}"]`);
            if (tooltip) {
                this.positionTooltip(tooltip, this.editor.currentBlock);
            }
        }
    }
    
    /**
     * Create debug tooltips for all blocks
     */
    createTooltips() {
        log('createTooltips()', 'DebugTooltip');

        // Only create tooltip for the active block
        this.updateActiveBlockTooltip();
    }
    
    /**
     * Create debug tooltip for a specific block
     * @param {HTMLElement} blockElement - The block element
     * @param {number} index - The block index
     */
    createTooltip(blockElement, index) {
        log('createTooltip()', 'DebugTooltip');

        // Remove existing tooltip if present
        const existingTooltip = document.querySelector(`.debug-tooltip[data-block-index="${index}"]`);
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        const tooltip = document.createElement('div');
        tooltip.className = 'debug-tooltip';
        tooltip.setAttribute('data-block-index', index);
        
        // Position tooltip to the right of the block using fixed positioning
        this.updateTooltipContent(tooltip, blockElement, index);
        this.positionTooltip(tooltip, blockElement);
        
        // Add to document body for fixed positioning
        document.body.appendChild(tooltip);
    }
    
    /**
     * Position debug tooltip relative to block
     * @param {HTMLElement} tooltip - The tooltip element
     * @param {HTMLElement} blockElement - The block element
     */
    positionTooltip(tooltip, blockElement) {
        log('positionTooltip()', 'DebugTooltip');

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
     * @param {HTMLElement} tooltip - The tooltip element
     * @param {HTMLElement} blockElement - The block element
     * @param {number} index - The block index
     */
    updateTooltipContent(tooltip, blockElement, index) {
        log('updateTooltipContent()', 'DebugTooltip');

        const block = this.editor ? this.editor.blocks[index] : null;
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
    removeTooltips() {
        log('removeTooltips()', 'DebugTooltip');

        const tooltips = document.querySelectorAll('.debug-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }
    
    /**
     * Start debug update loop
     */
    startUpdateLoop() {
        log('startUpdateLoop()', 'DebugTooltip');

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            this.updateActiveBlockTooltip();
        }, 1000); // Update every second
    }
    
    /**
     * Stop debug update loop
     */
    stopUpdateLoop() {
        log('stopUpdateLoop()', 'DebugTooltip');

        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    /**
     * Update all debug tooltips
     */
    updateTooltips() {
        log('updateTooltips()', 'DebugTooltip');

        if (!this.enabled) return;
        
        // Only show tooltip for the active block
        this.updateActiveBlockTooltip();
    }
    
    /**
     * Update tooltip for the currently active block only
     */
    updateActiveBlockTooltip() {
        log('updateActiveBlockTooltip()', 'DebugTooltip');

        if (!this.enabled || !this.editor || !this.editor.currentBlock) {
            return;
        }
        
        // Remove all existing tooltips first
        this.removeTooltips();
        
        // Find the index of the current block
        const blocks = this.editorInstance.querySelectorAll('.block');
        const currentIndex = Array.from(blocks).indexOf(this.editor.currentBlock);
        
        if (currentIndex !== -1) {
            this.createTooltip(this.editor.currentBlock, currentIndex);
        }
    }
    
    /**
     * Check if debug tooltips are enabled
     * @returns {boolean} True if enabled, false otherwise
     */
    isEnabled() {
        return this.enabled;
    }
}
