'use strict';

/**
 * Express Application Factory
 * ===========================
 *
 * Constructs and exports a fully-configured Express `app` instance composed of:
 *   - Environment configuration  (dotenv loaded via ./config/env)
 *   - Production middleware stack (helmet → compression → cors → morgan, in this
 *                                  exact order — encapsulated in ./middleware)
 *   - Aggregated routes           (greeting + health routers mounted at the root,
 *                                  encapsulated in ./routes)
 *
 * This module is intentionally a **factory**: it returns a configured app but
 * does NOT bind to a TCP port. The HTTP listener is started by the root
 * `server.js` entry point, which guards the `app.listen()` call with
 * `if (require.main === module)` so that Supertest (and any other consumer)
 * can `require('../server')` and exercise the app in-process without
 * occupying a port. See AAP Risk B4 (Listen Guard) and Rule R9.
 *
 * Behavior-preservation contract
 * ------------------------------
 * The configured `app` produced by this module MUST be observably identical
 * to the configured app produced by the pre-refactor `server.js` lines
 * 31-107. Concretely:
 *
 *   1. Middleware ordering — helmet, compression, cors, morgan registered in
 *      exactly this order (delegated to `registerMiddleware` from
 *      `./middleware`). See Rule R7 and Risk B2.
 *
 *   2. Routing surface — three routes only: GET / ("Hello world"),
 *      GET /evening ("Good evening"), GET /health (JSON
 *      {status, timestamp, uptime}). All declared via the aggregated router
 *      from `./routes`. See Rule R1 and Risk B6.
 *
 *   3. No introduction of new behaviors — no body parsers, no error handler,
 *      no 404 handler, no `app.set(...)`, no `app.disable(...)`, no
 *      process-level handlers. See Rule R6 and Risk B7.
 *
 * Module load sequence (Risk B1 / Rule R8 — dotenv load-order invariant)
 * ----------------------------------------------------------------------
 * The `require('./config/env')` statement BELOW MUST be the very first
 * executable require in this file. Because Node.js `require()` is synchronous,
 * this ordering causes `dotenv.config()` (invoked at the top of
 * `src/config/env.js`) to run BEFORE any other module reads `process.env`.
 * In particular, this guarantees that `src/middleware/index.js`'s morgan
 * format-selection ternary (`process.env.NODE_ENV === 'production' ? ... `)
 * observes any NODE_ENV value defined by the `.env` file at the project root.
 *
 *   server.js
 *     └─► require('./src/app')        ← evaluated synchronously
 *           └─► require('./config/env')           [STEP 1 — populates process.env]
 *           └─► require('express')                [STEP 2 — load framework]
 *           └─► require('./middleware')           [STEP 3 — load registrar]
 *           └─► require('./routes')               [STEP 4 — load aggregated router]
 *           └─► express()                         [STEP 5 — instantiate app]
 *           └─► registerMiddleware(app)           [STEP 6 — attach middleware]
 *           └─► app.use(router)                   [STEP 7 — mount routes]
 *           └─► module.exports = app              [STEP 8 — expose app]
 *
 * Public API
 * ----------
 * Default export: the configured Express `app` instance, suitable for
 *   - `server.js` to call `.listen()` on, and
 *   - `tests/server.test.js` to pass to `supertest(app)`.
 *
 * The exported value is a callable Express application function (it can be
 * supplied to `http.createServer(app)` or invoked directly by Supertest),
 * exposing the standard Express surface: `listen()`, `use()`, `get()`,
 * `post()`, `set()`, `disable()`, etc.
 *
 * Source: pre-refactor `server.js` lines 31-107 (express() instantiation
 * through the last route declaration, exclusive of `app.listen` which remains
 * in `server.js`).
 *
 * @module src/app
 */

// -----------------------------------------------------------------------------
// 1) Environment loading — MUST be the FIRST require in this file.
//
// Loading `./config/env` triggers its top-level `require('dotenv').config()`,
// which populates `process.env` from the project's `.env` file BEFORE any
// other module in the require graph reads `process.env`. This enforces
// Rule R8 / Risk B1 (dotenv load-order invariant).
//
// We deliberately do NOT destructure named exports here (no `const { PORT } =
// require('./config/env')`) because this file does not consume any specific
// environment value — `PORT` is consumed in the root `server.js` for the
// `app.listen()` call, and `NODE_ENV` is consumed inline by the morgan
// format-selection ternary in `src/middleware/index.js`. The side-effect
// of dotenv.config() running is the entirety of what we need from this
// require, so importing it for its side effect alone is the correct pattern.
// -----------------------------------------------------------------------------
require('./config/env');

// -----------------------------------------------------------------------------
// 2) Express web framework — instantiated below into the `app` constant.
//
// The `express` import is required here (not inside a function body) so that
// the framework is loaded exactly once per Node.js process, matching the
// pre-refactor `server.js` line 31 behavior. The module exports a callable
// that, when invoked without `new`, returns a fresh Express application
// instance.
// -----------------------------------------------------------------------------
const express = require('express');

// -----------------------------------------------------------------------------
// 3) Middleware stack registrar — default export is a function with signature
//    `(app: Express) => void` that registers helmet → compression → cors →
//    morgan onto the provided app, in that exact order.
//
// The registrar function is invoked further below, AFTER `express()` creates
// the app instance and BEFORE the aggregated router is mounted. This timing
// is what ensures every incoming request — including requests routed to
// `/`, `/evening`, and `/health` — passes through the full middleware stack.
//
// The default-export shape (single function, no destructuring) matches
// `src/middleware/index.js`'s `module.exports = registerMiddleware;`.
// -----------------------------------------------------------------------------
const registerMiddleware = require('./middleware');

// -----------------------------------------------------------------------------
// 4) Aggregated router — default export is an `express.Router()` instance
//    composing `greeting.routes` (GET /, GET /evening) and `health.routes`
//    (GET /health) per `src/routes/index.js`. The router is mounted on the
//    Express app via a single `app.use(router)` call below.
//
// The default-export shape (single Router instance, no destructuring) matches
// `src/routes/index.js`'s `module.exports = router;`.
// -----------------------------------------------------------------------------
const router = require('./routes');

// -----------------------------------------------------------------------------
// 5) Application instantiation.
//
// `express()` returns a fresh Express application object that is both a
// callable request handler (so it can be passed to `http.createServer(app)`
// or to `supertest(app)`) and an object exposing the methods used elsewhere:
// `listen()`, `use()`, `get()`, `post()`, `set()`, `disable()`, etc.
//
// Matches pre-refactor `server.js` line 40: `const app = express();`
// -----------------------------------------------------------------------------
const app = express();

// -----------------------------------------------------------------------------
// 6) Register the production middleware stack onto the app.
//
// `registerMiddleware(app)` mutates the provided app by calling, in order:
//   app.use(helmet());
//   app.use(compression());
//   app.use(cors());
//   app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
//
// This call MUST occur BEFORE `app.use(router)` below so that middleware
// applies to every routed request — matching the pre-refactor behavior where
// the middleware app.use(...) calls (server.js lines 56, 59, 62, 65) preceded
// the route declarations (server.js lines 79, 94, 105).
// -----------------------------------------------------------------------------
registerMiddleware(app);

// -----------------------------------------------------------------------------
// 7) Mount the aggregated router on the application at the root path.
//
// `app.use(router)` is invoked without a path argument so the child routers'
// absolute paths (`/`, `/evening`, `/health`) are exposed verbatim. This
// preserves the original URL contract from the pre-refactor `server.js`
// declarations at lines 79, 94, and 105.
//
// Per AAP Rule R1 (Functional parity) and Risk B6 (Handler Response
// Semantics), the URLs, methods, response bodies, status codes, and
// Content-Type headers served by this mount MUST exactly equal those served
// by the pre-refactor inline `app.get(...)` declarations.
// -----------------------------------------------------------------------------
app.use(router);

// -----------------------------------------------------------------------------
// 8) Export the configured app as the module's default export.
//
// This file does NOT call `app.listen(...)`. The listen call lives in the
// root `server.js` inside `if (require.main === module) { ... }`, per AAP
// Rule R9 and Risk B4 (Listen Guard Invariant). Consumers of this module:
//   - `server.js`              — calls `app.listen(PORT, ...)` when run
//                                directly (not when required by tests).
//   - `tests/server.test.js`   — receives this app transitively via
//                                `require('../server')` and exercises it
//                                with Supertest, NOT binding any port.
// -----------------------------------------------------------------------------
module.exports = app;
