/**
 * Express.js Application Entry Point
 * 
 * This is a Node.js Express server tutorial implementing two GET endpoints:
 * - GET / : Returns "Hello world"
 * - GET /evening : Returns "Good evening"
 * 
 * The server listens on the PORT environment variable or defaults to port 3000.
 * The app instance is exported for testing purposes.
 */

'use strict';

// Import Express web framework
const express = require('express');

// Create Express application instance
const app = express();

// Define server port from environment or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Root endpoint handler
 * GET / - Returns "Hello world" as plain text response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/', (req, res) => {
  res.send('Hello world');
});

/**
 * Evening endpoint handler
 * GET /evening - Returns "Good evening" as plain text response
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/evening', (req, res) => {
  res.send('Good evening');
});

// Start server only when run directly (not when imported for testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app instance for testing
module.exports = app;
