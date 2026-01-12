# Technical Specification

# 0. Agent Action Plan

## 0.1 Executive Summary

Based on the bug description, the Blitzy platform understands that the bug is: **the `server.js` file requires review and potential implementation of missing robustness features including error handling, graceful shutdown, input validation, resource cleanup, and robust HTTP request processing**.

#### Problem Statement

The user requested a comprehensive review of `server.js` for potential issues in these critical areas:
- **Missing error handling**: Synchronous and asynchronous errors not being caught and handled appropriately
- **Graceful shutdown**: No mechanism to handle SIGTERM/SIGINT signals for clean process termination
- **Input validation**: No protection against malformed requests or payload size limits
- **Resource cleanup**: No orderly release of resources (connections, file handles) during shutdown
- **Robust HTTP request processing**: Lack of proper middleware chain and error propagation

#### Technical Failure Translation

| User Language | Technical Translation |
|--------------|----------------------|
| "Missing error handling" | No Express error-handling middleware (4-argument middleware function), no process-level exception handlers |
| "Graceful shutdown" | No SIGTERM/SIGINT signal listeners, no `server.close()` implementation |
| "Input validation" | No body-parser size limits, no request sanitization middleware |
| "Resource cleanup" | No shutdown timeout mechanism, no connection draining logic |
| "Robust HTTP processing" | No centralized error middleware, no 404 handler, no health check endpoint |

#### Initial State

Upon repository inspection, the repository was found in a **greenfield state** containing only a README.md file. The `server.js` file did not exist, requiring implementation from scratch following the Technical Specification requirements.

#### Resolution Approach

The solution implements a comprehensive Express.js HTTP server with all requested robustness features following industry best practices sourced from Express.js official documentation, PM2 documentation, and established Node.js patterns.

## 0.2 Root Cause Identification

Based on research, THE root cause(s) is (are):

#### Root Cause #1: Missing Error Handling Infrastructure

**Located in**: `server.js` (file did not exist - greenfield repository)

**Technical Issue**: No Express error-handling middleware was present. Express requires a 4-argument middleware function `(err, req, res, next)` defined after all routes to catch and handle errors uniformly.

**Evidence**: Repository inspection via `get_source_folder_contents` and `bash` commands revealed only `README.md` exists in the project.

#### Root Cause #2: Absent Graceful Shutdown Logic

**Located in**: `server.js` (missing implementation)

**Technical Issue**: Node.js servers do not handle shutdown signals gracefully by default. When SIGTERM or SIGINT is received, in-flight requests are immediately terminated, potentially causing data corruption or incomplete operations.

**Evidence**: Web search confirms that "Node.js does not handle shutting itself down very nicely out of the box" and requires explicit signal handlers.

#### Root Cause #3: No Input Validation Middleware

**Located in**: `server.js` (missing implementation)

**Technical Issue**: Without `express.json()` and `express.urlencoded()` middleware with size limits, the server is vulnerable to oversized payload attacks and malformed JSON parsing errors.

**Evidence**: Express.js official documentation recommends body parser middleware with explicit `limit` options.

#### Root Cause #4: Missing Process-Level Exception Handlers

**Located in**: `server.js` (missing implementation)

**Technical Issue**: Without `uncaughtException` and `unhandledRejection` handlers, unhandled errors can crash the Node.js process without proper logging or cleanup.

**Evidence**: Best practices documentation confirms these handlers are essential for production applications.

#### Conclusion Justification

This conclusion is definitive because:
- Repository analysis confirms `server.js` does not exist
- Technical Specification sections 5.2 and 8.2 define requirements for Node.js/Express implementation
- Web search confirms industry-standard patterns for all identified issues
- All root causes trace back to missing implementation of required server infrastructure

## 0.3 Diagnostic Execution

#### Code Examination Results

**File analyzed**: `server.js` (relative to repository root)

**Initial state**: File did not exist - greenfield repository

**Implementation created**: Lines 1-227 containing complete server implementation

**Key implementation sections**:
- Lines 33-60: Request processing middleware (shutdown check, body parsers, logging)
- Lines 64-90: Route handlers (/hello, /evening, /, /health)
- Lines 94-117: Error handling (404 handler and global error middleware)
- Lines 121-159: Graceful shutdown handler with timeout mechanism
- Lines 163-191: Process signal and exception handlers

#### Repository Analysis Findings

| Tool Used | Command Executed | Finding | File:Line |
|-----------|-----------------|---------|-----------|
| bash | `find / -name ".blitzyignore" 2>/dev/null` | No ignore files found | N/A |
| get_source_folder_contents | `folder_path: ""` | Only README.md exists | Root directory |
| bash | `pwd && ls -la` | Working directory: `/tmp/blitzy/Repo-Test-Sud/Dec22Sud` | N/A |
| bash | `node --version` | Node.js v20.19.6 installed | N/A |
| bash | `npm --version` | NPM 11.1.0 installed | N/A |
| get_tech_spec_section | `5.2 Component Details` | Node 18.x/20.x, Express 4.18.x required | Tech Spec |
| get_tech_spec_section | `8.2 Local Development Environment` | Port 3000 required | Tech Spec |

#### Web Search Findings

**Search queries**:
- "Express.js graceful shutdown error handling best practices 2024"
- "Express.js unhandled exception uncaughtException error handling middleware"

**Web sources referenced**:
- Express.js Official Documentation (expressjs.com)
- PM2 Documentation - Graceful Shutdown Best Practices
- Medium articles on Express.js production patterns
- Lagoon Documentation on Node.js Graceful Shutdown
- GeeksforGeeks Express.js Error Handling Guide

**Key findings incorporated**:
- Use `server.close()` to stop accepting new connections while finishing existing ones
- Handle both SIGTERM (process managers) and SIGINT (Ctrl+C) signals
- Implement `uncaughtException` and `unhandledRejection` process handlers
- Use 4-argument middleware `(err, req, res, next)` for Express error handling
- Set `Connection: close` header during shutdown to signal clients
- Use timeout mechanism to force exit if graceful shutdown exceeds threshold

#### Fix Verification Analysis

**Steps followed to reproduce bug**: Repository inspection confirmed missing `server.js` file

**Confirmation tests used**:
```bash
# All endpoints verified working:
curl -s http://localhost:3000/hello   # Returns "Hello world"
curl -s http://localhost:3000/evening # Returns "Good evening"
curl -s http://localhost:3000/health  # Returns {"status":"healthy"}
curl -s http://localhost:3000/invalid # Returns 404 JSON error

#### Graceful shutdown verified:
#### Server received SIGTERM and exited gracefully with code 0
```

**Boundary conditions and edge cases covered**:
- 404 responses for unknown routes (GET, POST, PUT, DELETE)
- Malformed JSON body handling (returns 400)
- Query parameter handling
- Trailing slash handling
- Double-slash path handling
- HEAD request support

**Verification status**: Successful, confidence level **95%**

## 0.4 Bug Fix Specification

#### The Definitive Fix

**Files to modify**: `server.js` (created new file)

**Implementation approach**: Create comprehensive Express.js server with all robustness features

**This fixes the root cause by**: Implementing industry-standard patterns for error handling, graceful shutdown, input validation, resource cleanup, and robust HTTP processing.

#### Change Instructions

**CREATE** file `server.js` with the following key components:

**1. Error Handling Middleware** (Lines 94-117)
```javascript
// 404 Not Found Handler - catches all unmatched routes
app.use((req, res, next) => {
  const error = new Error(`Not Found: ${req.method} ${req.url}`);
  error.status = 404;
  next(error);
});

// Global Error Middleware - 4-argument signature required by Express
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({ error: err.message, status: statusCode });
});
```

**2. Graceful Shutdown Handler** (Lines 121-159)
```javascript
// Graceful shutdown with timeout mechanism
const gracefulShutdown = (signal) => {
  isShuttingDown = true;
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  server.close(() => { clearTimeout(timeout); process.exit(0); });
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

**3. Input Validation Middleware** (Lines 46-51)
```javascript
// Body parsers with size limits to prevent payload attacks
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
```

**4. Process Exception Handlers** (Lines 167-191)
```javascript
// Handle uncaught synchronous exceptions
process.on('uncaughtException', (err) => { console.error(err); process.exit(1); });
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => { gracefulShutdown('UNHANDLED_REJECTION'); });
```

**5. Shutdown State Middleware** (Lines 35-45)
```javascript
// Reject new connections during shutdown
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.setHeader('Connection', 'close');
    return res.status(503).json({ error: 'Server shutting down' });
  }
  next();
});
```

#### Fix Validation

**Test command to verify fix**:
```bash
NODE_ENV=test npm test
```

**Expected output after fix**:
```
Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
```

**Confirmation method**:
- All 22 unit tests passing
- Manual endpoint testing via curl commands
- Graceful shutdown verification via SIGTERM signal
- Error response verification for 404 and malformed JSON

#### User Interface Design

No Figma screens or UI components were provided for this implementation. The server is a backend-only HTTP API service.

## 0.5 Scope Boundaries

#### Changes Required (EXHAUSTIVE LIST)

| File | Lines | Specific Change |
|------|-------|-----------------|
| `server.js` | 1-227 | CREATE complete server implementation with all robustness features |
| `package.json` | 1-22 | CREATE project configuration with Express 4.18.2 dependency |
| `server.test.js` | 1-210 | CREATE comprehensive unit test suite (22 test cases) |
| `node_modules/` | N/A | INSTALL Express.js and dev dependencies (jest, supertest) |

**No other files require modification.**

#### Explicitly Excluded

**Do not modify**:
- `README.md` - Existing documentation file, out of scope for server implementation
- Any CI/CD configuration files - Not part of the bug fix scope
- Docker/Kubernetes configurations - Deployment infrastructure out of scope

**Do not refactor**:
- Express.js internal modules - Use framework as-is
- Node.js core modules - Use standard library without modification

**Do not add**:
- Database connectivity - Not required per Technical Specification (stateless design)
- Authentication/Authorization - Not part of current requirements
- External API integrations - Out of scope for this educational tutorial
- Advanced logging frameworks (Winston, Bunyan) - Console logging sufficient for tutorial
- Process managers (PM2 config) - Beyond scope of server.js review
- HTTPS/TLS configuration - HTTP sufficient for localhost development
- Rate limiting - Not specified in requirements
- CORS configuration - Not required for basic tutorial endpoints

#### Scope Rationale

The implementation strictly addresses the five areas identified in the user request:
1. **Error handling** ✓ - Global error middleware and 404 handler implemented
2. **Graceful shutdown** ✓ - SIGTERM/SIGINT handlers with timeout mechanism
3. **Input validation** ✓ - Body parser middleware with size limits
4. **Resource cleanup** ✓ - Connection draining via server.close()
5. **Robust HTTP processing** ✓ - Middleware chain, health endpoint, proper response formats

## 0.6 Verification Protocol

#### Bug Elimination Confirmation

**Execute test suite**:
```bash
NODE_ENV=test npm test
```

**Verify output matches**:
```
PASS ./server.test.js
  Express Server Tests
    GET /
      ✓ should return server status JSON
    GET /hello
      ✓ should return "Hello world" text
    GET /evening
      ✓ should return "Good evening" text
    GET /health
      ✓ should return healthy status with uptime
    404 Not Found Handler
      ✓ should return 404 for unknown GET route
      ✓ should return 404 for unknown POST route
      ✓ should return 404 for unknown PUT route
      ✓ should return 404 for unknown DELETE route
    Input Validation - Body Parsing
      ✓ should accept valid JSON body
      ✓ should handle malformed JSON gracefully
    ...
Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
```

**Confirm error handling works**:
```bash
curl -s http://localhost:3000/nonexistent | jq
# Expected: {"error":"Not Found: GET /nonexistent","status":404}
```

**Validate graceful shutdown**:
```bash
# Start server in background
node server.js &
sleep 2
# Send SIGTERM
kill -SIGTERM $!
# Expected output: "Graceful shutdown complete. Exiting with code 0."
```

#### Regression Check

**Run existing test suite**:
```bash
npm test
```

**Verify unchanged behavior in**:
- All existing endpoints return expected responses
- Response content-types are correct (text/plain for /hello, /evening; application/json for others)
- HTTP status codes match specifications

**Confirm performance metrics**:
```bash
# Health endpoint includes uptime metric
curl -s http://localhost:3000/health | jq '.uptime'
# Should return a number >= 0
```

#### Test Coverage Summary

| Test Category | Tests | Status |
|--------------|-------|--------|
| Root Endpoint | 1 | ✓ Pass |
| Hello Endpoint | 1 | ✓ Pass |
| Evening Endpoint | 1 | ✓ Pass |
| Health Check | 1 | ✓ Pass |
| 404 Error Handling | 4 | ✓ Pass |
| Input Validation | 2 | ✓ Pass |
| HTTP Methods | 2 | ✓ Pass |
| Response Formats | 3 | ✓ Pass |
| Edge Cases | 5 | ✓ Pass |
| Server Status | 2 | ✓ Pass |
| **Total** | **22** | **✓ All Pass** |

## 0.7 Execution Requirements

#### Research Completeness Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Repository structure fully mapped | ✓ Complete | `get_source_folder_contents` returned README.md only |
| All related files examined with retrieval tools | ✓ Complete | Bash commands confirmed no existing server.js |
| Bash analysis completed for patterns/dependencies | ✓ Complete | Node v20.19.6, NPM 11.1.0 verified |
| Root cause definitively identified with evidence | ✓ Complete | Missing server implementation confirmed |
| Single solution determined and validated | ✓ Complete | 22/22 tests passing |

#### Fix Implementation Rules

**Make the exact specified change only**:
- Created `server.js` with comprehensive robustness features
- Created `package.json` with required dependencies
- Created `server.test.js` with complete test coverage

**Zero modifications outside the bug fix**:
- No changes to README.md
- No infrastructure modifications
- No additional configuration files

**No interpretation or improvement of working code**:
- Implementation follows Technical Specification exactly
- Uses Express 4.18.2 as specified
- Targets Node.js 18.x/20.x as documented

**Preserve all whitespace and formatting except where changed**:
- Consistent code style throughout implementation
- Proper JSDoc-style comments for documentation
- Section separators for code organization

#### Runtime Requirements

| Component | Required Version | Installed Version | Status |
|-----------|-----------------|-------------------|--------|
| Node.js | 18.x or 20.x LTS | v20.19.6 | ✓ Compatible |
| NPM | Latest | 11.1.0 | ✓ Compatible |
| Express | 4.18.x | 4.18.2 | ✓ Exact Match |

#### Execution Commands

**Start server**:
```bash
npm start
# or
node server.js
```

**Run tests**:
```bash
npm test
```

**Install dependencies**:
```bash
npm install
```

#### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | HTTP server port |
| `HOST` | localhost | Server bind address |
| `NODE_ENV` | (none) | Set to 'test' for testing, 'production' for prod |

## 0.8 References

#### Files and Folders Searched

| Path | Type | Purpose |
|------|------|---------|
| `/tmp/blitzy/Repo-Test-Sud/Dec22Sud/` | Folder | Repository root directory |
| `/tmp/blitzy/Repo-Test-Sud/Dec22Sud/README.md` | File | Project documentation (only existing file) |
| `/tmp/environments_files/` | Folder | Environment files directory (empty) |

#### Technical Specification Sections Referenced

| Section | Title | Key Information |
|---------|-------|-----------------|
| 1.2 | System Overview | Educational tutorial, two endpoints required |
| 5.2 | Component Details | Node 18.x/20.x, Express 4.18.x specifications |
| 8.2 | Local Development Environment | Port 3000, localhost configuration |
| Node.js Runtime Requirements | Version Requirements | Node.js 18.x or 20.x LTS recommended |
| Express.js Version Requirements | Framework Specs | Express 4.18.x recommended |

#### Web Sources Referenced

| Source | URL | Key Finding |
|--------|-----|-------------|
| Express.js Official Docs | expressjs.com/en/guide/error-handling.html | 4-argument error middleware pattern |
| Express.js Official Docs | expressjs.com/en/advanced/healthcheck-graceful-shutdown.html | Health check and shutdown patterns |
| PM2 Documentation | pm2.io/docs/runtime/best-practices/graceful-shutdown/ | SIGINT/SIGTERM handling, server.close() pattern |
| Lagoon Documentation | docs.lagoon.sh/using-lagoon-advanced/nodejs/ | Graceful shutdown implementation details |
| Medium - Arunangshu Das | medium.com/@arunangshudas | Production shutdown patterns, Connection: close header |
| ButterCMS | buttercms.com/blog/express-js-error-handling/ | uncaughtException and unhandledRejection handlers |
| Dev.to | dev.to/superiqbal7 | SIGINT vs SIGTERM signal differences |

#### Attachments Provided

No attachments were provided for this project.

#### Figma Screens Provided

No Figma screens or URLs were provided for this implementation.

#### Created Files Summary

| File | Lines | Description |
|------|-------|-------------|
| `server.js` | 227 | Express.js HTTP server with error handling, graceful shutdown, input validation, resource cleanup |
| `package.json` | 22 | NPM package configuration with Express 4.18.2 and dev dependencies |
| `server.test.js` | 210 | Comprehensive test suite with 22 test cases covering all functionality |

#### Dependencies Installed

| Package | Version | Type | Purpose |
|---------|---------|------|---------|
| express | 4.18.2 | Production | HTTP server framework |
| jest | ^29.7.0 | Development | Test runner |
| supertest | ^7.0.0 | Development | HTTP assertion library |

