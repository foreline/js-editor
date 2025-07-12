import { eventEmitter } from '@/utils/eventEmitter.js';

describe('eventEmitter', () => {
  beforeEach(() => {
    // Reset events before each test
    eventEmitter.events = [];
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('subscribe and emit', () => {
    test('should register an event handler and call it when event is emitted', () => {
      const handler = jest.fn();
      
      eventEmitter.subscribe('TEST_EVENT', handler);
      eventEmitter.emit('TEST_EVENT', 'testData');
      
      expect(handler).toHaveBeenCalledWith('testData');
    });

    test('should support multiple subscribers to the same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventEmitter.subscribe('TEST_EVENT', handler1);
      eventEmitter.subscribe('TEST_EVENT', handler2);
      
      eventEmitter.emit('TEST_EVENT', 'testData');
      
      expect(handler1).toHaveBeenCalledWith('testData');
      expect(handler2).toHaveBeenCalledWith('testData');
    });

    test('should only call handlers for the emitted event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      eventEmitter.subscribe('EVENT1', handler1);
      eventEmitter.subscribe('EVENT2', handler2);
      
      eventEmitter.emit('EVENT1', 'testData');
      
      expect(handler1).toHaveBeenCalledWith('testData');
      expect(handler2).not.toHaveBeenCalled();
    });

    test('should pass multiple arguments to handlers', () => {
      const handler = jest.fn();
      
      eventEmitter.subscribe('TEST_EVENT', handler);
      eventEmitter.emit('TEST_EVENT', 'arg1', 'arg2', 'arg3');
      
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });

  describe('unsubscribe', () => {
    test('should remove event handler when unsubscribe is called', () => {
      const handler = jest.fn();
      
      const subscription = eventEmitter.subscribe('TEST_EVENT', handler);
      subscription.unsubscribe();
      
      eventEmitter.emit('TEST_EVENT', 'testData');
      
      expect(handler).not.toHaveBeenCalled();
    });

    test('should only remove the specific handler', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      const subscription = eventEmitter.subscribe('TEST_EVENT', handler1);
      eventEmitter.subscribe('TEST_EVENT', handler2);
      
      subscription.unsubscribe();
      
      eventEmitter.emit('TEST_EVENT', 'testData');
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith('testData');
    });
  });
});
