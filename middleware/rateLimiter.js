/**
 * @fileoverview Rate Limiting Middleware Module
 * 
 * This module provides DoS (Denial of Service) protection for the Express.js
 * application by implementing request rate limiting using the express-rate-limit
 * package. It throttles incoming requests based on client IP addresses.
 * 
 * Default Configuration:
 * - Window: 15 minutes (900000ms)
 * - Max requests: 100 per window per IP
 * - Headers: Standard RateLimit-* headers (draft-8 specification)
 * 
 * Environment Variable Overrides:
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds
 * - RATE_LIMIT_MAX: Maximum requests per window
 * 
 * @module middleware/rateLimiter
 * @see https://www.npmjs.com/package/express-rate-limit
 * @see https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
 */

'use strict';

// External dependency: express-rate-limit ^8.2.1
// Factory function to create rate limiting middleware
const { rateLimit } = require('express-rate-limit');

// Internal dependency: Centralized security configuration
// Contains rate limit settings with environment variable support
const { rateLimitConfig } = require('../config/security.js');

/**
 * Rate Limiter Middleware
 * 
 * Express middleware that implements request rate limiting to protect
 * against abuse and DoS attacks. Uses the centralized configuration from
 * config/security.js which supports environment variable overrides.
 * 
 * Configuration (from rateLimitConfig):
 * @property {number} windowMs - Time window in milliseconds (default: 900000 = 15 minutes)
 * @property {number} limit - Maximum requests per IP per window (default: 100)
 * @property {boolean} standardHeaders - Returns RateLimit-* headers per draft-8 (default: true)
 * @property {boolean} legacyHeaders - Disables deprecated X-RateLimit-* headers (default: false)
 * @property {Object} message - JSON response when rate limit is exceeded
 * @property {boolean} skipSuccessfulRequests - Count all requests (default: false)
 * @property {boolean} skipFailedRequests - Count all requests (default: false)
 * @property {Function} handler - Custom handler for rate limit exceeded
 * @property {number} statusCode - HTTP status code (default: 429)
 * @property {Function} skip - Function to skip rate limiting for specific requests
 * 
 * Response Headers (when standardHeaders is true):
 * - RateLimit-Limit: Maximum requests allowed in the window
 * - RateLimit-Remaining: Number of requests remaining
 * - RateLimit-Reset: Seconds until the rate limit window resets
 * 
 * Rate Limit Exceeded Response:
 * HTTP Status: 429 Too Many Requests
 * Body: { status: 429, error: 'Too Many Requests', message: '...', retryAfter: '...' }
 * 
 * @example
 * // Usage in Express application (server.js)
 * const rateLimiter = require('./middleware/rateLimiter');
 * app.use(rateLimiter);
 * 
 * @example
 * // Apply to specific routes only
 * const rateLimiter = require('./middleware/rateLimiter');
 * app.use('/api', rateLimiter);
 * 
 * @type {Function}
 * @returns {Function} Express middleware function (req, res, next) => void
 * 
 * @see {@link module:config/security~rateLimitConfig} for configuration details
 */
const rateLimiter = rateLimit({
  // Time window for rate limiting in milliseconds
  // Default: 15 minutes (900000ms) - configurable via RATE_LIMIT_WINDOW_MS
  windowMs: rateLimitConfig.windowMs,
  
  // Maximum number of requests allowed per IP within the time window
  // Default: 100 requests - configurable via RATE_LIMIT_MAX
  // Note: express-rate-limit v8.x uses 'limit' instead of deprecated 'max'
  limit: rateLimitConfig.limit,
  
  // Enable standard RateLimit headers per IETF draft-8 specification
  // Headers: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
  // These provide clients with rate limit information
  standardHeaders: rateLimitConfig.standardHeaders,
  
  // Disable legacy X-RateLimit-* headers (deprecated, non-standard)
  // Reduces response header size and follows modern standards
  legacyHeaders: rateLimitConfig.legacyHeaders,
  
  // JSON response body when rate limit is exceeded
  // Includes error details and retry information
  message: rateLimitConfig.message,
  
  // Count all requests against the limit (successful and failed)
  skipSuccessfulRequests: rateLimitConfig.skipSuccessfulRequests,
  skipFailedRequests: rateLimitConfig.skipFailedRequests,
  
  // Custom handler for rate limit exceeded scenario
  // Returns structured JSON error response with 429 status
  handler: rateLimitConfig.handler,
  
  // HTTP status code returned when rate limit is exceeded
  statusCode: rateLimitConfig.statusCode,
  
  // Skip rate limiting for specific requests (e.g., health checks)
  // The config skips /health and /healthz endpoints
  skip: rateLimitConfig.skip
  
  // Note: keyGenerator is intentionally omitted to use the library's default
  // behavior which properly handles IPv6 addresses. The default uses req.ip
  // which respects Express's 'trust proxy' setting.
  // When behind a reverse proxy, configure: app.set('trust proxy', 1)
});

// Export the configured rate limiter middleware as default export
// This allows: const rateLimiter = require('./middleware/rateLimiter');
module.exports = rateLimiter;

// Alternative named export for destructuring import style
// This allows: const { rateLimiter } = require('./middleware/rateLimiter');
module.exports.rateLimiter = rateLimiter;
