# Technical Specification

# 0. Agent Action Plan

## 0.1 Intent Clarification

### 0.1.1 Core Testing Objective

Based on the provided requirements, the Blitzy platform understands that the testing objective is to **create a comprehensive unit test suite for server.js** that validates all HTTP server functionality using either Jest or Mocha testing frameworks.

**Request Categorization**: Add new tests (greenfield test implementation)

**Testing Requirements with Enhanced Clarity**:

- **HTTP Response Testing**: Validate that all endpoints return expected response bodies
  - `/hello` endpoint must return exactly "Hello world"
  - `/evening` endpoint must return exactly "Good evening"
  - Response content type headers must be appropriate (text/html or text/plain)
  
- **Status Code Testing**: Verify correct HTTP status codes for all scenarios
  - Success responses (200 OK) for valid endpoint requests
  - Error responses (404 Not Found) for undefined routes
  - Appropriate error codes for edge cases
  
- **Header Validation**: Test HTTP response headers
  - Content-Type header correctness
  - Content-Length header accuracy
  - Custom headers if applicable
  
- **Server Startup/Shutdown Testing**: Validate server lifecycle
  - Server binds to port 3000 successfully
  - Server handles EADDRINUSE port conflicts gracefully
  - Graceful shutdown releases resources properly
  
- **Error Handling Testing**: Verify robust error management
  - Malformed requests handled appropriately
  - Invalid HTTP methods return proper errors
  - Unhandled route requests return 404
  
- **Edge Case Testing**: Cover boundary conditions
  - Concurrent request handling
  - Empty request bodies
  - Large request payloads (if applicable)
  - Special characters in URLs

**Implicit Testing Needs Identified**:

- Test isolation ensuring each test runs independently
- Mock/stub patterns for server lifecycle tests
- Proper test teardown to prevent port conflicts between tests
- Async/await pattern usage for HTTP request testing

### 0.1.2 Special Instructions and Constraints

**Critical Directives**:
- Tests must be compatible with both Jest and Mocha frameworks as specified by user
- Focus on unit testing server.js functionality specifically
- Follow existing Node.js/Express.js patterns in the repository
- Tests should not require actual network connections during execution

**Testing Requirements**:
- Use Supertest library for HTTP endpoint testing (industry standard)
- Maintain separation between app initialization and server listening for testability
- Follow established Express.js testing conventions
- Ensure all tests can run in CI/CD environments

**Web Search Requirements Documented**:
- Jest latest version compatibility with Node.js 18.x/20.x LTS
- Supertest integration patterns with Express.js
- Best practices for testing Express.js HTTP servers
- Graceful server shutdown testing approaches

### 0.1.3 Technical Interpretation

These testing requirements translate to the following technical test implementation strategy:

- **To test HTTP responses**, we will create unit tests using Supertest that send GET requests to `/hello` and `/evening` endpoints and assert response body content
- **To test status codes**, we will create tests that verify the `.status()` property of HTTP responses matches expected values (200, 404)
- **To test headers**, we will create assertions using Supertest's `.expect('Content-Type', /text/)` pattern
- **To test server startup**, we will create tests that verify the server.listen callback is invoked and port binding succeeds
- **To test server shutdown**, we will create tests that verify server.close() releases the port and triggers appropriate callbacks
- **To test error handling**, we will create tests for undefined routes, invalid methods, and edge case requests

### 0.1.4 Coverage Requirements Interpretation

**Explicit Coverage Targets**: Not specified by user - will follow industry standards

**Implicit Coverage Expectations Based on Analysis**:

| Coverage Area | Target | Rationale |
|---------------|--------|-----------|
| Statement Coverage | ≥80% | Industry standard for Node.js applications |
| Branch Coverage | ≥75% | Ensure error handling paths are tested |
| Function Coverage | 100% | All exported functions must be tested |
| Line Coverage | ≥80% | Comprehensive testing requirement |

**Existing Coverage Patterns**: Repository currently has ZERO automated tests (manual testing only per tech spec section 6.6)

**Critical Paths Requiring Coverage**:
- Server initialization flow (http.createServer → server.listen)
- Route handler execution (/hello and /evening routes)
- Response generation (res.send/res.end calls)
- Error response generation for 404 routes

**To achieve comprehensive testing, coverage should include**:
- All HTTP endpoint handlers with happy path and error scenarios
- Server lifecycle methods (startup, shutdown)
- All response status codes and headers
- Edge cases for malformed requests and undefined routes


## 0.2 Test Discovery and Analysis

### 0.2.1 Existing Test Infrastructure Assessment

**Critical Analysis Findings**:

The repository analysis was conducted to identify existing test patterns and infrastructure. Based on comprehensive searches for test files, package manifests, and configuration files:

**Repository Analysis Results**:
- **Search Pattern**: `*test*, *spec*, test_*, *_test.*, *_spec.*`
- **Result**: No test files found in the repository
- **Package Files**: No package.json, requirements.txt, or dependency manifests present
- **Test Configuration**: No jest.config.*, pytest.ini, .mocharc.*, or test configuration files detected

**Document Findings**: "Repository analysis reveals NO existing testing setup - this is a greenfield test implementation. The Tech Spec Section 6.6 (Testing Strategy) explicitly states manual testing methodology only, with automated testing frameworks (Jest, Mocha) listed as 'Excluded Testing Infrastructure'."

**Current Repository State**:

| Item | Status | Notes |
|------|--------|-------|
| Test Framework | Not Installed | Jest or Mocha required |
| Test Runner Configuration | Not Present | Must create jest.config.js or .mocharc.js |
| Coverage Tools | Not Installed | Need to add nyc or jest --coverage |
| Mock/Stub Libraries | Not Present | Supertest handles HTTP mocking |
| Test Data Fixtures | Not Present | Simple test cases - minimal fixtures needed |

**Tech Spec Conflict Note**: The current Technical Specification Section 6.6 explicitly excludes automated testing frameworks. This user request represents a **specification change** that supersedes the existing "Manual Testing Only" mandate. The implementation plan acknowledges this transition.

### 0.2.2 Target Implementation Architecture

Based on Technical Specification sections 5.2 (Component Details) and Express.js Request Processing Pipeline:

**Phase 1 - Vanilla Node.js HTTP Server (F-001)**:
```javascript
// Expected server.js structure
const http = require('http');
const server = http.createServer((req, res) => {
  // Route handling
});
server.listen(3000);
```

**Phase 2 - Express.js Framework Layer (F-003)**:
```javascript
// Expected server.js structure  
const express = require('express');
const app = express();
app.get('/hello', handler);
app.listen(3000);
```

**Endpoints to Test** (from F-002 and F-004):

| Endpoint | Method | Response | Status |
|----------|--------|----------|--------|
| `/hello` | GET | "Hello world" | 200 |
| `/evening` | GET | "Good evening" | 200 |
| `/*` (undefined) | ANY | Error | 404 |

### 0.2.3 Web Search Research Conducted

**Best Practices for Jest/Express.js Testing**:
- Separate Express app initialization from server listening for testability
- Use Supertest library for HTTP endpoint testing without starting actual server
- Configure Jest with `testEnvironment: 'node'` for backend testing
- Implement proper beforeAll/afterAll hooks for server lifecycle management

**Recommended Mocking Strategies**:
- Supertest handles server mocking internally - passes Express app directly
- No need for external HTTP mocking libraries
- Server lifecycle testing requires separate mock approach

**Test Organization Conventions**:
- Create `tests/` or `__tests__/` directory at project root
- Name test files as `*.test.js` or `*.spec.js`
- Organize by test type: unit/, integration/, e2e/

**Common Pitfalls to Avoid**:
- Starting server in test file prevents parallel test execution
- Not closing server connections causes "port in use" errors
- Forgetting async/await patterns causes race conditions
- Testing against running server instead of using Supertest


## 0.3 Testing Scope Analysis

### 0.3.1 Test Target Identification

**Primary Code to be Tested**:

| Module/File | Path | Test Types Required |
|-------------|------|---------------------|
| HTTP Server Core | `server.js` | Unit tests, Integration tests |
| Express App (if Phase 2) | `app.js` | Unit tests, Integration tests |
| Route Handlers | `server.js` or `routes/*.js` | Unit tests |

**Functions Requiring Tests**:

| Function/Handler | Test Categories |
|------------------|-----------------|
| `createServer()` callback | Request/Response handling, routing logic |
| `app.get('/hello', ...)` | Happy path, response validation |
| `app.get('/evening', ...)` | Happy path, response validation |
| `server.listen()` | Server startup, port binding |
| `server.close()` | Graceful shutdown |
| 404 handler | Undefined route handling |

**Existing Test File Mapping**:

| Source File | Existing Test File | Test Categories Present |
|-------------|-------------------|-------------------------|
| `server.js` | None | N/A |
| `app.js` | None | N/A |

**Dependencies Requiring Mocking**:

| Dependency Type | Component | Mocking Strategy |
|-----------------|-----------|------------------|
| HTTP Server | `http.createServer` | Supertest wraps Express/http.Server |
| Express App | `express()` | Pass directly to Supertest |
| Port Binding | `server.listen(3000)` | Supertest binds to ephemeral port |
| Console Output | `console.log` | Jest mock functions |

### 0.3.2 Version Compatibility Research

Based on current Node.js version 18.x/20.x LTS requirements from the Tech Spec, the recommended testing stack:

**Jest Configuration (Recommended Primary Framework)**:

| Component | Package | Version | Rationale |
|-----------|---------|---------|-----------|
| Testing Framework | jest | ^29.7.0 | Node.js 18.x/20.x compatible, stable LTS-aligned version |
| HTTP Testing | supertest | ^7.0.0 | Latest stable, Express.js compatible |
| Type Definitions | @types/jest | ^29.5.0 | TypeScript support if needed |
| Type Definitions | @types/supertest | ^6.0.0 | TypeScript support if needed |

**Mocha Configuration (Alternative Framework)**:

| Component | Package | Version | Rationale |
|-----------|---------|---------|-----------|
| Testing Framework | mocha | ^10.7.0 | Node.js 18.x/20.x compatible |
| Assertion Library | chai | ^5.1.0 | Modern assertion syntax |
| HTTP Testing | supertest | ^7.0.0 | Framework agnostic |
| Coverage Tool | nyc | ^17.0.0 | Istanbul-based coverage |

**Version Conflicts to Resolve**:
- Jest 30.x is available but requires Node.js 18.x minimum - compatible with project
- Jest 29.x provides broader compatibility if Node.js 16.x support is ever needed
- Recommendation: Use Jest 29.x for maximum stability with Node.js LTS releases

**Node.js Runtime Compatibility**:

| Node.js Version | Jest 29.x | Jest 30.x | Mocha 10.x |
|-----------------|-----------|-----------|------------|
| 18.x LTS | ✓ | ✓ | ✓ |
| 20.x LTS | ✓ | ✓ | ✓ |
| 22.x | ✓ | ✓ | ✓ |


## 0.4 Test Implementation Design

### 0.4.1 Test Strategy Selection

**Test Types to Implement**:

| Test Type | Focus Area | Priority |
|-----------|-----------|----------|
| Unit Tests | Isolated endpoint handlers, response formatting | High |
| Integration Tests | End-to-end HTTP request/response cycles | High |
| Edge Case Tests | Boundary conditions, invalid inputs | Medium |
| Error Handling Tests | 404 routes, server errors, malformed requests | High |
| Lifecycle Tests | Server startup, shutdown, port binding | Medium |

### 0.4.2 Test Case Blueprint

**Component: Hello World Endpoint (F-002)**

```
Test Categories:
- Happy path: GET /hello returns "Hello world" with 200 status
- Response validation: Content-Type header is text/html or text/plain
- Response validation: Response body exactly matches "Hello world"
- Edge cases: Request with query parameters still returns expected response
- Error cases: Non-GET methods return 404 or 405
```

**Component: Good Evening Endpoint (F-004)**

```
Test Categories:
- Happy path: GET /evening returns "Good evening" with 200 status
- Response validation: Content-Type header is appropriate
- Response validation: Response body exactly matches "Good evening"
- Edge cases: Request with trailing slash (/evening/) behavior
- Error cases: Non-GET methods return 404 or 405
```

**Component: Server Lifecycle**

```
Test Categories:
- Happy path: Server starts and listens on port 3000
- Happy path: Server binds to specified port successfully
- Error cases: EADDRINUSE when port is occupied
- Shutdown: server.close() releases port
- Shutdown: Callback invoked on successful close
```

**Component: Error Handling / 404 Routes**

```
Test Categories:
- Undefined routes: GET /unknown returns 404
- Undefined routes: POST /hello returns 404 or 405
- Edge cases: Root path (/) behavior
- Edge cases: Deeply nested undefined paths (/a/b/c/d)
```

### 0.4.3 Existing Test Extension Strategy

Since no tests currently exist, this is entirely new test creation:

- **Tests to create**: All test files must be created from scratch
- **Tests to extend**: N/A - no existing tests
- **Tests to refactor**: N/A - no existing tests
- **Tests to fix**: N/A - no existing tests

### 0.4.4 Test Data and Fixtures Design

**Required Test Data Structures**:

| Data Type | Purpose | Location |
|-----------|---------|----------|
| Expected Response Bodies | Assert endpoint responses | Inline in tests |
| Expected Status Codes | Assert HTTP status codes | Inline constants |
| Invalid Route Paths | Test 404 handling | Test file constants |
| Mock Server Config | Server lifecycle tests | Test setup files |

**Fixture Organization Strategy**:

```
tests/
├── fixtures/
│   └── constants.js       # Expected values, test URLs
├── helpers/
│   └── test-utils.js      # Common test utilities
├── unit/
│   └── server.test.js     # Main server unit tests
└── integration/
    └── endpoints.test.js  # HTTP endpoint integration tests
```

**Mock Object Specifications**:

| Mock Target | Implementation | Purpose |
|-------------|---------------|---------|
| Express App | Import directly, pass to Supertest | HTTP testing without port binding |
| Console.log | jest.spyOn(console, 'log') | Verify server startup messages |
| Process.exit | jest.spyOn(process, 'exit') | Test graceful shutdown |

**Test Database/State Management Approach**:
- No database interaction - stateless endpoints only
- Each test is fully isolated
- No shared state between tests
- Use beforeEach/afterEach for server cleanup if needed


## 0.5 Test File Transformation Mapping

### 0.5.1 File-by-File Test Plan

**Critical**: This section maps EVERY test file to be created, updated, or deleted.

**Transformation Modes**:
- **CREATE** - Create a new test file
- **UPDATE** - Update an existing test file
- **DELETE** - Remove an obsolete test file
- **REFERENCE** - Use as an example for test patterns and styles

| Target Test File | Transformation | Source File/Reference | Purpose/Changes |
|-----------------|----------------|----------------------|-----------------|
| `tests/unit/server.test.js` | CREATE | `server.js` | Comprehensive unit tests for HTTP server: response content, status codes, headers, error handling |
| `tests/unit/server.startup.test.js` | CREATE | `server.js` | Server lifecycle tests: startup, port binding, shutdown |
| `tests/integration/endpoints.test.js` | CREATE | `server.js` | End-to-end HTTP endpoint integration tests using Supertest |
| `tests/helpers/test-utils.js` | CREATE | N/A | Common test utilities, server creation helpers, cleanup functions |
| `tests/fixtures/constants.js` | CREATE | N/A | Test constants: expected responses, URLs, status codes |
| `jest.config.js` | CREATE | N/A | Jest configuration for Node.js environment |
| `package.json` | UPDATE | `package.json` | Add test scripts and devDependencies for Jest/Supertest |

### 0.5.2 New Test Files Detail

**tests/unit/server.test.js** - Core Server Unit Tests

| Test Suite | Test Cases | Assertions |
|------------|------------|------------|
| `describe('GET /hello')` | returns "Hello world", status 200, correct headers | 6-8 assertions |
| `describe('GET /evening')` | returns "Good evening", status 200, correct headers | 6-8 assertions |
| `describe('404 Handling')` | undefined routes return 404, proper error format | 4-6 assertions |
| `describe('HTTP Methods')` | POST/PUT/DELETE to defined routes | 4-6 assertions |

```
File: tests/unit/server.test.js
Test categories: happy path, response validation, edge cases, errors
Mock dependencies: None (uses Supertest)
Assertions focus: Response body, status codes, Content-Type headers
```

**tests/unit/server.startup.test.js** - Server Lifecycle Tests

| Test Suite | Test Cases | Assertions |
|------------|------------|------------|
| `describe('Server Startup')` | listens on port, console output | 3-4 assertions |
| `describe('Server Shutdown')` | graceful close, callback invoked | 2-3 assertions |
| `describe('Port Conflicts')` | EADDRINUSE handling | 2-3 assertions |

```
File: tests/unit/server.startup.test.js
Test categories: startup sequence, shutdown sequence, error scenarios
Mock dependencies: console.log, process.exit
Assertions focus: Callback invocation, port binding success
```

**tests/integration/endpoints.test.js** - HTTP Integration Tests

| Test Suite | Test Cases | Assertions |
|------------|------------|------------|
| `describe('Endpoint Integration')` | full request/response cycle | 10-15 assertions |
| `describe('Headers Validation')` | Content-Type, Content-Length | 4-6 assertions |
| `describe('Edge Cases')` | query params, trailing slashes | 4-6 assertions |

```
File: tests/integration/endpoints.test.js
Integration points: HTTP layer, Express routing, response formatting
Test data requirements: Expected response constants
```

### 0.5.3 Test Configuration Files

**jest.config.js** - Jest Configuration

```
Configuration settings:
- testEnvironment: 'node'
- testMatch: ['**/tests/**/*.test.js']
- coverageDirectory: 'coverage'
- collectCoverageFrom: ['server.js', 'app.js']
- coverageThreshold: { global: { branches: 75, functions: 100, lines: 80 } }
```

**package.json Updates** - Test Scripts

```
Scripts to add:
- "test": "jest"
- "test:watch": "jest --watch"
- "test:coverage": "jest --coverage"
- "test:ci": "jest --ci --coverage --watchAll=false"
```

### 0.5.4 Test Helper Files Detail

**tests/helpers/test-utils.js** - Common Test Utilities

```
Exports:
- createTestApp(): Returns Express app without listening
- cleanupServer(server): Ensures server is closed after tests
- getExpectedResponse(endpoint): Returns expected response for endpoint
```

**tests/fixtures/constants.js** - Test Constants

```
Exports:
- ENDPOINTS: { HELLO: '/hello', EVENING: '/evening' }
- EXPECTED_RESPONSES: { HELLO: 'Hello world', EVENING: 'Good evening' }
- STATUS_CODES: { OK: 200, NOT_FOUND: 404 }
- CONTENT_TYPES: { TEXT: 'text/html' }
```

### 0.5.5 Cross-File Test Dependencies

**Shared Resources**:

| Resource | Location | Used By |
|----------|----------|---------|
| Test Constants | `tests/fixtures/constants.js` | All test files |
| Test Utilities | `tests/helpers/test-utils.js` | All test files |
| Jest Config | `jest.config.js` | Test runner |
| App Export | `app.js` or `server.js` | All integration tests |

**Import Updates Required**:

```javascript
// All test files will need:
const request = require('supertest');
const app = require('../../server'); // or app.js
const { EXPECTED_RESPONSES } = require('../fixtures/constants');
```

### 0.5.6 Complete Test File Inventory

| File Path | Type | Lines Est. | Priority |
|-----------|------|------------|----------|
| `tests/unit/server.test.js` | Unit Tests | 150-200 | P0 |
| `tests/unit/server.startup.test.js` | Unit Tests | 80-100 | P1 |
| `tests/integration/endpoints.test.js` | Integration | 100-150 | P0 |
| `tests/helpers/test-utils.js` | Utility | 30-50 | P0 |
| `tests/fixtures/constants.js` | Fixtures | 20-30 | P0 |
| `jest.config.js` | Config | 20-30 | P0 |

**Total Estimated Test Lines**: 400-560 lines
**Total Test Files**: 6 files


## 0.6 Dependency Inventory

### 0.6.1 Testing Dependencies

All key testing packages relevant to this testing exercise:

**Primary Testing Stack (Jest)**:

| Registry | Package Name | Version | Purpose |
|----------|--------------|---------|---------|
| npm | jest | ^29.7.0 | Testing framework - stable with Node.js 18.x/20.x |
| npm | supertest | ^7.0.0 | HTTP assertions and endpoint testing |
| npm | @types/jest | ^29.5.0 | TypeScript definitions (optional) |
| npm | @types/supertest | ^6.0.0 | TypeScript definitions (optional) |

**Alternative Testing Stack (Mocha)**:

| Registry | Package Name | Version | Purpose |
|----------|--------------|---------|---------|
| npm | mocha | ^10.7.0 | Testing framework alternative |
| npm | chai | ^5.1.0 | Assertion library for Mocha |
| npm | supertest | ^7.0.0 | HTTP assertions and endpoint testing |
| npm | nyc | ^17.0.0 | Code coverage instrumentation |

**Application Dependencies** (from Tech Spec):

| Registry | Package Name | Version | Purpose |
|----------|--------------|---------|---------|
| npm | express | ^4.18.2 | Web framework (Phase 2) |
| npm | http | built-in | Node.js HTTP module (Phase 1) |

### 0.6.2 DevDependencies Configuration

**Recommended package.json devDependencies**:

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

**For Mocha alternative**:

```json
{
  "devDependencies": {
    "mocha": "^10.7.0",
    "chai": "^5.1.0",
    "supertest": "^7.0.0",
    "nyc": "^17.0.0"
  }
}
```

### 0.6.3 Import Updates

**Test Files Requiring Import Configuration**:

| Test File | Required Imports |
|-----------|------------------|
| `tests/**/*.test.js` | `supertest`, `app/server` module |
| `tests/helpers/test-utils.js` | `express` (for test app creation) |
| `tests/fixtures/constants.js` | None (pure data exports) |

**Import Transformation Rules**:

For Jest-based tests:
```javascript
// Standard import pattern
const request = require('supertest');
const app = require('../../server');
// OR for separated app/server
const app = require('../../app');
```

For Mocha-based tests:
```javascript
// Mocha with Chai imports
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../server');
```

### 0.6.4 Version Compatibility Matrix

| Node.js | Jest 29.x | Supertest 7.x | Express 4.18.x |
|---------|-----------|---------------|----------------|
| 18.x LTS | ✓ | ✓ | ✓ |
| 20.x LTS | ✓ | ✓ | ✓ |
| 22.x | ✓ | ✓ | ✓ |

**No version conflicts identified** - all packages are compatible with Node.js 18.x/20.x LTS targets.

### 0.6.5 Installation Commands

**Primary Installation (Jest)**:
```bash
npm install --save-dev jest supertest
```

**Alternative Installation (Mocha)**:
```bash
npm install --save-dev mocha chai supertest nyc
```

**CI/CD Installation**:
```bash
npm ci  # Uses package-lock.json for reproducible builds
```


## 0.7 Coverage and Quality Targets

### 0.7.1 Coverage Metrics

**Current Coverage**: 0% (No automated tests exist - manual testing only per Tech Spec 6.6)

**Target Coverage Based on Industry Standards**:

| Metric | Current | Target | Rationale |
|--------|---------|--------|-----------|
| Statement Coverage | 0% | ≥80% | Industry standard for backend services |
| Branch Coverage | 0% | ≥75% | Ensure conditional paths tested |
| Function Coverage | 0% | 100% | All public functions must be tested |
| Line Coverage | 0% | ≥80% | Comprehensive code execution |

**Coverage Gaps to Address**:

| Component | Current | Target | Focus Areas |
|-----------|---------|--------|-------------|
| HTTP Endpoints | 0% | 100% | /hello, /evening handlers |
| Error Handling | 0% | 100% | 404 routes, error responses |
| Server Lifecycle | 0% | 80% | startup, shutdown |
| Response Formatting | 0% | 100% | Headers, body content |

**Critical Paths Requiring Full Coverage**:
- `GET /hello` request → response flow
- `GET /evening` request → response flow
- Undefined route → 404 response flow
- Server startup → listening state transition
- Server shutdown → closed state transition

### 0.7.2 Test Quality Criteria

**Assertion Density Expectations**:

| Test Type | Min Assertions per Test | Rationale |
|-----------|------------------------|-----------|
| Unit Tests | 2-3 | Verify single behavior thoroughly |
| Integration Tests | 3-5 | Cover request/response lifecycle |
| Edge Case Tests | 2-3 | Validate boundary conditions |

**Test Isolation Requirements**:
- Each test must be independent and runnable in isolation
- No shared mutable state between tests
- Tests must clean up resources (server connections, mocks)
- Tests must pass regardless of execution order

**Performance Constraints**:

| Metric | Target | Rationale |
|--------|--------|-----------|
| Individual Test Duration | <500ms | Fast feedback cycle |
| Total Test Suite Duration | <10s | CI/CD efficiency |
| Parallel Execution | Supported | Jest default behavior |

**Maintainability Standards**:
- Clear, descriptive test names following pattern: `it('should [expected behavior] when [condition]')`
- DRY principle for common setup/teardown in beforeEach/afterEach
- Avoid magic numbers - use named constants from fixtures
- Single assertion concept per test (multiple assertions for same behavior allowed)

### 0.7.3 Following Repository Test Patterns

Since the repository has no existing tests, patterns will follow industry best practices:

**Naming Conventions**:
- Test files: `*.test.js` (Jest default)
- Test suites: `describe('Component Name', () => {})`
- Test cases: `it('should behavior when condition', () => {})`

**Test Organization**:
```
tests/
├── unit/           # Isolated component tests
├── integration/    # Multi-component tests
├── helpers/        # Test utilities
└── fixtures/       # Test data
```

**Assertion Style**:
```javascript
// Jest expect() syntax
expect(response.status).toBe(200);
expect(response.text).toEqual('Hello world');
```

### 0.7.4 Quality Gates for CI/CD

**Pre-Merge Requirements**:
- All tests must pass (0 failures)
- Coverage thresholds must be met
- No test timeout violations
- No console errors during test execution

**Jest Coverage Configuration**:
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 75,
    functions: 100,
    lines: 80,
    statements: 80
  }
}
```


## 0.8 Scope Boundaries

### 0.8.1 Exhaustively In Scope

**New Test Files**:
- `tests/unit/**/*.test.js` - All unit tests for server components
- `tests/integration/**/*.test.js` - All HTTP integration tests
- `tests/helpers/**/*.js` - Test utility functions
- `tests/fixtures/**/*.js` - Test data and constants

**Test Configuration Files**:
- `jest.config.js` - Jest test runner configuration
- `.jestrc` or `.jestrc.json` - Alternative Jest config (if needed)
- `package.json` scripts section - Test commands

**Source File Modifications** (minimal, for testability only):
- `server.js` - May require separation of app/server for Supertest compatibility
- `app.js` - Create if separating Express app from server.listen()

**Documentation Updates**:
- `README.md` - Testing section with run instructions
- `docs/testing.md` - Comprehensive testing documentation (optional)

### 0.8.2 Explicitly Out of Scope

**Source Code Modifications Beyond Testability**:
- Feature additions to endpoints
- Performance optimizations to server.js
- Refactoring unrelated to test enablement
- Adding new endpoints or routes
- Changing response formats or content

**Unrelated Test Files**:
- Tests for files not specified by user (e.g., database, authentication)
- End-to-end browser tests
- Load/performance tests
- Security/penetration tests

**Infrastructure Changes**:
- CI/CD pipeline modifications (unless test script addition)
- Docker/containerization changes
- Deployment configuration changes
- Database setup or migrations

**Items Explicitly Excluded by User Instructions**:
- No source code modifications unless absolutely necessary for testability
- Focus specifically on server.js testing as requested

### 0.8.3 Conditional Scope Items

**May Require Source Modification for Testability**:

| Item | Condition | Action |
|------|-----------|--------|
| App/Server Separation | If server.js combines app creation and listening | Extract app creation to app.js |
| Module Exports | If server.js doesn't export app | Add module.exports = app |
| Console.log Statements | If testing startup messages | Keep or add for verification |

**Testability Refactoring Pattern**:

Current (if exists):
```javascript
// server.js - not testable
const express = require('express');
const app = express();
app.get('/hello', ...);
app.listen(3000);
```

Required for testing:
```javascript
// app.js - testable
const express = require('express');
const app = express();
app.get('/hello', ...);
module.exports = app;

// server.js - production entry
const app = require('./app');
app.listen(3000);
```

### 0.8.4 Scope Summary Table

| Category | Status | Files/Items |
|----------|--------|-------------|
| Unit Tests | IN SCOPE | `tests/unit/*.test.js` |
| Integration Tests | IN SCOPE | `tests/integration/*.test.js` |
| Test Configuration | IN SCOPE | `jest.config.js`, `package.json` |
| Test Utilities | IN SCOPE | `tests/helpers/*.js`, `tests/fixtures/*.js` |
| Testability Refactoring | CONDITIONAL | `server.js` → `app.js` separation |
| Source Features | OUT OF SCOPE | New endpoints, features |
| Unrelated Tests | OUT OF SCOPE | Database, auth, e2e browser |
| Infrastructure | OUT OF SCOPE | CI/CD, Docker, deployment |


## 0.9 Execution Parameters

### 0.9.1 Testing-Specific Instructions

**Test Execution Commands**:

| Purpose | Command | Description |
|---------|---------|-------------|
| Run All Tests | `npm test` | Execute full test suite |
| Run with Coverage | `npm run test:coverage` | Tests + coverage report |
| Watch Mode | `npm run test:watch` | Re-run on file changes |
| CI Execution | `npm run test:ci` | Non-interactive for pipelines |
| Single File | `npm test -- tests/unit/server.test.js` | Run specific test file |
| Pattern Match | `npm test -- --testPathPattern=hello` | Tests matching pattern |

**Coverage Measurement Command**:
```bash
npm run test:coverage
# OR

npx jest --coverage
```

**Debug Mode Execution**:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
# Connect Chrome DevTools to debug tests

```

### 0.9.2 Package.json Scripts Configuration

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "CI=true jest --ci --coverage --watchAll=false",
    "test:verbose": "jest --verbose",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

### 0.9.3 Specific Test Patterns in Repository

Since the repository has no existing tests, new patterns will be established:

**Test File Naming Pattern**:
- `*.test.js` - Standard Jest test files
- `*.spec.js` - Alternative (if preferred)

**Test Discovery Pattern**:
```javascript
// jest.config.js
testMatch: [
  '**/tests/**/*.test.js',
  '**/tests/**/*.spec.js'
]
```

**Test Exclusion Pattern**:
```javascript
// jest.config.js
testPathIgnorePatterns: [
  '/node_modules/',
  '/tests/fixtures/',
  '/tests/helpers/'
]
```

### 0.9.4 Environment Setup Requirements

**Prerequisites Before Running Tests**:

| Requirement | Command | Purpose |
|-------------|---------|---------|
| Install Dependencies | `npm install` | Install all packages |
| Node.js Version | `node -v` (18.x or 20.x) | Verify runtime |
| Clear Cache | `npm run test -- --clearCache` | Reset Jest cache |

**Environment Variables for Testing**:
```bash
# Optional but recommended

NODE_ENV=test npm test
CI=true npm run test:ci  # For CI/CD environments
```

### 0.9.5 Test Execution Order and Isolation

**Jest Default Behavior**:
- Tests run in parallel across files
- Tests within a file run sequentially
- Each test file gets its own isolated environment

**Run In Band (Sequential)**:
```bash
npm test -- --runInBand
# Use when tests have port conflicts

```

**Test Timeout Configuration**:
```javascript
// jest.config.js
testTimeout: 5000  // 5 seconds per test
```

### 0.9.6 Mocha Alternative Commands

If using Mocha instead of Jest:

| Purpose | Command |
|---------|---------|
| Run All Tests | `npx mocha 'tests/**/*.test.js'` |
| Run with Coverage | `npx nyc mocha 'tests/**/*.test.js'` |
| Watch Mode | `npx mocha --watch 'tests/**/*.test.js'` |
| CI Execution | `npx nyc --reporter=text mocha --exit 'tests/**/*.test.js'` |

**Mocha package.json scripts**:
```json
{
  "scripts": {
    "test": "mocha 'tests/**/*.test.js'",
    "test:coverage": "nyc mocha 'tests/**/*.test.js'",
    "test:watch": "mocha --watch 'tests/**/*.test.js'",
    "test:ci": "nyc --reporter=text-lcov mocha --exit 'tests/**/*.test.js'"
  }
}
```


## 0.10 Special Instructions for Testing

### 0.10.1 Testing-Specific Requirements

**User-Specified Directives**:

- **Primary Objective**: Create comprehensive unit tests for `server.js` using Jest or Mocha
- **Framework Choice**: User specified either Jest OR Mocha - implementation can choose preferred framework (Jest recommended)
- **Test Categories Required**: HTTP responses, status codes, headers, server startup/shutdown, error handling, edge cases

**Implementation Guidelines**:

| Principle | Directive |
|-----------|-----------|
| Minimal Change | ONLY modify test files and test-related configurations |
| Source Preservation | DO NOT modify source code unless absolutely necessary for testability |
| Pattern Following | Follow Express.js testing best practices and conventions |
| Test Isolation | Ensure all tests can run independently and in parallel |
| Backward Compatibility | Maintain compatibility with Node.js 18.x and 20.x LTS |
| Code Style | Match existing code style and naming conventions |

### 0.10.2 Testability Modifications

**Permitted Source Modifications**:

If `server.js` does not export the Express app for Supertest:

```javascript
// Current (if not testable):
const express = require('express');
const app = express();
app.listen(3000);

// Required modification:
const express = require('express');
const app = express();
// Routes...
if (require.main === module) {
  app.listen(3000);
}
module.exports = app;
```

**Rationale**: Supertest requires the Express app object to be importable without starting the server.

### 0.10.3 Test Isolation Guidelines

**Server Connection Management**:

```javascript
// Correct: Use Supertest without manual server management
const request = require('supertest');
const app = require('../server');

describe('Endpoints', () => {
  it('should respond', async () => {
    await request(app).get('/hello').expect(200);
  });
});
```

**Avoid Manual Server Starting in Tests**:
```javascript
// AVOID: Causes port conflicts
let server;
beforeAll(() => { server = app.listen(3000); });
afterAll(() => { server.close(); });
```

### 0.10.4 Mocking and Stubbing Guidelines

**Use Jest Mock Functions for Console Testing**:

```javascript
// Testing console output during startup
const consoleSpy = jest.spyOn(console, 'log');
// ... trigger server action
expect(consoleSpy).toHaveBeenCalledWith(
  expect.stringContaining('listening')
);
consoleSpy.mockRestore();
```

**Do NOT Mock HTTP/Express Internals**:
- Let Supertest handle HTTP layer testing
- Focus assertions on responses, not internal Express methods

### 0.10.5 Best Practices Checklist

| Practice | Required | Notes |
|----------|----------|-------|
| Use Supertest for HTTP testing | ✓ | Industry standard approach |
| Export app without listening | ✓ | Enable Supertest usage |
| Async/await test syntax | ✓ | Clean, readable tests |
| Clear test descriptions | ✓ | `should [behavior] when [condition]` |
| Single responsibility tests | ✓ | One concept per test |
| Clean up mocks/spies | ✓ | Restore in afterEach |
| No hard-coded ports in tests | ✓ | Supertest uses ephemeral ports |
| Coverage reporting | ✓ | Track test effectiveness |

### 0.10.6 CI/CD Compatibility

**Non-Interactive Execution**:
```bash
# Always use non-interactive flags in CI

CI=true npm test -- --watchAll=false --coverage
```

**Timeout Handling**:
```bash
# Prevent hanging tests in CI

timeout 300 npm test
```

**Coverage Reporting for CI**:
```javascript
// jest.config.js for CI
{
  coverageReporters: ['text', 'lcov', 'json-summary'],
  collectCoverageFrom: ['server.js', 'app.js']
}
```

### 0.10.7 Specification Transition Note

**Important**: The current Technical Specification (Section 6.6 - Testing Strategy) explicitly states "Manual Testing Only" with Jest and Mocha listed as "Excluded Testing Infrastructure."

This user request to create comprehensive unit tests using Jest or Mocha represents a **specification change** that supersedes the existing manual testing mandate. The implementation of this Agent Action Plan effectively transitions the project from:

- **Before**: Manual testing methodology only
- **After**: Automated unit testing with Jest/Mocha + Supertest

This transition is authorized by the user's explicit request and should be documented in project records as a specification update.


