/**
 * @fileoverview Production-ready Express.js server with graceful shutdown support
 * 
 * Endpoints:
 *   GET /         - Returns "Hello world"
 *   GET /evening  - Returns "Good evening"
 *   GET /health   - Health check for container orchestration
 * 
 * Features:
 *   - Graceful shutdown (SIGTERM/SIGINT)
 *   - Centralized error handling
 *   - 404 Not Found handler
 *   - Process-level error handlers
 * 
 * @module server
 */

'use strict';

const express = require('express');

// Initialize Express application
const app = express();

// Server configuration
const PORT = process.env.PORT || 3000;

// Server state
let server = null;        // HTTP server instance for graceful shutdown
let isShuttingDown = false; // Prevents multiple shutdown attempts

// =============================================================================
// ROUTES
// =============================================================================

/**
 * Root endpoint - returns greeting message
 */
app.get('/', (req, res) => {
  res.send('Hello world');
});

/**
 * Evening endpoint - returns evening greeting
 */
app.get('/evening', (req, res) => {
  res.send('Good evening');
});

/**
 * Health check endpoint - returns server status for orchestration tools
 * Returns 503 during shutdown to prevent routing new requests
 */
app.get('/health', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({
      status: 'shutting_down',
      message: 'Server is shutting down and not accepting new requests',
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

/**
 * 404 handler - catches requests to undefined routes
 * Must be placed after all route definitions
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    statusCode: 404
  });
});

/**
 * Error handler - centralized error processing
 * Must have 4 parameters to be recognized as error middleware
 */
app.use((err, req, res, next) => {
  // Log error for debugging
  console.error('Error occurred:', err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 500;

  const errorResponse = {
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    statusCode
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

/**
 * Handles graceful shutdown with timeout protection
 * @param {string} signal - Signal that triggered shutdown (SIGTERM/SIGINT)
 * @param {number} timeout - Max wait time in ms before forced exit (default: 10s)
 */
function gracefulShutdown(signal, timeout = 10000) {
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }

  console.log(`\n${signal} signal received: starting graceful shutdown...`);
  isShuttingDown = true;

  // Force exit if shutdown takes too long
  const forceExitTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out, forcing exit...');
    process.exit(1);
  }, timeout);
  forceExitTimer.unref(); // Don't let timer keep process alive

  if (server) {
    server.close((err) => {
      clearTimeout(forceExitTimer);

      if (err) {
        console.error('Error during server close:', err);
        process.exit(1);
      }

      console.log('HTTP server closed successfully.');
      console.log('Cleanup complete. Exiting process.');
      process.exit(0);
    });
  } else {
    clearTimeout(forceExitTimer);
    console.log('No server instance to close. Exiting process.');
    process.exit(0);
  }
}

// =============================================================================
// PROCESS EVENT HANDLERS
// =============================================================================

// Handle uncaught synchronous exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.stack || err);
  console.error('Application is in an undefined state. Shutting down...');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  console.error('Application shutting down due to unhandled promise rejection...');
  process.exit(1);
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// =============================================================================
// SERVER STARTUP
// =============================================================================

// Start server only when run directly (not when imported for testing)
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });

  // Handle server startup errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${PORT} is already in use.`);
      console.error('Please choose a different port or stop the other process.');
    } else if (err.code === 'EACCES') {
      console.error(`Error: Permission denied to bind to port ${PORT}.`);
      console.error('Use a port > 1024 or run with elevated privileges.');
    } else {
      console.error('Server startup error:', err);
    }
    process.exit(1);
  });
}

// Export app for testing
module.exports = app;
