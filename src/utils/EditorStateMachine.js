'use strict';

import { log } from './log.js';

/**
 * Editor states
 * @enum {string}
 */
export const EditorState = Object.freeze({
    IDLE: 'IDLE',
    CREATING: 'CREATING',
    CONVERTING: 'CONVERTING'
});

/**
 * State machine for the Editor that replaces ad-hoc boolean flags
 * (isCreatingBlock, isConvertingBlock) with explicit state transitions
 * and an operation queue for requests that arrive during non-IDLE states.
 */
export class EditorStateMachine {
    constructor() {
        this._state = EditorState.IDLE;
        this._queue = [];
    }

    /**
     * Current state
     * @returns {string}
     */
    get state() {
        return this._state;
    }

    /**
     * Whether the editor is busy (not IDLE)
     * @returns {boolean}
     */
    isBusy() {
        return this._state !== EditorState.IDLE;
    }

    /**
     * Whether the editor is currently creating a block
     * @returns {boolean}
     */
    get isCreating() {
        return this._state === EditorState.CREATING;
    }

    /**
     * Whether the editor is currently converting a block
     * @returns {boolean}
     */
    get isConverting() {
        return this._state === EditorState.CONVERTING;
    }

    /**
     * Transition to CREATING state
     * @throws {Error} if not in IDLE state
     */
    startCreating() {
        log(`startCreating() [${this._state} → ${EditorState.CREATING}]`, 'StateMachine.');

        if (this._state !== EditorState.IDLE) {
            log(`Cannot start creating: already in ${this._state} state, queueing`, 'StateMachine.');
            return false;
        }

        this._state = EditorState.CREATING;
        return true;
    }

    /**
     * Transition from CREATING back to IDLE, then flush the queue
     */
    finishCreating() {
        log(`finishCreating() [${this._state} → ${EditorState.IDLE}]`, 'StateMachine.');

        if (this._state !== EditorState.CREATING) {
            log(`finishCreating called but state is ${this._state}, forcing IDLE`, 'StateMachine.');
        }

        this._state = EditorState.IDLE;
        this._flushQueue();
    }

    /**
     * Transition to CONVERTING state
     * @returns {boolean} whether the transition succeeded
     */
    startConverting() {
        log(`startConverting() [${this._state} → ${EditorState.CONVERTING}]`, 'StateMachine.');

        if (this._state !== EditorState.IDLE) {
            log(`Cannot start converting: already in ${this._state} state, queueing`, 'StateMachine.');
            return false;
        }

        this._state = EditorState.CONVERTING;
        return true;
    }

    /**
     * Transition from CONVERTING back to IDLE, then flush the queue
     */
    finishConverting() {
        log(`finishConverting() [${this._state} → ${EditorState.IDLE}]`, 'StateMachine.');

        if (this._state !== EditorState.CONVERTING) {
            log(`finishConverting called but state is ${this._state}, forcing IDLE`, 'StateMachine.');
        }

        this._state = EditorState.IDLE;
        this._flushQueue();
    }

    /**
     * Enqueue an operation to be executed when the state returns to IDLE.
     * If already IDLE, execute immediately.
     * @param {Function} fn - The operation to enqueue
     */
    enqueue(fn) {
        if (this._state === EditorState.IDLE) {
            fn();
        } else {
            log(`Enqueuing operation (queue size: ${this._queue.length + 1})`, 'StateMachine.');
            this._queue.push(fn);
        }
    }

    /**
     * Force reset to IDLE state and clear the queue.
     * Use only for error recovery.
     */
    reset() {
        log(`reset() [${this._state} → ${EditorState.IDLE}], clearing ${this._queue.length} queued ops`, 'StateMachine.');
        this._state = EditorState.IDLE;
        this._queue = [];
    }

    /**
     * Flush queued operations sequentially.
     * @private
     */
    _flushQueue() {
        while (this._queue.length > 0 && this._state === EditorState.IDLE) {
            const fn = this._queue.shift();
            try {
                fn();
            } catch (e) {
                log(`Queued operation failed: ${e.message}`, 'StateMachine.');
            }
        }
    }
}
