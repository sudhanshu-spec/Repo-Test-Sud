/**
 * Express.js Application Entry Point
 *
 * Thin entry point for the Express.js HTTP server. This file is intentionally
 * minimal: all application-construction concerns (environment loading,
 * middleware registration, route declarations) have been decomposed into the
 * `src/` tree as part of the modular Express.js refactor. This file is
 * responsible for ONLY two things:
 *
 *   1. Re-exporting the configured Express `app` instance obtained from
 *      `./src/app` so that consumers — most notably `tests/server.test.js`
 *      which calls `require('../server')` — receive a fully composed app
 *      suitable for both production use and in-process Supertest assertions.
 *
 *   2. Conditionally binding the HTTP listener via `app.listen(PORT, ...)`
 *      ONLY when this file is invoked directly (i.e., `node server.js` or
 *      PM2 launching `./server.js`), gated by `require.main === module`.
 *      When required by the Jest test runner, the guard prevents the listener
 *      from being created, allowing Supertest to attach to the in-memory app
 *      without occupying a TCP port.
 *
 * Endpoints (declared in src/routes/, handled in src/controllers/):
 *   - GET /         -> Returns "Hello world"   (text/html; charset=utf-8, 200)
 *   - GET /evening  -> Returns "Good evening"  (text/html; charset=utf-8, 200)
 *   - GET /health   -> Returns JSON {status, timestamp, uptime} for monitoring
 *                       and load balancer integration (application/json, 200)
 *
 * Middleware Stack (registered in src/middleware/index.js, order is significant):
 *   1. helmet      - Security HTTP headers
 *   2. compression - Gzip/deflate response compression
 *   3. cors        - Cross-Origin Resource Sharing
 *   4. morgan      - HTTP request logging ('combined' in production, 'dev' otherwise)
 *
 * Environment Configuration (loaded by src/config/env.js):
 *   - PORT     : Server listening port (default: 3000)
 *   - NODE_ENV : Application environment (development/production/test)
 *
 * Module Load Order (R8 / Risk B1 — dotenv load-order invariant):
 *   The `require('./src/app')` statement BELOW MUST be the first executable
 *   require in this file. Loading `./src/app` synchronously triggers
 *   `require('./src/config/env')` at the top of that module, which in turn
 *   invokes `require('dotenv').config()` BEFORE any code in the require graph
 *   reads `process.env`. This sequencing guarantees that the morgan
 *   format-selection ternary (`process.env.NODE_ENV === 'production' ? ... `)
 *   inside `src/middleware/index.js` observes any NODE_ENV value defined in
 *   the project's `.env` file.
 *
 *   server.js
 *     └─► require('./src/app')                  [STEP 1]
 *           └─► require('./config/env')         [STEP 2 — dotenv.config()]
 *           └─► require('express')              [STEP 3]
 *           └─► require('./middleware')         [STEP 4]
 *           └─► require('./routes')             [STEP 5]
 *           └─► express() + registerMiddleware  [STEP 6]
 *           └─► app.use(router)                 [STEP 7]
 *           └─► module.exports = app            [STEP 8]
 *
 * Public API Contract (R3 — Public surface parity):
 *   - This file MUST remain at the repository root as `server.js` because:
 *       * `package.json` declares `"main": "server.js"` and
 *         `"start": "node server.js"`.
 *       * `ecosystem.config.js` declares `script: './server.js'`.
 *       * `tests/server.test.js` calls `require('../server')`.
 *     Each of those external references must continue to resolve unchanged.
 *   - This file MUST export the configured Express `app` instance via
 *     `module.exports = app;`. The exported value is a callable Express
 *     application function (acceptable as the argument to Supertest, to
 *     `http.createServer`, etc.) exposing the standard Express surface.
 *
 * Listen Guard (R9 / Risk B4 — Listen Guard Invariant):
 *   The `app.listen(...)` call below MUST remain inside the
 *   `if (require.main === module) { ... }` block. The application factory in
 *   `src/app.js` MUST NOT bind to a port. If `app.listen` were moved into the
 *   factory, every `require('../server')` from the test process would attempt
 *   to occupy a TCP port, causing EADDRINUSE on parallel test runs and
 *   hanging the test process.
 */

'use strict';

// -----------------------------------------------------------------------------
// 1) Configured Express application instance.
//
// This require MUST be the first executable statement so the transitive
// require chain loads `./src/config/env` (and therefore invokes
// `require('dotenv').config()`) BEFORE any module in the process reads
// `process.env`. See AAP Rule R8 / Risk B1 (dotenv load-order invariant).
//
// The value bound to `app` is the same fully-configured Express app instance
// produced by `src/app.js` — middleware (helmet, compression, cors, morgan)
// already attached, routes (`/`, `/evening`, `/health`) already mounted.
// -----------------------------------------------------------------------------
const app = require('./src/app');

// -----------------------------------------------------------------------------
// 2) Server listening port.
//
// Destructured from the centralized env configuration module. `PORT` resolves
// to `process.env.PORT || 3000` per the source-of-truth in
// `src/config/env.js` (matches pre-refactor server.js:L43 verbatim).
//
// Note: This require runs AFTER `./src/app` above and therefore reads the
// module-cached copy of `./src/config/env` that was already evaluated as part
// of the transitive load triggered by step 1. The value of `PORT` is
// computed exactly once (at module load), matching the pre-refactor behavior.
// -----------------------------------------------------------------------------
const { PORT } = require('./src/config/env');

// -----------------------------------------------------------------------------
// 3) Conditional HTTP listener.
//
// `require.main === module` is `true` only when this file is the entry point
// of the Node.js process (e.g., `node server.js` or PM2 launching
// `./server.js`). It is `false` when this file is required by another module,
// such as `tests/server.test.js` via `require('../server')`. Guarding
// `app.listen(...)` with this check is the canonical Express pattern that
// allows Supertest to exercise the app in-process without binding a port.
//
// The two console.log statements inside the listen callback MUST remain
// verbatim — they are part of the observable startup contract documented in
// README.md (PM2 deployment section) and have been preserved bit-for-bit
// from the pre-refactor server.js:L112-L113. The fallback `'development'` in
// the NODE_ENV banner is intentional: the env config module does NOT default
// NODE_ENV (it mirrors `process.env.NODE_ENV` exactly, which may be
// undefined), so the display fallback must live at the call site here.
// -----------------------------------------------------------------------------
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// -----------------------------------------------------------------------------
// 4) Export the configured Express app instance.
//
// Preserves the pre-refactor export contract at server.js:L118 verbatim.
// Consumers:
//   - tests/server.test.js  — `const app = require('../server')` and
//                              `supertest(app)` for HTTP assertions.
//   - Any external embedder — `require('repo-test-sud')` resolves here via
//                              the `"main": "server.js"` entry in package.json.
// -----------------------------------------------------------------------------
module.exports = app;
