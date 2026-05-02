module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testPathIgnorePatterns: [
    // Legacy/obsolete suites after refactor
    // '<rootDir>/tests/Toolbar\\.test\\.js',
    // '<rootDir>/tests/ToolbarHandlers\\.test\\.js',
    // '<rootDir>/tests/KeyHandler\\.test\\.js', // re-enabled
    // '<rootDir>/tests/HeadingBlock\\.test\\.js', // re-enabled after fix
    // '<rootDir>/tests/H[1-6]Block\\.test\\.js', // re-enabled after fix
    // '<rootDir>/tests/OrderedListBlock\.test\.js', // re-enabled after fix
    // '<rootDir>/tests/UnorderedListBlock\.test\.js', // re-enabled after fix
    // '<rootDir>/tests/UnorderedListEmptyEditorFix\.test\.js',
    // '<rootDir>/tests/EmptyEditorEdgeCase\.test\.js', // re-enabled
    // '<rootDir>/tests/TaskListCheckboxFix\.test\.js', // re-enabled
    // '<rootDir>/tests/ParserListCodeFix\.test\.js', // re-enabled
    // '<rootDir>/tests/ContentExport\.test\.js', // re-enabled after rewrite
    // '<rootDir>/tests/Block\\.test\\.js', // re-enabled after fix
    // '<rootDir>/tests/BlockConversion\\.test\\.js', // re-enabled after rewrite
    // '<rootDir>/tests/syntaxHighlighter\\.test\\.js', // re-enabled after fix
  // Additional legacy suites still asserting pre-refactor contracts
  // '<rootDir>/tests/Editor.instance\\.test\\.js', // re-enabled after fix
  // '<rootDir>/tests/Editor.static\\.test\\.js', // re-enabled after rewrite
  // '<rootDir>/tests/EmptyBlockPersistenceFix\\.test\\.js', // re-enabled after rewrite
  // '<rootDir>/tests/HeaderConversionDebug\\.test\\.js', // re-enabled after rewrite
  // '<rootDir>/tests/CodeBlock\\.test\\.js', // re-enabled after fix
  // '<rootDir>/tests/MixedBlockParsing\\.test\\.js', // re-enabled
  // '<rootDir>/tests/BlockFactory\\.test\\.js', // re-enabled after fix
  // '<rootDir>/tests/setCurrentBlockOptimization\\.test\\.js', // re-enabled after rewrite
  // '<rootDir>/tests/ParserIntegration\\.test\\.js', // re-enabled
  // '<rootDir>/tests/Parser\\.test\\.js', // re-enabled
  // '<rootDir>/tests/ListBlock\\.test\\.js', // re-enabled after fix
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/utils/log.js$': '<rootDir>/tests/mocks/log.js',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/tests/?(*.)+(spec|test).js'],
  transformIgnorePatterns: ['/node_modules/(?!showdown)/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js'
  ]
};
