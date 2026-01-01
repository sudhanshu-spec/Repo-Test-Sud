/**
 * Express.js Application Entry Point
 * 
 * This is the entry point for the Node.js Express server tutorial.
 * It imports the configured Express application from src/app.js and handles
 * server startup.
 * 
 * Endpoints (defined in src/routes/index.js):
 * - GET / : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * 
 * The server listens on the PORT environment variable or defaults to port 3000.
 * The app instance is exported for testing purposes.
 */

'use strict';

// Import the configured Express application
const app = require('./src/app');

// Define server port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Start server only when run directly (not when imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app instance for testing
module.exports = app;
