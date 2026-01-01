# Technical Specification

# 0. Agent Action Plan

## 0.1 Intent Clarification

### 0.1.1 Core Testing Objective

Based on the provided requirements, the Blitzy platform understands that the testing objective is to **create comprehensive unit tests for server.js using Jest testing framework**. The request falls into the category of **[Add new tests | Improve coverage]**.

#### Explicit Testing Requirements

| # | Requirement | Technical Interpretation |
|---|-------------|-------------------------|
| 1 | Test HTTP responses | Verify response body content for all endpoints |
| 2 | Test status codes | Assert correct HTTP status codes (200, 404, etc.) |
| 3 | Test headers | Validate Content-Type and other response headers |
| 4 | Test server startup/shutdown | Test server lifecycle management using hooks |
| 5 | Test error handling | Cover 404 responses and invalid route scenarios |
| 6 | Test edge cases | Boundary conditions, malformed requests, parameter handling |

#### Implicit Testing Needs Identified

- **Response format validation**: Verify plain text responses match exact expected strings
- **Route matching behavior**: Test Express routing for both registered and unregistered paths
- **Content-Type headers**: Validate `text/html` charset headers from `res.send()`
- **HTTP method constraints**: Verify behavior for non-GET methods (POST, PUT, DELETE, etc.)
- **Query parameter handling**: Test endpoints with/without query strings
- **Request path variations**: Test trailing slashes, case sensitivity

### 0.1.2 Special Instructions and Constraints

#### Testing Framework Decision
The user specified "Jest or Mocha" - based on repository analysis, **Jest ^29.7.0** is already configured and should be used as the primary testing framework with Supertest ^7.0.0 for HTTP assertions.

#### Key Constraints Identified
- Follow existing test patterns established in `tests/server.test.js`
- Maintain the `require.main === module` testability pattern in server.js
- Use Supertest for in-process HTTP testing (no network port binding)
- Tests must run with `npm test` command

#### Web Search Requirements Documented
- Jest 29 + Express + Supertest best practices (COMPLETED)
- Server startup/shutdown testing patterns with beforeAll/afterAll (COMPLETED)
- HTTP header testing approaches (COMPLETED)

### 0.1.3 Technical Interpretation

These testing requirements translate to the following technical test implementation strategy:

| Requirement | Implementation Strategy |
|-------------|------------------------|
| HTTP responses | Use `request(app).get('/').expect('Hello world')` pattern |
| Status codes | Assert using `expect(response.status).toBe(200)` |
| Headers | Use Supertest `.expect('Content-Type', /text\/html/)` |
| Server startup/shutdown | Test using `app.listen()` and `server.close()` in dedicated test suite |
| Error handling | Test 404 responses for unregistered routes |
| Edge cases | Test query parameters, trailing slashes, HTTP methods |

#### File-to-Test Mapping

- To **test server.js endpoints**, we will **create/update** `tests/server.test.js` with comprehensive test cases
- To **test server lifecycle**, we will **create** `tests/server.lifecycle.test.js` for startup/shutdown scenarios
- To **test error handling**, we will **add** 404 and method-not-allowed test cases

### 0.1.4 Coverage Requirements Interpretation

#### Explicit Coverage Expectations
The user expects "comprehensive unit tests" which translates to:
- All registered routes tested (GET /, GET /evening)
- All HTTP response components verified (status, body, headers)
- Error scenarios covered (404 for unknown routes)
- Server lifecycle events tested

#### Coverage Targets Based on Best Practices
| Coverage Type | Target | Rationale |
|---------------|--------|-----------|
| Statement Coverage | 100% | Small codebase (54 lines) |
| Branch Coverage | 100% | Single branch (`require.main === module`) |
| Function Coverage | 100% | All route handlers must be exercised |
| Line Coverage | 100% | Complete verification of all logic |

To achieve comprehensive testing, coverage should include:
- Both registered endpoints (`/` and `/evening`)
- Unregistered routes returning 404
- Response headers and content types
- Server binding behavior (conditional startup)
- HTTP method handling for each route

## 0.2 Test Discovery and Analysis

### 0.2.1 Existing Test Infrastructure Assessment

Repository analysis reveals a **Jest + Supertest** testing setup with an established integration testing approach.

#### Test Framework Configuration

| Component | Details | Location |
|-----------|---------|----------|
| Test Runner | Jest ^29.7.0 | package.json devDependencies |
| HTTP Testing | Supertest ^7.0.0 | package.json devDependencies |
| Test Script | `jest` | package.json scripts.test |
| Test Directory | `tests/` | Root directory |
| Test Files | `*.test.js` pattern | tests/server.test.js |

#### Existing Test Coverage Analysis

**File: `tests/server.test.js`** (Current state)

| Test Suite | Test Case | Coverage |
|------------|-----------|----------|
| Test GET request | GET / returns Hello world | Root endpoint response |
| Test GET request | GET /evening returns Good evening | Evening endpoint response |

#### Identified Coverage Gaps

| Gap Category | Missing Coverage | Priority |
|--------------|-----------------|----------|
| Status Codes | No explicit status code assertions | HIGH |
| Headers | Content-Type headers not verified | HIGH |
| Error Handling | 404 responses not tested | HIGH |
| Edge Cases | Query params, trailing slashes | MEDIUM |
| HTTP Methods | POST/PUT/DELETE behavior | MEDIUM |
| Server Lifecycle | Startup/shutdown testing | HIGH |

#### Mock/Stub Libraries Detected
- None currently in use
- Application has no external dependencies requiring mocking

#### Test Data Fixtures Present
- None required - endpoints return static string responses

### 0.2.2 Web Search Research Conducted

#### Best Practices for Jest + Express + Supertest Testing

| Source | Key Finding |
|--------|-------------|
| Jest Documentation | Use `beforeAll`/`afterAll` hooks for server setup/teardown |
| Supertest Guide | Pass `app` directly to `request()` for in-process testing |
| Express Testing | Export `app` without calling `listen()` for testability |
| Community Best Practices | Use `expect()` for status codes, `.expect()` for headers |

#### Recommended Mocking Strategies
- No external service mocking required for this application
- Server exports `app` instance directly for Supertest consumption
- `require.main === module` pattern prevents port binding during tests

#### Test Organization Conventions for Node.js/Jest
- Group related tests using `describe()` blocks
- Use semantic test descriptions (`it('should return 200 for valid route')`)
- Separate lifecycle tests from endpoint tests
- Use async/await for clean Supertest assertions

#### Common Pitfalls to Avoid
- **Port binding conflicts**: Always export `app` without calling `listen()`
- **Open handles**: Use `--detectOpenHandles` flag during development
- **Async issues**: Return promises or use async/await in test functions
- **Test isolation**: Avoid shared state between tests

## 0.3 Testing Scope Analysis

### 0.3.1 Test Target Identification

#### Primary Code Under Test

| Module/File | Path | Test Types Required |
|-------------|------|---------------------|
| server.js | /server.js | Unit tests, HTTP tests, lifecycle tests |

#### Functions and Routes to Test

| Function/Route | Location | Test Categories |
|----------------|----------|-----------------|
| `GET /` handler | server.js:5-7 | Response body, status code, headers |
| `GET /evening` handler | server.js:9-11 | Response body, status code, headers |
| Express app creation | server.js:1-3 | App initialization verification |
| Server startup guard | server.js:13-16 | Conditional listener binding |

#### Existing Test File Mapping

| Source File | Existing Test File | Test Categories Present |
|-------------|-------------------|------------------------|
| server.js | tests/server.test.js | Response body only |

#### Dependencies Requiring Mocking

| Dependency | Type | Mocking Strategy |
|------------|------|------------------|
| express | Framework | None needed - test actual behavior |
| HTTP server | Built-in | Use Supertest for in-process requests |

### 0.3.2 Version Compatibility Research

Based on current Node.js version 20.x and package.json dependencies, recommended testing stack:

| Component | Package | Version | Rationale |
|-----------|---------|---------|-----------|
| Testing Framework | jest | ^29.7.0 | Already installed, LTS compatible with Node 20 |
| HTTP Testing | supertest | ^7.0.0 | Already installed, compatible with Express 4.x |
| Assertion Library | Jest built-in | N/A | Included with Jest |
| Mocking Library | Jest built-in | N/A | jest.fn(), jest.mock() available |
| Coverage Tool | Jest built-in | N/A | `--coverage` flag supported |

#### Version Compatibility Matrix

| Package | Current Version | Node.js 20 Compatibility | Express 4.21 Compatibility |
|---------|----------------|-------------------------|---------------------------|
| jest | ^29.7.0 | ✅ Full support | ✅ Compatible |
| supertest | ^7.0.0 | ✅ Full support | ✅ Compatible |
| express | ^4.21.2 | ✅ Full support | N/A |

#### No Version Conflicts Detected
All installed packages are mutually compatible with the current Node.js runtime (v20.19.6) and each other.

## 0.4 Test Implementation Design

### 0.4.1 Test Strategy Selection

#### Test Types to Implement

| Test Type | Focus Area | Priority |
|-----------|------------|----------|
| Unit Tests | Individual route handlers | HIGH |
| Integration Tests | HTTP request/response cycle | HIGH |
| Edge Case Tests | Boundary conditions, invalid inputs | MEDIUM |
| Error Handling Tests | 404 responses, method restrictions | HIGH |
| Lifecycle Tests | Server startup/shutdown | MEDIUM |

### 0.4.2 Test Case Blueprint

#### Component: GET / Route Handler

| Test Category | Scenarios |
|---------------|-----------|
| Happy Path | Returns "Hello world" with 200 status |
| Headers | Content-Type is text/html with charset |
| Status Code | Explicit 200 status verification |

#### Component: GET /evening Route Handler

| Test Category | Scenarios |
|---------------|-----------|
| Happy Path | Returns "Good evening" with 200 status |
| Headers | Content-Type is text/html with charset |
| Status Code | Explicit 200 status verification |

#### Component: Error Handling

| Test Category | Scenarios |
|---------------|-----------|
| 404 Responses | Unknown routes return 404 status |
| Invalid Paths | /unknown, /api, /evening/extra |
| Invalid Methods | POST, PUT, DELETE to existing routes |

#### Component: Server Lifecycle

| Test Category | Scenarios |
|---------------|-----------|
| Startup | Server starts and binds to port |
| Shutdown | Server closes cleanly |
| Conditional Binding | require.main check behavior |

### 0.4.3 Existing Test Extension Strategy

#### Tests to Extend

**File: `tests/server.test.js`**
- Add status code assertions to existing tests
- Add Content-Type header verification
- Add new test suites for error handling
- Add edge case test scenarios

#### Tests to Add

- **404 Error Tests**: Test responses for undefined routes
- **HTTP Method Tests**: Test POST/PUT/DELETE returns appropriate response
- **Query Parameter Tests**: Test routes with query strings
- **Path Variation Tests**: Test trailing slashes, case variations

### 0.4.4 Test Data and Fixtures Design

#### Required Test Data Structures

| Data Type | Purpose | Implementation |
|-----------|---------|---------------|
| Expected Responses | Verify response bodies | String constants |
| Route Paths | Test route matching | String arrays |
| HTTP Methods | Test method handling | Method name arrays |

#### Mock Object Specifications
- No mock objects required
- Application has no external dependencies

#### Test Utility Functions

```javascript
// Helper for HTTP method testing
const testMethods = ['POST', 'PUT', 'DELETE'];
```

#### Test Database/State Management
- Not applicable - application is stateless
- Each test operates independently

## 0.5 Test File Transformation Mapping

### 0.5.1 File-by-File Test Plan

| Target Test File | Transformation | Source File/Test | Purpose/Changes |
|-----------------|----------------|------------------|-----------------|
| tests/server.test.js | UPDATE | tests/server.test.js | Add comprehensive HTTP response, status code, and header tests for all endpoints |
| tests/server.test.js | UPDATE | tests/server.test.js | Add error handling test suite for 404 responses |
| tests/server.test.js | UPDATE | tests/server.test.js | Add edge case tests for query parameters and path variations |
| tests/server.lifecycle.test.js | CREATE | server.js | Add server startup/shutdown lifecycle tests |
| tests/server.methods.test.js | CREATE | server.js | Add HTTP method constraint tests for POST/PUT/DELETE |

### 0.5.2 Test Files to Modify Detail

### tests/server.test.js - Major Update

**Current State**: 2 basic response body tests

**Modifications Required**:

| New Test Methods | Description |
|-----------------|-------------|
| `should return 200 status code for GET /` | Explicit status code assertion |
| `should return 200 status code for GET /evening` | Explicit status code assertion |
| `should return correct Content-Type header for GET /` | Header validation |
| `should return correct Content-Type header for GET /evening` | Header validation |
| `should return 404 for unknown routes` | Error handling |
| `should return 404 for GET /unknown` | Specific undefined route |
| `should handle query parameters on GET /` | Edge case |
| `should handle trailing slash on routes` | Edge case |

**Updated Fixtures**: None required

**Assertions to Add**:
- `.expect(200)` - Status code assertions
- `.expect('Content-Type', /text\/html/)` - Header assertions
- `.expect(404)` - Error status assertions

### 0.5.3 New Test Files Detail

#### tests/server.lifecycle.test.js - Server Startup/Shutdown Tests

| Test Categories | Description |
|-----------------|-------------|
| Happy Path | Server starts successfully on specified port |
| Happy Path | Server closes cleanly without open handles |
| Edge Cases | Multiple start/stop cycles |
| Error Cases | Port binding with conditional require.main check |

**Mock Dependencies**: None

**Assertions Focus**:
- Verify `app.listen()` returns server instance
- Verify `server.close()` completes without error
- Verify `require.main === module` guard behavior

#### tests/server.methods.test.js - HTTP Method Tests

| Test Categories | Description |
|-----------------|-------------|
| HTTP Methods | POST to GET-only routes behavior |
| HTTP Methods | PUT to GET-only routes behavior |
| HTTP Methods | DELETE to GET-only routes behavior |

**Assertions Focus**:
- Verify non-GET methods return appropriate response (404 from Express default)

### 0.5.4 Test Configuration Updates

| Config File | Update Required |
|-------------|-----------------|
| package.json | No update needed - test script already configured |
| jest.config.js | Does not exist - using Jest defaults (acceptable) |

### 0.5.5 Cross-File Test Dependencies

#### Shared Resources

| Resource | Location | Usage |
|----------|----------|-------|
| Express app instance | server.js (export) | All test files import and test against |

#### Import Updates Required

All test files will use:
```javascript
const app = require('../server');
const request = require('supertest');
```

#### Test Utilities Needed
- No shared utilities required
- Supertest provides all necessary HTTP testing capabilities

## 0.6 Dependency Inventory

### 0.6.1 Testing Dependencies

All testing dependencies are already installed. No additional packages required.

| Registry | Package Name | Version | Purpose |
|----------|--------------|---------|---------|
| npm | jest | ^29.7.0 | Testing framework and test runner |
| npm | supertest | ^7.0.0 | HTTP assertions library for Express testing |

#### Runtime Dependencies (Under Test)

| Registry | Package Name | Version | Purpose |
|----------|--------------|---------|---------|
| npm | express | ^4.21.2 | Web application framework |

#### No Additional Dependencies Required

The existing testing stack provides complete coverage for:
- Test execution and assertions (Jest)
- HTTP request simulation (Supertest)
- Mock functions (Jest built-in)
- Code coverage reporting (Jest built-in)

### 0.6.2 Import Updates

#### Test Files Requiring Import Updates

None - existing imports are sufficient:

**Current Pattern (Correct)**:
```javascript
const request = require('supertest');
const app = require('../server');
```

#### Import Transformation Rules

| Test File | Current Import | Required Import | Action |
|-----------|---------------|-----------------|--------|
| tests/server.test.js | supertest, server | No change | KEEP |
| tests/server.lifecycle.test.js | N/A (new file) | supertest, server | CREATE |
| tests/server.methods.test.js | N/A (new file) | supertest, server | CREATE |

### 0.6.3 Dependency Verification

All dependencies verified via `npm install`:

```
added 355 packages, audited 356 packages
found 0 vulnerabilities
```

#### Version Lock Status

| Dependency | package.json | Installed | Lock File |
|------------|-------------|-----------|-----------|
| jest | ^29.7.0 | 29.7.0 | package-lock.json |
| supertest | ^7.0.0 | 7.0.0 | package-lock.json |
| express | ^4.21.2 | 4.21.2 | package-lock.json |

## 0.7 Coverage and Quality Targets

### 0.7.1 Coverage Metrics

#### Current Coverage Assessment

Based on existing tests in `tests/server.test.js`:

| Metric | Current | Estimation Basis |
|--------|---------|------------------|
| Statement Coverage | ~60% | Route handlers tested, lifecycle untested |
| Branch Coverage | ~50% | `require.main` branch untested |
| Function Coverage | 100% | Both route handlers exercised |
| Line Coverage | ~60% | Server startup lines untested |

#### Target Coverage

| Metric | Target | Rationale |
|--------|--------|-----------|
| Statement Coverage | 100% | Small codebase permits complete coverage |
| Branch Coverage | 100% | Only one branch to cover |
| Function Coverage | 100% | All handlers and app creation |
| Line Coverage | 100% | Every line can be executed |

#### Coverage Gaps to Address

| Component | Current Coverage | Target Coverage | Gap Analysis |
|-----------|-----------------|-----------------|--------------|
| GET / handler | Partial | 100% | Missing status/header tests |
| GET /evening handler | Partial | 100% | Missing status/header tests |
| require.main guard | 0% | 100% | Lifecycle test needed |
| Error handling | 0% | 100% | 404 tests needed |
| Express app creation | 0% | 100% | Implicit via endpoint tests |

### 0.7.2 Test Quality Criteria

#### Assertion Density Expectations

| Test Type | Minimum Assertions | Focus |
|-----------|-------------------|-------|
| Endpoint Tests | 3 per test | Status, body, header |
| Error Tests | 2 per test | Status, body |
| Lifecycle Tests | 2 per test | Action completion, state |

#### Test Isolation Requirements

- Each test must be independent and runnable in isolation
- No shared mutable state between tests
- Each test file can run independently with `jest <filename>`
- Tests must pass regardless of execution order

#### Performance Constraints

| Metric | Threshold | Rationale |
|--------|-----------|-----------|
| Individual Test | < 500ms | Simple HTTP assertions |
| Test Suite | < 5s | Small test surface |
| Full Run | < 10s | All test files |

#### Maintainability Standards

| Standard | Requirement |
|----------|-------------|
| Descriptive Names | `should return X when Y` pattern |
| DRY Principle | Use describe blocks for grouping |
| Comment Ratio | Minimal - tests are self-documenting |
| Test Organization | Group by feature/behavior |

#### Repository Test Pattern Adherence

Following existing patterns from `tests/server.test.js`:
- Use `describe()` for test suite grouping
- Use `it()` for individual test cases
- Use `request(app).get()` for HTTP requests
- Use `.expect()` for assertions

## 0.8 Scope Boundaries

### 0.8.1 Exhaustively In Scope

#### Test Files - New Creation

| Pattern | Files | Purpose |
|---------|-------|---------|
| tests/server.lifecycle.test.js | 1 file | Server startup/shutdown tests |
| tests/server.methods.test.js | 1 file | HTTP method constraint tests |

#### Test Files - Updates

| Pattern | Files | Purpose |
|---------|-------|---------|
| tests/server.test.js | 1 file | Enhanced HTTP response, status, header tests |

#### Test Categories In Scope

| Category | Specific Tests |
|----------|---------------|
| HTTP Responses | Response body content verification for all routes |
| Status Codes | 200 for valid routes, 404 for invalid routes |
| Headers | Content-Type header verification |
| Server Startup | Verify app.listen() functionality |
| Server Shutdown | Verify server.close() cleanup |
| Error Handling | 404 responses for unknown routes |
| Edge Cases | Query parameters, trailing slashes, path variations |

#### Source Files Under Test

| File | Path | Scope |
|------|------|-------|
| server.js | /server.js | All exported functionality |

#### Test Utilities In Scope

| Item | Purpose |
|------|---------|
| Test helper constants | Expected response strings |
| Route path arrays | For parameterized testing |

### 0.8.2 Explicitly Out of Scope

#### Source Code Modifications

| Item | Rationale |
|------|-----------|
| server.js modifications | Tests only - no source changes needed |
| package.json changes | Testing deps already present |
| Express configuration | Already testable as-is |

#### Test Types Excluded

| Type | Rationale |
|------|-----------|
| Performance/Load Testing | Not requested by user |
| Security Testing | Not requested by user |
| E2E Testing with actual network | Supertest handles in-process |
| Database Testing | Application has no database |

#### Files Not To Be Modified

| File | Rationale |
|------|-----------|
| server.js | Source code - testing only |
| package.json | Dependencies already configured |
| blitzy/documentation/* | Documentation files |
| README.md | Not a testing artifact |

#### Unrelated Testing Areas

| Area | Rationale |
|------|-----------|
| Third-party API mocking | No external APIs used |
| Database mocking | No database in application |
| Authentication testing | No auth in application |
| File system testing | No file operations |

## 0.9 Execution Parameters

### 0.9.1 Testing-Specific Instructions

#### Test Execution Commands

| Purpose | Command |
|---------|---------|
| Run all tests | `npm test` |
| Run all tests (alternative) | `npx jest` |
| Run specific test file | `npx jest tests/server.test.js` |
| Run tests with verbose output | `npx jest --verbose` |
| Run tests with coverage | `npx jest --coverage` |
| Run tests in watch mode | `npx jest --watch` |

#### Coverage Measurement Command

```bash
npx jest --coverage --coverageReporters="text" --coverageReporters="lcov"
```

#### Single Test Execution Pattern

```bash
# Run specific test by name
npx jest -t "should return 200 status code"

#### Run specific describe block
npx jest -t "GET / endpoint"
```

#### Debug Mode Execution

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### 0.9.2 Environment Setup Requirements

## Node.js Runtime
- Version: 20.x (tested with v20.19.6)
- Package Manager: npm (v11.1.0 verified)

#### Pre-Test Setup

```bash
cd /tmp/blitzy/Repo-Test-Sud/010126
npm install
```

#### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| DB_Host | Database host (unused) | No |
| API_KEY | API key (unused) | No |
| NODE_ENV | Environment mode | No |
| CI | Continuous Integration flag | Optional |

### 0.9.3 Test Patterns to Follow

#### Existing Repository Conventions

**Naming Pattern**:
```javascript
describe('Feature/Component', () => {
  it('should [expected behavior]', async () => {
    // test implementation
  });
});
```

**Request Pattern**:
```javascript
const response = await request(app).get('/path');
expect(response.status).toBe(200);
```

### 0.9.4 Jest Configuration

#### Current Configuration (package.json)

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

#### Recommended Jest Options (via CLI or jest.config.js if needed)

| Option | Value | Purpose |
|--------|-------|---------|
| testEnvironment | node | Server-side testing |
| verbose | true | Detailed output |
| collectCoverage | true | Coverage reporting |
| detectOpenHandles | true | Find unclosed resources |
| forceExit | false | Clean exit preferred |

## 0.10 Special Instructions for Testing

### 0.10.1 Testing-Specific Requirements

#### Minimal Change Principle

- **ONLY modify test files and test-related configurations**
- **DO NOT modify source code** - server.js is already properly structured for testing
- Follow existing test patterns in `tests/server.test.js`
- Maintain test isolation using Supertest's in-process approach

#### Framework and Library Directives

| Directive | Requirement |
|-----------|-------------|
| Testing Framework | Use Jest (already configured) |
| HTTP Testing | Use Supertest for all HTTP assertions |
| Mocking | Use Jest built-in mocking if needed |
| Port Binding | Never bind to actual network ports in tests |

#### Test Organization Requirements

| Requirement | Implementation |
|-------------|---------------|
| Test isolation | Each test must be independent |
| Parallel execution | Tests must support concurrent running |
| Clean teardown | Use afterAll/afterEach for cleanup if needed |
| Backward compatibility | New tests must not break existing tests |

### 0.10.2 Code Style and Naming Conventions

#### Match Existing Patterns

**From `tests/server.test.js`**:
```javascript
const request = require('supertest');
const app = require('../server');

describe('Test description', () => {
  it('should do something', async () => {
    const response = await request(app).get('/');
    expect(response.text).toEqual('Expected');
  });
});
```

#### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Test files | `*.test.js` | server.test.js |
| Describe blocks | Feature/endpoint name | 'GET / endpoint' |
| Test cases | 'should [verb] [outcome]' | 'should return 200 status' |

### 0.10.3 Supertest Best Practices

#### In-Process Testing Pattern

```javascript
// Correct: Pass app directly
const response = await request(app).get('/');

// Avoid: Binding to actual port
// const response = await request('http://localhost:3000').get('/');
```

#### Assertion Chaining

```javascript
await request(app)
  .get('/')
  .expect(200)
  .expect('Content-Type', /text\/html/)
  .expect('Hello world');
```

### 0.10.4 Server Lifecycle Testing Guidance

For startup/shutdown tests:

- Use `beforeAll()` to start server
- Use `afterAll()` to close server
- Wrap `server.close()` in Promise for proper cleanup
- Avoid `--forceExit` flag by ensuring clean shutdown

### 0.10.5 Expected Test Output

After implementation, `npm test` should produce:

```
PASS tests/server.test.js
PASS tests/server.lifecycle.test.js
PASS tests/server.methods.test.js

Test Suites: 3 passed, 3 total
Tests: X passed, X total
Coverage: 100%
```

### 0.10.6 Validation Checklist

Before marking tests complete:

- [ ] All tests pass with `npm test`
- [ ] No open handle warnings
- [ ] Coverage meets 100% target
- [ ] Tests run independently
- [ ] Tests follow existing patterns
- [ ] No source code modifications made

