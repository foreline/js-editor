'use strict';

// Break Editor circular dep chain
jest.mock('../src/Editor.js');
jest.mock('@/utils/log.js');

import { DebugTooltip } from '../src/DebugTooltip.js';

describe('DebugTooltip', () => {
    let tooltip;
    let mockEditorInstance;
    let mockEditor;

    beforeEach(() => {
        jest.clearAllMocks();

        // Use the real jsdom element (setup.js saves it as _originalCreateElement)
        // because MutationObserver.observe() requires a real DOM Node
        mockEditorInstance = global._originalCreateElement('div');
        jest.spyOn(mockEditorInstance.classList, 'add');
        jest.spyOn(mockEditorInstance.classList, 'remove');

        mockEditor = {
            currentBlock: null,
            blocks: []
        };

        tooltip = new DebugTooltip({ editorInstance: mockEditorInstance });
    });

    // -----------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------
    describe('constructor', () => {
        it('creates an instance', () => {
            expect(tooltip).toBeInstanceOf(DebugTooltip);
        });

        it('starts disabled', () => {
            expect(tooltip.enabled).toBe(false);
        });

        it('initialises event-listener references to null', () => {
            expect(tooltip.scrollHandler).toBeNull();
            expect(tooltip.resizeHandler).toBeNull();
        });

        it('stores the editorInstance option', () => {
            expect(tooltip.editorInstance).toBe(mockEditorInstance);
        });
    });

    // -----------------------------------------------------------
    // enable / disable
    // -----------------------------------------------------------
    describe('enable', () => {
        it('sets enabled to true', () => {
            tooltip.enable(mockEditor);
            expect(tooltip.enabled).toBe(true);
        });

        it('adds bke-debug-mode class to editorInstance', () => {
            tooltip.enable(mockEditor);
            // classList.add is mocked by setup.js; verify it was called
            expect(mockEditorInstance.classList.add).toHaveBeenCalledWith('bke-debug-mode');
        });

        it('is idempotent – calling enable twice does not double-attach listeners', () => {
            tooltip.enable(mockEditor);
            const addSpy = jest.spyOn(window, 'addEventListener');
            tooltip.enable(mockEditor); // second call should be no-op
            expect(addSpy).not.toHaveBeenCalled();
            addSpy.mockRestore();
        });
    });

    describe('disable', () => {
        it('sets enabled to false', () => {
            tooltip.enable(mockEditor);
            tooltip.disable();
            expect(tooltip.enabled).toBe(false);
        });

        it('removes bke-debug-mode class from editorInstance', () => {
            tooltip.enable(mockEditor);
            tooltip.disable();
            expect(mockEditorInstance.classList.remove).toHaveBeenCalledWith('bke-debug-mode');
        });

        it('is idempotent – calling disable on an already-disabled tooltip is a no-op', () => {
            const removeSpy = jest.spyOn(window, 'removeEventListener');
            tooltip.disable(); // already disabled
            expect(removeSpy).not.toHaveBeenCalled();
            removeSpy.mockRestore();
        });
    });

    // -----------------------------------------------------------
    // toggle
    // -----------------------------------------------------------
    describe('toggle', () => {
        it('enables when currently disabled', () => {
            expect(tooltip.enabled).toBe(false);
            tooltip.toggle(mockEditor);
            expect(tooltip.enabled).toBe(true);
        });

        it('disables when currently enabled', () => {
            tooltip.enable(mockEditor);
            expect(tooltip.enabled).toBe(true);
            tooltip.toggle(mockEditor);
            expect(tooltip.enabled).toBe(false);
        });

        it('can be called multiple times alternating state', () => {
            tooltip.toggle(mockEditor);
            expect(tooltip.enabled).toBe(true);
            tooltip.toggle(mockEditor);
            expect(tooltip.enabled).toBe(false);
            tooltip.toggle(mockEditor);
            expect(tooltip.enabled).toBe(true);
        });
    });

    // -----------------------------------------------------------
    // addEventListeners / removeEventListeners
    // -----------------------------------------------------------
    describe('addEventListeners', () => {
        it('attaches scroll and resize handlers to window', () => {
            const addSpy = jest.spyOn(window, 'addEventListener');
            tooltip.addEventListeners();
            expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
            expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
            addSpy.mockRestore();
        });

        it('stores handler references for later removal', () => {
            tooltip.addEventListeners();
            expect(tooltip.scrollHandler).toBeInstanceOf(Function);
            expect(tooltip.resizeHandler).toBeInstanceOf(Function);
        });
    });

    describe('removeEventListeners', () => {
        it('detaches scroll and resize handlers', () => {
            tooltip.addEventListeners();
            const removeSpy = jest.spyOn(window, 'removeEventListener');
            tooltip.removeEventListeners();
            expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
            expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
            removeSpy.mockRestore();
        });

        it('nullifies handler references after removal', () => {
            tooltip.addEventListeners();
            tooltip.removeEventListeners();
            expect(tooltip.scrollHandler).toBeNull();
            expect(tooltip.resizeHandler).toBeNull();
        });

        it('is safe to call when no listeners were attached', () => {
            expect(() => tooltip.removeEventListeners()).not.toThrow();
        });
    });
});
