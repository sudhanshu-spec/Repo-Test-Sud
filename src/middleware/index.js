/**
 * Middleware Stack Registrar
 *
 * Registers the production middleware stack onto a provided Express `app` instance
 * in the strict, behavior-preserving order:
 *
 *   1. helmet      — Security HTTP headers (X-Content-Type-Options, X-Frame-Options, etc.)
 *   2. compression — Gzip/deflate response compression
 *   3. cors        — Cross-Origin Resource Sharing
 *   4. morgan      — HTTP request logging ('combined' in production, 'dev' otherwise)
 *
 * This registrar is invoked by `src/app.js` exactly once, after `express()` is
 * instantiated and before any routes are mounted, so the middleware stack
 * applies to every incoming request.
 *
 * Migrated verbatim from server.js lines 56, 59, 62, 65 — no options or
 * ordering have been changed. See AAP Risk B2 (Middleware Registration
 * Order) and Risk B5 (Morgan Format-Selection Expression).
 */

'use strict';

// Production middleware packages (all declared in package.json dependencies).
// The order of these require statements is NOT behaviorally significant; only
// the order of the app.use(...) calls inside registerMiddleware matters.
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');

/**
 * Register the production middleware stack onto an Express app.
 *
 * Mutates the provided `app` by attaching middleware in this exact order:
 * helmet → compression → cors → morgan. No additional middleware is registered.
 *
 * The morgan format-selection ternary `process.env.NODE_ENV === 'production'
 * ? 'combined' : 'dev'` is preserved verbatim from the source `server.js`
 * (line 65) to guarantee identical log output semantics across environments.
 * Because the ternary is evaluated inside the function body (not at module
 * load), it correctly observes any NODE_ENV value that `src/config/env.js`
 * has loaded via `dotenv.config()` prior to this function being invoked.
 *
 * @param {import('express').Express} app - The Express application instance to configure.
 * @returns {void}
 */
function registerMiddleware(app) {
  // 1) Security middleware — sets various HTTP headers for protection against
  //    common vulnerabilities (matches server.js:L56).
  app.use(helmet());

  // 2) Compression middleware — gzip/deflate compression reduces response sizes
  //    by up to 70% (matches server.js:L59).
  app.use(compression());

  // 3) CORS middleware — enables controlled cross-origin requests for API
  //    consumers (matches server.js:L62).
  app.use(cors());

  // 4) Request logging middleware — 'combined' for production (Apache-style),
  //    'dev' for development. The ternary MUST remain inline and read
  //    process.env.NODE_ENV directly (matches server.js:L65 verbatim).
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

module.exports = registerMiddleware;
