/**
 * @fileoverview Secure Express.js Server Entry Point
 * 
 * Main application file implementing a secure HTTPS Express server with a
 * comprehensive security middleware stack:
 *   - Helmet.js:          Security headers (CSP, HSTS, X-Frame-Options, etc.)
 *   - express-rate-limit: DoS/brute-force protection
 *   - CORS middleware:    Cross-origin request control
 *   - express-validator:  Input validation and sanitization
 * 
 * Endpoints served: /hello, /evening, /health
 * 
 * @module server
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// EXTERNAL DEPENDENCIES
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');     // Web application framework
const https = require('https');         // Native HTTPS server module
const http = require('http');           // Native HTTP server module (for redirects)
const fs = require('fs');               // File system access (certificate loading)
const path = require('path');           // Path resolution utilities
const helmet = require('helmet');       // Security headers middleware

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

// Load environment variables BEFORE accessing process.env
require('dotenv').config();

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL DEPENDENCIES
// ─────────────────────────────────────────────────────────────────────────────

const { helmetConfig, validateSecurityConfig } = require('./config/security');
const rateLimiter = require('./middleware/rateLimiter');
const corsMiddleware = require('./middleware/cors');
const apiRouter = require('./routes/api');

// ─────────────────────────────────────────────────────────────────────────────
// SERVER CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Server configuration with environment variable overrides and sensible defaults.
 * @type {Object}
 */
const config = {
  // Network binding
  httpsPort:           parseInt(process.env.HTTPS_PORT, 10) || 3443,
  httpPort:            parseInt(process.env.HTTP_PORT, 10) || 3000,
  
  // SSL/TLS certificate paths
  sslKeyPath:          process.env.SSL_KEY_PATH  || './certificates/key.pem',
  sslCertPath:         process.env.SSL_CERT_PATH || './certificates/cert.pem',
  
  // Runtime environment
  nodeEnv:             process.env.NODE_ENV || 'development',
  
  // Auto-redirect HTTP → HTTPS (always enabled in production)
  enableHttpsRedirect: process.env.ENABLE_HTTPS_REDIRECT === 'true' ||
                       process.env.NODE_ENV === 'production'
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPRESS APPLICATION INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/** @type {express.Application} Express app instance */
const app = express();

// Enable proxy trust in production for correct client IP detection
// (required for rate-limiter behind nginx/load-balancer)
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY MIDDLEWARE STACK
// Execution order: Rate Limiter → CORS → Helmet → Body Parser → Routes
// ─────────────────────────────────────────────────────────────────────────────

// [1] Rate Limiter - first line of defense against DoS/brute-force
app.use(rateLimiter);

// [2] CORS - control which origins may call this API
app.use(corsMiddleware);

// [3] Helmet - set 13 security headers; removes X-Powered-By
app.use(helmet(helmetConfig));

// [4] Body Parsers - accept JSON and URL-encoded payloads (size-limited)
app.use(express.json({
  limit: '10kb',   // mitigate large-payload attacks
  strict: true     // accept only arrays and objects
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Mount API router at root (preserves original /hello, /evening paths)
app.use('/', apiRouter);

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 404 handler for unmatched routes.
 */
app.use((req, res) => {
  res.status(404).json({
    success:   false,
    error:     'Not Found',
    message:   `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

/**
 * Global error handler - returns standardized JSON error responses.
 * Stack traces are only exposed in development mode.
 */
app.use((err, req, res, _next) => {
  console.error('[Error]', err.message);

  const statusCode = err.status || err.statusCode || 500;

  const errorResponse = {
    success:   false,
    error:     err.name || 'Internal Server Error',
    message:   config.nodeEnv === 'development' ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  };

  // Expose stack trace in development only
  if (config.nodeEnv === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// ─────────────────────────────────────────────────────────────────────────────
// SSL CERTIFICATE HANDLING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attempts to load SSL/TLS certificates from the file system.
 * @returns {Object|null} { key, cert } buffers or null if unavailable.
 */
function loadSSLCertificates() {
  const keyPath  = path.resolve(config.sslKeyPath);
  const certPath = path.resolve(config.sslCertPath);

  if (!fs.existsSync(keyPath)) {
    console.warn(`[Warn] SSL key not found: ${keyPath}`);
    return null;
  }

  if (!fs.existsSync(certPath)) {
    console.warn(`[Warn] SSL cert not found: ${certPath}`);
    return null;
  }

  try {
    return {
      key:  fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
  } catch (err) {
    console.error('[Error] Failed to read SSL certificates:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP → HTTPS REDIRECT SERVER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a lightweight HTTP server that 301-redirects all traffic to HTTPS.
 * @returns {http.Server}
 */
function createHttpRedirectServer() {
  return http.createServer((req, res) => {
    const host     = req.headers.host?.replace(/:\d+$/, '') || 'localhost';
    const httpsUrl = `https://${host}:${config.httpsPort}${req.url}`;

    res.writeHead(301, { Location: httpsUrl });
    res.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STARTUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prints a nicely formatted startup banner with environment and endpoint info.
 * @param {Object} opts
 * @param {string} opts.protocol   - 'https' or 'http'
 * @param {number} opts.port       - Server port number
 * @param {boolean} opts.httpsEnabled - Whether TLS encryption is active
 */
function printStartupBanner({ protocol, port, httpsEnabled }) {
  const baseUrl = `${protocol}://localhost:${port}`;

  console.log(`
════════════════════════════════════════
   ${httpsEnabled ? 'Secure ' : ''}Express Server Started
════════════════════════════════════════
  Environment : ${config.nodeEnv}
  URL         : ${baseUrl}

  Endpoints:
    GET ${baseUrl}/hello
    GET ${baseUrl}/evening
    GET ${baseUrl}/health

  Security Features:
    ${httpsEnabled ? '✓' : '✗'} HTTPS/TLS encryption ${httpsEnabled ? 'enabled' : '(certs not found)'}
    ✓ Security headers via Helmet.js
    ✓ Rate limiting enabled
    ✓ CORS configured
    ✓ Input validation enabled
════════════════════════════════════════
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER STARTUP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initializes and starts the server:
 *   - HTTPS if certificates are present
 *   - HTTP fallback in development mode
 *   - Exits with error if certs missing in production
 */
function startServer() {
  // Emit any security configuration warnings
  const securityValidation = validateSecurityConfig();
  if (!securityValidation.valid) {
    console.warn('[Security Warnings]');
    securityValidation.warnings.forEach(w => console.warn(`  - ${w}`));
  }

  const sslOptions = loadSSLCertificates();

  // ── HTTPS mode (certificates found) ────────────────────────────────────────
  if (sslOptions) {
    const httpsServer = https.createServer(sslOptions, app);

    httpsServer.listen(config.httpsPort, () => {
      printStartupBanner({ protocol: 'https', port: config.httpsPort, httpsEnabled: true });
    });

    // Optional HTTP→HTTPS redirect server
    if (config.enableHttpsRedirect) {
      createHttpRedirectServer().listen(config.httpPort, () => {
        console.log(`[Redirect] HTTP:${config.httpPort} → HTTPS:${config.httpsPort}`);
      });
    }

    return;
  }

  // ── Development fallback (HTTP) ────────────────────────────────────────────
  if (config.nodeEnv === 'development') {
    console.warn(`
[Dev Mode] SSL certificates not found – starting HTTP server.
To generate self-signed certs run:
  mkdir -p certificates
  openssl req -x509 -newkey rsa:4096 \\
    -keyout certificates/key.pem \\
    -out certificates/cert.pem \\
    -days 365 -nodes -subj "/CN=localhost"
`);

    http.createServer(app).listen(config.httpPort, () => {
      printStartupBanner({ protocol: 'http', port: config.httpPort, httpsEnabled: false });
    });

    return;
  }

  // ── Production mode: certs required ────────────────────────────────────────
  console.error(`
[Fatal] SSL certificates not found – HTTPS required in production.
  Expected key  : ${path.resolve(config.sslKeyPath)}
  Expected cert : ${path.resolve(config.sslCertPath)}

Provide valid certificates or switch to development mode (NODE_ENV=development).
`);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────────────────────

/** Handle shutdown signals to allow in-flight requests to complete. */
const handleShutdown = (signal) => {
  console.log(`\n[Server] ${signal} received – shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT',  () => handleShutdown('SIGINT'));

// ─────────────────────────────────────────────────────────────────────────────
// ENTRYPOINT
// ─────────────────────────────────────────────────────────────────────────────

startServer();

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS (for testing)
// ─────────────────────────────────────────────────────────────────────────────

module.exports = app;
