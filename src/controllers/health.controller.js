'use strict';

/**
 * Health Check Request Handler
 *
 * Named handler function for the GET /health endpoint. Extracted verbatim from
 * the inline route handler in the previous monolithic server.js implementation
 * (server.js:L79-L85) as part of the modular Express.js refactor.
 *
 * Response contract (Risk B6 in AAP §0.6.1 — must be preserved bit-for-bit):
 *   - HTTP status:   200 (explicit via res.status(200))
 *   - Content-Type:  application/json; charset=utf-8 (set automatically by res.json())
 *   - JSON body:     {
 *       status:    'healthy',                 // literal string
 *       timestamp: new Date().toISOString(),  // ISO 8601 timestamp, per-request
 *       uptime:    process.uptime()           // Node.js process uptime in seconds
 *     }
 *
 * Behavioral invariants:
 *   - The timestamp and uptime are computed at request-handle time (NOT cached at module load),
 *     so each invocation produces a fresh ISO 8601 string and a fresh uptime value.
 *   - The function is synchronous; it does not return a Promise and does not use async/await.
 *   - The function is stateless: it holds no closures and reads no module-level mutable state.
 *
 * Globals used:
 *   - Date    (JavaScript built-in)  for `new Date().toISOString()`
 *   - process (Node.js built-in)     for `process.uptime()`
 *
 * Source: server.js:L79-L85
 */

/**
 * Handler for GET /health.
 *
 * Returns a JSON document describing the current health status of the
 * Node.js process for consumption by monitoring systems and load balancers.
 *
 * @param {import('express').Request}  req - Express request object (unused).
 * @param {import('express').Response} res - Express response object.
 * @returns {void}
 */
function getHealth(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}

module.exports = { getHealth };
