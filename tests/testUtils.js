/**
 * Test utilities for mocking DOM elements and common objects
 */

/**
 * Create a mock DOM element with proper classList and all necessary methods
 */
export function createMockElement(tagName = 'div', options = {}) {
    const element = {
        tagName: tagName.toUpperCase(),
        classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn().mockReturnValue(false),
            toggle: jest.fn()
        },
        setAttribute: jest.fn(),
        getAttribute: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([]),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        focus: jest.fn(),
        click: jest.fn(),
        innerHTML: options.innerHTML || '',
        innerText: options.innerText || '',
        textContent: options.textContent || '',
        id: options.id || '',
        className: options.className || '',
        style: {},
        parentNode: null,
        childNodes: [],
        children: [],
        ...options
    };
    
    return element;
}

/**
 * Create a mock BlockFactory with all necessary methods
 */
export function createMockBlockFactory() {
    return {
        findBlockClassForTrigger: jest.fn(),
        createBlock: jest.fn().mockReturnValue({
            _type: 'p',
            _content: '',
            _html: '',
            _nested: false
        }),
        getAllBlockClasses: jest.fn().mockReturnValue([]),
        getBlockClass: jest.fn()
    };
}

/**
 * Create a mock document with createElement that returns proper mock elements
 */
export function createMockDocument() {
    const mockDocument = {
        createElement: jest.fn((tagName) => createMockElement(tagName)),
        getElementById: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([]),
        body: createMockElement('body'),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    };
    
    return mockDocument;
}

/**
 * Setup common mocks for tests
 */
export function setupCommonMocks() {
    const mockDocument = createMockDocument();
    
    // Mock global document
    global.document = mockDocument;
    
    // Mock Prism for syntax highlighting tests
    global.Prism = {
        highlight: jest.fn().mockReturnValue('highlighted code'),
        languages: {
            javascript: {},
            markup: {},
            css: {},
            python: {},
            java: {},
            cpp: {},
            csharp: {},
            php: {},
            ruby: {},
            go: {},
            rust: {},
            typescript: {},
            json: {},
            xml: {},
            sql: {},
            bash: {},
            shell: {}
        }
    };
    
    return { mockDocument };
}
