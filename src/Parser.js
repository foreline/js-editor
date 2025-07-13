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
            return html.replace(/<[^>]+>/g, '').trim();        }        // First pass: Get top-level blocks including task list items
        const blockRegex = /<(h[1-6]|div|del|p|ol|ul|blockquote|pre|code|li)[^>]*>([\s\S]*?)<\/\1>/gi;
        const matches = [...htmlString.matchAll(blockRegex)];
        
        return matches.map(match => {
            const fullMatch = match[0];
            const innerHtml = match[2];
            const tagName = fullMatch.match(/<(\w+)/)[1].toLowerCase();

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
            tasklists: true  // Enable task list support
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
            default:
                element.classList.add('block-p');
        }

        element.innerHTML = block.html || block.content || '';

        return element;
    }
}