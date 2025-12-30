/**
 * Express.js Server Entry Point
 * 
 * This is the server entry point that handles HTTP server initialization.
 * The Express application configuration and routes are imported from the
 * modular src/app.js module, following the App/Server separation pattern.
 * 
 * Endpoints provided (via src/app.js):
 * - GET / : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * 
 * The server listens on the PORT environment variable or defaults to port 3000.
 * The app instance is exported for testing purposes, maintaining backward
 * compatibility with existing test suites.
 * 
 * @module server
 */

'use strict';

// Import the configured Express application from the modular app module
// This follows the App/Server separation pattern for improved testability
const app = require('./src/app');

// Define server port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Start server only when run directly (not when imported for testing)
// This guard enables testing the app without starting an HTTP server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app instance for testing
// Maintains backward compatibility with tests that import from '../server'
module.exports = app;
