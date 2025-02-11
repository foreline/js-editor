'use strict';

/**
 * Осуществляет подписку и генерацию событий
 *
 * @example Подписка на событие
 * eventEmitter.subscribe('EVENT_CODE', function(...eventObjects){ console.log('event occurred'); });
 *
 * @example Генерация события
 * eventEmitter.emit('EVENT_CODE', eventObject);
 *
 * @type {{subscribe: (function(*, *): {unsubscribe: function(): *}), constructor(*): void, emit: eventEmitter.emit, events: *[]}}
 */
export const eventEmitter = {
    
    events: [],
    debug: true,
    
    /**
     *
     * @param events
     * @param debug
     */
    constructor(events, debug = true) {
        //this.events = events || {};
        this.events = events || [];
        this.debug = debug;
    },
    
    /**
     * Подписка на событие
     * @param {string|array<string>} eventCode Код или коды события
     * @param {callback} callback Функция
     * @returns {{unsubscribe: (function())}}
     */
    subscribe: function(eventCode, callback)
    {
        const codes = Array.isArray(eventCode) ? eventCode : [eventCode];
        
        codes.forEach(code => {
            if ( !this.events[code] ) {
                this.events[code] = [];
            }
            this.events[code].push(callback);
            
            //(this.events[eventCode] || (this.events[eventCode] = [])).push(callback);
        });
        
        return {
            unsubscribe: () => {
                this.events[eventCode] && this.events[eventCode].splice(this.events[eventCode].indexOf(callback) >>> 0, 1);
            }
        };
    },
    
    /**
     * Генерирует событие
     * @param {string} eventCode
     * @param {mixed} args
     */
    emit: function(eventCode, ...args)
    {
        if ( this.debug ) {
            console.log('%c Event emitted: ' + eventCode, 'background-color: #000; color: #fff; padding: 4px;');
            console.log(args);
        }
        (this.events[eventCode] || []).forEach(fn => {
            try {
                fn(...args);
            } catch (error) {
                console.error(`Error in event ${eventCode}:`, error);
            }
        });
    },
    
    /**
     *
     */
    cleanup: function() {
        Object.keys(this.events).forEach(key => {
            this.events[key] = this.events[key].filter(callback => {
                try {
                    return typeof callback === 'function';
                } catch (error) {
                    return false;
                }
            });
        });
    }
};