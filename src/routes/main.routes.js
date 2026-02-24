/**
 * Main Application Routes Module
 *
 * Defines the primary HTTP GET route handlers using an Express.js Router instance.
 * Each handler responds with a hardcoded string literal via synchronous res.send(),
 * preserving exact behavioral contracts from the original server implementation.
 *
 * Route contracts preserved:
 * - GET '/' returns 'Hello, World!\n' (14 bytes, with trailing newline)
 * - GET '/evening' returns 'Good evening' (12 bytes, no trailing newline)
 *
 * @module src/routes/main.routes
 * @requires express
 */

const express = require('express');

const router = express.Router();

/**
 * Root route handler.
 * Responds with 'Hello, World!\n' — exact match to original server.js line 9.
 * The trailing newline character is an immutable part of the response contract.
 *
 * @route GET /
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {void} Sends 'Hello, World!\n' with HTTP 200 status
 */
router.get('/', (req, res) => {
  res.send('Hello, World!\n');
});

/**
 * Evening route handler.
 * Responds with 'Good evening' — exact match to original server.js line 13.
 * This response intentionally has no trailing newline character.
 *
 * @route GET /evening
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {void} Sends 'Good evening' with HTTP 200 status
 */
router.get('/evening', (req, res) => {
  res.send('Good evening');
});

module.exports = router;
