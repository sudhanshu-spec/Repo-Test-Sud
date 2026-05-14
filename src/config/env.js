/**
 * Environment Configuration Module
 *
 * Centralizes environment-variable loading for the application.
 *
 * Responsibilities:
 * - Invokes `require('dotenv').config()` exactly once at module load.
 *   This is the SINGLE call site for dotenv in the entire codebase.
 * - Exposes resolved environment values consumed elsewhere:
 *   - PORT     : Server listening port (default: 3000)
 *   - NODE_ENV : Application environment (development/production/test or
 *                undefined). NOT defaulted; mirrors `process.env.NODE_ENV`
 *                bit-for-bit so downstream consumers see the same value they
 *                would by reading `process.env.NODE_ENV` directly.
 *
 * Load-order invariant (R8 / Risk B1):
 *   This module MUST be required BEFORE any other module that reads
 *   `process.env`. The require chain `server.js -> src/app.js -> ./config/env`
 *   ensures dotenv.config() runs first.
 *
 * Source-of-truth references (preserved verbatim from the pre-refactor server.js):
 * - server.js:L28 -> require('dotenv').config();
 * - server.js:L43 -> const PORT = process.env.PORT || 3000;
 *
 * @module src/config/env
 */

'use strict';

// Load environment variables from .env file FIRST (before any env access elsewhere).
// This is the SINGLE place in the codebase where dotenv is loaded.
require('dotenv').config();

// Server listening port (default: 3000) — preserves server.js:L43 verbatim.
// The `||` operator yields the numeric literal 3000 for any falsy value of
// `process.env.PORT` and the raw string value otherwise. Both numeric and
// string values are valid arguments to `http.Server#listen`.
const PORT = process.env.PORT || 3000;

// Application environment — no defaulting, no normalization (Risk B5).
// When `process.env.NODE_ENV` is undefined, this constant is also undefined.
// Consumers needing a defaulted display value (e.g., the startup banner in
// server.js) MUST apply their own fallback at the call site.
const NODE_ENV = process.env.NODE_ENV;

module.exports = { PORT, NODE_ENV };
