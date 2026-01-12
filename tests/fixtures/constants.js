/**
 * @fileoverview Test constants and fixtures module providing centralized test data definitions.
 * Serves as single source of truth for test assertions across all test files,
 * eliminating magic strings and enabling easy maintenance.
 * @module tests/fixtures/constants
 */

'use strict';

/**
 * Endpoint URL path constants for HTTP request testing.
 * @constant {Object}
 * @property {string} HELLO - The hello endpoint path
 * @property {string} EVENING - The evening endpoint path
 * @property {string} ROOT - The root endpoint path for edge case testing
 */
const ENDPOINTS = Object.freeze({
  HELLO: '/hello',
  EVENING: '/evening',
  ROOT: '/'
});

/**
 * Expected response body strings for endpoint assertions.
 * @constant {Object}
 * @property {string} HELLO - Expected response for /hello endpoint
 * @property {string} EVENING - Expected response for /evening endpoint
 */
const EXPECTED_RESPONSES = Object.freeze({
  HELLO: 'Hello world',
  EVENING: 'Good evening'
});

/**
 * HTTP status code constants for response validation.
 * @constant {Object}
 * @property {number} OK - Success status code (200)
 * @property {number} NOT_FOUND - Not found status code (404)
 * @property {number} METHOD_NOT_ALLOWED - Method not allowed status code (405)
 */
const STATUS_CODES = Object.freeze({
  OK: 200,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405
});

/**
 * Content-Type header values for response header validation.
 * @constant {Object}
 * @property {string} TEXT - HTML text content type
 * @property {string} PLAIN - Plain text content type
 */
const CONTENT_TYPES = Object.freeze({
  TEXT: 'text/html',
  PLAIN: 'text/plain'
});

/**
 * Array of invalid route paths for 404 error handling tests.
 * Includes various edge cases: unknown routes, deeply nested paths, and trailing slash variants.
 * @constant {string[]}
 */
const INVALID_ROUTES = Object.freeze([
  '/unknown',
  '/notfound',
  '/a/b/c/d',
  '/hello/'
]);

module.exports = {
  ENDPOINTS,
  EXPECTED_RESPONSES,
  STATUS_CODES,
  CONTENT_TYPES,
  INVALID_ROUTES
};
