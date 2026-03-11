"""
Flask Application Entry Point

A production-ready Python Flask server implementing:

Endpoints:
- GET /        : Returns "Hello world"
- GET /evening : Returns "Good evening"
- GET /health  : Returns JSON health status for monitoring/load balancer integration

Extension Stack (in order):
- Flask-Talisman : Security HTTP headers (CSP, X-Content-Type-Options, X-Frame-Options, etc.)
- Flask-Compress  : Gzip/deflate response compression for reduced bandwidth
- Flask-CORS      : Cross-Origin Resource Sharing for API consumers
- Python logging  : HTTP request logging with environment-aware formats

Environment Configuration:
- PORT      : Server listening port (default: 3000)
- FLASK_ENV : Application environment (development/production)

The server listens on the PORT environment variable or defaults to port 3000.
The app instance is importable for testing purposes and Gunicorn deployment.

This module fully replaces the original Node.js Express server (server.js) with
behavioral parity across all endpoints, middleware, and configuration patterns.
"""

# ---------------------------------------------------------------------------
# Imports
# ---------------------------------------------------------------------------

# Flask web framework and JSON response helper (replaces Express)
from flask import Flask, jsonify, request

# Security headers extension (replaces helmet middleware)
from flask_talisman import Talisman

# Cross-Origin Resource Sharing extension (replaces cors middleware)
from flask_cors import CORS

# Response compression extension (replaces compression middleware)
from flask_compress import Compress

# Environment variable loading (replaces require('dotenv').config())
from dotenv import load_dotenv

# Standard library modules
import os
import time
from datetime import datetime, timezone
import logging

# ---------------------------------------------------------------------------
# Environment Loading
# Load environment variables from .env file FIRST (before any env access).
# This mirrors the Node.js pattern: require('dotenv').config() at line 28
# of the original server.js, which runs before any process.env access.
# ---------------------------------------------------------------------------
load_dotenv()

# ---------------------------------------------------------------------------
# Application Startup Time
# Record the time the application module is loaded for uptime calculation.
# This replaces Node.js process.uptime() which returns seconds since the
# Node.js process was started. By capturing time.time() at module load,
# we achieve equivalent behavior: time.time() - start_time gives seconds
# since the application started.
# ---------------------------------------------------------------------------
start_time = time.time()

# ---------------------------------------------------------------------------
# Flask Application Creation
# Create the Flask application instance (replaces: const app = express())
# The app object is the central WSGI application and is importable by:
# - Tests: from app import app
# - Gunicorn: app:app
# ---------------------------------------------------------------------------
app = Flask(__name__)

# ---------------------------------------------------------------------------
# Configuration
# Read PORT from environment or default to 3000, matching the Node.js
# pattern: const PORT = process.env.PORT || 3000
# Read FLASK_ENV for environment-aware behavior (replaces NODE_ENV)
# ---------------------------------------------------------------------------
PORT = int(os.environ.get('PORT', 3000))
flask_env = os.environ.get('FLASK_ENV', 'development')

# ---------------------------------------------------------------------------
# Extension Initialization (Middleware Stack)
#
# The extension stack is configured in a specific order for optimal security
# and performance, matching the original Express middleware ordering:
# 1. Talisman  - Security headers applied first before any response is sent
#                (replaces helmet())
# 2. Compress  - Compress responses early for performance benefits
#                (replaces compression())
# 3. CORS      - Handle CORS preflight and cross-origin requests before
#                route processing (replaces cors())
# ---------------------------------------------------------------------------

# Security extension - sets various HTTP headers for protection against
# common web application security issues. Configures:
# - Content-Security-Policy header
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: SAMEORIGIN
# - Strict-Transport-Security (HSTS)
# force_https=False is CRITICAL for local development compatibility
# so that non-HTTPS requests are not automatically redirected.
Talisman(app, force_https=False)

# Compression extension - gzip/deflate compression reduces response sizes
# by up to 70%, improving transfer speeds for API consumers.
Compress(app)

# CORS extension - enables controlled cross-origin requests for API consumers.
# Default configuration matches the permissive cors() behavior from Express,
# allowing all origins, methods, and headers.
CORS(app)

# ---------------------------------------------------------------------------
# Logging Configuration (replaces morgan middleware)
#
# Configures environment-aware request logging:
# - Production ('combined'): Verbose format with timestamps, logger name,
#   and log level — equivalent to morgan's Apache 'combined' format
# - Development ('dev'): Simpler format with timestamps and log level —
#   equivalent to morgan's concise 'dev' format
#
# The original Express server uses:
#   app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
# ---------------------------------------------------------------------------
if flask_env == 'production':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
else:
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

# Create module-level logger for application logging
logger = logging.getLogger(__name__)


@app.after_request
def log_request(response):
    """
    Log each HTTP request after it has been processed.

    This replaces morgan's per-request logging behavior from the original
    Express application. Morgan automatically logs every incoming HTTP request
    with method, path, status code, and response time. This after_request
    handler provides equivalent functionality using Flask's built-in logger.

    Args:
        response: The Flask response object after route processing.

    Returns:
        The unmodified response object (pass-through).
    """
    app.logger.info(
        '%s %s %s %s',
        request.method,
        request.path,
        response.status_code,
        request.remote_addr
    )
    return response


# ---------------------------------------------------------------------------
# Route Handlers
#
# All three endpoints are migrated from Express route handlers to Flask
# route decorators. Response bodies and HTTP status codes are preserved
# exactly as in the original Node.js implementation.
# ---------------------------------------------------------------------------

@app.route('/')
def index():
    """
    Root endpoint handler.

    GET / - Returns "Hello world" as a plain text response.

    This mirrors the original Express handler at lines 94-96 of server.js:
        app.get('/', (req, res) => { res.send('Hello world'); });

    Returns:
        str: "Hello world" with HTTP 200 OK status (Flask default).
    """
    return 'Hello world'


@app.route('/evening')
def evening():
    """
    Evening endpoint handler.

    GET /evening - Returns "Good evening" as a plain text response.

    This mirrors the original Express handler at lines 105-107 of server.js:
        app.get('/evening', (req, res) => { res.send('Good evening'); });

    Returns:
        str: "Good evening" with HTTP 200 OK status (Flask default).
    """
    return 'Good evening'


@app.route('/health')
def health():
    """
    Health check endpoint handler.

    GET /health - Returns JSON health status for monitoring and load balancer
    integration. The response JSON structure exactly matches the original
    Node.js implementation.

    This mirrors the original Express handler at lines 79-85 of server.js:
        app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

    Response JSON fields:
    - status (str): Current health status, always 'healthy'
    - timestamp (str): ISO 8601 formatted UTC time matching JavaScript's
      Date.toISOString() output (e.g., "2024-01-15T10:30:00.000Z")
    - uptime (float): Application uptime in seconds since module load,
      replacing Node.js process.uptime()

    Returns:
        Response: JSON response with health data and HTTP 200 OK status.
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(
            timespec='milliseconds'
        ).replace('+00:00', 'Z'),
        'uptime': time.time() - start_time
    })


# ---------------------------------------------------------------------------
# Conditional Startup Block
#
# Start server only when run directly (not when imported for testing or
# when loaded by Gunicorn). This replaces the Node.js pattern:
#   if (require.main === module) { app.listen(PORT, ...) }
#
# When imported by pytest (from app import app) or Gunicorn (app:app),
# this block is skipped, allowing the app to be used without starting
# the development server.
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    print(f'Server running on port {PORT}')
    print(f'Environment: {flask_env}')
    app.run(host='0.0.0.0', port=PORT, debug=(flask_env != 'production'))
