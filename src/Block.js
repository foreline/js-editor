'use strict';

import {BlockType} from "@/BlockType";

/**
 *
 */
export class Block
{
    _type = 'div';
    _content = '';
    _html = '';
    _nested = false;
    
    /**
     * @param {string} type
     */
    constructor(type= '') {
        if ( 0 === type.length ) {
            type = BlockType.PARAGRAPH
        }
        this._type = type;
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