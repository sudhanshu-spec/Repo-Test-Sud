/**
 * @fileoverview Centralized Security Configuration Module
 * 
 * This module exports configuration objects for security middleware:
 * - Helmet.js (security headers)
 * - CORS (Cross-Origin Resource Sharing)
 * - Rate Limiting (request throttling)
 * 
 * All configurations support environment variable overrides for flexibility
 * across different deployment environments.
 * 
 * @module config/security
 * @see https://helmetjs.github.io/
 * @see https://www.npmjs.com/package/cors
 * @see https://www.npmjs.com/package/express-rate-limit
 */

'use strict';

/**
 * Parses CORS allowed origins from environment variable
 * Supports comma-separated list of origins
 * 
 * @returns {string[]} Array of allowed origin URLs
 * @example
 * // CORS_ALLOWED_ORIGINS="http://localhost:3000,https://example.com"
 * // Returns: ['http://localhost:3000', 'https://example.com']
 */
const parseAllowedOrigins = () => {
  const originsEnv = process.env.CORS_ALLOWED_ORIGINS;
  
  if (!originsEnv || originsEnv.trim() === '') {
    // Default to localhost for development
    return ['http://localhost:3000'];
  }
  
  // Parse comma-separated origins and trim whitespace
  return originsEnv
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
};

/**
 * Parses an integer from environment variable with a default fallback
 * 
 * @param {string} envValue - The environment variable value
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed integer or default value
 */
const parseIntEnv = (envValue, defaultValue) => {
  if (!envValue) {
    return defaultValue;
  }
  
  const parsed = parseInt(envValue, 10);
  
  // Return default if parsing results in NaN or invalid number
  if (isNaN(parsed) || parsed < 0) {
    return defaultValue;
  }
  
  return parsed;
};

/**
 * Helmet.js Security Headers Configuration
 * 
 * Configures HTTP security headers to protect against common web vulnerabilities:
 * - Content-Security-Policy (CSP): Prevents XSS and data injection attacks
 * - Strict-Transport-Security (HSTS): Forces HTTPS connections
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME-type sniffing
 * - Cross-Origin-Resource-Policy: Controls resource sharing
 * - Cross-Origin-Opener-Policy: Isolates browsing context
 * 
 * Note: Helmet automatically removes the X-Powered-By header
 * 
 * @type {Object}
 * @property {Object} contentSecurityPolicy - CSP directive configuration
 * @property {Object} hsts - HTTP Strict Transport Security settings
 * @property {number} hsts.maxAge - Duration in seconds to cache HSTS (1 year = 31536000)
 * @property {boolean} hsts.includeSubDomains - Apply HSTS to all subdomains
 * @property {Object} crossOriginResourcePolicy - CORP policy settings
 * @property {Object} crossOriginOpenerPolicy - COOP policy settings
 * 
 * @see https://helmetjs.github.io/
 * @see https://owasp.org/www-project-secure-headers/
 */
const helmetConfig = {
  /**
   * Content Security Policy configuration
   * Defines approved sources for content loading to prevent XSS attacks
   */
  contentSecurityPolicy: {
    directives: {
      // Only allow resources from the same origin by default
      defaultSrc: ["'self'"],
      
      // Script sources - restrict to same origin and disable inline scripts
      scriptSrc: ["'self'"],
      
      // Style sources - allow same origin
      styleSrc: ["'self'"],
      
      // Image sources - allow same origin and data URIs for inline images
      imgSrc: ["'self'", 'data:'],
      
      // Font sources - allow same origin
      fontSrc: ["'self'"],
      
      // Object sources - block all plugins (Flash, Java, etc.)
      objectSrc: ["'none'"],
      
      // Base URI - restrict to same origin
      baseUri: ["'self'"],
      
      // Form action targets - restrict to same origin
      formAction: ["'self'"],
      
      // Frame ancestors - prevent clickjacking (equivalent to X-Frame-Options)
      frameAncestors: ["'self'"],
      
      // Upgrade insecure requests to HTTPS
      upgradeInsecureRequests: [],
      
      // Block all mixed content
      blockAllMixedContent: []
    }
  },
  
  /**
   * HTTP Strict Transport Security (HSTS) configuration
   * Forces browsers to use HTTPS for all future requests
   */
  hsts: {
    // Cache HSTS directive for 1 year (31536000 seconds)
    maxAge: 31536000,
    
    // Apply HSTS policy to all subdomains
    includeSubDomains: true,
    
    // Don't include in browser preload lists by default
    // Set to true only for production with valid certificates
    preload: false
  },
  
  /**
   * Cross-Origin Resource Policy (CORP) configuration
   * Controls which origins can include resources from this server
   */
  crossOriginResourcePolicy: {
    // Allow resources to be loaded by same-origin pages only
    // Options: 'same-origin', 'same-site', 'cross-origin'
    policy: 'same-origin'
  },
  
  /**
   * Cross-Origin Opener Policy (COOP) configuration
   * Isolates the browsing context to prevent cross-origin attacks
   */
  crossOriginOpenerPolicy: {
    // Isolate the browsing context from cross-origin documents
    // Options: 'same-origin', 'same-origin-allow-popups', 'unsafe-none'
    policy: 'same-origin'
  },
  
  /**
   * Cross-Origin Embedder Policy (COEP) configuration
   * Controls embedding of cross-origin resources
   */
  crossOriginEmbedderPolicy: {
    // Require CORP/CORS for all cross-origin resources
    // Options: 'require-corp', 'credentialless', false
    policy: 'require-corp'
  },
  
  /**
   * X-Content-Type-Options configuration
   * Prevents browsers from MIME-type sniffing
   * Always enabled by default in Helmet (nosniff)
   */
  xContentTypeOptions: true,
  
  /**
   * X-Frame-Options configuration
   * Prevents clickjacking by controlling iframe embedding
   * Options: 'DENY', 'SAMEORIGIN'
   */
  frameguard: {
    action: 'sameorigin'
  },
  
  /**
   * X-DNS-Prefetch-Control configuration
   * Controls DNS prefetching to prevent privacy leaks
   */
  dnsPrefetchControl: {
    allow: false
  },
  
  /**
   * Referrer-Policy configuration
   * Controls how much referrer information is included with requests
   */
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  
  /**
   * X-Download-Options configuration
   * Prevents IE from executing downloads in site context
   */
  ieNoOpen: true,
  
  /**
   * X-Permitted-Cross-Domain-Policies configuration
   * Controls Adobe Flash and PDF behavior
   */
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  }
};

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * Controls which origins can access the API and what methods/headers are allowed.
 * Origin whitelist can be configured via CORS_ALLOWED_ORIGINS environment variable.
 * 
 * @type {Object}
 * @property {string[]|Function} origin - Allowed origins or validation function
 * @property {string[]} methods - Allowed HTTP methods
 * @property {number} optionsSuccessStatus - Status code for successful OPTIONS requests
 * @property {string[]} allowedHeaders - Headers that can be used in actual request
 * @property {boolean} credentials - Whether to include credentials in CORS requests
 * @property {number} maxAge - How long preflight results can be cached (in seconds)
 * 
 * @see https://www.npmjs.com/package/cors
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 */
const corsConfig = {
  /**
   * Allowed origins configuration
   * Uses environment variable CORS_ALLOWED_ORIGINS or defaults to localhost
   * Supports dynamic origin validation function for flexibility
   */
  origin: (origin, callback) => {
    const allowedOrigins = parseAllowedOrigins();
    
    // Allow requests with no origin (same-origin, curl, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the request origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Reject requests from non-whitelisted origins
    return callback(new Error('CORS policy: Origin not allowed'), false);
  },
  
  /**
   * Allowed HTTP methods
   * GET: Retrieve resources
   * POST: Create/submit data
   * OPTIONS: Preflight requests for CORS
   */
  methods: ['GET', 'POST', 'OPTIONS'],
  
  /**
   * Status code for successful OPTIONS (preflight) requests
   * Using 200 instead of 204 for legacy browser compatibility
   * Some legacy browsers (IE11, older SmartTVs) fail on 204
   */
  optionsSuccessStatus: 200,
  
  /**
   * Headers that clients are allowed to use in requests
   * Content-Type: Required for JSON payloads
   * Authorization: For authentication tokens
   * X-Requested-With: Common AJAX identifier
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  
  /**
   * Whether to include credentials (cookies, authorization headers)
   * Set to true if your API needs to handle authenticated requests
   */
  credentials: true,
  
  /**
   * How long (in seconds) browsers can cache preflight response
   * 86400 seconds = 24 hours
   * Reduces number of preflight requests for better performance
   */
  maxAge: 86400,
  
  /**
   * Headers exposed to the client-side JavaScript
   * These headers can be accessed in the response by the browser
   */
  exposedHeaders: [
    'Content-Length',
    'X-Request-Id',
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset'
  ]
};

/**
 * Rate Limiting Configuration
 * 
 * Protects the API from abuse by limiting the number of requests
 * from a single IP address within a time window.
 * 
 * Configuration can be overridden via environment variables:
 * - RATE_LIMIT_WINDOW_MS: Time window in milliseconds (default: 900000 = 15 minutes)
 * - RATE_LIMIT_MAX: Maximum requests per window (default: 100)
 * 
 * @type {Object}
 * @property {number} windowMs - Time window for rate limiting in milliseconds
 * @property {number} limit - Maximum number of requests per window per IP
 * @property {boolean} standardHeaders - Include standard RateLimit headers (draft-8)
 * @property {boolean} legacyHeaders - Include legacy X-RateLimit headers
 * @property {string|Object} message - Response when rate limit is exceeded
 * 
 * @see https://www.npmjs.com/package/express-rate-limit
 * @see https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
 */
const rateLimitConfig = {
  /**
   * Time window for rate limiting in milliseconds
   * Default: 15 minutes (900000ms)
   * Can be overridden via RATE_LIMIT_WINDOW_MS environment variable
   */
  windowMs: parseIntEnv(process.env.RATE_LIMIT_WINDOW_MS, 900000),
  
  /**
   * Maximum number of requests allowed per IP within the time window
   * Default: 100 requests per 15 minutes
   * Can be overridden via RATE_LIMIT_MAX environment variable
   */
  limit: parseIntEnv(process.env.RATE_LIMIT_MAX, 100),
  
  /**
   * Enable standard RateLimit headers per IETF draft-8 specification
   * Headers: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
   * Recommended for modern clients
   */
  standardHeaders: true,
  
  /**
   * Disable legacy X-RateLimit-* headers
   * These are non-standard and deprecated
   * Set to false to reduce response header size
   */
  legacyHeaders: false,
  
  /**
   * Response message when rate limit is exceeded
   * Returns JSON object with error details
   */
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'You have exceeded the maximum number of allowed requests. Please try again later.',
    retryAfter: 'See Retry-After header for wait time'
  },
  
  /**
   * Skip successful requests from counting against the limit
   * Set to false to count all requests
   */
  skipSuccessfulRequests: false,
  
  /**
   * Skip failed requests from counting against the limit
   * Set to false to count all requests
   */
  skipFailedRequests: false,
  
  /**
   * Handler function called when rate limit is exceeded
   * Returns 429 status with JSON error response
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @param {Object} options - Rate limit options
   */
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
  
  /**
   * Status code returned when rate limit is exceeded
   */
  statusCode: 429,
  
  /**
   * Skip rate limiting in certain conditions
   * Can be used to whitelist certain IPs or routes
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {boolean} True to skip rate limiting
   */
  skip: (req, res) => {
    // Skip rate limiting for health check endpoints
    if (req.path === '/health' || req.path === '/healthz') {
      return true;
    }
    return false;
  },
  
  /**
   * Key generator function for identifying unique clients
   * Uses IP address by default
   * Supports proxied requests via X-Forwarded-For header
   * 
   * @param {Object} req - Express request object
   * @returns {string} Unique identifier for the client
   */
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if behind a proxy, otherwise use IP
    return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  }
};

/**
 * Get parsed allowed origins for CORS
 * Useful for debugging and logging purposes
 * 
 * @returns {string[]} Array of allowed origin URLs
 */
const getAllowedOrigins = () => {
  return parseAllowedOrigins();
};

/**
 * Validate security configuration
 * Checks for potential misconfigurations
 * 
 * @returns {Object} Validation result with status and warnings
 */
const validateSecurityConfig = () => {
  const warnings = [];
  const origins = parseAllowedOrigins();
  
  // Check for wildcard origins (security risk)
  if (origins.includes('*')) {
    warnings.push('CORS: Wildcard origin (*) detected. This allows all origins and may be a security risk.');
  }
  
  // Check for HTTP origins in production
  if (process.env.NODE_ENV === 'production') {
    const httpOrigins = origins.filter(o => o.startsWith('http://'));
    if (httpOrigins.length > 0) {
      warnings.push(`CORS: HTTP origins detected in production: ${httpOrigins.join(', ')}. Consider using HTTPS only.`);
    }
  }
  
  // Check rate limit configuration
  if (rateLimitConfig.limit > 1000) {
    warnings.push('Rate Limit: Very high limit detected. Consider lowering for better protection.');
  }
  
  if (rateLimitConfig.windowMs < 60000) {
    warnings.push('Rate Limit: Very short window detected. Consider using at least 1 minute windows.');
  }
  
  return {
    valid: warnings.length === 0,
    warnings: warnings
  };
};

// Export configuration objects for use in middleware setup
module.exports = {
  helmetConfig,
  corsConfig,
  rateLimitConfig,
  getAllowedOrigins,
  validateSecurityConfig
};
