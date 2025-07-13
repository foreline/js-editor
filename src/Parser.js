'use strict';

import {log} from "@/utils/log.js";
import {Block} from "@/Block.js";
import {BlockFactory} from "@/blocks/BlockFactory.js";
import {BlockType} from "@/BlockType";
import showdown from "showdown";

/**
 *
 */
export class Parser
{
    /**
     * Parse the html string and return array of Block objects.
     * @param {string} htmlString
     * @returns {array<Block>} blocks
     */
    static parseHtml(htmlString)
    {
        log('parseHtml()', 'Parser.'); console.log({htmlString});

        if (!htmlString || htmlString.trim() === '') return [];        // Helper function to extract text content
        function getTextContent(html) {
            // For lists, preserve line breaks between list items
            if (html.includes('<li>')) {
                const listItems = html.match(/<li>(.*?)<\/li>/g);
                if (listItems) {
                    return listItems
                        .map(item => item.replace(/<li>(.*?)<\/li>/, '$1'))
                        .join('\n');
                }
            }
            // For pre/code blocks, extract the inner code content
            if (html.includes('<pre>') || html.includes('<code>')) {
                // Handle <pre><code>content</code></pre> pattern
                const preCodeMatch = html.match(/<pre><code[^>]*>(.*?)<\/code><\/pre>/s);
                if (preCodeMatch) {
                    return preCodeMatch[1].trim();
                }
                // Handle standalone <code>content</code> pattern
                const codeMatch = html.match(/<code[^>]*>(.*?)<\/code>/s);
                if (codeMatch) {
                    return codeMatch[1].trim();
                }
            }
            return html.replace(/<[^>]+>/g, '').trim();        }        // First pass: Get top-level blocks including task list items, tables, and images
        const blockRegex = /<(h[1-6]|div|del|p|ol|ul|blockquote|pre|code|li|table|img)[^>]*>([\s\S]*?)<\/\1>|<(img)[^>]*\/?>/gi;
        const matches = [...htmlString.matchAll(blockRegex)];
        
        return matches.map(match => {
            const fullMatch = match[0];
            const innerHtml = match[2];
            const tagName = (fullMatch.match(/<(\w+)/)[1] || '').toLowerCase();

            // Special handling for self-closing img tags
            if (tagName === 'img') {
                const srcMatch = fullMatch.match(/src="([^"]+)"/);
                const altMatch = fullMatch.match(/alt="([^"]*)"/);
                
                const src = srcMatch ? srcMatch[1] : '';
                const alt = altMatch ? altMatch[1] : 'Image';
                const imageContent = `![${alt}](${src})`;
                
                return new Block(
                    BlockType.IMAGE,
                    imageContent,
                    fullMatch,
                    null
                );
            }

            // Special handling for task list items
            if (tagName === 'li' && fullMatch.includes('data-block-type="sq"')) {
                // Extract checkbox state and text content
                const checkboxMatch = fullMatch.match(/<input type="checkbox"([^>]*)?>/);
                const isChecked = checkboxMatch && checkboxMatch[1] && checkboxMatch[1].includes('checked');
                const textContent = getTextContent(fullMatch);
                
                return new Block(
                    BlockType.SQ,
                    textContent,
                    fullMatch,
                    null,
                    isChecked  // Pass checkbox state
                );
            }

            // Special handling for tables
            if (tagName === 'table') {
                // Extract table content and convert to markdown format
                const textContent = this.extractTableContent(fullMatch);
                
                return new Block(
                    BlockType.TABLE,
                    textContent,
                    fullMatch,
                    null
                );
            }

            // Check for nested blocks
            const nestedBlocks = Parser.parseHtml(innerHtml);

            // Create Block instance
            return new Block(
                tagName,
                getTextContent(fullMatch),
                fullMatch,
                nestedBlocks.length > 0 ? nestedBlocks : null
            );
        });
    }

    /**
     * Extract table content from HTML table and convert to markdown format
     * @param {string} tableHtml - HTML table string
     * @returns {string} - Table content in markdown format
     */
    static extractTableContent(tableHtml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(tableHtml, 'text/html');
        const table = doc.querySelector('table');
        
        if (!table) return '';
        
        let content = '';
        const headers = [];
        const rows = [];
        
        // Extract headers
        const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
        if (headerRow) {
            const headerCells = headerRow.querySelectorAll('th, td');
            headerCells.forEach(cell => {
                headers.push(cell.textContent.trim());
            });
        }
        
        // Extract data rows
        const dataRows = table.querySelectorAll('tbody tr') || table.querySelectorAll('tr:not(:first-child)');
        dataRows.forEach(row => {
            const cells = row.querySelectorAll('td, th');
            const rowData = [];
            cells.forEach(cell => {
                rowData.push(cell.textContent.trim());
            });
            if (rowData.length > 0) {
                rows.push(rowData);
            }
        });
        
        // Build markdown table
        if (headers.length > 0) {
            content += '| ' + headers.join(' | ') + ' |\n';
            content += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
            
            rows.forEach(row => {
                content += '| ' + row.join(' | ') + ' |\n';
            });
        }
        
        return content;
    }

    /**
     * Parse the markdown string and return array of Block objects.
     * @param {string} markdownString
     * @return {array<Block>} blocks
     */
    static parse(markdownString) {
        log('parse()', 'Parser.'); console.log({markdownString});

        if (!markdownString || markdownString.trim() === '') {
            return [];
        }

        // Pre-process markdown to handle task lists
        let processedMarkdown = markdownString;
        
        // Convert task list syntax to custom HTML first
        processedMarkdown = processedMarkdown.replace(/^- \[([x ])\] (.+)$/gm, (match, checked, text) => {
            const isChecked = checked === 'x';
            return `<task-item data-checked="${isChecked}">${text}</task-item>`;
        });

        // Use showdown to convert markdown to HTML
        const converter = new showdown.Converter({ 
            ghCompatibleHeaderId: false, 
            headerIds: false,
            tasklists: true,  // Enable task list support
            tables: true      // Enable table support
        });
        const html = converter.makeHtml(processedMarkdown);
        
        // Fix: Ensure strikethrough and blockquote formatting are properly parsed
        const htmlClean = html
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            // Fix blockquote formatting - remove inner <p> tags for simple quotes
            .replace(/<blockquote>\s*<p>(.*?)<\/p>\s*<\/blockquote>/gs, '<blockquote>$1</blockquote>')
            // Extract inline code from paragraphs and make them standalone code blocks
            .replace(/<p><code>(.*?)<\/code><\/p>/g, '<code>$1</code>')
            // Convert custom task-item tags to proper structure
            .replace(/<task-item data-checked="(true|false)">(.*?)<\/task-item>/g, (match, checked, text) => {
                const checkedAttr = checked === 'true' ? ' checked' : '';
                return `<li class="task-list-item" data-block-type="sq"><input type="checkbox"${checkedAttr}> ${text}</li>`;
            })
            // Ensure blocks are properly separated with line breaks to help parsing
            .replace(/(<\/(?:h[1-6]|div|del|p|ol|ul|blockquote|pre|code)>)(<(?:h[1-6]|div|del|p|ol|ul|blockquote|pre|code))/g, '$1\n$2');
        
        // Remove id attributes from heading tags
        const htmlFinal = htmlClean.replace(/<h[1-6]\s+id="[^"]+"/g, match => match.replace(/\s+id="[^"]+"/, ''));
        
        // Now parse the HTML into blocks
        return Parser.parseHtml(htmlFinal);
    }

    /**
     * Turns Block object into html code.
     * @param {Block} block
     * @return {HTMLElement} htmlElement
     */
    static html(block) {
        log('html()', 'Parser.'); console.log({block});

        let element = document.createElement('div');

        element.classList.add('block');
        
        // Add block type as data attribute for key handling
        element.setAttribute('data-block-type', block.type);
        element.setAttribute('data-placeholder', 'Type "/" to insert block');

        // For task list items, create li element instead of div
        if (block.type === BlockType.SQ) {
            element = document.createElement('li');
            element.classList.add('block');
            element.setAttribute('data-block-type', 'sq');
            element.setAttribute('data-placeholder', 'Task item');
            element.contentEditable = true;
            
            // Create checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '8px';
            
            // Set checked state if block instance has the information
            if (block._blockInstance && block._blockInstance.isChecked) {
                checkbox.checked = block._blockInstance.isChecked();
            }
            
            // Add change event listener
            checkbox.addEventListener('change', (e) => {
                if (block._blockInstance && block._blockInstance.toggleCheckbox) {
                    block._blockInstance.toggleCheckbox(element);
                }
            });
            
            element.appendChild(checkbox);
            element.appendChild(document.createTextNode(' ' + (block.content || '')));
            
            return element;
        }

        // For table blocks, create div with table content
        if (block.type === BlockType.TABLE) {
            element.classList.add('block-table');
            element.setAttribute('data-block-type', 'table');
            element.setAttribute('data-placeholder', 'Table');
            element.contentEditable = false; // Tables manage their own editing
            
            // Use the HTML from the block or generate from content
            if (block.html && block.html.includes('<table')) {
                element.innerHTML = block.html;
            } else if (block._blockInstance && block._blockInstance.generateTableHTML) {
                element.innerHTML = block._blockInstance.generateTableHTML();
            } else {
                // Fallback: create basic table
                element.innerHTML = '<table style="border-collapse: collapse; width: 100%;"><tr><td style="border: 1px solid #ddd; padding: 8px;">Cell</td></tr></table>';
            }
            
            return element;
        }

        // For image blocks, create div with image content and drag-drop functionality
        if (block.type === BlockType.IMAGE) {
            element.classList.add('block-image');
            element.setAttribute('data-block-type', 'image');
            element.setAttribute('data-placeholder', 'Image');
            element.contentEditable = false; // Images manage their own interaction
            
            // Use the HTML from the block or generate from content
            if (block._blockInstance && block._blockInstance.generateImageHTML) {
                element.innerHTML = block._blockInstance.generateImageHTML();
                
                // Set up drag and drop and resizing
                block._blockInstance.setupDragAndDrop(element);
                
                const img = element.querySelector('img');
                if (img) {
                    img.onload = () => block._blockInstance.setupImageResizing(img);
                }
            } else {
                // Fallback: create basic image placeholder
                element.innerHTML = '<div class="image-placeholder">No image</div>';
            }
            
            return element;
        }

        switch (block.type) {
            case BlockType.H1:
                element.classList.add('block-h1');
                break;
            case BlockType.H2:
                element.classList.add('block-h2');
                break;
            case BlockType.H3:
                element.classList.add('block-h3');
                break;
            case BlockType.PARAGRAPH:
                element.classList.add('block-p');
                break;
            case BlockType.QUOTE:
                element.classList.add('block-quote');
                break;
            case BlockType.TABLE:
                element.classList.add('block-table');
                break;
            default:
                element.classList.add('block-p');
        }

        element.innerHTML = block.html || block.content || '';

        return element;
    }
}