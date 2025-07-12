'use strict';

import { Toolbar } from './Toolbar.js';

export const ToolbarHandlers = {
  /**
   * Handles the click event for the toolbar button.
   * @param {Event} event - The click event.
   * @param {Object} context - The context object containing necessary data.
   * @return {void}
   * @throws {Error} Throws an error if the context is not provided.
   * */
  init: () => {
    
    // Place <p> instead of <div>
    document.execCommand('defaultParagraphSeparator', false, 'p');

    /*
    * UNDO | REDO
    */

    document
        .querySelectorAll('.editor-toolbar-undo')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.undo();
            });
        });

    document
        .querySelectorAll('.editor-toolbar-redo')
        .forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.redo();
            });
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
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Toolbar.html();
            });
        });
  },
};