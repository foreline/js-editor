'use strict';

import { Toolbar } from './Toolbar.js';
import {eventEmitter, EVENTS} from "@/utils/eventEmitter.js";

export const ToolbarHandlers = {
  /**
   * Store event listeners for cleanup
   */
  eventListeners: new Map(),

  /**
   * Create a toolbar event handler with automatic event emission
   * @param {string} actionName - Name of the toolbar action
   * @param {Function} actionFunction - Function to execute
   * @returns {Function} Enhanced event handler
   */
  createToolbarHandler: (actionName, actionFunction) => {
    return (e) => {
      e.preventDefault();
      
      // Emit toolbar action event
      eventEmitter.emit(EVENTS.TOOLBAR_ACTION, {
        action: actionName,
        timestamp: Date.now(),
        button: e.target
      }, { source: 'toolbar.action' });
      
      // Execute the action
      actionFunction(e);
    };
  },

  /**
   * Handles the click event for the toolbar button.
   * @param {Event} event - The click event.
   * @param {Object} context - The context object containing necessary data.
   * @return {void}
   * @throws {Error} Throws an error if the context is not provided.
   * */
  init: () => {
    // Clear existing event listeners before adding new ones
    ToolbarHandlers.cleanup();
    
    // Place <p> instead of <div>
    document.execCommand('defaultParagraphSeparator', false, 'p');

    /*
    * UNDO | REDO
    */

    document
        .querySelectorAll('.editor-toolbar-undo')
        .forEach(btn => {
            const handler = ToolbarHandlers.createToolbarHandler('undo', () => Toolbar.undo());
            btn.addEventListener('click', handler);
            ToolbarHandlers.eventListeners.set(btn, { event: 'click', handler });
        });

    document
        .querySelectorAll('.editor-toolbar-redo')
        .forEach(btn => {
            const handler = ToolbarHandlers.createToolbarHandler('redo', () => Toolbar.redo());
            btn.addEventListener('click', handler);
            ToolbarHandlers.eventListeners.set(btn, { event: 'click', handler });
        });

    /*
    * HEADERs | PARAGRAPH
    */

    document
        .querySelectorAll('.editor-toolbar-header1')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.h1();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-header2')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.h2();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-header3')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.h3();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-header4')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.h4();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-header5')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.h5();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-header6')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.h6();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-paragraph')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.paragraph();
            });
        });

    /*
    * BOLD | ITALIC | UNDERLINE | STRIKETHROUGH
    */

    document
        .querySelectorAll('.editor-toolbar-bold')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.bold();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-italic')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.italic();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-underline')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.underline();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-strikethrough')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.strikethrough();
            });
        });

    /*
    * UL | OL |
    */

    document
        .querySelectorAll('.editor-toolbar-ul')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.ul();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-ol')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.ol();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-sq')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.sq();
            });
        });

    /*
    * CODE
    */

    document
        .querySelectorAll('.editor-toolbar-code')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.code();
            });
        });

    /*
    * TABLE
    */

    document
        .querySelectorAll('.editor-toolbar-table')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.table();
            });
        });

    /*
    * TEXT | MARKDOWN | HTML
    */

    document
        .querySelectorAll('.editor-toolbar-text')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.text();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-markdown')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.markdown();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-html')
        .forEach(btn => {
            const handler = (e) => {
                e.preventDefault();
                Toolbar.html();
            };
            btn.addEventListener('click', handler);
            ToolbarHandlers.eventListeners.set(btn, { event: 'click', handler });
        });

    /*
    * DEBUG MODE TOGGLE
    */
    document
        .querySelectorAll('.editor-toolbar-debug')
        .forEach(btn => {
            const handler = ToolbarHandlers.createToolbarHandler('debug', Toolbar.debug);
            btn.addEventListener('click', handler);
            ToolbarHandlers.eventListeners.set(btn, { event: 'click', handler });
        });
  },

  /**
   * Add event listener and track it for cleanup
   * @param {Element} element 
   * @param {string} event 
   * @param {Function} handler 
   */
  addEventListenerWithTracking: (element, event, handler) => {
    element.addEventListener(event, handler);
    ToolbarHandlers.eventListeners.set(element, { event, handler });
  },

  /**
   * Clean up all event listeners to prevent memory leaks
   */
  cleanup: () => {
    ToolbarHandlers.eventListeners.forEach((listenerInfo, element) => {
      try {
        element.removeEventListener(listenerInfo.event, listenerInfo.handler);
      } catch (error) {
        console.warn('Failed to remove event listener:', error);
      }
    });
    ToolbarHandlers.eventListeners.clear();
  }
};