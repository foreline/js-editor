'use strict';

import {BlockType} from "@/BlockType";

/**
 * Editor block
 */
export class Block
{
    _type = BlockType.PARAGRAPH;
    _content = '';
    _html = '';
    _nested = false;
    
    /**
     * @param {string} type
     * @param {string} content
     * @param {string} html
     * @param {boolean} nested
     */
    constructor(type = '', content = '', html = '', nested = false) {
        if ( 0 === type.length ) {
            type = BlockType.PARAGRAPH;
        }
        type = BlockType.getBlockTypeFromHtmlTag(type);
        this._type = type;
        this._content = content;
        this._html = html;
        this._nested = nested;
    }

    get type() {
        return this._type;
    }
    
    set type(value) {
        this._type = value;
    }
    
    get content() {
        return this._content;
    }
    
    set content(value) {
        this._content = value;
    }
    
    get html() {
        return this._html;
    }
    
    set html(value) {
        this._html = value;
    }
    
    get nested() {
        return this._nested;
    }
    
    set nested(value) {
        this._nested = value;
    }
}