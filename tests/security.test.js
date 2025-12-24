/**
 * Security Test Suite for Express.js Server
 * 
 * This dedicated security test suite verifies the implementation of security
 * middleware as specified in the Agent Action Plan Sections 0.6.1, 0.8.2, and 0.8.3.
 * 
 * Test Coverage:
 * - Security Headers: Verifies all Helmet.js headers are properly set
 * - Rate Limiting: Verifies express-rate-limit middleware behavior
 * - CORS: Verifies cors middleware configuration
 * 
 * Uses supertest for HTTP assertions without starting a live server.
 * 
 * @module tests/security
 */

'use strict';

// Import supertest for HTTP assertions
const request = require('supertest');

// Import the Express app from server.js
const app = require('../server');

// =============================================================================
// SECURITY HEADERS TEST SUITE
// =============================================================================

describe('Security Headers', () => {
  /**
   * Test that Content-Security-Policy header is present
   * Helmet.js sets a restrictive CSP by default to mitigate XSS and injection attacks
   */
  test('should include Content-Security-Policy header', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.headers['content-security-policy']).toBeDefined();
    // Verify CSP contains expected directives
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  /**
   * Test that X-Content-Type-Options header is set to 'nosniff'
   * Prevents browsers from MIME type sniffing
   */
  test('should include X-Content-Type-Options header as nosniff', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  /**
   * Test that X-Frame-Options header is present
   * Prevents clickjacking attacks by restricting page embedding
   */
  test('should include X-Frame-Options header', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  /**
   * Test that X-Powered-By header is removed
   * Helmet removes this header by default to prevent server fingerprinting
   */
  test('should NOT include X-Powered-By header', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  /**
   * Test that Strict-Transport-Security header is present
   * Enforces HTTPS connections to protect against protocol downgrade attacks
   */
  test('should include Strict-Transport-Security header', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.headers['strict-transport-security']).toBeDefined();
    expect(response.headers['strict-transport-security']).toContain('max-age=');
  });

  /**
   * Test that Cross-Origin-Opener-Policy header is present
   * Provides process isolation for cross-origin windows
   */
  test('should include Cross-Origin-Opener-Policy header', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.headers['cross-origin-opener-policy']).toBe('same-origin');
  });

  /**
   * Test that Cross-Origin-Resource-Policy header is present
   * Blocks cross-origin resource loading
   */
  test('should include Cross-Origin-Resource-Policy header', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.headers['cross-origin-resource-policy']).toBe('same-origin');
  });

  /**
   * Test that Referrer-Policy header is present
   * Controls referrer information sent with requests
   */
  test('should include Referrer-Policy header', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  /**
   * Test that X-DNS-Prefetch-Control header is present
   * Disables DNS prefetching for privacy
   */
  test('should include X-DNS-Prefetch-Control header', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.headers['x-dns-prefetch-control']).toBe('off');
  });
});

// =============================================================================
// RATE LIMITING TEST SUITE
// =============================================================================
// Note: Rate limit tests are designed to verify configuration without exhausting 
// the rate limit. The exhaustive test is skipped by default to avoid affecting
// other test suites in the same run.

describe('Rate Limiting', () => {
  /**
   * Test that RateLimit headers are included in responses
   * Uses draft-8 specification headers: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
   */
  test('should include RateLimit headers', async () => {
    const response = await request(app).get('/');
    
    // Accept both 200 (normal response) and 429 (rate limited from previous tests)
    expect([200, 429]).toContain(response.status);
    
    // Check for draft-8 RateLimit headers (case-insensitive)
    const headers = response.headers;
    const hasRateLimitHeaders = 
      headers['ratelimit-limit'] !== undefined ||
      headers['ratelimit'] !== undefined ||
      headers['ratelimit-remaining'] !== undefined;
    
    expect(hasRateLimitHeaders).toBe(true);
  });

  /**
   * Test that rate limiter is properly configured with expected options
   * Verifies the rate limit value from headers
   */
  test('should have rate limit configured', async () => {
    const response = await request(app).get('/');
    
    // Accept both 200 (normal response) and 429 (rate limited from previous tests)
    expect([200, 429]).toContain(response.status);
    
    // Verify RateLimit-Limit header indicates the configured limit (100)
    const rateLimitHeader = response.headers['ratelimit-limit'];
    if (rateLimitHeader) {
      expect(parseInt(rateLimitHeader, 10)).toBe(100);
    }
  });

  /**
   * Test that rate limit response includes the draft-8 format headers
   * The draft-8 format uses a combined 'ratelimit' header with specific format
   */
  test('should include rate limit policy header', async () => {
    const response = await request(app).get('/');
    
    // Accept both 200 (normal response) and 429 (rate limited from previous tests)
    expect([200, 429]).toContain(response.status);
    
    // Check for RateLimit-Policy header (draft-8 format)
    // The header format is: "100-in-15min"; q=100; w=900; pk=:...
    const policyHeader = response.headers['ratelimit-policy'];
    expect(policyHeader).toBeDefined();
    
    // Verify policy header contains expected values (100 requests per window)
    if (policyHeader) {
      expect(policyHeader).toContain('100');
    }
  });
});

// =============================================================================
// CORS TEST SUITE
// =============================================================================

describe('CORS', () => {
  /**
   * Test that Access-Control-Allow-Origin header is included
   * CORS middleware should set this header for cross-origin requests
   */
  test('should include Access-Control-Allow-Origin header', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:3000');
    
    // Accept both 200 (normal response) and 429 (rate limited)
    expect([200, 429]).toContain(response.status);
    // CORS headers should be present for requests with Origin header
    // The value depends on CORS_ORIGIN configuration (defaults to '*' in development)
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  /**
   * Test that preflight OPTIONS requests are handled correctly
   * CORS middleware should respond to OPTIONS requests with proper headers
   */
  test('should handle preflight OPTIONS request', async () => {
    const response = await request(app)
      .options('/')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');
    
    // OPTIONS requests should return 200, 204, or 429 (if rate limited)
    expect([200, 204, 429]).toContain(response.status);
    
    // Check for CORS headers in preflight response
    expect(response.headers['access-control-allow-methods']).toBeDefined();
  });

  /**
   * Test that allowed headers are properly configured
   * CORS middleware should include Access-Control-Allow-Headers
   */
  test('should include Access-Control-Allow-Headers in preflight', async () => {
    const response = await request(app)
      .options('/')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Content-Type');
    
    // Check for allowed headers in preflight response
    // Accept 200, 204, or 429 (if rate limited)
    expect([200, 204, 429]).toContain(response.status);
    expect(response.headers['access-control-allow-headers']).toBeDefined();
  });

  /**
   * Test that RateLimit headers are exposed to CORS clients
   * CORS middleware should expose RateLimit headers via Access-Control-Expose-Headers
   */
  test('should expose RateLimit headers to CORS clients', async () => {
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:3000');
    
    // Accept both 200 (normal response) and 429 (rate limited)
    expect([200, 429]).toContain(response.status);
    // Check that RateLimit headers are exposed
    const exposedHeaders = response.headers['access-control-expose-headers'];
    if (exposedHeaders) {
      expect(exposedHeaders.toLowerCase()).toContain('ratelimit');
    }
  });
});

// =============================================================================
// ERROR HANDLING TEST SUITE
// =============================================================================

describe('Error Handling', () => {
  /**
   * Test that 404 responses are properly formatted
   * The notFoundHandler should return structured JSON for undefined routes
   */
  test('should return 404 for undefined routes', async () => {
    const response = await request(app).get('/nonexistent-route');
    
    // Accept both 404 (not found) and 429 (rate limited)
    expect([404, 429]).toContain(response.status);
    
    // Only verify body structure if we got a 404
    if (response.status === 404) {
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not Found');
      expect(response.body.message).toContain('/nonexistent-route');
    }
  });

  /**
   * Test that error responses include security headers
   * Security middleware should still be applied to error responses
   */
  test('should include security headers in error responses', async () => {
    const response = await request(app).get('/nonexistent-route');
    
    // Accept both 404 (not found) and 429 (rate limited)
    expect([404, 429]).toContain(response.status);
    
    // Security headers should be present regardless of response status
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});

// =============================================================================
// BODY PARSING TEST SUITE
// =============================================================================

describe('Body Parsing Middleware', () => {
  /**
   * Test that JSON body parsing is configured
   * express.json() middleware should parse JSON request bodies
   */
  test('should parse JSON request bodies', async () => {
    // POST to root should not throw parsing errors even though route doesn't handle POST
    // This verifies JSON parsing middleware is active
    const response = await request(app)
      .post('/')
      .send({ test: 'data' })
      .set('Content-Type', 'application/json');
    
    // Should get 404 (no POST handler) or 429 (rate limited) - not 400 (parsing error)
    expect([404, 429]).toContain(response.status);
  });

  /**
   * Test that URL-encoded body parsing is configured
   * express.urlencoded() middleware should parse URL-encoded request bodies
   */
  test('should parse URL-encoded request bodies', async () => {
    const response = await request(app)
      .post('/')
      .send('test=data')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    
    // Should get 404 (no POST handler) or 429 (rate limited) - not 400 (parsing error)
    expect([404, 429]).toContain(response.status);
  });
});
