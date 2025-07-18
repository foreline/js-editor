import { eventEmitter, EditorEventEmitter, EVENTS } from '@/utils/eventEmitter.js';

describe('EditorEventEmitter', () => {
  let emitter;

  beforeEach(() => {
    emitter = new EditorEventEmitter({ debug: false });
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    emitter.cleanup();
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('subscribe and emit', () => {
    test('should register an event handler and call it when event is emitted', () => {
      const handler = jest.fn();
      
      emitter.subscribe('test.event', handler);
      emitter.emit('test.event', { data: 'testData' });
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        type: 'test.event',
        data: { data: 'testData' },
        timestamp: expect.any(Number),
        source: 'editor'
      }));
    });

    test('should support multiple subscribers to the same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      emitter.subscribe('test.event', handler1);
      emitter.subscribe('test.event', handler2);
      
      emitter.emit('test.event', { data: 'testData' });
      
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    test('should only call handlers for the emitted event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      emitter.subscribe('event1', handler1);
      emitter.subscribe('event2', handler2);
      
      emitter.emit('event1', { data: 'testData' });
      
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
    });

    test('should support priority-based execution order', () => {
      const executionOrder = [];
      const handler1 = jest.fn(() => executionOrder.push('handler1'));
      const handler2 = jest.fn(() => executionOrder.push('handler2'));
      const handler3 = jest.fn(() => executionOrder.push('handler3'));
      
      emitter.subscribe('test.event', handler1, { priority: 1 });
      emitter.subscribe('test.event', handler2, { priority: 3 });
      emitter.subscribe('test.event', handler3, { priority: 2 });
      
      emitter.emit('test.event', { data: 'testData' });
      
      expect(executionOrder).toEqual(['handler2', 'handler3', 'handler1']);
    });

    test('should support once option', () => {
      const handler = jest.fn();
      
      emitter.subscribe('test.event', handler, { once: true });
      
      emitter.emit('test.event', { data: 'test1' });
      emitter.emit('test.event', { data: 'test2' });
      
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('debouncing', () => {
    test('should debounce events', (done) => {
      const handler = jest.fn();
      
      emitter.subscribe('test.event', handler);
      
      emitter.emit('test.event', { data: 'test1' }, { debounce: 50 });
      emitter.emit('test.event', { data: 'test2' }, { debounce: 50 });
      emitter.emit('test.event', { data: 'test3' }, { debounce: 50 });
      
      setTimeout(() => {
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
          data: { data: 'test3' }
        }));
        done();
      }, 100);
    });
  });

  describe('throttling', () => {
    test('should throttle events', (done) => {
      const handler = jest.fn();
      
      emitter.subscribe('test.event', handler);
      
      emitter.emit('test.event', { data: 'test1' }, { throttle: 50 });
      emitter.emit('test.event', { data: 'test2' }, { throttle: 50 });
      emitter.emit('test.event', { data: 'test3' }, { throttle: 50 });
      
      setTimeout(() => {
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
          data: { data: 'test1' }
        }));
        done();
      }, 100);
    });
  });

  describe('unsubscribe', () => {
    test('should remove event handler when unsubscribe is called', () => {
      const handler = jest.fn();
      
      const subscription = emitter.subscribe('test.event', handler);
      subscription.unsubscribe();
      
      emitter.emit('test.event', { data: 'testData' });
      
      expect(handler).not.toHaveBeenCalled();
    });

    test('should only remove the specific handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const subscription = emitter.subscribe('test.event', handler1);
      emitter.subscribe('test.event', handler2);
      
      subscription.unsubscribe();
      
      emitter.emit('test.event', { data: 'testData' });
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    test('should clear all timers and invalid listeners', () => {
      const handler = jest.fn();
      
      emitter.subscribe('test.event', handler);
      emitter.emit('test.event', { data: 'test' }, { debounce: 100 });
      
      expect(emitter.debouncedEvents.size).toBe(1);
      
      emitter.cleanup();
      
      expect(emitter.debouncedEvents.size).toBe(0);
    });
  });

  describe('utility methods', () => {
    test('should return correct listener count', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      expect(emitter.getListenerCount('test.event')).toBe(0);
      
      emitter.subscribe('test.event', handler1);
      expect(emitter.getListenerCount('test.event')).toBe(1);
      
      emitter.subscribe('test.event', handler2);
      expect(emitter.getListenerCount('test.event')).toBe(2);
    });

    test('should return all event types', () => {
      emitter.subscribe('event1', jest.fn());
      emitter.subscribe('event2', jest.fn());
      
      const eventTypes = emitter.getEventTypes();
      expect(eventTypes).toContain('event1');
      expect(eventTypes).toContain('event2');
    });
  });
});

describe('Global eventEmitter instance', () => {
  beforeEach(() => {
    eventEmitter.removeAllListeners();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    eventEmitter.removeAllListeners();
    console.log.mockRestore();
  });

  test('should work with legacy API', () => {
    const handler = jest.fn();
    
    eventEmitter.subscribe('TEST_EVENT', handler);
    eventEmitter.emit('TEST_EVENT', { data: 'testData' });
    
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      type: 'TEST_EVENT',
      data: { data: 'testData' }
    }));
  });
});

describe('Event constants', () => {
  test('should have all required event types defined', () => {
    expect(EVENTS.CONTENT_CHANGED).toBe('content.changed');
    expect(EVENTS.BLOCK_CREATED).toBe('block.created');
    expect(EVENTS.BLOCK_FOCUSED).toBe('block.focused');
    expect(EVENTS.EDITOR_UPDATED).toBe('editor.updated');
    expect(EVENTS.TOOLBAR_ACTION).toBe('toolbar.action');
    expect(EVENTS.USER_PASTE).toBe('user.paste');
    expect(EVENTS.USER_KEY_PRESS).toBe('user.keypress');
  });
});
