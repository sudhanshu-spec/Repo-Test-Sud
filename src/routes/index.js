/**
 * Route Barrel/Aggregator Module
 *
 * @description Centralizes all route module exports using the Barrel/Aggregator Pattern.
 * This module serves as the single entry point for route registration, allowing
 * the application layer to import all route definitions with a single require
 * statement rather than importing each route module individually.
 *
 * The Barrel Pattern provides a clean abstraction boundary between the application
 * factory in src/app.js and the individual route handler modules. When new route
 * modules are added to the application, only this aggregator file needs to be
 * updated — the consuming application factory remains unchanged.
 *
 * Usage in src/app.js:
 *   const { mainRoutes } = require('./routes');
 *   app.use('/', mainRoutes);
 *
 * @module src/routes
 * @requires ./main.routes
 * @see module:src/routes/main.routes — Route handler definitions for GET / and GET /evening
 * @see module:src/app — Express application factory that consumes this barrel
 */

const mainRoutes = require('./main.routes');

module.exports = {
  mainRoutes
};
