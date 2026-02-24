# Hello World — Express.js Server

A modular Express.js 5.2.1 HTTP server demonstrating best-practice project structure with the Factory Pattern, Barrel/Aggregator routing, and Twelve-Factor App configuration. Built on Node.js 20.x LTS with 63 tests providing 100% code coverage.

## Architecture

The application follows a three-tier modular layered architecture:

| Layer | File(s) | Responsibility |
|-------|---------|----------------|
| **Server Lifecycle** | `server.js` | HTTP bootstrap, listen binding, error handling, graceful shutdown |
| **Application** | `src/app.js` | Express Factory Pattern — creates and configures the app, mounts routes, exports without calling `listen()` |
| **Supporting** | `src/config/index.js`, `src/routes/index.js`, `src/routes/main.routes.js` | Twelve-Factor configuration, barrel route exports, route handler definitions |

## Project Structure

```
hello_world/
├── server.js              # HTTP server entry point
├── src/
│   ├── app.js             # Express application factory
│   ├── config/
│   │   └── index.js       # Environment-driven configuration
│   └── routes/
│       ├── index.js       # Route barrel/aggregator
│       └── main.routes.js # GET / and GET /evening handlers
├── tests/
│   ├── unit/              # Unit tests for config and routes
│   ├── integration/       # HTTP integration tests via Supertest
│   └── lifecycle/         # Server lifecycle tests
├── package.json
└── jest.config.js
```

## Prerequisites

- **Node.js** 20.x LTS
- **npm** 11.x

## Installation

```bash
npm ci
```

## Usage

Start the server with default settings or override via environment variables:

```bash
npm start                              # Default: http://127.0.0.1:3000/
HOST=0.0.0.0 PORT=8080 npm start       # Custom binding
```

The server logs its bound address on startup:

```
Server running at http://127.0.0.1:3000/
```

## API Endpoints

| Method | Path | Response Body | Status | Content-Type |
|--------|------|---------------|--------|--------------|
| `GET` | `/` | `Hello, World!\n` | 200 | `text/html; charset=utf-8` |
| `GET` | `/evening` | `Good evening` | 200 | `text/html; charset=utf-8` |

Undefined routes return `404 Not Found`. The `X-Powered-By: Express` and `ETag` headers are present on all successful responses.

## Testing

```bash
npm test              # Run all 63 tests with coverage
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:ci       # CI mode with reporters
```

The test suite comprises 63 tests across 4 suites:

| Suite | Location | Tests | Scope |
|-------|----------|-------|-------|
| Unit — Config | `tests/unit/config.test.js` | 15 | Configuration module defaults and env var parsing |
| Unit — Routes | `tests/unit/routes.test.js` | 7 | Router layer introspection and handler registration |
| Integration | `tests/integration/endpoints.test.js` | 26 | HTTP response bodies, status codes, and headers |
| Lifecycle | `tests/lifecycle/server.test.js` | 15 | Server binding, startup logging, error suppression, shutdown |

Coverage thresholds enforced by Jest:

| Metric | Threshold |
|--------|-----------|
| Branches | 75% |
| Functions | 90% |
| Lines | 80% |
| Statements | 80% |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `127.0.0.1` | Server bind address |
| `PORT` | `3000` | Server listen port (invalid values fall back to `3000`) |
| `NODE_ENV` | `development` | Runtime environment identifier |

## Design Patterns

- **Factory Pattern** (`src/app.js`) — Decouples Express app creation from HTTP server binding, enabling Supertest integration testing without TCP listeners.
- **Barrel/Aggregator Pattern** (`src/routes/index.js`) — Centralizes route module exports for clean, single-point imports.
- **Twelve-Factor App Configuration** (`src/config/index.js`) — Externalizes host, port, and environment settings via environment variables with sensible defaults.
- **Separation of Concerns** — Three-tier architecture isolates server lifecycle, application logic, and supporting modules.

## Dependencies

| Package | Version | Type | Purpose |
|---------|---------|------|---------|
| `express` | `^5.1.0` | runtime | HTTP framework — routing, middleware, response handling |
| `jest` | `^30.2.0` | dev | Test runner, assertions, mocking, coverage |
| `supertest` | `^7.1.4` | dev | HTTP integration testing without TCP binding |

No additional dependencies are required. The application has zero runtime dependencies beyond Express.

## License

MIT
