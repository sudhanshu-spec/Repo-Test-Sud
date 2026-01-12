/**
 * @fileoverview HTTP server entry point for the Express application.
 * Imports the configured Express app and starts listening on port 3000.
 * 
 * This file is the production entry point that should be executed with:
 * `node server.js`
 * 
 * The Express app configuration is separated into app.js for testability.
 * 
 * @module server
 * @requires ./app
 */

'use strict';

const app = require('./app');

/**
 * Default server port number.
 * @constant {number}
 */
const PORT = process.env.PORT || 3000;

/**
 * Start the HTTP server and listen on the specified port.
 * Logs a message to console when the server starts successfully.
 * 
 * @fires server#listening
 */
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

/**
 * Export the server instance for programmatic access and testing.
 * @exports server
 */
module.exports = server;
