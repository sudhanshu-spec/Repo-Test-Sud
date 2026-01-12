/**
 * Jest Configuration for Node.js Backend Testing
 * Configures test environment, patterns, and coverage settings
 */
module.exports = {
  // Use Node.js environment for backend testing
  testEnvironment: 'node',

  // Test file discovery patterns
  testMatch: ['**/tests/**/*.test.js'],

  // Patterns to ignore when searching for test files
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/fixtures/',
    '/tests/helpers/'
  ],

  // Coverage report output directory
  coverageDirectory: 'coverage',

  // Source files to collect coverage from
  collectCoverageFrom: [
    'server.js',
    'app.js'
  ],

  // Coverage thresholds - fail if not met
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 100,
      lines: 80,
      statements: 80
    }
  },

  // Coverage reporters for different outputs
  coverageReporters: ['text', 'lcov', 'json-summary'],

  // Test timeout in milliseconds
  testTimeout: 5000,

  // Verbose output for better debugging
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true
};
