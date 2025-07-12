'use strict';

import {log} from "@/utils/log.js";
import {Block} from "@/Block.js";
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

        if (!htmlString || htmlString.trim() === '') return [];
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
            const nestedBlocks = Parser.parseHtml(innerHtml);

            // Create Block instance
            return new Block(
                fullMatch.match(/<(\w+)/)[1].toLowerCase(),
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
    static parse(markdownString)
    {
        log('parse()', 'Parser.'); console.log({markdownString});

        if (!markdownString || markdownString.trim() === '') return [];
        // Use showdown to convert markdown to HTML
        const converter = new showdown.Converter();
        const html = converter.makeHtml(markdownString);
        // Now parse the HTML into blocks
        return Parser.parseHtml(html);
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
                //element.innerHTML = '<h1>' + (block.html || block.content || '') + '</h1>';
                break;
            case BlockType.H2:
                element.classList.add('block-h2');
                //element.innerHTML = '<h2>' + (block.html || block.content || '') + '</h2>';
                break;
            case BlockType.H3:
                element.classList.add('block-h3');
                //element.innerHTML = '<h3>' + (block.html || block.content || '') + '</h3>';
                break;
            case BlockType.PARAGRAPH:
                element.classList.add('block-p');
                //element.innerHTML = '<p>' + (block.html || block.content || '') + '</p>';
                break;
            case BlockType.QUOTE:
                element.classList.add('block-quote');
                //element.innerHTML = '<blockquote>' + (block.html || block.content || '') + '</blockquote>';
                break;
            default:
                element.classList.add('block-p');
                //element.innerHTML = '<p>' + (block.html || block.content || '') + '</p>';
        }

        element.innerHTML = block.html || block.content || '';

        return element;
    }
}