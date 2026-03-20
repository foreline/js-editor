/**
 * Tests for EditorStateMachine
 * Verifies state transitions, guards, queueing, and backward compatibility
 */

import { EditorStateMachine, EditorState } from '../src/utils/EditorStateMachine.js';

describe('EditorStateMachine', () => {
    let sm;

    beforeEach(() => {
        sm = new EditorStateMachine();
    });

    describe('initial state', () => {
        test('starts in IDLE state', () => {
            expect(sm.state).toBe(EditorState.IDLE);
        });

        test('isBusy returns false when IDLE', () => {
            expect(sm.isBusy()).toBe(false);
        });

        test('isCreating is false when IDLE', () => {
            expect(sm.isCreating).toBe(false);
        });

        test('isConverting is false when IDLE', () => {
            expect(sm.isConverting).toBe(false);
        });
    });

    describe('CREATING transitions', () => {
        test('startCreating transitions from IDLE to CREATING', () => {
            const result = sm.startCreating();
            expect(result).toBe(true);
            expect(sm.state).toBe(EditorState.CREATING);
            expect(sm.isCreating).toBe(true);
            expect(sm.isBusy()).toBe(true);
        });

        test('finishCreating transitions from CREATING to IDLE', () => {
            sm.startCreating();
            sm.finishCreating();
            expect(sm.state).toBe(EditorState.IDLE);
            expect(sm.isCreating).toBe(false);
            expect(sm.isBusy()).toBe(false);
        });

        test('startCreating returns false when already CREATING', () => {
            sm.startCreating();
            const result = sm.startCreating();
            expect(result).toBe(false);
            expect(sm.state).toBe(EditorState.CREATING);
        });

        test('startCreating returns false when CONVERTING', () => {
            sm.startConverting();
            const result = sm.startCreating();
            expect(result).toBe(false);
            expect(sm.state).toBe(EditorState.CONVERTING);
        });
    });

    describe('CONVERTING transitions', () => {
        test('startConverting transitions from IDLE to CONVERTING', () => {
            const result = sm.startConverting();
            expect(result).toBe(true);
            expect(sm.state).toBe(EditorState.CONVERTING);
            expect(sm.isConverting).toBe(true);
            expect(sm.isBusy()).toBe(true);
        });

        test('finishConverting transitions from CONVERTING to IDLE', () => {
            sm.startConverting();
            sm.finishConverting();
            expect(sm.state).toBe(EditorState.IDLE);
            expect(sm.isConverting).toBe(false);
            expect(sm.isBusy()).toBe(false);
        });

        test('startConverting returns false when already CONVERTING', () => {
            sm.startConverting();
            const result = sm.startConverting();
            expect(result).toBe(false);
            expect(sm.state).toBe(EditorState.CONVERTING);
        });

        test('startConverting returns false when CREATING', () => {
            sm.startCreating();
            const result = sm.startConverting();
            expect(result).toBe(false);
            expect(sm.state).toBe(EditorState.CREATING);
        });
    });

    describe('operation queue', () => {
        test('enqueue executes immediately when IDLE', () => {
            const fn = jest.fn();
            sm.enqueue(fn);
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test('enqueue defers execution when CREATING', () => {
            const fn = jest.fn();
            sm.startCreating();
            sm.enqueue(fn);
            expect(fn).not.toHaveBeenCalled();
        });

        test('enqueue defers execution when CONVERTING', () => {
            const fn = jest.fn();
            sm.startConverting();
            sm.enqueue(fn);
            expect(fn).not.toHaveBeenCalled();
        });

        test('queued operations flush on finishCreating', () => {
            const fn1 = jest.fn();
            const fn2 = jest.fn();
            sm.startCreating();
            sm.enqueue(fn1);
            sm.enqueue(fn2);
            expect(fn1).not.toHaveBeenCalled();
            expect(fn2).not.toHaveBeenCalled();

            sm.finishCreating();
            expect(fn1).toHaveBeenCalledTimes(1);
            expect(fn2).toHaveBeenCalledTimes(1);
        });

        test('queued operations flush on finishConverting', () => {
            const fn = jest.fn();
            sm.startConverting();
            sm.enqueue(fn);
            expect(fn).not.toHaveBeenCalled();

            sm.finishConverting();
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test('queued operations execute in order', () => {
            const order = [];
            sm.startCreating();
            sm.enqueue(() => order.push(1));
            sm.enqueue(() => order.push(2));
            sm.enqueue(() => order.push(3));
            sm.finishCreating();
            expect(order).toEqual([1, 2, 3]);
        });

        test('queue stops flushing if an operation transitions state', () => {
            const order = [];
            sm.startCreating();
            sm.enqueue(() => {
                order.push(1);
                sm.startCreating(); // transitions away from IDLE
            });
            sm.enqueue(() => order.push(2));
            sm.finishCreating();
            // First op runs and transitions to CREATING, second stays queued
            expect(order).toEqual([1]);
            expect(sm.state).toBe(EditorState.CREATING);
        });

        test('failed queued operation does not break rest of queue', () => {
            const fn1 = jest.fn(() => { throw new Error('test'); });
            const fn2 = jest.fn();
            sm.startCreating();
            sm.enqueue(fn1);
            sm.enqueue(fn2);
            sm.finishCreating();
            expect(fn1).toHaveBeenCalled();
            expect(fn2).toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        test('reset forces IDLE and clears queue', () => {
            const fn = jest.fn();
            sm.startConverting();
            sm.enqueue(fn);
            sm.reset();
            expect(sm.state).toBe(EditorState.IDLE);
            expect(fn).not.toHaveBeenCalled();
        });

        test('reset from CREATING clears state', () => {
            sm.startCreating();
            sm.reset();
            expect(sm.state).toBe(EditorState.IDLE);
            expect(sm.isCreating).toBe(false);
        });
    });

    describe('finishCreating/finishConverting from wrong state', () => {
        test('finishCreating from IDLE still lands in IDLE', () => {
            sm.finishCreating();
            expect(sm.state).toBe(EditorState.IDLE);
        });

        test('finishConverting from IDLE still lands in IDLE', () => {
            sm.finishConverting();
            expect(sm.state).toBe(EditorState.IDLE);
        });

        test('finishCreating from CONVERTING forces IDLE', () => {
            sm.startConverting();
            sm.finishCreating();
            expect(sm.state).toBe(EditorState.IDLE);
        });
    });
});
