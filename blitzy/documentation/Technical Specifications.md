# Technical Specification

# 0. Agent Action Plan

## 0.1 Intent Clarification

### 0.1.1 Core Refactoring Objective

Based on the prompt, the Blitzy platform understands that the refactoring objective is to **restructure and modernize the existing Node.js server implementation to follow Express.js best practices and modular architecture patterns**, while preserving 100% behavioral compatibility with the current implementation.

| Attribute | Value |
|-----------|-------|
| Refactoring Type | Code structure / Modularity |
| Target Repository | Same repository (in-place refactor) |
| Framework Status | Express.js already integrated (v4.21.2) |
| Behavior Requirement | Maintain exact feature parity |

**Key Refactoring Goals (Enhanced Clarity):**

- **Goal 1: Separation of Concerns** - Restructure the single-file Express server (`server.js`) into a modular architecture with distinct layers for routing, application configuration, and server bootstrapping
- **Goal 2: Express.js Best Practices** - Apply industry-standard Express.js patterns including separate `app.js` for application configuration and `server.js` for HTTP listener
- **Goal 3: Route Modularization** - Extract route definitions into dedicated route files for better maintainability and scalability
- **Goal 4: Test Compatibility** - Ensure the refactored architecture maintains testability via app export without port binding during test execution
- **Goal 5: Feature Preservation** - Maintain exact response behavior for both endpoints:
  - `GET /` → Returns `"Hello world"` with HTTP 200
  - `GET /evening` → Returns `"Good evening"` with HTTP 200

**Implicit Requirements (Surfaced):**

- Preserve the `require.main === module` guard pattern for conditional server startup
- Maintain CommonJS module format (`require`/`module.exports`) for consistency
- Keep environment variable configuration for `PORT` (default: 3000)
- Ensure zero regression in existing Jest/Supertest test suite
- Maintain `'use strict'` mode directive

### 0.1.2 Special Instructions and Constraints

**Critical Directives:**

- **Maintain All Public Interfaces** - The exported `app` object must remain accessible for testing via `require('../server')` or equivalent path
- **Preserve Test Coverage** - All existing tests in `tests/server.test.js` must continue passing without modification
- **Exact Response Matching** - Response text must match character-for-character: `"Hello world"` and `"Good evening"`
- **No Breaking Changes** - The `npm start` and `npm test` scripts must work identically after refactoring

**User Requirements (Preserved Exactly):**

> User Example: "Rewrite this Node.js server into a express.js refactor, keeping every feature and functionality exactly as in the original Node.js project. Ensure the rewritten version fully matches the behavior and logic of the current implementation."

**Migration Requirements:**

- In-place refactoring within the same repository structure
- No external service integrations required
- No database schema changes (project is stateless)

### 0.1.3 Technical Interpretation

This refactoring translates to the following technical transformation strategy:

**Current Architecture → Target Architecture:**

```
CURRENT (Monolithic):                    TARGET (Modular):
┌─────────────────────────┐              ┌─────────────────────────┐
│      server.js          │              │      server.js          │
│  ┌─────────────────┐    │              │  (HTTP listener only)   │
│  │ Express App     │    │              └───────────┬─────────────┘
│  │ Route Handlers  │    │     ──>                  │
│  │ Port Binding    │    │              ┌───────────▼─────────────┐
│  │ Module Export   │    │              │        app.js           │
│  └─────────────────┘    │              │  (Express configuration)│
└─────────────────────────┘              └───────────┬─────────────┘
                                                     │
                                         ┌───────────▼─────────────┐
                                         │    src/routes/          │
                                         │  (Route definitions)    │
                                         └─────────────────────────┘
```

**Transformation Rules and Patterns:**

| Rule | From | To |
|------|------|-----|
| App Configuration | Inline in `server.js` | Separate `app.js` module |
| Route Definitions | Inline `app.get()` calls | Modular route files in `src/routes/` |
| Server Bootstrap | Combined with app logic | Isolated in `server.js` |
| Module Export | Single `app` export | Maintained for test compatibility |

**Design Pattern Application:**

- **Separation Pattern**: Decouple HTTP server concerns from Express application configuration
- **Router Pattern**: Use `express.Router()` for modular route organization
- **Entry Point Pattern**: Maintain single entry point (`server.js`) while delegating to modules

## 0.2 Source Analysis

### 0.2.1 Comprehensive Source File Discovery

**Search Patterns Applied:**

The following patterns were used to identify ALL files requiring refactoring based on user instructions:

| Pattern | Purpose | Files Found |
|---------|---------|-------------|
| `*.js` (root) | Core application files | `server.js` |
| `tests/**/*.js` | Test files requiring import updates | `tests/server.test.js` |
| `*.json` (root) | Package and configuration files | `package.json`, `postman.json` |
| `*.md` (root) | Documentation files | `README.md` |
| `.env*` | Environment configuration | `.env.example` |

### 0.2.2 Current Structure Mapping

```
Current:
/
├── server.js (53 lines - Express app + routes + server combined)
├── package.json (npm manifest with express ^4.21.2)
├── package-lock.json (dependency lock file)
├── README.md (endpoint documentation)
├── .env.example (environment template)
├── postman.json (API collection)
├── tests/
│   └── server.test.js (Jest integration tests)
└── blitzy/
    └── documentation/
        ├── Technical Specifications.md
        └── Project Guide.md
```

### 0.2.3 Source File Analysis

**Primary Source File: `server.js`**

| Attribute | Current State |
|-----------|---------------|
| Total Lines | 53 lines |
| Concerns Mixed | 4 (app creation, routing, server binding, module export) |
| Route Handlers | 2 inline handlers |
| Dependencies | `express` (single import) |
| Export | `module.exports = app` |

**Code Structure Breakdown:**

```javascript
// Lines 1-10: File documentation
// Lines 12-21: Imports and app initialization
// Lines 23-32: GET / route handler
// Lines 34-43: GET /evening route handler
// Lines 45-50: Conditional server startup
// Lines 52-53: Module export
```

**Test File: `tests/server.test.js`**

| Attribute | Current State |
|-----------|---------------|
| Total Lines | 45 lines |
| Test Framework | Jest |
| HTTP Testing | Supertest |
| Import Path | `require('../server')` |
| Test Cases | 2 (one per endpoint) |

### 0.2.4 Complete Source File Inventory

The following table provides an exhaustive list of ALL source files that need consideration during the refactoring:

| File Path | Type | Refactoring Action | Reason |
|-----------|------|-------------------|--------|
| `server.js` | JavaScript | UPDATE | Extract routes, separate app configuration |
| `tests/server.test.js` | JavaScript | UPDATE | Update import path if app location changes |
| `package.json` | JSON | UPDATE | Add new scripts if needed, update main entry |
| `README.md` | Markdown | UPDATE | Document new project structure |
| `.env.example` | Config | KEEP | No changes needed (PORT variable stays) |
| `postman.json` | JSON | KEEP | API endpoints unchanged |
| `package-lock.json` | JSON | AUTO | Auto-generated, no manual changes |

### 0.2.5 Dependency Analysis

**Runtime Dependencies (from `package.json`):**

| Package | Version | Purpose | Refactoring Impact |
|---------|---------|---------|-------------------|
| express | ^4.21.2 | Web framework | Core - remains unchanged |

**Development Dependencies (from `package.json`):**

| Package | Version | Purpose | Refactoring Impact |
|---------|---------|---------|-------------------|
| jest | ^29.7.0 | Test framework | None - configuration unchanged |
| supertest | ^7.0.0 | HTTP testing | None - usage pattern unchanged |

### 0.2.6 Code Coupling Assessment

**Current Coupling Points:**

- `server.js` → Self-contained (no external module imports beyond Express)
- `tests/server.test.js` → Coupled to `../server` import path
- `package.json` → Coupled to `server.js` as main entry point

**Files Requiring Import Updates Post-Refactoring:**

| File | Current Import | Potential New Import |
|------|----------------|---------------------|
| `tests/server.test.js` | `require('../server')` | `require('../server')` or `require('../app')` |

## 0.3 Target Design

### 0.3.1 Refactored Structure Planning

**Target Architecture (Comprehensive):**

```
Target:
/
├── server.js                 (HTTP listener - bootstrap only)
├── app.js                    (Express app configuration & export)
├── src/
│   └── routes/
│       ├── index.js          (Route aggregator)
│       └── greeting.routes.js (Greeting endpoint handlers)
├── package.json              (Updated main entry if needed)
├── package-lock.json         (Auto-generated)
├── README.md                 (Updated project structure docs)
├── .env.example              (Environment template - unchanged)
├── postman.json              (API collection - unchanged)
├── tests/
│   └── server.test.js        (Tests - import path updated)
└── blitzy/
    └── documentation/
        ├── Technical Specifications.md
        └── Project Guide.md
```

**Standalone Operation Requirements:**

The refactored project includes all necessary files for independent operation:

| File Category | Files | Purpose |
|---------------|-------|---------|
| Entry Point | `server.js` | HTTP server bootstrap |
| Application | `app.js` | Express app configuration |
| Routes | `src/routes/*.js` | Endpoint definitions |
| Configuration | `.env.example` | Environment template |
| Dependencies | `package.json`, `package-lock.json` | Package management |
| Testing | `tests/server.test.js` | Automated testing |
| Documentation | `README.md` | Usage documentation |

### 0.3.2 Web Search Research Conducted

Based on comprehensive research of Express.js refactoring best practices:

**Best Practices for Express.js Modular Architecture:**

| Practice | Application to This Project | Source Reference |
|----------|----------------------------|------------------|
| Separate app and server | Split `server.js` into `app.js` (config) and `server.js` (listener) | Treblle Blog |
| Modular route organization | Extract routes to `src/routes/` directory | Node.js Best Practices |
| Router instances | Use `express.Router()` for route grouping | Express.js Patterns |
| Conditional startup guard | Maintain `require.main === module` pattern | Industry Standard |
| Three-layer architecture | Web layer (routes) separation from entry point | Treblle Blog |

**Express.js Convention Alignment:**

| Convention | Implementation |
|------------|----------------|
| Entry point file | `server.js` (HTTP listener) |
| App configuration | `app.js` (middleware, routes) |
| Route organization | `src/routes/` directory |
| Module system | CommonJS (`require`/`module.exports`) |
| Strict mode | `'use strict'` directive retained |

**Migration Strategy Applied:**

- **Pattern**: In-place modular refactoring
- **Approach**: Extract components while maintaining backward compatibility
- **Validation**: Existing test suite as regression gate

### 0.3.3 Design Pattern Applications

**Pattern 1: App-Server Separation**

```
┌─────────────────────────────────────────────────────────────┐
│                        server.js                            │
│  - Imports app from app.js                                  │
│  - PORT configuration                                       │
│  - Conditional server.listen()                              │
│  - require.main === module guard                            │
└─────────────────────────┬───────────────────────────────────┘
                          │ imports
┌─────────────────────────▼───────────────────────────────────┐
│                         app.js                              │
│  - Creates Express instance                                 │
│  - Registers routes via Router                              │
│  - Exports app for testing                                  │
└─────────────────────────┬───────────────────────────────────┘
                          │ uses
┌─────────────────────────▼───────────────────────────────────┐
│                   src/routes/index.js                       │
│  - Aggregates all route modules                             │
│  - Mounts routers with path prefixes                        │
└─────────────────────────┬───────────────────────────────────┘
                          │ includes
┌─────────────────────────▼───────────────────────────────────┐
│               src/routes/greeting.routes.js                 │
│  - GET / handler                                            │
│  - GET /evening handler                                     │
└─────────────────────────────────────────────────────────────┘
```

**Pattern 2: Express Router Pattern**

- Use `express.Router()` to create modular, mountable route handlers
- Group related routes together (greeting endpoints)
- Export router instances for composition in main app

**Pattern 3: Module Export for Testing**

- Export `app` instance from `app.js` for Supertest integration
- Maintain same testing interface: `require('../app')` or redirect via `server.js`
- No port binding during import for clean test execution

### 0.3.4 File Responsibility Matrix

| File | Responsibility | Dependencies | Exports |
|------|---------------|--------------|---------|
| `server.js` | HTTP listener bootstrap | `app.js` | None (entry point) |
| `app.js` | Express app configuration | `express`, `src/routes` | `app` |
| `src/routes/index.js` | Route aggregation | `greeting.routes.js` | `router` |
| `src/routes/greeting.routes.js` | Greeting endpoint handlers | `express` | `router` |

## 0.4 Transformation Mapping

### 0.4.1 File-by-File Transformation Plan

**Complete File Transformation Matrix:**

| Target File | Transformation | Source File | Key Changes |
|------------|----------------|-------------|-------------|
| `server.js` | UPDATE | `server.js` | Strip app configuration, import from app.js, retain HTTP listener logic only |
| `app.js` | CREATE | `server.js` | Extract Express app creation, middleware setup, route registration, and module export |
| `src/routes/index.js` | CREATE | `server.js` | Create route aggregator that imports and mounts all route modules |
| `src/routes/greeting.routes.js` | CREATE | `server.js` | Extract GET / and GET /evening handlers into Router module |
| `tests/server.test.js` | UPDATE | `tests/server.test.js` | Update import path from `../server` to `../app` for app instance access |
| `package.json` | UPDATE | `package.json` | Update main entry point to `server.js` (already correct), verify scripts |
| `README.md` | UPDATE | `README.md` | Add documentation for new project structure and file organization |

### 0.4.2 Detailed Transformation Specifications

**Transformation 1: `server.js` (UPDATE)**

```javascript
// BEFORE: Full application in one file
// AFTER: HTTP listener only
'use strict';
const app = require('./app');
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => { /* ... */ });
}
```

| Element | Action | Details |
|---------|--------|---------|
| Express import | REMOVE | Moved to app.js |
| App creation | REMOVE | Moved to app.js |
| Route definitions | REMOVE | Moved to src/routes/ |
| Port configuration | KEEP | Retained in server.js |
| Conditional startup | KEEP | `require.main === module` guard |
| Module export | MODIFY | Export app for backward compatibility |

**Transformation 2: `app.js` (CREATE)**

```javascript
// NEW FILE: Express application configuration
'use strict';
const express = require('express');
const routes = require('./src/routes');
const app = express();
app.use('/', routes);
module.exports = app;
```

| Element | Source | Details |
|---------|--------|---------|
| Express import | `server.js` line 15 | Moved from server.js |
| App instantiation | `server.js` line 18 | `const app = express()` |
| Route mounting | `server.js` lines 30-43 | Via imported router |
| Module export | `server.js` line 53 | Export app for testing |

**Transformation 3: `src/routes/index.js` (CREATE)**

```javascript
// NEW FILE: Route aggregator
'use strict';
const express = require('express');
const greetingRoutes = require('./greeting.routes');
const router = express.Router();
router.use('/', greetingRoutes);
module.exports = router;
```

**Transformation 4: `src/routes/greeting.routes.js` (CREATE)**

```javascript
// NEW FILE: Greeting endpoint handlers
'use strict';
const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.send('Hello world'));
router.get('/evening', (req, res) => res.send('Good evening'));
module.exports = router;
```

| Element | Source Location | Target Location |
|---------|-----------------|-----------------|
| GET / handler | `server.js` lines 30-32 | `greeting.routes.js` |
| GET /evening handler | `server.js` lines 41-43 | `greeting.routes.js` |

**Transformation 5: `tests/server.test.js` (UPDATE)**

| Element | Before | After |
|---------|--------|-------|
| App import | `require('../server')` | `require('../app')` |
| Test logic | Unchanged | Unchanged |
| Assertions | Unchanged | Unchanged |

### 0.4.3 Cross-File Dependencies

**Import Statement Updates:**

| File | Old Import | New Import | Reason |
|------|-----------|-----------|--------|
| `server.js` | `require('express')` | `require('./app')` | App now in separate module |
| `tests/server.test.js` | `require('../server')` | `require('../app')` | Direct app import for testing |

**Module Dependency Graph:**

```
┌──────────────────┐
│   server.js      │ ─────imports────▶ ┌──────────────┐
│ (entry point)    │                   │   app.js     │
└──────────────────┘                   └──────┬───────┘
                                              │ imports
┌──────────────────┐                   ┌──────▼───────┐
│ tests/           │                   │ src/routes/  │
│ server.test.js   │ ─────imports────▶ │ index.js     │
└──────────────────┘                   └──────┬───────┘
                                              │ imports
                                       ┌──────▼───────────────┐
                                       │ src/routes/          │
                                       │ greeting.routes.js   │
                                       └──────────────────────┘
```

**Configuration Updates:**

| File | Configuration Element | Change |
|------|----------------------|--------|
| `package.json` | `"main"` field | Verify set to `"server.js"` |
| `package.json` | `"scripts.start"` | Verify `"node server.js"` |
| `package.json` | `"scripts.test"` | No change (`"jest"`) |

### 0.4.4 Wildcard Pattern Specifications

**Trailing Wildcard Patterns Applied:**

| Pattern | Target Files | Purpose |
|---------|-------------|---------|
| `src/routes/*.js` | All route modules | Route file updates |
| `tests/*.js` | Test files | Import path corrections |

**Specific File Patterns (No Wildcards Needed):**

Due to the small scope of this refactoring, specific file paths are preferred over wildcards:

- `server.js` - Single entry point
- `app.js` - Single app configuration
- `src/routes/index.js` - Single route aggregator
- `src/routes/greeting.routes.js` - Single route module
- `tests/server.test.js` - Single test file

### 0.4.5 One-Phase Execution

**CRITICAL: The entire refactor will be executed by Blitzy in ONE phase.**

**Single-Phase Transformation Sequence:**

1. Create `src/routes/` directory structure
2. Create `src/routes/greeting.routes.js` with extracted handlers
3. Create `src/routes/index.js` as route aggregator
4. Create `app.js` with Express configuration
5. Update `server.js` to import from `app.js`
6. Update `tests/server.test.js` import path
7. Update `README.md` with new structure documentation
8. Verify `package.json` configuration

**All files are included in this single phase - no splitting into multiple phases.**

## 0.5 Dependency Inventory

### 0.5.1 Key Private and Public Packages

**Complete Package Registry:**

| Registry | Package Name | Version | Purpose | Refactoring Impact |
|----------|--------------|---------|---------|-------------------|
| npm (public) | express | ^4.21.2 | Web application framework | Core dependency - no changes |
| npm (public) | jest | ^29.7.0 | Testing framework | Dev dependency - no changes |
| npm (public) | supertest | ^7.0.0 | HTTP assertions library | Dev dependency - no changes |

**Version Verification:**

All versions are directly sourced from `package.json` in the repository:

```json
{
  "dependencies": {
    "express": "^4.21.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

**Package Lock Analysis (from `package-lock.json`):**

| Package | Locked Version | Integrity Hash Prefix |
|---------|---------------|----------------------|
| express | 4.21.2 | sha512-... (verified) |
| jest | 29.7.0 | sha512-... (verified) |
| supertest | 7.0.0 | sha512-... (verified) |

**No Additional Packages Required:**

The refactoring does not introduce any new dependencies. The existing Express.js Router functionality is built into the `express` package.

### 0.5.2 Dependency Updates

**Import Refactoring:**

**Files Requiring Import Updates:**

| File Pattern | Current State | Required Changes |
|--------------|---------------|------------------|
| `server.js` | `require('express')` | Change to `require('./app')` |
| `tests/server.test.js` | `require('../server')` | Change to `require('../app')` |

**Import Transformation Rules:**

| Rule ID | Old Pattern | New Pattern | Apply To |
|---------|------------|-------------|----------|
| IR-001 | `const express = require('express')` | `const app = require('./app')` | `server.js` |
| IR-002 | `const app = express()` | REMOVE (moved to `app.js`) | `server.js` |
| IR-003 | `const app = require('../server')` | `const app = require('../app')` | `tests/server.test.js` |

**New Import Statements (New Files):**

| File | Required Imports |
|------|-----------------|
| `app.js` | `const express = require('express')` |
| `app.js` | `const routes = require('./src/routes')` |
| `src/routes/index.js` | `const express = require('express')` |
| `src/routes/index.js` | `const greetingRoutes = require('./greeting.routes')` |
| `src/routes/greeting.routes.js` | `const express = require('express')` |

### 0.5.3 External Reference Updates

**Configuration Files:**

| File | Element | Current Value | New Value |
|------|---------|---------------|-----------|
| `package.json` | `main` | `"server.js"` | `"server.js"` (no change) |
| `package.json` | `scripts.start` | `"node server.js"` | `"node server.js"` (no change) |
| `package.json` | `scripts.test` | `"jest"` | `"jest"` (no change) |

**Documentation Files:**

| File | Section | Required Update |
|------|---------|-----------------|
| `README.md` | Project structure | Add new file organization |
| `README.md` | Setup instructions | No changes (npm install/start still work) |

**Build/CI Files:**

No CI/CD configuration files exist in this project that require updates.

### 0.5.4 Environment Configuration

**Environment Variables (Unchanged):**

| Variable | Source | Default | Usage |
|----------|--------|---------|-------|
| `PORT` | `.env.example` | 3000 | Server listening port |
| `DB` | `.env.example` | (empty) | Optional database connection |
| `DB_HOST` | User-provided | (set) | Database host configuration |
| `DB_HOST1` | User-provided | (set) | Additional database host |

**Note:** Environment variable handling remains in `server.js` and requires no changes to the configuration approach.

### 0.5.5 Node.js Runtime Requirements

| Requirement | Specification | Source |
|-------------|--------------|--------|
| Node.js Version | >=18.0.0 | `package.json` engines field |
| Current Installed | v20.19.6 | Runtime verification |
| npm Version | >=7 (lockfileVersion 3) | `package-lock.json` |

**Runtime Compatibility Verified:**
- Node.js v20.19.6 satisfies >=18.0.0 requirement ✓
- All 356 packages installed successfully ✓
- Zero vulnerabilities reported ✓
- All tests passing (2/2) ✓

## 0.6 Scope Boundaries

### 0.6.1 Exhaustively In Scope

**Source Transformations:**

| Pattern | Description | Files Matched |
|---------|-------------|---------------|
| `server.js` | Main server entry point | 1 file |
| `app.js` | New application configuration (to be created) | 1 file |
| `src/routes/*.js` | Route modules (to be created) | 2 files |

**Test Updates:**

| Pattern | Description | Files Matched |
|---------|-------------|---------------|
| `tests/server.test.js` | Integration test file | 1 file |

**Configuration Updates:**

| Pattern | Description | Files Matched |
|---------|-------------|---------------|
| `package.json` | npm manifest verification | 1 file |

**Documentation Updates:**

| Pattern | Description | Files Matched |
|---------|-------------|---------------|
| `README.md` | Project structure documentation | 1 file |

**Directory Creation:**

| Path | Purpose |
|------|---------|
| `src/` | Source code root directory |
| `src/routes/` | Route module directory |

**Complete In-Scope File List:**

| # | File Path | Action | Justification |
|---|-----------|--------|---------------|
| 1 | `server.js` | UPDATE | Extract app configuration, keep HTTP listener |
| 2 | `app.js` | CREATE | New Express app configuration module |
| 3 | `src/routes/index.js` | CREATE | Route aggregator module |
| 4 | `src/routes/greeting.routes.js` | CREATE | Greeting endpoints module |
| 5 | `tests/server.test.js` | UPDATE | Update import path to app.js |
| 6 | `package.json` | UPDATE | Verify main entry point |
| 7 | `README.md` | UPDATE | Document new project structure |

**Import Corrections:**

Every file containing old import statements that require updates:

| File | Old Import | New Import |
|------|-----------|-----------|
| `server.js` | `require('express')` | `require('./app')` |
| `tests/server.test.js` | `require('../server')` | `require('../app')` |

### 0.6.2 Explicitly Out of Scope

**Files NOT to be Modified:**

| File Path | Reason for Exclusion |
|-----------|---------------------|
| `package-lock.json` | Auto-generated file, will update automatically |
| `.env.example` | Environment configuration unchanged |
| `postman.json` | API endpoints unchanged, collection remains valid |
| `blitzy/documentation/*.md` | Specification documents, not implementation |
| `amazon_cloudformation.yaml` | Infrastructure template, unrelated |
| `apache.conf` | Web server config, unrelated |
| `datadog.yaml` | Monitoring config, unrelated |
| `script.sh` | Shell script, unrelated |
| `dummy_qtest.csv` | Test data, unrelated |
| `notion.md` | Documentation sample, unrelated |
| `mysql.sql` | Database script, unrelated |
| `oracle.sql` | Database script, unrelated |
| `dotnet.cs` | C# sample, unrelated |
| `php.php` | PHP sample, unrelated |
| `eclipse.xml` | IDE config, unrelated |
| `junit.java` | Java test, unrelated |
| `maven.xml` | Maven config, unrelated |

**Features NOT Being Changed:**

| Feature | Current Behavior | Post-Refactor Behavior |
|---------|-----------------|----------------------|
| GET / response | Returns `"Hello world"` | Returns `"Hello world"` (unchanged) |
| GET /evening response | Returns `"Good evening"` | Returns `"Good evening"` (unchanged) |
| HTTP status codes | 200 OK for both endpoints | 200 OK for both endpoints (unchanged) |
| Default port | 3000 | 3000 (unchanged) |
| Port configuration | `process.env.PORT` | `process.env.PORT` (unchanged) |
| Test framework | Jest with Supertest | Jest with Supertest (unchanged) |
| Module format | CommonJS | CommonJS (unchanged) |

**Architectural Decisions NOT Being Changed:**

| Decision | Rationale |
|----------|-----------|
| No middleware additions | User requested exact functionality preservation |
| No error handling additions | Not in original implementation |
| No logging additions | Not in original implementation |
| No database integration | Not in original implementation |
| No authentication | Not in original implementation |

### 0.6.3 Scope Boundary Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              IN SCOPE                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │ Source Files    │  │ Test Files      │  │ Configuration               │  │
│  │ ─────────────── │  │ ─────────────── │  │ ───────────────────────────│  │
│  │ • server.js     │  │ • tests/        │  │ • package.json              │  │
│  │ • app.js (new)  │  │   server.test.js│  │ • README.md                 │  │
│  │ • src/routes/   │  │                 │  │                             │  │
│  │   *.js (new)    │  │                 │  │                             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              OUT OF SCOPE                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ Infrastructure: amazon_cloudformation.yaml, apache.conf, datadog.yaml  ││
│  │ Database: mysql.sql, oracle.sql                                         ││
│  │ Other Languages: dotnet.cs, php.php, junit.java, eclipse.xml, maven.xml││
│  │ Documentation Artifacts: blitzy/documentation/*, notion.md              ││
│  │ Utilities: script.sh, dummy_qtest.csv                                   ││
│  │ Auto-generated: package-lock.json                                       ││
│  │ Unchanged Config: .env.example, postman.json                            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

## 0.7 Special Instructions for Refactoring

### 0.7.1 Refactoring-Specific Requirements

**User-Emphasized Requirements:**

| Requirement | Priority | Validation Method |
|-------------|----------|-------------------|
| Keep every feature and functionality exactly as in the original | CRITICAL | Test suite execution |
| Fully match the behavior and logic of current implementation | CRITICAL | Response text comparison |
| Rewrite into Express.js refactor | HIGH | Code structure review |

### 0.7.2 Behavioral Preservation Mandates

**Endpoint Contract Preservation:**

| Endpoint | Request | Expected Response | Status |
|----------|---------|-------------------|--------|
| `GET /` | `curl http://localhost:3000/` | `Hello world` | 200 OK |
| `GET /evening` | `curl http://localhost:3000/evening` | `Good evening` | 200 OK |

**Response Format Requirements:**

- Content-Type: `text/html; charset=utf-8` (Express default for `res.send()`)
- Body: Exact string match, no whitespace differences
- Headers: Standard Express response headers

### 0.7.3 API Contract Maintenance

**Maintain All Public API Contracts:**

| Contract Element | Specification | Preservation Method |
|-----------------|---------------|---------------------|
| Route paths | `/` and `/evening` | Exact path registration |
| HTTP methods | GET only | Router configuration |
| Response strings | Character-exact | Literal string preservation |
| Status codes | 200 | Default `res.send()` behavior |

### 0.7.4 Test Compatibility Requirements

**Preserve All Existing Functionality:**

| Test Case | Assertion | Must Pass |
|-----------|-----------|-----------|
| `GET / returns Hello world` | `response.text === 'Hello world'` | ✓ |
| `GET / returns 200` | `response.status === 200` | ✓ |
| `GET /evening returns Good evening` | `response.text === 'Good evening'` | ✓ |
| `GET /evening returns 200` | `response.status === 200` | ✓ |

**Ensure All Tests Continue Passing:**

The existing test suite in `tests/server.test.js` must execute successfully after refactoring:

```bash
# Required test command (must succeed)
npm test

#### Expected output
PASS tests/server.test.js
  Express Server Endpoints
    GET /
      ✓ GET / returns Hello world
    GET /evening
      ✓ GET /evening returns Good evening

Tests: 2 passed, 2 total
```

### 0.7.5 Design Pattern Application Guidelines

**Follow Express.js Best Practices Where Applicable:**

| Pattern | Application | Implementation |
|---------|-------------|----------------|
| App-Server Separation | Split `server.js` | `app.js` + `server.js` |
| Express Router | Modular routes | `express.Router()` in route files |
| Conditional Startup | Test compatibility | `require.main === module` guard |
| Module Export | Testing support | `module.exports = app` in `app.js` |

### 0.7.6 Backward Compatibility Requirements

**Maintain Backward Compatibility:**

| Compatibility Aspect | Requirement | Implementation |
|---------------------|-------------|----------------|
| npm start | Must work unchanged | Entry point remains `server.js` |
| npm test | Must work unchanged | Jest configuration unchanged |
| Import path | Flexible for tests | Export app from both entry points if needed |
| Environment vars | Must work unchanged | PORT handling in `server.js` |

**Script Compatibility Matrix:**

| Command | Current Behavior | Post-Refactor Behavior | Status |
|---------|-----------------|----------------------|--------|
| `npm install` | Install dependencies | Install dependencies | Unchanged |
| `npm start` | Start server on PORT | Start server on PORT | Unchanged |
| `npm test` | Run Jest tests | Run Jest tests | Unchanged |
| `node server.js` | Start server | Start server | Unchanged |

### 0.7.7 Code Quality Standards

**Maintain Code Standards:**

| Standard | Requirement | Verification |
|----------|-------------|--------------|
| Strict mode | `'use strict'` in all JS files | Code review |
| CommonJS | `require`/`module.exports` format | Code review |
| Documentation | JSDoc comments preserved | Code review |
| Naming conventions | Consistent with original | Code review |

### 0.7.8 Validation Checklist

**Pre-Completion Validation:**

- [ ] All route handlers produce identical responses
- [ ] Test suite passes (2/2 tests)
- [ ] npm scripts work without modification
- [ ] No new dependencies introduced
- [ ] Module export pattern maintained
- [ ] Strict mode enabled in all files
- [ ] Port configuration unchanged
- [ ] README updated with new structure

**Post-Refactoring Verification Commands:**

```bash
# Install dependencies
npm install

#### Run automated tests (must pass)
npm test

#### Start server
npm start

#### Manual endpoint verification
curl http://localhost:3000/
#### Expected: Hello world

curl http://localhost:3000/evening
# Expected: Good evening
```

