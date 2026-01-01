/**
 * Jest Test Suite for Express.js Server Lifecycle
 * 
 * This test file verifies the server startup/shutdown lifecycle behavior:
 * - Server starts successfully on a specified port
 * - Server closes cleanly without open handles
 * - Multiple start/stop cycles work correctly
 * - The require.main === module guard prevents auto-start on import
 * 
 * Uses supertest for HTTP assertions and tests server lifecycle management
 * using beforeAll/afterAll hooks for proper setup and teardown.
 */

'use strict';

// Import supertest for HTTP assertions
const request = require('supertest');

// Import the Express app from server.js
const app = require('../server');

/**
 * Helper function to wrap server.close() in a Promise for proper async cleanup.
 * Ensures Jest exits cleanly without --forceExit flag.
 * 
 * @param {Object} server - The HTTP server instance to close
 * @returns {Promise<void>} Promise that resolves when server is closed
 */
const closeServerAsync = (server) => {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Helper function to start server on a given port with Promise wrapper.
 * Returns server instance for later cleanup.
 * 
 * @param {Object} application - The Express app instance
 * @param {number} port - Port number to bind to
 * @returns {Promise<Object>} Promise that resolves with server instance
 */
const startServerAsync = (application, port) => {
  return new Promise((resolve, reject) => {
    try {
      const server = application.listen(port, () => {
        resolve(server);
      });
      server.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

describe('Server Lifecycle', () => {
  /**
   * Test suite for server startup functionality
   * Verifies the server can start successfully and return a valid server instance
   */
  describe('Server Startup', () => {
    let server = null;
    const TEST_PORT = 3001;

    afterEach(async () => {
      // Ensure server is closed after each test to prevent port conflicts
      if (server) {
        await closeServerAsync(server);
        server = null;
      }
    });

    test('should start server successfully on specified port', async () => {
      // Start the server on test port
      server = await startServerAsync(app, TEST_PORT);
      
      // Verify server instance is returned and is listening
      expect(server).toBeDefined();
      expect(server).not.toBeNull();
      expect(server.listening).toBe(true);
    });

    test('should return a valid server instance with address information', async () => {
      // Start the server on test port
      server = await startServerAsync(app, TEST_PORT);
      
      // Verify server address information
      const address = server.address();
      expect(address).toBeDefined();
      expect(address.port).toBe(TEST_PORT);
    });

    test('should respond to HTTP requests after starting', async () => {
      // Start the server on test port
      server = await startServerAsync(app, TEST_PORT);
      
      // Verify server responds to requests (using supertest in-process)
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });
  });

  /**
   * Test suite for server shutdown functionality
   * Verifies the server can close cleanly without resource leaks
   */
  describe('Server Shutdown', () => {
    const TEST_PORT = 3002;

    test('should close server cleanly without errors', async () => {
      // Start the server
      const server = await startServerAsync(app, TEST_PORT);
      expect(server.listening).toBe(true);
      
      // Close the server and verify no errors
      await expect(closeServerAsync(server)).resolves.toBeUndefined();
      
      // Verify server is no longer listening
      expect(server.listening).toBe(false);
    });

    test('should complete shutdown without open handles', async () => {
      // Start the server
      const server = await startServerAsync(app, TEST_PORT);
      
      // Verify server is listening before shutdown
      expect(server.listening).toBe(true);
      
      // Close the server using Promise wrapper
      await closeServerAsync(server);
      
      // Verify server is completely stopped
      expect(server.listening).toBe(false);
      
      // Verify address returns null after close (indicating complete shutdown)
      const address = server.address();
      expect(address).toBeNull();
    });

    test('should handle calling close on already closed server gracefully', async () => {
      // Start the server
      const server = await startServerAsync(app, TEST_PORT);
      
      // Close the server first time
      await closeServerAsync(server);
      expect(server.listening).toBe(false);
      
      // Calling close on already closed server triggers callback with "Server is not running" error
      // This is expected Node.js behavior - we verify it throws the expected error
      // but does not crash the process
      await expect(closeServerAsync(server)).rejects.toThrow('Server is not running.');
    });
  });

  /**
   * Test suite for multiple start/stop cycles
   * Verifies server can be started and stopped multiple times without resource leaks
   */
  describe('Multiple Start/Stop Cycles', () => {
    const TEST_PORT = 3003;

    test('should support multiple consecutive start/stop cycles', async () => {
      // Cycle 1: Start, verify, stop
      let server = await startServerAsync(app, TEST_PORT);
      expect(server.listening).toBe(true);
      
      // Verify server responds during cycle 1
      let response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
      
      // Stop server from cycle 1
      await closeServerAsync(server);
      expect(server.listening).toBe(false);
      
      // Cycle 2: Start again on same port, verify, stop
      server = await startServerAsync(app, TEST_PORT);
      expect(server.listening).toBe(true);
      
      // Verify server responds during cycle 2
      response = await request(app).get('/evening');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Good evening');
      
      // Stop server from cycle 2
      await closeServerAsync(server);
      expect(server.listening).toBe(false);
    });

    test('should maintain consistent behavior across three start/stop cycles', async () => {
      const CYCLE_COUNT = 3;
      
      for (let i = 0; i < CYCLE_COUNT; i++) {
        // Start server
        const server = await startServerAsync(app, TEST_PORT);
        expect(server.listening).toBe(true);
        
        // Verify functionality
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        
        // Stop server
        await closeServerAsync(server);
        expect(server.listening).toBe(false);
      }
    });

    test('should release port completely between cycles allowing immediate rebind', async () => {
      // Start and immediately stop server
      let server = await startServerAsync(app, TEST_PORT);
      await closeServerAsync(server);
      
      // Should be able to bind to same port immediately without EADDRINUSE error
      server = await startServerAsync(app, TEST_PORT);
      expect(server.listening).toBe(true);
      expect(server.address().port).toBe(TEST_PORT);
      
      // Cleanup
      await closeServerAsync(server);
    });
  });

  /**
   * Test suite for require.main === module check behavior
   * Verifies that importing the app does NOT automatically start the server
   */
  describe('require.main Check Behavior', () => {
    test('should not automatically start server when imported', () => {
      // The app is already imported at the top of this file
      // If require.main check didn't work, server would have started automatically
      // and we'd see port binding issues or the app would be listening
      
      // Verify that app is an Express application instance (function)
      expect(typeof app).toBe('function');
      
      // Verify app is not already listening on any port
      // Express apps don't have a 'listening' property until listen() is called
      // and they return a server instance
      expect(app.listening).toBeUndefined();
    });

    test('should export app instance for testing without side effects', () => {
      // Verify the exported app has expected Express methods
      expect(typeof app.get).toBe('function');
      expect(typeof app.listen).toBe('function');
      expect(typeof app.use).toBe('function');
      
      // Verify app can be used directly with supertest without server binding
      // This confirms the require.main guard allows proper testing
      expect(app).toBeDefined();
    });

    test('should allow supertest to work without explicit server binding', async () => {
      // Supertest can work with Express app directly because of require.main guard
      // This test verifies the app is properly exportable for testing
      const response = await request(app).get('/');
      
      // If require.main guard wasn't present, this could fail due to port conflicts
      // or the test would hang
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello world');
    });

    test('should only start server when run as main module', async () => {
      // In test context, require.main is the Jest runner, not server.js
      // Therefore, the server should NOT have started automatically
      
      // We can verify this by checking that we can bind to the default port
      // If server had auto-started, this would fail with EADDRINUSE
      const DEFAULT_PORT = 3000;
      const server = await startServerAsync(app, DEFAULT_PORT);
      
      // If we got here without error, the require.main check worked correctly
      expect(server.listening).toBe(true);
      expect(server.address().port).toBe(DEFAULT_PORT);
      
      // Cleanup
      await closeServerAsync(server);
    });
  });

  /**
   * Test suite for edge cases in server lifecycle
   * Verifies proper handling of boundary conditions and error scenarios
   */
  describe('Server Lifecycle Edge Cases', () => {
    test('should handle rapid start/stop without race conditions', async () => {
      const TEST_PORT = 3004;
      
      // Rapidly start and stop server
      const server1 = await startServerAsync(app, TEST_PORT);
      await closeServerAsync(server1);
      
      const server2 = await startServerAsync(app, TEST_PORT);
      await closeServerAsync(server2);
      
      const server3 = await startServerAsync(app, TEST_PORT);
      
      // Verify final server is functioning
      expect(server3.listening).toBe(true);
      
      // Cleanup
      await closeServerAsync(server3);
    });

    test('should maintain app state across server restarts', async () => {
      const TEST_PORT = 3005;
      
      // Start server and make request
      let server = await startServerAsync(app, TEST_PORT);
      let response = await request(app).get('/');
      expect(response.text).toBe('Hello world');
      
      // Stop and restart server
      await closeServerAsync(server);
      server = await startServerAsync(app, TEST_PORT);
      
      // App should still respond correctly
      response = await request(app).get('/evening');
      expect(response.text).toBe('Good evening');
      
      // Cleanup
      await closeServerAsync(server);
    });

    test('should correctly report listening state throughout lifecycle', async () => {
      const TEST_PORT = 3006;
      
      // Before start: app doesn't have listening property
      expect(app.listening).toBeUndefined();
      
      // After start: server is listening
      const server = await startServerAsync(app, TEST_PORT);
      expect(server.listening).toBe(true);
      
      // After stop: server is not listening
      await closeServerAsync(server);
      expect(server.listening).toBe(false);
    });
  });
});
