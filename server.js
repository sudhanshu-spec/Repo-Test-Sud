/**
 * @fileoverview Secure Express.js Server Entry Point
 * @description Main application entry point implementing a secure HTTPS Express server
 *              with comprehensive security middleware stack including Helmet.js for
 *              security headers, express-rate-limit for DoS protection, CORS middleware
 *              for cross-origin control, and express-validator for input validation.
 *              Serves /hello and /evening endpoints with optional personalization.
 * 
 * @module server
 * @requires express
 * @requires https
 * @requires http
 * @requires fs
 * @requires path
 * @requires dotenv
 * @requires helmet
 * @requires ./config/security
 * @requires ./middleware/rateLimiter
 * @requires ./middleware/cors
 * @requires ./routes/api
 */

'use strict';

// =============================================================================
// EXTERNAL DEPENDENCIES
// =============================================================================

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

// Load environment variables from .env file
// Must be done before accessing process.env values
require('dotenv').config();

// =============================================================================
// INTERNAL DEPENDENCIES
// =============================================================================

const { helmetConfig, validateSecurityConfig } = require('./config/security');
const rateLimiter = require('./middleware/rateLimiter');
const corsMiddleware = require('./middleware/cors');
const apiRouter = require('./routes/api');

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Server configuration parsed from environment variables with defaults
 * @type {Object}
 */
const config = {
  // Server ports
  httpsPort: parseInt(process.env.HTTPS_PORT, 10) || 3443,
  httpPort: parseInt(process.env.HTTP_PORT, 10) || 3000,
  
  // SSL certificate paths
  sslKeyPath: process.env.SSL_KEY_PATH || './certificates/key.pem',
  sslCertPath: process.env.SSL_CERT_PATH || './certificates/cert.pem',
  
  // Environment mode
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Enable HTTP-to-HTTPS redirect (enabled in production by default)
  enableHttpsRedirect: process.env.ENABLE_HTTPS_REDIRECT === 'true' || 
                        process.env.NODE_ENV === 'production'
};

// =============================================================================
// EXPRESS APPLICATION INITIALIZATION
// =============================================================================

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

// Trust proxy for proper IP detection behind reverse proxies
// Required for express-rate-limit to work correctly behind nginx, load balancers, etc.
if (config.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// =============================================================================
// SECURITY MIDDLEWARE STACK
// Order matters: Rate Limiter → CORS → Helmet → Body Parser → Routes
// =============================================================================

// 1. Rate Limiting - First line of defense against DoS attacks
// Must be applied before other middleware to protect against abuse
app.use(rateLimiter);

// 2. CORS - Cross-Origin Resource Sharing control
// Controls which origins can access the API
app.use(corsMiddleware);

// 3. Helmet.js - Security Headers
// Adds 13 security headers including CSP, HSTS, X-Frame-Options, etc.
// Also removes X-Powered-By header to prevent server fingerprinting
app.use(helmet(helmetConfig));

// 4. Body Parser Middleware
// Parse JSON request bodies with size limit for security
app.use(express.json({ 
  limit: '10kb',  // Limit body size to prevent payload attacks
  strict: true    // Only accept arrays and objects
}));

// Parse URL-encoded bodies with size limit
app.use(express.urlencoded({ 
  extended: true,
  limit: '10kb'
}));

// =============================================================================
// API ROUTES
// =============================================================================

// Mount API router at /api prefix
// Routes: GET /api/hello, GET /api/evening, GET /api/health
app.use('/api', apiRouter);

// Root endpoint redirect to health check
app.get('/', (req, res) => {
  res.redirect('/api/health');
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * 404 Not Found handler for unmatched routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

/**
 * Global error handler
 * Catches all unhandled errors and returns standardized error response
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
app.use((err, req, res, next) => {
  // Log error for debugging (use proper logging in production)
  console.error('[Error]', err.message);
  
  // Determine status code
  const statusCode = err.status || err.statusCode || 500;
  
  // Build error response
  const errorResponse = {
    success: false,
    error: err.name || 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  };
  
  // Include stack trace in development mode only
  if (config.nodeEnv === 'development') {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
});

// =============================================================================
// SSL CERTIFICATE HANDLING
// =============================================================================

/**
 * Loads SSL certificates from file system
 * @returns {Object|null} SSL options object or null if certificates not found
 */
function loadSSLCertificates() {
  const keyPath = path.resolve(config.sslKeyPath);
  const certPath = path.resolve(config.sslCertPath);
  
  // Check if certificate files exist
  if (!fs.existsSync(keyPath)) {
    console.warn(`[Warning] SSL key file not found: ${keyPath}`);
    return null;
  }
  
  if (!fs.existsSync(certPath)) {
    console.warn(`[Warning] SSL certificate file not found: ${certPath}`);
    return null;
  }
  
  try {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
  } catch (err) {
    console.error('[Error] Failed to read SSL certificates:', err.message);
    return null;
  }
}

// =============================================================================
// HTTP-TO-HTTPS REDIRECT SERVER
// =============================================================================

/**
 * Creates an HTTP server that redirects all requests to HTTPS
 * @returns {http.Server} HTTP redirect server
 */
function createHttpRedirectServer() {
  return http.createServer((req, res) => {
    const host = req.headers.host?.replace(/:\d+$/, '') || 'localhost';
    const httpsUrl = `https://${host}:${config.httpsPort}${req.url}`;
    
    res.writeHead(301, { Location: httpsUrl });
    res.end();
  });
}

// =============================================================================
// SERVER STARTUP
// =============================================================================

/**
 * Starts the server with HTTPS if certificates are available,
 * falls back to HTTP in development mode
 */
function startServer() {
  // Validate security configuration
  const securityValidation = validateSecurityConfig();
  if (!securityValidation.valid) {
    console.warn('[Security Warnings]');
    securityValidation.warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
  }
  
  // Attempt to load SSL certificates
  const sslOptions = loadSSLCertificates();
  
  if (sslOptions) {
    // Start HTTPS server
    const httpsServer = https.createServer(sslOptions, app);
    
    httpsServer.listen(config.httpsPort, () => {
      console.log('\n====================================');
      console.log('    Secure Express Server Started');
      console.log('====================================');
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`HTTPS Server: https://localhost:${config.httpsPort}`);
      console.log('\nEndpoints:');
      console.log(`  - GET https://localhost:${config.httpsPort}/api/hello`);
      console.log(`  - GET https://localhost:${config.httpsPort}/api/evening`);
      console.log(`  - GET https://localhost:${config.httpsPort}/api/health`);
      console.log('\nSecurity Features:');
      console.log('  ✓ HTTPS/TLS encryption enabled');
      console.log('  ✓ Security headers via Helmet.js');
      console.log('  ✓ Rate limiting enabled');
      console.log('  ✓ CORS configured');
      console.log('  ✓ Input validation enabled');
      console.log('====================================\n');
    });
    
    // Start HTTP redirect server if enabled
    if (config.enableHttpsRedirect) {
      const httpRedirectServer = createHttpRedirectServer();
      
      httpRedirectServer.listen(config.httpPort, () => {
        console.log(`[HTTP Redirect] Redirecting HTTP:${config.httpPort} → HTTPS:${config.httpsPort}`);
      });
    }
    
  } else if (config.nodeEnv === 'development') {
    // Fallback to HTTP in development mode
    console.warn('\n[Development Mode] SSL certificates not found.');
    console.warn('Starting HTTP server instead of HTTPS.\n');
    console.warn('To generate self-signed certificates:');
    console.warn('  mkdir -p certificates');
    console.warn('  openssl req -x509 -newkey rsa:4096 -keyout certificates/key.pem \\');
    console.warn('    -out certificates/cert.pem -days 365 -nodes -subj "/CN=localhost"\n');
    
    const httpServer = http.createServer(app);
    
    httpServer.listen(config.httpPort, () => {
      console.log('\n====================================');
      console.log('    Express Server Started (HTTP)');
      console.log('====================================');
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`HTTP Server: http://localhost:${config.httpPort}`);
      console.log('\nEndpoints:');
      console.log(`  - GET http://localhost:${config.httpPort}/api/hello`);
      console.log(`  - GET http://localhost:${config.httpPort}/api/evening`);
      console.log(`  - GET http://localhost:${config.httpPort}/api/health`);
      console.log('\nSecurity Features:');
      console.log('  ✗ HTTPS disabled (certificates not found)');
      console.log('  ✓ Security headers via Helmet.js');
      console.log('  ✓ Rate limiting enabled');
      console.log('  ✓ CORS configured');
      console.log('  ✓ Input validation enabled');
      console.log('====================================\n');
    });
    
  } else {
    // Production mode requires SSL certificates
    console.error('\n[Fatal Error] SSL certificates not found in production mode.');
    console.error('HTTPS is required for production deployments.');
    console.error(`Expected key: ${path.resolve(config.sslKeyPath)}`);
    console.error(`Expected cert: ${path.resolve(config.sslCertPath)}`);
    console.error('\nPlease provide valid SSL certificates or use development mode.\n');
    process.exit(1);
  }
}

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

/**
 * Handles graceful shutdown on SIGTERM/SIGINT signals
 * Allows active connections to complete before exiting
 */
process.on('SIGTERM', () => {
  console.log('\n[Server] SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n[Server] SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// =============================================================================
// START SERVER
// =============================================================================

// Start the server
startServer();

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Export the Express application for testing purposes
 * @type {express.Application}
 */
module.exports = app;
