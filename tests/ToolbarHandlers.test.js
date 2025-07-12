import { ToolbarHandlers } from '@/ToolbarHandlers.js';
import { Toolbar } from '@/Toolbar.js';

jest.mock('@/Toolbar.js');

describe('ToolbarHandlers', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="editor-toolbar-undo"></div>
      <div class="editor-toolbar-redo"></div>
      <div class="editor-toolbar-header1"></div>
      <div class="editor-toolbar-header2"></div>
      <div class="editor-toolbar-header3"></div>
      <div class="editor-toolbar-header4"></div>
      <div class="editor-toolbar-header5"></div>
      <div class="editor-toolbar-header6"></div>
      <div class="editor-toolbar-paragraph"></div>
      <div class="editor-toolbar-bold"></div>
      <div class="editor-toolbar-italic"></div>
      <div class="editor-toolbar-underline"></div>
      <div class="editor-toolbar-strikethrough"></div>
      <div class="editor-toolbar-ul"></div>
      <div class="editor-toolbar-ol"></div>
      <div class="editor-toolbar-sq"></div>
      <div class="editor-toolbar-code"></div>
      <div class="editor-toolbar-text"></div>
      <div class="editor-toolbar-markdown"></div>
      <div class="editor-toolbar-html"></div>
    `;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize toolbar handlers and attach event listeners', () => {
    ToolbarHandlers.init();

    expect(document.querySelector('.editor-toolbar-undo').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-redo').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-header1').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-header2').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-header3').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-header4').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-header5').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-header6').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-paragraph').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-bold').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-italic').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-underline').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-strikethrough').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-ul').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-ol').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-sq').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-code').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-text').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-markdown').onclick).toBeDefined();
    expect(document.querySelector('.editor-toolbar-html').onclick).toBeDefined();
  });

  test('should call appropriate Toolbar methods on button click', () => {
    ToolbarHandlers.init();

    document.querySelector('.editor-toolbar-undo').click();
    expect(Toolbar.undo).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-redo').click();
    expect(Toolbar.redo).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-header1').click();
    expect(Toolbar.h1).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-header2').click();
    expect(Toolbar.h2).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-header3').click();
    expect(Toolbar.h3).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-header4').click();
    expect(Toolbar.h4).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-header5').click();
    expect(Toolbar.h5).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-header6').click();
    expect(Toolbar.h6).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-paragraph').click();
    expect(Toolbar.paragraph).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-bold').click();
    expect(Toolbar.bold).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-italic').click();
    expect(Toolbar.italic).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-underline').click();
    expect(Toolbar.underline).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-strikethrough').click();
    expect(Toolbar.strikethrough).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-ul').click();
    expect(Toolbar.ul).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-ol').click();
    expect(Toolbar.ol).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-sq').click();
    expect(Toolbar.sq).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-code').click();
    expect(Toolbar.code).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-text').click();
    expect(Toolbar.text).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-markdown').click();
    expect(Toolbar.markdown).toHaveBeenCalled();

    document.querySelector('.editor-toolbar-html').click();
    expect(Toolbar.html).toHaveBeenCalled();
  });
});
