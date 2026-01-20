/**
 * Jest Configuration for HTTP Server Tests
 * @see https://jestjs.io/docs/configuration
 */
module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test file locations
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],

  // Module handling
  moduleFileExtensions: ['js', 'json'],

  // Coverage configuration
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'server.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 90,
      lines: 80,
      statements: 80
    }
  },

  // Test execution
  verbose: true,
  testTimeout: 10000,

  // Cleanup
  clearMocks: true,
  restoreMocks: true
};
