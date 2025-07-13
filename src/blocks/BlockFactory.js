'use strict';

import {BaseBlock} from "@/blocks/BaseBlock";
import {ParagraphBlock} from "@/blocks/ParagraphBlock";
import {H1Block, H2Block, H3Block, H4Block, H5Block, H6Block} from "@/blocks/HeadingBlock";
import {UnorderedListBlock, OrderedListBlock, TaskListBlock} from "@/blocks/ListBlock";
import {CodeBlock, QuoteBlock, DelimiterBlock} from "@/blocks/SpecialBlock";
import {TableBlock} from "@/blocks/TableBlock";
import {ImageBlock} from "@/blocks/ImageBlock";
import {BlockType} from "@/BlockType";

/**
 * Factory class for creating block instances based on type
 */
export class BlockFactory
{
    /**
     * Create a block instance based on type
     * @param {string} type - Block type
     * @param {string} content - Block content
     * @param {string} html - Block HTML
     * @param {boolean} nested - Whether block is nested
     * @returns {BaseBlock} - Block instance
     */
    static createBlock(type = '', content = '', html = '', nested = false) {
        if (type === '' || type === BlockType.PARAGRAPH) {
            return new ParagraphBlock(content, html, nested);
        }

        switch (type) {
            case BlockType.H1:
                return new H1Block(content, html, nested);
            case BlockType.H2:
                return new H2Block(content, html, nested);
            case BlockType.H3:
                return new H3Block(content, html, nested);
            case BlockType.H4:
                return new H4Block(content, html, nested);
            case BlockType.H5:
                return new H5Block(content, html, nested);
            case BlockType.H6:
                return new H6Block(content, html, nested);
            case BlockType.UL:
                return new UnorderedListBlock(content, html, nested);
            case BlockType.OL:
                return new OrderedListBlock(content, html, nested);
            case BlockType.SQ:
                return new TaskListBlock(content, html, nested);
            case BlockType.CODE:
                return new CodeBlock(content, html, nested);
            case BlockType.QUOTE:
                return new QuoteBlock(content, html, nested);
            case BlockType.DELIMITER:
                return new DelimiterBlock(content, html, nested);
            case BlockType.TABLE:
                return new TableBlock(content, html, nested);
            case BlockType.IMAGE:
                return new ImageBlock(content, html, nested);
            default:
                return new ParagraphBlock(content, html, nested);
        }
    }

    /**
     * Get a block class for the given block type
     * @param {string} type - Block type
     * @returns {Function|null} - Block class or null if not found
     */
    static getBlockClass(type) {
        if (type === '' || type === BlockType.PARAGRAPH) {
            return ParagraphBlock;
        }

        switch (type) {
            case BlockType.H1:
                return H1Block;
            case BlockType.H2:
                return H2Block;
            case BlockType.H3:
                return H3Block;
            case BlockType.H4:
                return H4Block;
            case BlockType.H5:
                return H5Block;
            case BlockType.H6:
                return H6Block;
            case BlockType.UL:
                return UnorderedListBlock;
            case BlockType.OL:
                return OrderedListBlock;
            case BlockType.SQ:
                return TaskListBlock;
            case BlockType.CODE:
                return CodeBlock;
            case BlockType.QUOTE:
                return QuoteBlock;
            case BlockType.DELIMITER:
                return DelimiterBlock;
            case BlockType.TABLE:
                return TableBlock;
            case BlockType.IMAGE:
                return ImageBlock;
            default:
                return ParagraphBlock;
        }
    }

    /**
     * Get all registered block classes
     * @returns {Array} - Array of block classes
     */
    static getAllBlockClasses() {
        return [
            ParagraphBlock,
            H1Block,
            H2Block,
            H3Block,
            H4Block,
            H5Block,
            H6Block,
            UnorderedListBlock,
            OrderedListBlock,
            TaskListBlock,
            CodeBlock,
            QuoteBlock,
            DelimiterBlock,
            TableBlock,
            ImageBlock
        ];
    }

    /**
     * Find block class that matches markdown trigger
     * @param {string} text - Text to check against triggers
     * @returns {class|null} - Block class that matches or null
     */
    static findBlockClassForTrigger(text) {
        const blockClasses = this.getAllBlockClasses();
        
        for (const blockClass of blockClasses) {
            if (blockClass.matchesMarkdownTrigger && blockClass.matchesMarkdownTrigger(text)) {
                return blockClass;
            }
        }
        
        return null;
    }

    /**
     * Create block instance from markdown trigger
     * @param {string} text - Trigger text
     * @param {string} content - Block content
     * @param {string} html - Block HTML
     * @param {boolean} nested - Whether block is nested
     * @returns {BaseBlock|null} - Block instance or null if no match
     */
    static createBlockFromTrigger(text, content = '', html = '', nested = false) {
        const blockClass = this.findBlockClassForTrigger(text);
        
        if (blockClass) {
            return new blockClass(content, html, nested);
        }
        
        return null;
    }
}
