/**
 * Express.js HTTP Server with Comprehensive Robustness Features
 * 
 * This server implements production-grade robustness including:
 * - Error handling with global 4-argument Express middleware and 404 handler
 * - Graceful shutdown with SIGTERM/SIGINT signal handlers and timeout mechanism
 * - Input validation with body-parser size limits
 * - Resource cleanup via server.close() for connection draining
 * - Process-level exception handlers for uncaughtException and unhandledRejection
 * 
 * Endpoints:
 * - GET /hello   - Returns "Hello world" (text/plain)
 * - GET /evening - Returns "Good evening" (text/plain)
 * - GET /        - Returns server status JSON
 * - GET /health  - Returns health check with uptime
 * 
 * @module server
 * @version 1.0.0
 */

'use strict';

// =============================================================================
// MODULE IMPORTS AND CONFIGURATION
// =============================================================================

const express = require('express');

// Server configuration constants
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Shutdown state flag - tracks whether server is in graceful shutdown mode
let isShuttingDown = false;

// Express application instance
const app = express();

// HTTP server instance - initialized when server starts listening
let server = null;

// =============================================================================
// REQUEST PROCESSING MIDDLEWARE CHAIN
// =============================================================================

/**
 * Shutdown check middleware
 * Rejects new connections during graceful shutdown with 503 Service Unavailable
 * Sets 'Connection: close' header to signal clients to close their connections
 */
app.use((req, res, next) => {
    if (isShuttingDown) {
        res.setHeader('Connection', 'close');
        return res.status(503).json({
            error: 'Server is shutting down',
            status: 503
        });
    }
    next();
});

/**
 * JSON body parser middleware with size limit
 * Limits payload size to 1mb to prevent oversized payload attacks
 */
app.use(express.json({ limit: '1mb' }));

/**
 * URL-encoded body parser middleware with size limit
 * Enables parsing of URL-encoded form data with extended mode
 */
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/**
 * Request logging middleware
 * Logs incoming requests with timestamp, method, URL, and client IP
 */
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`[${timestamp}] ${method} ${url} - ${ip}`);
    next();
});

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * GET /hello
 * Returns "Hello world" as plain text
 */
app.get('/hello', (req, res) => {
    res.type('text/plain').send('Hello world');
});

/**
 * GET /evening
 * Returns "Good evening" as plain text
 */
app.get('/evening', (req, res) => {
    res.type('text/plain').send('Good evening');
});

/**
 * GET /
 * Returns server status information as JSON
 */
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'Express.js Server is operational',
        timestamp: new Date().toISOString(),
        endpoints: ['/hello', '/evening', '/health']
    });
});

/**
 * GET /health
 * Health check endpoint returning server health status with uptime
 * Used by load balancers and orchestration systems to verify server availability
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage().heapUsed
    });
});

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

/**
 * 404 Not Found Handler
 * Catches all unmatched routes and creates a standardized 404 error
 * This middleware must be placed after all route definitions
 */
app.use((req, res, next) => {
    const error = new Error(`Not Found: ${req.method} ${req.url}`);
    error.status = 404;
    next(error);
});

/**
 * Global Error Middleware
 * Express requires 4-argument signature (err, req, res, next) for error handlers
 * Provides standardized JSON error responses with appropriate status codes
 * 
 * @param {Error} err - The error object passed from previous middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
app.use((err, req, res, next) => {
    // Determine appropriate status code (default to 500 for unhandled errors)
    const statusCode = err.status || 500;
    
    // Log error details for debugging (only log stack trace for 500 errors)
    if (statusCode === 500) {
        console.error(`[ERROR] ${err.message}`);
        console.error(err.stack);
    } else {
        console.warn(`[WARN] ${statusCode}: ${err.message}`);
    }
    
    // Send standardized JSON error response
    res.status(statusCode).json({
        error: err.message,
        status: statusCode
    });
});

// =============================================================================
// GRACEFUL SHUTDOWN HANDLER
// =============================================================================

/**
 * Graceful shutdown handler
 * Implements orderly shutdown process:
 * 1. Sets shutdown flag to reject new connections
 * 2. Starts timeout for forced exit (10 seconds)
 * 3. Stops accepting new connections via server.close()
 * 4. Waits for existing connections to complete
 * 5. Exits with appropriate code
 * 
 * @param {string} signal - The signal that triggered shutdown (SIGTERM, SIGINT, etc.)
 */
const gracefulShutdown = (signal) => {
    console.log(`\n[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);
    
    // Prevent multiple shutdown attempts
    if (isShuttingDown) {
        console.log('[SHUTDOWN] Shutdown already in progress...');
        return;
    }
    
    // Set flag to reject new connections via middleware
    isShuttingDown = true;
    
    // Set a timeout to force exit if graceful shutdown takes too long
    // 10 seconds is the recommended timeout for most scenarios
    const forceExitTimeout = setTimeout(() => {
        console.error('[SHUTDOWN] Forced exit due to timeout (10s exceeded)');
        process.exit(1);
    }, 10000);
    
    // Unref the timeout so it doesn't prevent the process from exiting naturally
    forceExitTimeout.unref();
    
    // Check if server is running
    if (!server) {
        console.log('[SHUTDOWN] Server not running. Exiting immediately.');
        clearTimeout(forceExitTimeout);
        process.exit(0);
        return;
    }
    
    // Stop accepting new connections while finishing existing ones
    server.close((err) => {
        if (err) {
            console.error('[SHUTDOWN] Error during server close:', err.message);
            clearTimeout(forceExitTimeout);
            process.exit(1);
            return;
        }
        
        console.log('[SHUTDOWN] Graceful shutdown complete. Exiting with code 0.');
        clearTimeout(forceExitTimeout);
        process.exit(0);
    });
    
    console.log('[SHUTDOWN] Server stopped accepting new connections. Draining existing...');
};

// =============================================================================
// PROCESS SIGNAL AND EXCEPTION HANDLERS
// =============================================================================

/**
 * SIGTERM Signal Handler
 * Triggered by process managers (PM2, Docker, Kubernetes) for graceful termination
 */
process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM');
});

/**
 * SIGINT Signal Handler
 * Triggered by Ctrl+C in terminal for graceful termination
 */
process.on('SIGINT', () => {
    gracefulShutdown('SIGINT');
});

/**
 * Uncaught Exception Handler
 * Catches synchronous errors that weren't handled by try/catch blocks
 * Logs the error and exits with failure code to allow process manager to restart
 * 
 * WARNING: The process should always exit after this event as the state is undefined
 */
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:');
    console.error(err.message);
    console.error(err.stack);
    
    // Exit with failure code - process manager should restart the service
    process.exit(1);
});

/**
 * Unhandled Promise Rejection Handler
 * Catches Promise rejections that weren't handled by .catch() blocks
 * Initiates graceful shutdown to prevent undefined state
 * 
 * Note: In Node.js 15+, unhandled rejections cause process exit by default
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Promise Rejection:');
    console.error('Reason:', reason);
    
    // Initiate graceful shutdown for unhandled rejections
    gracefulShutdown('UNHANDLED_REJECTION');
});

// =============================================================================
// SERVER START LOGIC
// =============================================================================

/**
 * Start the HTTP server
 * Only starts listening if this file is run directly (not imported for testing)
 */
if (require.main === module) {
    server = app.listen(PORT, HOST, () => {
        console.log('='.repeat(60));
        console.log('Express.js Server Started');
        console.log('='.repeat(60));
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Server running at http://${HOST}:${PORT}`);
        console.log(`Health check: http://${HOST}:${PORT}/health`);
        console.log('='.repeat(60));
        console.log('Available endpoints:');
        console.log(`  GET /       - Server status`);
        console.log(`  GET /hello  - Returns "Hello world"`);
        console.log(`  GET /evening - Returns "Good evening"`);
        console.log(`  GET /health - Health check with uptime`);
        console.log('='.repeat(60));
        console.log('Press Ctrl+C to stop the server');
    });
} else {
    // For testing: create server instance without starting
    // This allows test frameworks to control the server lifecycle
    server = app.listen(0); // Listen on random available port for testing
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Export app and server for testing purposes
 * - app: Express application instance for supertest integration
 * - server: HTTP server instance for lifecycle control
 */
module.exports = { app, server };
