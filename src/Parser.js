'use strict';

import {log} from "@/utils/log.js";
import {Block} from "@/Block.js";
import {BlockType} from "@/BlockType";

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
        log('parse()', 'Parser.'); console.log({htmlString});
    
        // Helper function to extract text content
        function getTextContent(html) {
            return html.replace(/<[^>]+>/g, '').trim();
        }
    
        // First pass: Get top-level blocks
        const blockRegex = /<(h[1-6]|div|p)[^>]*>([\s\S]*?)<\/\1>/gi;
        
        const matches = [...htmlString.matchAll(blockRegex)];
    
        return matches.map(match => {
            const fullMatch = match[0];
            const innerHtml = match[2];
        
            // Check for nested blocks
            const nestedBlocks = this.parse(innerHtml);
        
            return {
                type: fullMatch.match(/<(\w+)/)[1].toLowerCase(),
                content: getTextContent(fullMatch),
                html: fullMatch,
                nested: nestedBlocks.length > 0 ? nestedBlocks : null
            };
        });
    }

    /**
     * Parse the markdown string and return array of Block objects.
     * @param {string} markdownString
     * @return {array<Block>} blocks
     */
    static parse(markdownString)
    {
        log('parse()', 'Parser.'); console.log({markdownString});
        
        // Split by new lines and filter out empty lines
        const lines = markdownString.split('\n').filter(line => line.trim() !== '');
        
        return lines.map(line => {
            let type = BlockType.PARAGRAPH;
            let content = line.trim();
            
            // Check for heading syntax
            if (line.startsWith('# ')) {
                type = BlockType.H1;
                content = content.slice(2).trim();
            }
            
            return new Block(type, content);
        });
    }
    
    /**
     * Turns Block object into html code.
     * @param {Block} block
     * @return {HTMLElement} htmlElement
     */
    static html(block)
    {
        log('html()', 'Parser.'); console.log({block});
        
        let element = document.createElement('div');
        
        //element.tabIndex = -1;
        element.classList.add('block');
        
        element.setAttribute('data-placeholder', 'Type "/" to insert block');
        
        switch ( block.type ) {
            case BlockType.H1:
                element.classList.add('block-h1');
                break;
            default:
                element.classList.add('block-p');
        }
    
        element.innerHTML = block.html;
        
        return element;
    }
}