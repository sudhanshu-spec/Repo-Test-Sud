'use strict';

/**
 * Health Routes
 *
 * Declares the health-check endpoint using `express.Router()` as part of the
 * modular Express.js refactor that decomposes the monolithic `server.js` into
 * per-domain route, controller, middleware, and configuration modules.
 *
 * Routes registered on this router:
 *   - GET /health  ->  getHealth  (returns JSON {status, timestamp, uptime})
 *
 * Responsibilities:
 *   - Declare URL and HTTP method only.
 *   - Bind the path `/health` to the named handler exported from the health
 *     controller.
 *
 * Non-responsibilities (intentional, per AAP §0.6.1 / §0.7.2):
 *   - No middleware registration. App-wide middleware (helmet, compression,
 *     cors, morgan) is attached to the Express `app` instance by
 *     `src/middleware/index.js` BEFORE the aggregated router is mounted in
 *     `src/app.js`. Mounting middleware here would either duplicate or
 *     re-order the stack and break Risk B2 (Middleware Registration Order).
 *   - No business logic, request validation, body parsing, async wrappers,
 *     error handlers, fallback routes, or process-level event handlers.
 *   - No additional HTTP methods or paths beyond GET /health.
 *
 * Behavioral parity (Risk B6 — Handler Response Semantics):
 *   Mounting this router via `app.use(require('./src/routes'))` from
 *   `src/app.js` MUST produce the same observable response on GET /health as
 *   the inline `app.get('/health', ...)` declaration at server.js:L79-L85:
 *   HTTP 200, Content-Type `application/json; charset=utf-8`, JSON body
 *   `{ status: 'healthy', timestamp: <ISO 8601>, uptime: <number> }`.
 *
 * Test contract (tests/server.test.js):
 *   - L58-L66: GET /health returns 200 + JSON content-type + body with
 *     status:'healthy', defined timestamp, numeric uptime.
 *   - L68-L73: GET /health timestamp round-trips via
 *     `new Date(timestamp).toISOString() === timestamp`.
 *
 * Source: server.js:L79-L85 (inline `app.get('/health', ...)` declaration).
 *
 * @module src/routes/health.routes
 */

// Web application framework — used here solely for the `Router()` factory.
const express = require('express');

// Named request handler for GET /health. The destructuring shape matches the
// controller's export contract: `module.exports = { getHealth }` in
// `src/controllers/health.controller.js`.
const { getHealth } = require('../controllers/health.controller');

// Construct a fresh, isolated Router instance. The Router is invoked as a
// factory function (NOT with `new`), matching the canonical Express usage and
// the project's existing pattern in the refactor.
const router = express.Router();

// GET /health  ->  getHealth
// Declares URL-to-handler binding only. The handler reference is the function
// imported above; it is NOT wrapped in an inline arrow function so that the
// observable behavior matches the source (server.js:L79-L85) bit-for-bit.
router.get('/health', getHealth);

// Export the configured router so the aggregator at `src/routes/index.js` can
// mount it onto the application via `router.use(require('./health.routes'))`.
module.exports = router;
