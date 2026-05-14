'use strict';

/**
 * Greeting Routes
 *
 * Declares the two greeting endpoints using `express.Router()` as part of the
 * modular Express.js refactor that decomposes the monolithic `server.js` into
 * per-domain route, controller, middleware, and configuration modules.
 *
 * Routes registered on this router:
 *   - GET /         ->  getRoot     (returns "Hello world")
 *   - GET /evening  ->  getEvening  (returns "Good evening")
 *
 * Responsibilities:
 *   - Declare URLs and HTTP methods only.
 *   - Bind the path `/` to the `getRoot` handler and the path `/evening` to
 *     the `getEvening` handler — both named exports of the greeting controller.
 *
 * Non-responsibilities (intentional, per AAP §0.6.1 / §0.7.2):
 *   - No middleware registration. App-wide middleware (helmet, compression,
 *     cors, morgan) is attached to the Express `app` instance by
 *     `src/middleware/index.js` BEFORE the aggregated router is mounted in
 *     `src/app.js`. Mounting middleware here would either duplicate or
 *     re-order the stack and break Risk B2 (Middleware Registration Order).
 *   - No business logic, request validation, body parsing, async wrappers,
 *     error handlers, fallback routes, or process-level event handlers.
 *   - No additional HTTP methods or paths beyond GET / and GET /evening
 *     (per Risk B7 — No-Introduction Constraint).
 *
 * Behavioral parity (Risk B6 — Handler Response Semantics):
 *   Mounting this router via `app.use(require('./src/routes'))` from
 *   `src/app.js` MUST produce the same observable responses as the inline
 *   `app.get('/', ...)` and `app.get('/evening', ...)` declarations at
 *   server.js:L94-L96 and server.js:L105-L107:
 *     - GET /         -> HTTP 200, body "Hello world",   Content-Type text/html; charset=utf-8
 *     - GET /evening  -> HTTP 200, body "Good evening",  Content-Type text/html; charset=utf-8
 *
 * Test contract (tests/server.test.js):
 *   - L32-L37: GET / returns 200 + body "Hello world".
 *   - L44-L49: GET /evening returns 200 + body "Good evening".
 *   - L80-L89: GET / response includes Helmet headers
 *     `x-content-type-options: nosniff` and `x-frame-options: SAMEORIGIN`
 *     (provided by middleware, not this file — included here for traceability).
 *   - L96-L102: GET / response includes `access-control-allow-origin` header
 *     when Origin is set (provided by cors middleware, not this file).
 *
 * Source: server.js:L94-L96 (GET / -> getRoot),
 *         server.js:L105-L107 (GET /evening -> getEvening).
 *
 * @module src/routes/greeting.routes
 */

// Web application framework — used here solely for the `Router()` factory.
const express = require('express');

// Named request handlers for GET / and GET /evening. The destructuring shape
// matches the controller's export contract:
// `module.exports = { getRoot, getEvening }` in
// `src/controllers/greeting.controller.js`.
const { getRoot, getEvening } = require('../controllers/greeting.controller');

// Construct a fresh, isolated Router instance. The Router is invoked as a
// factory function (NOT with `new`), matching the canonical Express usage and
// the project's existing pattern in the refactor (mirrors `health.routes.js`).
const router = express.Router();

// GET /  ->  getRoot
// Declares URL-to-handler binding only. The handler reference is the function
// imported above; it is NOT wrapped in an inline arrow function so that the
// observable behavior matches the source (server.js:L94-L96) bit-for-bit.
router.get('/', getRoot);

// GET /evening  ->  getEvening
// Declares URL-to-handler binding only. The handler reference is the function
// imported above; it is NOT wrapped in an inline arrow function so that the
// observable behavior matches the source (server.js:L105-L107) bit-for-bit.
router.get('/evening', getEvening);

// Export the configured router so the aggregator at `src/routes/index.js` can
// mount it onto the application via `router.use(require('./greeting.routes'))`.
module.exports = router;
