'use strict';

import { Event } from '../src/Event.js';

describe('Event', () => {
    describe('constructor', () => {
        it('should create an Event instance', () => {
            const event = new Event();
            
            expect(event).toBeInstanceOf(Event);
        });

        it('should be a class that can be instantiated', () => {
            expect(typeof Event).toBe('function');
            expect(Event.prototype.constructor).toBe(Event);
        });
    });

    describe('class definition', () => {
        it('should have Event as constructor name', () => {
            expect(Event.name).toBe('Event');
        });

        it('should be an empty class currently', () => {
            const event = new Event();
            const props = Object.getOwnPropertyNames(event);
            const methods = Object.getOwnPropertyNames(Event.prototype).filter(name => name !== 'constructor');
            
            expect(props.length).toBe(0);
            expect(methods.length).toBe(0);
        });
    });
});
