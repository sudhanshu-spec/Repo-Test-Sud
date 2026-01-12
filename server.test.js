/**
 * Comprehensive Jest Test Suite for Express.js Server
 * 
 * This test suite covers all robustness features:
 * - Error handling with 404 responses
 * - Input validation with body parsing
 * - Route handlers for all endpoints
 * - HTTP method support
 * - Response format validation
 * - Edge cases handling
 * 
 * @module server.test
 * @requires supertest
 * @requires ./server.js
 */

'use strict';

const request = require('supertest');

// Import the app and server from server.js
let app, server;

/**
 * Setup before all tests
 * Loads the server module and suppresses console output during testing
 */
beforeAll(() => {
    // Suppress console output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Load the module
    const serverModule = require('./server.js');
    app = serverModule.app;
    server = serverModule.server;
});

/**
 * Cleanup after all tests
 * Restores console and closes the server
 */
afterAll((done) => {
    // Restore console
    console.log.mockRestore();
    console.warn.mockRestore();
    console.error.mockRestore();
    
    // Close the server after all tests
    if (server && server.close) {
        server.close(done);
    } else {
        done();
    }
});

describe('Express Server Tests', () => {
    // =========================================================================
    // ROOT ENDPOINT TESTS (Test Case 1)
    // =========================================================================
    describe('GET /', () => {
        it('should return server status JSON with 200 status', async () => {
            const res = await request(app).get('/');
            
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/application\/json/);
            expect(res.body).toHaveProperty('status', 'running');
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('endpoints');
            expect(Array.isArray(res.body.endpoints)).toBe(true);
        });
    });

    // =========================================================================
    // HELLO ENDPOINT TESTS (Test Case 2)
    // =========================================================================
    describe('GET /hello', () => {
        it('should return "Hello world" as text/plain', async () => {
            const res = await request(app).get('/hello');
            
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/text\/plain/);
            expect(res.text).toBe('Hello world');
        });
    });

    // =========================================================================
    // EVENING ENDPOINT TESTS (Test Case 3)
    // =========================================================================
    describe('GET /evening', () => {
        it('should return "Good evening" as text/plain', async () => {
            const res = await request(app).get('/evening');
            
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/text\/plain/);
            expect(res.text).toBe('Good evening');
        });
    });

    // =========================================================================
    // HEALTH CHECK TESTS (Test Case 4)
    // =========================================================================
    describe('GET /health', () => {
        it('should return healthy status with uptime', async () => {
            const res = await request(app).get('/health');
            
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/application\/json/);
            expect(res.body).toHaveProperty('status', 'healthy');
            expect(res.body).toHaveProperty('uptime');
            expect(typeof res.body.uptime).toBe('number');
            expect(res.body.uptime).toBeGreaterThanOrEqual(0);
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('memoryUsage');
        });
    });

    // =========================================================================
    // 404 NOT FOUND HANDLER TESTS (Test Cases 5-8)
    // =========================================================================
    describe('404 Not Found Handler', () => {
        it('should return 404 for unknown GET route', async () => {
            const res = await request(app).get('/nonexistent');
            
            expect(res.status).toBe(404);
            expect(res.headers['content-type']).toMatch(/application\/json/);
            expect(res.body).toHaveProperty('error');
            expect(res.body).toHaveProperty('status', 404);
            expect(res.body.error).toContain('Not Found');
        });

        it('should return 404 for unknown POST route', async () => {
            const res = await request(app).post('/unknown');
            
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error');
            expect(res.body).toHaveProperty('status', 404);
        });

        it('should return 404 for unknown PUT route', async () => {
            const res = await request(app).put('/missing');
            
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error');
            expect(res.body).toHaveProperty('status', 404);
        });

        it('should return 404 for unknown DELETE route', async () => {
            const res = await request(app).delete('/notfound');
            
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error');
            expect(res.body).toHaveProperty('status', 404);
        });
    });

    // =========================================================================
    // INPUT VALIDATION TESTS (Test Cases 9-10)
    // =========================================================================
    describe('Input Validation - Body Parsing', () => {
        it('should accept valid JSON body', async () => {
            const res = await request(app)
                .post('/test-json')
                .send({ name: 'test', value: 123 })
                .set('Content-Type', 'application/json');
            
            // Should return 404 since route doesn't exist, but JSON should be parsed
            expect(res.status).toBe(404);
        });

        it('should handle malformed JSON gracefully', async () => {
            const res = await request(app)
                .post('/test-json')
                .send('{ invalid json }')
                .set('Content-Type', 'application/json');
            
            // Express should return 400 for malformed JSON
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });

    // =========================================================================
    // HTTP METHOD TESTS (Test Cases 11-12)
    // =========================================================================
    describe('HTTP Methods', () => {
        it('should support HEAD request for /hello', async () => {
            const res = await request(app).head('/hello');
            
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/text\/plain/);
            // HEAD requests should not have a body
            expect(res.text === '' || res.text === undefined).toBe(true);
        });

        it('should support HEAD request for /', async () => {
            const res = await request(app).head('/');
            
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/application\/json/);
        });
    });

    // =========================================================================
    // RESPONSE FORMAT TESTS (Test Cases 13-15)
    // =========================================================================
    describe('Response Formats', () => {
        it('should return text/plain for /hello', async () => {
            const res = await request(app).get('/hello');
            expect(res.headers['content-type']).toMatch(/text\/plain/);
        });

        it('should return text/plain for /evening', async () => {
            const res = await request(app).get('/evening');
            expect(res.headers['content-type']).toMatch(/text\/plain/);
        });

        it('should return application/json for /', async () => {
            const res = await request(app).get('/');
            expect(res.headers['content-type']).toMatch(/application\/json/);
        });
    });

    // =========================================================================
    // EDGE CASE TESTS (Test Cases 16-20)
    // =========================================================================
    describe('Edge Cases', () => {
        it('should handle query parameters on valid routes', async () => {
            const res = await request(app).get('/hello?param=value');
            
            expect(res.status).toBe(200);
            expect(res.text).toBe('Hello world');
        });

        it('should handle trailing slash for routes', async () => {
            // Express with default settings treats /hello and /hello/ similarly
            const res = await request(app).get('/hello/');
            
            // Without strict routing enabled, Express matches both /hello and /hello/
            expect([200, 404]).toContain(res.status);
        });

        it('should handle double slash in path', async () => {
            const res = await request(app).get('//hello');
            
            // Double slashes are handled by Express - may match or return 404
            expect([200, 404]).toContain(res.status);
        });

        it('should handle URL-encoded paths', async () => {
            const res = await request(app).get('/hello%20world');
            
            // URL-encoded path should return 404 since it's not a defined route
            expect(res.status).toBe(404);
        });

        it('should handle empty path segment', async () => {
            const res = await request(app).get('/');
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status');
        });
    });

    // =========================================================================
    // SERVER STATUS TESTS (Test Cases 21-22)
    // =========================================================================
    describe('Server Status', () => {
        it('should export app object correctly', () => {
            expect(app).toBeDefined();
            expect(typeof app).toBe('function'); // Express app is a function
            expect(typeof app.get).toBe('function');
            expect(typeof app.use).toBe('function');
            expect(typeof app.post).toBe('function');
            expect(typeof app.put).toBe('function');
            expect(typeof app.delete).toBe('function');
        });

        it('should export server object correctly', () => {
            expect(server).toBeDefined();
            expect(typeof server).toBe('object');
            expect(typeof server.close).toBe('function');
            expect(typeof server.listen).toBe('function');
            expect(typeof server.address).toBe('function');
        });
    });
});
