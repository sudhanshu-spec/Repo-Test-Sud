'use strict';

/**
 * Greeting Request Handlers
 *
 * Named handler functions for greeting endpoints. Extracted verbatim from the
 * inline route handlers in the previous monolithic server.js implementation
 * as part of the modular Express.js refactor.
 *
 * The handlers in this module are imported by `src/routes/greeting.routes.js`
 * and mounted on the `GET /` and `GET /evening` routes respectively. They
 * implement the public HTTP contract enforced by `tests/server.test.js` and
 * documented in `README.md`.
 *
 * Response contract (Risk B6 in AAP §0.6.1 — must be preserved bit-for-bit):
 *   - GET /         -> HTTP 200, body "Hello world",   Content-Type text/html; charset=utf-8
 *   - GET /evening  -> HTTP 200, body "Good evening",  Content-Type text/html; charset=utf-8
 *
 * Behavioral invariants:
 *   - Response bodies are the exact literal strings 'Hello world' and 'Good evening'
 *     (case-sensitive, single space between words, no punctuation, no trailing whitespace).
 *   - Uses res.send() (NOT res.json()) so Express sets Content-Type to
 *     'text/html; charset=utf-8' — required for parity with the monolithic
 *     implementation and validated by the Supertest assertions on response.text.
 *   - Default HTTP status 200 (Express default for res.send()); no explicit
 *     res.status(200) call is made, matching the source verbatim.
 *   - Both functions are synchronous (no async/await, no Promises).
 *   - Both functions are stateless: no closures over external variables, no
 *     module-level mutable state, no I/O side effects beyond the single
 *     res.send() call.
 *
 * Source: server.js:L94-L96 (getRoot), server.js:L105-L107 (getEvening)
 */

/**
 * Handler for GET /.
 *
 * Sends the plain text response "Hello world" with HTTP status 200.
 * Express's default Content-Type for res.send(string) is
 * 'text/html; charset=utf-8'.
 *
 * @param {import('express').Request}  req - Express request object (unused).
 * @param {import('express').Response} res - Express response object.
 * @returns {void}
 */
function getRoot(req, res) {
  res.send('Hello world');
}

/**
 * Handler for GET /evening.
 *
 * Sends the plain text response "Good evening" with HTTP status 200.
 * Express's default Content-Type for res.send(string) is
 * 'text/html; charset=utf-8'.
 *
 * @param {import('express').Request}  req - Express request object (unused).
 * @param {import('express').Response} res - Express response object.
 * @returns {void}
 */
function getEvening(req, res) {
  res.send('Good evening');
}

module.exports = { getRoot, getEvening };
