# Repo-Test-Sud

A lightweight Node.js Express server tutorial demonstrating best practices for building, testing, and deploying web services.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Code Architecture](#code-architecture)
- [Testing](#testing)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

This project is a minimal Express.js web server that serves as a learning resource and template for building Node.js applications. It demonstrates:

- Express.js server setup and configuration
- RESTful API endpoint definition
- Test-driven development with Jest and Supertest
- Clean code organization with JSDoc documentation
- Production-ready deployment patterns

## Features

- **Two Simple Endpoints**: GET `/` and GET `/evening` returning greeting messages
- **Environment Configuration**: Configurable port via environment variables
- **Comprehensive Test Suite**: 48 unit and integration tests with 100% coverage
- **Production-Ready Architecture**: Testable module exports with conditional server startup
- **Well-Documented Code**: Inline comments and JSDoc annotations throughout

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | ≥ 18.0.0 | JavaScript runtime |
| npm | ≥ 8.0.0 | Package manager (included with Node.js) |

To verify your installations:

```bash
# Check Node.js version
node --version
# Expected output: v18.x.x or higher

# Check npm version
npm --version
# Expected output: 8.x.x or higher
```

## Quick Start

Get the server running in under a minute:

```bash
# Clone the repository
git clone <repository-url>
cd Repo-Test-Sud

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on port 3000 by default. Test it:

```bash
curl http://localhost:3000/
# Output: Hello world

curl http://localhost:3000/evening
# Output: Good evening
```

## Installation

### Step-by-Step Installation

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd Repo-Test-Sud
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

   This installs:
   - `express` (^4.21.2) - Web framework
   - `jest` (^29.7.0) - Testing framework (dev)
   - `supertest` (^7.0.0) - HTTP testing (dev)

3. **Configure Environment (Optional)**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` to customize settings.

4. **Verify Installation**

   Run the test suite to ensure everything is working:

   ```bash
   npm test
   ```

   Expected output: All 48 tests should pass.

## Configuration

### Environment Variables

The server supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port the server listens on |
| `DB` | (empty) | Database connection string (optional, for future use) |

### Setting Environment Variables

**Method 1: Using a .env file**

Create a `.env` file in the project root:

```env
PORT=3000
DB=mongodb://localhost:27017/myapp
```

**Method 2: Command Line (Linux/macOS)**

```bash
PORT=8080 npm start
```

**Method 3: Command Line (Windows PowerShell)**

```powershell
$env:PORT=8080; npm start
```

**Method 4: Command Line (Windows CMD)**

```cmd
set PORT=8080 && npm start
```

## API Documentation

### Endpoints Overview

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| GET | `/` | Returns "Hello world" greeting | 200 OK |
| GET | `/evening` | Returns "Good evening" greeting | 200 OK |
| * | `/*` | Any undefined route | 404 Not Found |

### Detailed Endpoint Reference

#### GET /

Returns a simple "Hello world" greeting.

**Request:**

```http
GET / HTTP/1.1
Host: localhost:3000
```

**Response:**

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

Hello world
```

**cURL Example:**

```bash
curl -i http://localhost:3000/
```

#### GET /evening

Returns a "Good evening" greeting.

**Request:**

```http
GET /evening HTTP/1.1
Host: localhost:3000
```

**Response:**

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

Good evening
```

**cURL Example:**

```bash
curl -i http://localhost:3000/evening
```

### Error Responses

#### 404 Not Found

Returned when accessing undefined routes or using unsupported HTTP methods.

**Example:**

```bash
curl -i http://localhost:3000/nonexistent
# HTTP/1.1 404 Not Found
```

### Query Parameters

The endpoints accept query parameters but ignore them (maintaining consistent responses):

```bash
curl http://localhost:3000/?foo=bar
# Output: Hello world
```

## Code Architecture

### Project Structure

```
Repo-Test-Sud/
├── server.js              # Main Express application entry point
├── package.json           # Node.js project manifest
├── package-lock.json      # Dependency lock file
├── .env.example           # Environment template
├── README.md              # This documentation file
├── tests/                 # Test suites directory
│   ├── server.test.js           # Endpoint tests
│   ├── server.lifecycle.test.js # Server lifecycle tests
│   └── server.methods.test.js   # HTTP method tests
└── blitzy/                # Blitzy platform documentation
    └── documentation/
```

### Server.js Code Explanation

The main server file (`server.js`) follows a clean, testable architecture:

```javascript
/**
 * Express.js Application Entry Point
 * 
 * Architecture decisions explained:
 * 1. 'use strict' - Enforces strict JavaScript mode for safer code
 * 2. Module exports - Exports app for testing without starting server
 * 3. require.main guard - Only binds to port when run directly
 */

'use strict';

// Import Express web framework
// Express provides routing, middleware, and HTTP utilities
const express = require('express');

// Create Express application instance
// This is the core application object that handles requests
const app = express();

// Define server port from environment or default to 3000
// Using process.env allows configuration without code changes
const PORT = process.env.PORT || 3000;

/**
 * Root endpoint handler
 * GET / - Returns "Hello world" as plain text response
 * 
 * How it works:
 * - app.get() registers a handler for GET requests to '/' path
 * - res.send() sets Content-Type to text/html and sends response
 * 
 * @param {Object} req - Express request object (contains query params, headers, etc.)
 * @param {Object} res - Express response object (used to send response back)
 */
app.get('/', (req, res) => {
  res.send('Hello world');
});

/**
 * Evening endpoint handler
 * GET /evening - Returns "Good evening" as plain text response
 * 
 * Same pattern as root endpoint, demonstrating route modularity
 */
app.get('/evening', (req, res) => {
  res.send('Good evening');
});

/**
 * Conditional server startup
 * 
 * Why this pattern?
 * - require.main === module is true only when file is run directly (node server.js)
 * - When imported for testing, this block is skipped
 * - This allows Supertest to work without port conflicts
 */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app instance for testing
// This enables Supertest to make requests without HTTP layer
module.exports = app;
```

### Key Design Patterns

1. **Testable Module Pattern**: The `require.main === module` guard enables the app to be imported for testing without starting a server.

2. **Environment-Based Configuration**: Using `process.env.PORT` allows deployment flexibility without code changes.

3. **Express App Export**: Exporting the `app` instance enables in-process testing with Supertest.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with verbose output
npx jest --verbose

# Run specific test file
npx jest tests/server.test.js

# Run tests with coverage report
npx jest --coverage
```

### Test Structure

The test suite is organized into three files:

| Test File | Purpose | Tests |
|-----------|---------|-------|
| `server.test.js` | Endpoint behavior, status codes, headers, edge cases | 22 tests |
| `server.lifecycle.test.js` | Server startup, shutdown, port binding | 14 tests |
| `server.methods.test.js` | HTTP method constraints (POST, PUT, DELETE) | 12 tests |

### Coverage Metrics

Target coverage: **100%** across all metrics

Run coverage report:

```bash
npx jest --coverage
```

### Writing New Tests

Follow this pattern for new tests:

```javascript
'use strict';

const request = require('supertest');
const app = require('../server');

describe('Feature Name', () => {
  test('should do something specific', async () => {
    const response = await request(app).get('/endpoint');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Expected response');
  });
});
```

## Deployment Guide

### Option 1: Traditional Server Deployment

1. **Set Up Server Environment**

   ```bash
   # On your server (Ubuntu/Debian example)
   sudo apt update
   sudo apt install -y nodejs npm
   ```

2. **Clone and Install**

   ```bash
   git clone <repository-url> /var/www/app
   cd /var/www/app
   npm install --production
   ```

3. **Configure Environment**

   ```bash
   echo "PORT=80" > .env
   ```

4. **Start with Process Manager (Recommended)**

   ```bash
   # Install PM2 globally
   npm install -g pm2

   # Start application
   pm2 start server.js --name "express-app"

   # Enable startup on boot
   pm2 startup
   pm2 save
   ```

5. **Verify Deployment**

   ```bash
   curl http://your-server-ip/
   # Output: Hello world
   ```

### Option 2: Docker Deployment

1. **Create Dockerfile**

   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install --production

   COPY server.js ./

   ENV PORT=3000
   EXPOSE 3000

   CMD ["node", "server.js"]
   ```

2. **Build and Run**

   ```bash
   # Build image
   docker build -t express-app .

   # Run container
   docker run -d -p 3000:3000 --name express-app express-app
   ```

### Option 3: Cloud Platform Deployment

#### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### AWS Elastic Beanstalk

1. Install EB CLI: `pip install awsebcli`
2. Initialize: `eb init`
3. Deploy: `eb create production`

#### Google Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy express-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Deployment Checklist

Before deploying to production:

- [ ] All tests pass (`npm test`)
- [ ] Environment variables configured
- [ ] Production dependencies installed (`npm install --production`)
- [ ] Port configuration matches hosting platform
- [ ] Health check endpoint available (GET /)
- [ ] Logging configured for production
- [ ] SSL/TLS configured (for production domains)

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

#### Module Not Found

**Error:**

```
Error: Cannot find module 'express'
```

**Solution:**

```bash
npm install
```

#### Tests Failing

1. Ensure dependencies are installed: `npm install`
2. Check Node.js version: `node --version` (should be ≥ 18)
3. Run tests with verbose output: `npx jest --verbose`

### Getting Help

If you encounter issues:

1. Check the [Issues](link-to-issues) page for known problems
2. Review the test suite for usage examples
3. Create a new issue with reproduction steps

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Write tests for new functionality
4. Ensure all tests pass: `npm test`
5. Submit a pull request

### Code Style Guidelines

- Use strict mode: `'use strict'`
- Add JSDoc comments to functions
- Follow existing naming conventions
- Write tests for all new features

## License

This project is open source and available for educational purposes.

---

**Happy Coding!** 🚀
