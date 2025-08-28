'use strict';

import {log} from "@/utils/log.js";

/**
 *
 */
export class Utils
{
    /**
     *
     * @param {string} str
     * @returns {string}
     */
    static stripTagsAttributes(str)
    {
        log('stripTagsAttributes()', 'Editor.');
        
        const pattern = new RegExp('<([a-zA-Z0-9]+)[^>]*>', 'mu');
        return str.replace(pattern, '<$1>');
    }
    
    /**
     *
     * @param {string} str
     * @param {string} allow Allowed tags in lowercase, i.e. "<b><em><i>"
     * @returns {string}
     */
    static stripTags(str, allow= '')
    {
        log('stripTags()', 'Editor.');
        
        // Making sure the "allow" argument is a string containing only tags in lowercase ()
        allow = (((allow || "") + "")
            .toLowerCase()
            .match(/<[a-z][a-z0-9]*>/g) || [])
            .join('');
        
        const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        let commentsAndPhpTags = /|<\?(?:php)?[\s\S]*?\?>/gi;
        
        return str.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
            return allow.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
    }
    
    /**
     *
     * @param {string} str
     * @returns {string}
     * @fixme rename method
     */
    static normalize(str)
    {
        log('normalize()', 'Editor.');
        
        // double spaces
        while ( str.match(/\s\s/gm) ) {
            str = str.replace(/\s\s/gm, ' ');
        }
        
        // space at start of the line
        // @fixme not working
        while ( str.match(/\n\s/gm) ) {
            str = str.replace(/\n\s/gm, '');
        }
        
        // @fixme not working
        while ( str.match(/\r\s/gm) ) {
            str = str.replace(/\r\s/gm, '');
        }
        
        // replace <div> with <p>
        while ( str.match(/<div>/gm) ) {
            str = str.replace(/<div>/gm, '<p>');
        }
        
        while ( str.match(/<\/div>/gm) ) {
            str = str.replace(/<\/div>/gm, '</p>');
        }
        
        // replace minus width dash
        str = str.replace(/\s-\s/gm, ' &mdash; ');
        
        // insert line break
        str = str.replace(/<\/p><p>/gm, '</p>\n<p>');
        
        return str;
    }
    
    /**
     *
     * @param str
     * @returns {*}
     */
    static escapeHTML = str => str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
    
    
}