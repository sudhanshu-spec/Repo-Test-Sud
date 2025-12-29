/**
 * Express.js Server Entry Point
 * 
 * This module serves as the HTTP listener bootstrap for the Express.js application.
 * It imports the configured Express app from app.js and starts the HTTP server.
 * 
 * This file implements the App-Server Separation pattern as defined in
 * Agent Action Plan Section 0.3.3, decoupling HTTP listener concerns from
 * Express application configuration.
 * 
 * Architecture:
 * - server.js: HTTP listener bootstrap (this file)
 * - app.js: Express configuration (imported here)
 * - src/routes/: Route definitions (used by app.js)
 * 
 * Endpoints (served via imported app):
 * - GET / : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * 
 * The server listens on the PORT environment variable or defaults to port 3000.
 * The app instance is re-exported for backward compatibility with existing test imports.
 * 
 * @module server
 */

'use strict';

// Import configured Express application instance from app.js
// The app has all routes and middleware pre-configured
const app = require('./app');

/**
 * Server port configuration
 * 
 * Reads from PORT environment variable, defaulting to 3000 if not set.
 * This allows flexible deployment across different environments.
 * 
 * @type {number}
 */
const PORT = process.env.PORT || 3000;

/**
 * Conditional server startup
 * 
 * Starts the HTTP listener only when this file is run directly (node server.js).
 * When imported for testing (e.g., via supertest), the listener is not started,
 * allowing tests to make HTTP assertions without binding to a port.
 * 
 * This pattern enables:
 * - npm start: Starts the HTTP server on configured port
 * - npm test: Imports app without starting listener for test assertions
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

/**
 * Export Express application instance
 * 
 * Re-exports the app from app.js to maintain backward compatibility
 * with any code that imports from server.js (e.g., existing tests).
 * 
 * Both import paths will work:
 * - require('./server') -> returns app (this export)
 * - require('./app') -> returns app (direct from app.js)
 * 
 * @exports app
 */
module.exports = app;
