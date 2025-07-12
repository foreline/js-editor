import '@testing-library/jest-dom';

// Mock global objects for testing
global.document = document;
global.window = window;

// Mock console methods to prevent noise during tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});
