/**
 * Security Configuration Module
 * 
 * Centralized security configuration for Express.js application middleware.
 * Provides configurable settings for:
 * - Helmet.js (security headers)
 * - CORS (Cross-Origin Resource Sharing)
 * - Rate limiting
 * 
 * Environment-aware settings with different configurations for
 * development and production environments.
 * 
 * @module config/security
 */

'use strict';

// =============================================================================
// ENVIRONMENT DETECTION
// =============================================================================

/**
 * Indicates whether the application is running in production mode.
 * Determined by NODE_ENV environment variable.
 * @type {boolean}
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Indicates whether the application is running in development mode.
 * True when NODE_ENV is not set to 'production'.
 * @type {boolean}
 */
const isDevelopment = !isProduction;

// =============================================================================
// HELMET CONFIGURATION (Security Headers)
// =============================================================================

/**
 * Helmet.js configuration options for setting security HTTP headers.
 * 
 * Configures the following security headers:
 * - Content-Security-Policy: Restricts resource loading to mitigate XSS
 * - Cross-Origin-Opener-Policy: Process isolation for cross-origin windows
 * - Cross-Origin-Resource-Policy: Block cross-origin resource loading
 * - X-DNS-Prefetch-Control: Disable DNS prefetching for privacy
 * - X-Frame-Options: Prevent clickjacking attacks
 * - Strict-Transport-Security: Enforce HTTPS connections
 * - X-Content-Type-Options: Prevent MIME type sniffing
 * - Referrer-Policy: Control referrer information sent with requests
 * - X-XSS-Protection: Disabled per modern security recommendations
 * 
 * @type {Object}
 * @see https://helmetjs.github.io/
 */
const helmetOptions = {
  /**
   * Content Security Policy configuration.
   * Restricts resource loading to same-origin by default to mitigate XSS attacks.
   * In production, uses strict directives. In development, allows unsafe-inline
   * for easier debugging if needed (commented out for security).
   */
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },

  /**
   * Cross-Origin-Opener-Policy header configuration.
   * Sets to 'same-origin' to provide process isolation for cross-origin windows,
   * preventing cross-origin attacks and side-channel leaks.
   */
  crossOriginOpenerPolicy: {
    policy: 'same-origin',
  },

  /**
   * Cross-Origin-Resource-Policy header configuration.
   * Sets to 'same-origin' to block cross-origin resource loading,
   * preventing unauthorized access to resources from other origins.
   */
  crossOriginResourcePolicy: {
    policy: 'same-origin',
  },

  /**
   * DNS Prefetch Control configuration.
   * Disables DNS prefetching to prevent privacy concerns from
   * browsers resolving domain names before user navigation.
   */
  dnsPrefetchControl: {
    allow: false,
  },

  /**
   * X-Frame-Options header configuration (frameguard).
   * Sets to 'SAMEORIGIN' to prevent clickjacking attacks by
   * restricting page embedding to same-origin frames only.
   */
  frameguard: {
    action: 'sameorigin',
  },

  /**
   * HTTP Strict Transport Security (HSTS) configuration.
   * Enforces HTTPS connections for one year (31536000 seconds)
   * including all subdomains. Preload flag included for HSTS preload list.
   */
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: isProduction, // Only preload in production
  },

  /**
   * X-Content-Type-Options header configuration.
   * Prevents browsers from MIME type sniffing, forcing them to
   * use the declared Content-Type header.
   */
  noSniff: true,

  /**
   * Referrer-Policy header configuration.
   * Sets to 'no-referrer' to prevent any referrer information
   * from being sent with requests, enhancing privacy.
   */
  referrerPolicy: {
    policy: 'no-referrer',
  },

  /**
   * X-XSS-Protection header configuration.
   * Disabled (set to 0) as recommended by Helmet 8.x.
   * Modern browsers' built-in XSS filters can introduce security issues,
   * and CSP provides better protection.
   */
  xssFilter: false,
};

// =============================================================================
// CORS CONFIGURATION
// =============================================================================

/**
 * Parses CORS origin from environment variable.
 * Supports comma-separated multiple origins for production use.
 * 
 * @param {string|undefined} envOrigin - The CORS_ORIGIN environment variable
 * @returns {string|string[]|boolean} Parsed origin(s) for CORS configuration
 */
function parseCorsOrigin(envOrigin) {
  // If no environment variable set, use permissive setting for development
  if (!envOrigin) {
    return isDevelopment ? '*' : false;
  }

  // If wildcard is explicitly set
  if (envOrigin === '*') {
    return '*';
  }

  // Check if multiple origins are provided (comma-separated)
  if (envOrigin.includes(',')) {
    return envOrigin.split(',').map(origin => origin.trim()).filter(Boolean);
  }

  // Single origin
  return envOrigin.trim();
}

/**
 * CORS (Cross-Origin Resource Sharing) configuration options.
 * 
 * Environment-aware settings:
 * - Development: Permissive (allows all origins with '*')
 * - Production: Restrictive (specific origins from CORS_ORIGIN env var)
 * 
 * @type {Object}
 * @see https://github.com/expressjs/cors
 */
const corsOptions = {
  /**
   * Configures the Access-Control-Allow-Origin header.
   * Uses CORS_ORIGIN environment variable, supporting:
   * - Single origin: 'https://example.com'
   * - Multiple origins: 'https://example.com,https://api.example.com'
   * - Wildcard: '*' (development only recommended)
   * Defaults to '*' in development, false (no CORS) in production if not set.
   */
  origin: parseCorsOrigin(process.env.CORS_ORIGIN),

  /**
   * Configures the Access-Control-Allow-Methods header.
   * Specifies which HTTP methods are allowed for cross-origin requests.
   */
  methods: ['GET', 'POST', 'PUT', 'DELETE'],

  /**
   * Provides a status code to use for successful OPTIONS requests.
   * Set to 200 for compatibility with legacy browsers (IE11, SmartTVs)
   * that may have issues with 204 No Content responses.
   */
  optionsSuccessStatus: 200,

  /**
   * Configures the Access-Control-Allow-Credentials header.
   * In production with specific origins, credentials can be enabled.
   * Disabled by default when using wildcard origin.
   * Note: credentials cannot be true when origin is '*'.
   */
  credentials: isProduction && process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*',

  /**
   * Configures the Access-Control-Allow-Headers header.
   * Specifies which headers can be used during the actual request.
   */
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

  /**
   * Configures the Access-Control-Expose-Headers header.
   * Specifies which headers can be exposed to the browser.
   */
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],

  /**
   * Configures the Access-Control-Max-Age header.
   * Indicates how long the results of a preflight request can be cached.
   * Set to 24 hours (86400 seconds) in production, shorter in development.
   */
  maxAge: isProduction ? 86400 : 3600,
};

// =============================================================================
// RATE LIMITING CONFIGURATION
// =============================================================================

/**
 * Default rate limit window in milliseconds (15 minutes).
 * Used when RATE_LIMIT_WINDOW environment variable is not set.
 * @type {number}
 */
const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

/**
 * Default maximum number of requests per rate limit window.
 * Used when RATE_LIMIT_MAX environment variable is not set.
 * @type {number}
 */
const DEFAULT_RATE_LIMIT_MAX = 100;

/**
 * Parses rate limit window from environment variable.
 * Returns default value if parsing fails or value is invalid.
 * 
 * @param {string|undefined} envValue - The RATE_LIMIT_WINDOW environment variable
 * @returns {number} Rate limit window in milliseconds
 */
function parseRateLimitWindow(envValue) {
  if (!envValue) {
    return DEFAULT_RATE_LIMIT_WINDOW_MS;
  }

  const parsed = parseInt(envValue, 10);
  
  // Validate parsed value is a positive number
  if (isNaN(parsed) || parsed <= 0) {
    console.warn(
      `Invalid RATE_LIMIT_WINDOW value "${envValue}". ` +
      `Using default: ${DEFAULT_RATE_LIMIT_WINDOW_MS}ms`
    );
    return DEFAULT_RATE_LIMIT_WINDOW_MS;
  }

  return parsed;
}

/**
 * Parses rate limit max from environment variable.
 * Returns default value if parsing fails or value is invalid.
 * 
 * @param {string|undefined} envValue - The RATE_LIMIT_MAX environment variable
 * @returns {number} Maximum number of requests per window
 */
function parseRateLimitMax(envValue) {
  if (!envValue) {
    return DEFAULT_RATE_LIMIT_MAX;
  }

  const parsed = parseInt(envValue, 10);
  
  // Validate parsed value is a positive number
  if (isNaN(parsed) || parsed <= 0) {
    console.warn(
      `Invalid RATE_LIMIT_MAX value "${envValue}". ` +
      `Using default: ${DEFAULT_RATE_LIMIT_MAX}`
    );
    return DEFAULT_RATE_LIMIT_MAX;
  }

  return parsed;
}

/**
 * Rate limiting configuration options for express-rate-limit middleware.
 * 
 * Protects against brute-force attacks and DoS by limiting the number
 * of requests from a single IP address within a time window.
 * 
 * @type {Object}
 * @see https://express-rate-limit.mintlify.app/
 */
const rateLimitOptions = {
  /**
   * Time window for rate limiting in milliseconds.
   * Configurable via RATE_LIMIT_WINDOW environment variable.
   * Default: 15 minutes (900000ms)
   */
  windowMs: parseRateLimitWindow(process.env.RATE_LIMIT_WINDOW),

  /**
   * Maximum number of requests allowed per windowMs.
   * Configurable via RATE_LIMIT_MAX environment variable.
   * Default: 100 requests per window
   */
  limit: parseRateLimitMax(process.env.RATE_LIMIT_MAX),

  /**
   * Enable modern RateLimit headers conforming to draft-8 specification.
   * Sends RateLimit-Limit, RateLimit-Remaining, and RateLimit-Reset headers.
   * @see https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
   */
  standardHeaders: 'draft-8',

  /**
   * Disable legacy X-RateLimit-* headers.
   * These deprecated headers are replaced by the standard headers above.
   */
  legacyHeaders: false,

  /**
   * Response body sent when rate limit is exceeded.
   * Returns a JSON object with error information for client handling.
   */
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
    retryAfter: 'See Retry-After header for wait time',
  },

  /**
   * Skip rate limiting for successful requests in development.
   * Useful for testing without being rate limited.
   * In production, all requests count toward the limit.
   */
  skipSuccessfulRequests: false,

  /**
   * Skip rate limiting for failed requests (4xx, 5xx responses).
   * Disabled to ensure all requests are counted.
   */
  skipFailedRequests: false,

  /**
   * Custom key generator function.
   * Uses the request IP address by default (built-in behavior).
   * Can be customized for API key-based limiting if needed.
   */
  keyGenerator: undefined, // Uses default IP-based key generation

  /**
   * Custom handler for rate-limited requests.
   * Returns 429 Too Many Requests with JSON error body.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @param {Object} options - Rate limiter options
   */
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  },

  /**
   * Store configuration.
   * Uses built-in memory store by default.
   * For distributed systems, consider using Redis or other external stores.
   */
  store: undefined, // Uses default MemoryStore
};

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Export security configuration objects and environment flags.
 * Uses CommonJS module.exports for Node.js compatibility.
 */
module.exports = {
  // Environment detection flags
  isProduction,
  isDevelopment,

  // Middleware configuration options
  helmetOptions,
  corsOptions,
  rateLimitOptions,
};
