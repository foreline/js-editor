'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {BlockType} from "@/BlockType";
import {Toolbar} from "@/Toolbar";
import {Editor} from "@/Editor";

/**
 * Image block for handling images with drag & drop and resizing
 */
export class ImageBlock extends BaseBlock
{
    constructor(content = '', html = '', nested = false) {
        super(BlockType.IMAGE, content, html, nested);
        this._src = '';
        this._alt = '';
        this._width = null;
        this._height = null;
        
        // Parse content if provided (should be image URL or markdown image syntax)
        if (content) {
            this.parseImageContent(content);
        }
    }

    /**
     * Parse image content from markdown format or URL
     * @param {string} content - Image content (URL or markdown syntax)
     */
    parseImageContent(content) {
        // Check if it's markdown image syntax: ![alt](src)
        const markdownMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (markdownMatch) {
            this._alt = markdownMatch[1];
            this._src = markdownMatch[2];
        } else if (content.startsWith('http') || content.startsWith('data:') || content.startsWith('./') || content.startsWith('../')) {
            // Treat as direct URL
            this._src = content;
            this._alt = 'Image';
        }
    }

    /**
     * Handle key press for image blocks
     * @param {KeyboardEvent} event
     * @param {string} text - current text content of the block
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleKeyPress(event, text) {
        // Images don't handle text input, but can handle navigation keys
        if (event.key === 'Delete' || event.key === 'Backspace') {
            // Allow deletion of image block
            return false; // Let default handler manage block deletion
        }
        
        return false;
    }

    /**
     * Handle Enter key press for image blocks
     * @param {KeyboardEvent} event
     * @returns {boolean} - true if key was handled, false otherwise
     */
    handleEnterKey(event) {
        // Create new paragraph block after image
        event.preventDefault();
        Editor.addEmptyBlock();
        return true;
    }

    /**
     * Set up drag and drop functionality for image upload
     * @param {HTMLElement} element - The image block element
     */
    setupDragAndDrop(element) {
        // Prevent default drag behaviors
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.add('drag-over');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('drag-over');

            const files = Array.from(e.dataTransfer.files);
            const imageFile = files.find(file => file.type.startsWith('image/'));

            if (imageFile) {
                this.handleImageFile(imageFile, element);
            }
        });

        // Handle file input selection
        element.addEventListener('imageSelected', (e) => {
            const file = e.detail;
            if (file && file.type.startsWith('image/')) {
                this.handleImageFile(file, element);
            }
        });

        // Handle click on placeholder to trigger file selection
        element.addEventListener('click', (e) => {
            const fileInput = element.querySelector('input[type="file"]');
            if (fileInput && e.target.closest('.image-placeholder')) {
                fileInput.click();
            }
        });
    }

    /**
     * Handle uploaded image file
     * @param {File} file - The image file
     * @param {HTMLElement} element - The image block element
     */
    handleImageFile(file, element) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this._src = e.target.result; // Base64 data URL
            this._alt = file.name;
            
            // Update the image element
            const img = element.querySelector('img');
            if (img) {
                img.src = this._src;
                img.alt = this._alt;
                this.setupImageResizing(img);
            }
            
            Editor.update();
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Set up image resizing functionality
     * @param {HTMLImageElement} img - The image element
     */
    setupImageResizing(img) {
        // Make image resizable by adding resize handles
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.cursor = 'nw-resize';
        
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        img.addEventListener('mousedown', (e) => {
            // Only resize if clicking near the bottom-right corner
            const rect = img.getBoundingClientRect();
            const threshold = 20; // 20px threshold from corner
            
            if (e.clientX > rect.right - threshold && e.clientY > rect.bottom - threshold) {
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt(getComputedStyle(img).width, 10);
                startHeight = parseInt(getComputedStyle(img).height, 10);
                
                e.preventDefault();
                
                document.addEventListener('mousemove', doResize);
                document.addEventListener('mouseup', stopResize);
            }
        });

        const doResize = (e) => {
            if (!isResizing) return;
            
            const newWidth = startWidth + e.clientX - startX;
            const aspectRatio = startHeight / startWidth;
            const newHeight = newWidth * aspectRatio;
            
            if (newWidth > 50) { // Minimum width
                img.style.width = newWidth + 'px';
                img.style.height = newHeight + 'px';
                
                this._width = newWidth;
                this._height = newHeight;
            }
        };

        const stopResize = () => {
            isResizing = false;
            document.removeEventListener('mousemove', doResize);
            document.removeEventListener('mouseup', stopResize);
            Editor.update();
        };
    }

    /**
     * Get markdown triggers for image creation
     * @returns {Array<string>} - Array of trigger strings
     */
    static getMarkdownTriggers() {
        return ['!['];
    }

    /**
     * Apply image transformation
     */
    applyTransformation() {
        const currentBlock = Editor.currentBlock;
        if (!currentBlock) return;
        
        // Prompt for image URL or show file picker
        const url = prompt('Enter image URL or drag & drop an image file:');
        if (url) {
            this._src = url;
            this._alt = 'Image';
        }
        
        currentBlock.setAttribute('data-block-type', 'image');
        currentBlock.innerHTML = this.generateImageHTML();
        
        // Set up drag and drop
        this.setupDragAndDrop(currentBlock);
        
        // Set up resizing for the image
        const img = currentBlock.querySelector('img');
        if (img) {
            img.onload = () => this.setupImageResizing(img);
        }
        
        Editor.setCurrentBlock(currentBlock);
        Editor.update();
    }

    /**
     * Generate HTML for image display
     * @returns {string} - HTML string for image
     */
    generateImageHTML() {
        if (!this._src) {
            return `
                <div class="image-placeholder" style="border: 2px dashed #ccc; padding: 40px; text-align: center; background: #f9f9f9;">
                    <div>📷</div>
                    <div>Drag & drop an image here or click to select</div>
                    <input type="file" accept="image/*" style="margin-top: 10px;" onchange="this.closest('.block').dispatchEvent(new CustomEvent('imageSelected', {detail: this.files[0]}))">
                </div>
            `;
        }
        
        const widthStyle = this._width ? `width: ${this._width}px;` : 'max-width: 100%;';
        const heightStyle = this._height ? `height: ${this._height}px;` : 'height: auto;';
        
        return `
            <div class="image-container" style="position: relative; display: inline-block;">
                <img src="${this._src}" alt="${this._alt}" style="${widthStyle} ${heightStyle} display: block; cursor: nw-resize;">
                <div class="resize-handle" style="position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; background: #007cba; cursor: nw-resize; opacity: 0.7;"></div>
            </div>
        `;
    }

    /**
     * Get toolbar configuration for images
     * @returns {Object} - toolbar button configuration
     */
    static getToolbarConfig() {
        return {
            class: 'editor-toolbar-image',
            icon: 'fa-image',
            title: 'Image',
            group: 'media'
        };
    }

    /**
     * Convert this image block to markdown
     * @returns {string} - markdown representation
     */
    toMarkdown() {
        if (!this._src) return '';
        return `![${this._alt}](${this._src})`;
    }

    /**
     * Convert this image block to HTML
     * @returns {string} - HTML representation
     */
    toHtml() {
        if (!this._src) return '';
        
        const widthAttr = this._width ? ` width="${this._width}"` : '';
        const heightAttr = this._height ? ` height="${this._height}"` : '';
        
        return `<img src="${this._src}" alt="${this._alt}"${widthAttr}${heightAttr}>`;
    }

    /**
     * Get disabled toolbar buttons for image blocks
     * @returns {Array<string>} - Array of disabled button classes
     */
    static getDisabledButtons() {
        return ['editor-toolbar-bold', 'editor-toolbar-italic', 'editor-toolbar-ul', 'editor-toolbar-ol', 'editor-toolbar-sq'];
    }

    /**
     * Set image source
     * @param {string} src - Image source URL
     */
    setSrc(src) {
        this._src = src;
    }

    /**
     * Set image alt text
     * @param {string} alt - Alt text
     */
    setAlt(alt) {
        this._alt = alt;
    }

    /**
     * Set image dimensions
     * @param {number} width - Image width
     * @param {number} height - Image height
     */
    setDimensions(width, height) {
        this._width = width;
        this._height = height;
    }

    /**
     * Get image source
     * @returns {string}
     */
    getSrc() {
        return this._src;
    }

    /**
     * Get image alt text
     * @returns {string}
     */
    getAlt() {
        return this._alt;
    }

    /**
     * Get image dimensions
     * @returns {Object} - {width, height}
     */
    getDimensions() {
        return {
            width: this._width,
            height: this._height
        };
    }
}
