/**
 * HTTP Server Bootstrap Module
 * 
 * This module serves as the entry point for starting the Express HTTP server.
 * It imports the configured Express application from app.js and handles:
 * - Server port configuration from environment variables
 * - Conditional server startup (only when run directly, not when imported)
 * - Backward-compatible app export for testing
 * 
 * Architecture:
 * - server.js (this file): HTTP listener bootstrap
 * - app.js: Express application configuration and route registration
 * - src/routes/: Modular route definitions
 * 
 * Endpoints (served via app.js):
 * - GET / : Returns "Hello world" (HTTP 200)
 * - GET /evening : Returns "Good evening" (HTTP 200)
 * 
 * Usage:
 * - Direct execution: `node server.js` starts HTTP server on PORT
 * - Import for testing: `require('./server')` returns app without binding port
 * 
 * @module server
 */

'use strict';

/**
 * Import Express application instance from app.js
 * 
 * The app module provides the fully configured Express application with:
 * - All route middleware registered
 * - Express instance methods including listen() for starting HTTP server
 * 
 * @type {express.Application}
 */
const app = require('./app');

/**
 * Server port configuration
 * 
 * Reads PORT from environment variable or defaults to 3000.
 * This maintains exact behavior from the original server.js implementation.
 * 
 * @type {number|string}
 */
const PORT = process.env.PORT || 3000;

/**
 * Conditional server startup
 * 
 * Starts the HTTP server only when this file is executed directly
 * (via `node server.js`), not when imported as a module (for testing).
 * 
 * This guard pattern allows:
 * - Production: `node server.js` starts server on configured PORT
 * - Testing: `require('./server')` returns app without port binding
 * 
 * The app.listen() method is provided by Express and binds the
 * application to the specified port, enabling HTTP request handling.
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

/**
 * Export Express application instance
 * 
 * Maintains backward compatibility with existing test imports.
 * Tests using `require('../server')` will continue to receive
 * the app instance for HTTP assertions via supertest.
 * 
 * This export pattern ensures:
 * - Test suite compatibility without modification
 * - Consistent interface whether importing from server.js or app.js
 * 
 * @exports app
 */
module.exports = app;
