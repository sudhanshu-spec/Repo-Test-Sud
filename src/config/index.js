/**
 * Twelve-Factor Application Configuration Module
 *
 * Serves as the single source of truth for all runtime configuration within the
 * Express.js 5.x application. Implements the Twelve-Factor App methodology
 * (Factor III: Config) by externalizing configuration through environment
 * variables while providing sensible defaults for local development.
 *
 * Default values preserve backward compatibility with the original hardcoded
 * values from server.js:
 * - host: '127.0.0.1' (loopback interface for local-only binding)
 * - port: 3000 (conventional Express.js development port)
 *
 * Environment variable overrides:
 * - HOST: Override the default host binding address
 * - PORT: Override the default port number (parsed as base-10 integer)
 * - NODE_ENV: Set the application environment (development, production, test)
 *
 * Consumed by:
 * - server.js — reads host and port for HTTP server binding via app.listen()
 * - src/app.js — indirectly via server.js for Express application lifecycle
 * - tests/unit/config.test.js — direct import for configuration validation
 * - tests/lifecycle/server.test.js — mocked via jest.doMock() for lifecycle testing
 *
 * @module src/config
 */

module.exports = {
  /**
   * Server host binding address.
   * Resolved from the HOST environment variable with a fallback to the
   * loopback address '127.0.0.1' for secure local-only binding by default.
   * @type {string}
   * @default '127.0.0.1'
   */
  host: process.env.HOST || '127.0.0.1',

  /**
   * Server port number.
   * Resolved from the PORT environment variable, parsed as a base-10 integer
   * via parseInt(). Falls back to port 3000 when PORT is unset, empty, or
   * contains a non-numeric string (NaN || 3000 evaluates to 3000). Whitespace
   * is automatically trimmed by parseInt(), and decimal values are truncated
   * to their integer component.
   * @type {number}
   * @default 3000
   */
  port: parseInt(process.env.PORT, 10) || 3000,

  /**
   * Application runtime environment identifier.
   * Resolved from the NODE_ENV environment variable with a fallback to
   * 'development' for safe local operation. Common values include
   * 'development', 'production', and 'test'.
   * @type {string}
   * @default 'development'
   */
  env: process.env.NODE_ENV || 'development'
};
