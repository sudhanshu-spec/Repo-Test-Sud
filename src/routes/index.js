'use strict';

/**
 * Router Aggregator
 *
 * Composes the per-domain Express routers into a single parent
 * `express.Router()` that is mounted on the application in one place by
 * `src/app.js` via `app.use(router)`. Acts as the SINGLE point of route
 * composition for the entire HTTP surface of the service.
 *
 * Child routers (mounted at the root, with NO path prefix):
 *   - greeting.routes — declares GET /        (returns "Hello world")
 *                       declares GET /evening (returns "Good evening")
 *   - health.routes   — declares GET /health  (returns JSON {status, timestamp, uptime})
 *
 * Why no path prefix?
 *   Each child router declares its own absolute paths (`/`, `/evening`,
 *   `/health`). These three URLs share NO common prefix, so introducing a
 *   prefix here (e.g., `router.use('/api', greetingRoutes)`) would prepend it
 *   to every nested URL and break the public HTTP contract verified by
 *   `tests/server.test.js`. Mounting both child routers at the root preserves
 *   the original URL contract bit-for-bit.
 *
 * Why explicit aggregation?
 *   Before the refactor, `server.js` (lines 79, 94, 105) called
 *   `app.get(...)` three times directly on the single Express app instance —
 *   an *implicit* aggregation of all routes onto one object. This file
 *   replaces that implicit pattern with explicit `express.Router()`
 *   composition: per-domain routers compose into one parent router that is
 *   then mounted on the app exactly once. This separation lets `src/app.js`
 *   stay agnostic of which domains exist and lets each domain's routes live
 *   alongside its controller.
 *
 * Critical non-responsibilities (per AAP §0.6.1, §0.7.2 — R6, R7, B7):
 *   - NO middleware is registered here. The helmet → compression → cors →
 *     morgan stack is attached to the Express `app` (not this router) by
 *     `src/middleware/index.js`, invoked from `src/app.js` BEFORE this
 *     aggregated router is mounted. Registering middleware on this router
 *     would either duplicate or re-order the stack and break Risk B2.
 *   - NO direct route declarations on the parent router (no
 *     `router.get(...)`, `router.post(...)`, etc.). All routes live in the
 *     domain-specific child routers.
 *   - NO 404 handler, error handler, or fallback route.
 *   - NO request validation, body parsing, async wrappers, or logging.
 *   - NO additional `router.use(...)` calls beyond the two child routers
 *     enumerated below.
 *   - This file is PURE composition.
 *
 * Mount order:
 *   `router.use(greetingRoutes)` is registered before `router.use(healthRoutes)`
 *   purely for alphabetical readability. The mount order is NOT behaviorally
 *   significant because the three concrete paths (`/`, `/evening`, `/health`)
 *   are distinct and non-overlapping — Express matches by path, not by
 *   registration order, when paths don't collide.
 *
 * Source: server.js:L79 (GET /health), L94 (GET /), L105 (GET /evening)
 *
 * @module src/routes/index
 */

// Web application framework — used here solely for the `Router()` factory
// that constructs the parent aggregator router. No direct route methods are
// called on `express` itself.
const express = require('express');

// Per-domain child routers. Each module exports an `express.Router()` instance
// as its default export (`module.exports = router;`):
//   - greeting.routes -> declares GET / and GET /evening
//   - health.routes   -> declares GET /health
// The require order (greeting before health) matches the alphabetical mount
// order below; it has no runtime significance.
const greetingRoutes = require('./greeting.routes');
const healthRoutes = require('./health.routes');

// Construct a fresh parent Router. Invoked as a factory function (NOT with
// `new`) — this is the canonical Express usage pattern and matches the
// existing per-domain routers (`greeting.routes.js`, `health.routes.js`).
const router = express.Router();

// Mount the greeting router at the root (NO path prefix argument).
// The greeting router exposes GET / and GET /evening as ABSOLUTE paths;
// mounting it at the root preserves those URLs verbatim so they match the
// original `app.get('/', ...)` and `app.get('/evening', ...)` declarations
// in server.js (L94 and L105).
router.use(greetingRoutes);

// Mount the health router at the root (NO path prefix argument).
// The health router exposes GET /health as an ABSOLUTE path; mounting it at
// the root preserves the URL verbatim so it matches the original
// `app.get('/health', ...)` declaration in server.js (L79).
router.use(healthRoutes);

// Export the configured parent router as the module's default export.
// `src/app.js` consumes this via `const router = require('./routes');` and
// then mounts it on the Express app via `app.use(router);` AFTER the
// middleware stack has been registered.
module.exports = router;
