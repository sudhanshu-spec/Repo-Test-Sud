/**
 * @fileoverview Jest test runner configuration for the Express.js hello_world application.
 *
 * Configures the Node.js test environment, test discovery across unit, integration,
 * and lifecycle test suites, code coverage collection with enforced minimum thresholds,
 * and appropriate timeouts for server lifecycle testing scenarios.
 *
 * Test discovery pattern captures all *.test.js files under tests/ subdirectories:
 *   - tests/unit/          — Config and route handler unit tests
 *   - tests/integration/   — HTTP endpoint integration tests via Supertest
 *   - tests/lifecycle/     — Server bootstrap and shutdown lifecycle tests
 *
 * Coverage collection targets:
 *   - server.js      — HTTP server entry point and lifecycle management
 *   - src/**\/*.js    — Express application factory, configuration, and route modules
 *
 * Coverage thresholds: branches >= 75%, functions >= 90%, lines >= 80%, statements >= 80%
 *
 * @type {import('jest').Config}
 */
module.exports = {
  // Node.js environment for server-side Express.js testing
  testEnvironment: 'node',

  // Discover test files across unit, integration, and lifecycle directories
  testMatch: ['**/tests/**/*.test.js'],

  // Code coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Minimum coverage thresholds to maintain code quality
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 90,
      lines: 80,
      statements: 80
    }
  },

  // Source files included in coverage collection
  collectCoverageFrom: [
    'server.js',
    'src/**/*.js',
    '!node_modules/**'
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],

  // Verbose output for detailed test result reporting
  verbose: true,

  // Extended timeout for server lifecycle test scenarios (10 seconds)
  testTimeout: 10000
};
