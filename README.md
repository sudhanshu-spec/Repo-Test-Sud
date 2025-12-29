# Repo-Test-Sud
Testing Existing and New Projects

## Node.js Express Server

This project includes a Node.js server built with Express.js framework, following a modular architecture pattern for better maintainability and scalability.

### Project Structure

```
/
├── server.js                     # HTTP listener bootstrap (entry point)
├── app.js                        # Express application configuration
├── src/
│   └── routes/
│       ├── index.js              # Route aggregator module
│       └── greeting.routes.js    # Greeting endpoint handlers
├── tests/
│   └── server.test.js            # Jest integration tests
├── package.json                  # npm manifest
├── .env.example                  # Environment variable template
└── README.md                     # Project documentation
```

#### File Descriptions

| File | Purpose |
|------|---------|
| `server.js` | HTTP server bootstrap - imports app and starts the listener on configured PORT |
| `app.js` | Express application configuration - creates Express instance, registers middleware and routes |
| `src/routes/index.js` | Route aggregator - imports and mounts all route modules |
| `src/routes/greeting.routes.js` | Greeting endpoints - contains GET / and GET /evening route handlers |
| `tests/server.test.js` | Integration tests - Jest/Supertest tests for endpoint verification |

### Architecture

This project follows Express.js best practices with a modular architecture:

#### App-Server Separation Pattern

The application separates concerns between HTTP server management and Express application configuration:

- **`server.js`**: Handles HTTP listener bootstrap only. Imports the configured app from `app.js` and starts the server on the specified PORT. Uses `require.main === module` guard for conditional startup (enables clean testing).

- **`app.js`**: Contains all Express application configuration including middleware setup and route registration. Exports the `app` instance for both server use and testing.

#### Express Router Pattern

Routes are organized using Express Router for modularity:

- **Route Aggregator** (`src/routes/index.js`): Central module that imports and mounts all route modules
- **Route Modules** (`src/routes/*.routes.js`): Individual route files grouped by feature (e.g., greeting routes)

This pattern enables:
- Easy addition of new route modules
- Clear separation of endpoint logic
- Better testability of individual routes

### Setup

```bash
npm install
npm start
```

### Endpoints

| Route | Method | Response |
|-------|--------|----------|
| `/` | GET | "Hello world" |
| `/evening` | GET | "Good evening" |

### Testing

Run automated tests:
```bash
npm test
```

The test suite uses Jest with Supertest for HTTP assertions. Tests import the `app` instance directly from `app.js` for isolated testing without starting the HTTP server.

### Environment Variables

- `PORT` - Server listening port (default: 3000)
- `DB` - Database connection string (optional)
