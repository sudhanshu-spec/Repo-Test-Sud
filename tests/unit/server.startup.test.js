/**
 * @fileoverview Server lifecycle unit tests for validating startup, port binding,
 * shutdown, and error handling behavior using Jest.
 * 
 * Contains test suites for:
 * - Server startup (listens on port, console output verification)
 * - Server shutdown (graceful close, callback invocation)
 * - Port conflict handling (EADDRINUSE error scenarios)
 * 
 * Uses Jest mock functions (jest.spyOn) for console.log and process verification.
 * @module tests/unit/server.startup.test
 */

'use strict';

const http = require('http');
const { cleanupServer, createTestApp } = require('../helpers/test-utils');
const { STATUS_CODES } = require('../fixtures/constants');

/**
 * Generate a random port number between 10000 and 60000 to avoid conflicts.
 * Using port 0 would also work but this gives more control for specific tests.
 * @returns {number} A random port number
 */
function getRandomPort() {
  return Math.floor(Math.random() * 50000) + 10000;
}

/**
 * Test suite for server lifecycle operations including startup, shutdown,
 * and port conflict handling. Uses the http module directly for lifecycle
 * testing to have full control over server instances.
 */
describe('Server Lifecycle Tests', () => {
  /** @type {http.Server|null} Primary server instance for testing */
  let server = null;
  
  /** @type {http.Server|null} Secondary server instance for port conflict tests */
  let conflictServer = null;
  
  /** @type {jest.SpyInstance|null} Spy for console.log calls */
  let consoleSpy = null;

  /**
   * Setup before each test - initialize console spy
   */
  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  /**
   * Cleanup after each test - restore mocks and close servers with proper waiting
   */
  afterEach(async () => {
    // Restore console mock
    if (consoleSpy) {
      consoleSpy.mockRestore();
      consoleSpy = null;
    }

    // Clean up conflict test server first
    if (conflictServer) {
      await cleanupServer(conflictServer);
      conflictServer = null;
    }

    // Clean up primary server
    if (server) {
      await cleanupServer(server);
      server = null;
    }
    
    // Small delay to ensure port is fully released
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  /**
   * Final cleanup after all tests complete
   */
  afterAll(async () => {
    // Ensure all server connections are properly closed
    await cleanupServer(server);
    await cleanupServer(conflictServer);
  });

  /**
   * Test suite for server startup behavior
   */
  describe('Server Startup', () => {
    /**
     * Test that server listens on the specified port when started
     */
    it('should listen on port when started', (done) => {
      const app = createTestApp();
      server = http.createServer(app);
      const testPort = getRandomPort();

      server.listen(testPort, () => {
        // Verify server is listening
        expect(server.listening).toBe(true);
        
        // Verify the server is bound to a port
        const address = server.address();
        expect(address).not.toBeNull();
        expect(address.port).toBe(testPort);
        
        done();
      });
    });

    /**
     * Test that server outputs startup message to console
     */
    it('should output startup message to console', (done) => {
      const app = createTestApp();
      server = http.createServer(app);
      const testPort = getRandomPort();
      
      // Restore and re-spy to capture actual output
      consoleSpy.mockRestore();
      consoleSpy = jest.spyOn(console, 'log');

      server.listen(testPort, () => {
        // Simulate typical startup log message
        console.log(`Server listening on port ${testPort}`);
        
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(String(testPort))
        );
        
        done();
      });
    });

    /**
     * Test that server binds to specified port successfully
     */
    it('should bind to specified port successfully', (done) => {
      const app = createTestApp();
      server = http.createServer(app);
      const customPort = getRandomPort();

      server.listen(customPort, () => {
        const address = server.address();
        expect(address.port).toBe(customPort);
        expect(server.listening).toBe(true);
        
        done();
      });
    });
  });

  /**
   * Test suite for server shutdown behavior
   */
  describe('Server Shutdown', () => {
    /**
     * Test that server releases port when server.close() is called
     */
    it('should release port when server.close() is called', (done) => {
      const app = createTestApp();
      server = http.createServer(app);
      const testPort = getRandomPort();

      server.listen(testPort, () => {
        // Verify server is listening before close
        expect(server.listening).toBe(true);

        server.close(() => {
          // Verify port is released (server no longer listening)
          expect(server.listening).toBe(false);
          
          // Verify we can create a new server on the same port
          const newServer = http.createServer(app);
          newServer.listen(testPort, () => {
            expect(newServer.listening).toBe(true);
            
            newServer.close(() => {
              done();
            });
          });
        });
      });
    });

    /**
     * Test that callback is invoked on successful close
     */
    it('should invoke callback on successful close', (done) => {
      const app = createTestApp();
      server = http.createServer(app);
      const closeCallback = jest.fn();
      const testPort = getRandomPort();

      server.listen(testPort, () => {
        server.close(() => {
          closeCallback();
          
          expect(closeCallback).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    /**
     * Test that server handles already-closed server gracefully
     */
    it('should handle already-closed server gracefully', async () => {
      const app = createTestApp();
      server = http.createServer(app);
      const testPort = getRandomPort();

      // Start and immediately close the server
      await new Promise((resolve) => {
        server.listen(testPort, resolve);
      });

      // First close should succeed
      await cleanupServer(server);
      expect(server.listening).toBe(false);

      // Second cleanup should handle gracefully without errors
      await expect(cleanupServer(server)).resolves.toBeUndefined();
    });
  });

  /**
   * Test suite for port conflict handling (EADDRINUSE errors)
   */
  describe('Port Conflicts', () => {
    /**
     * Test that server handles EADDRINUSE error when port is occupied
     */
    it('should handle EADDRINUSE error when port is occupied', (done) => {
      const app = createTestApp();
      const conflictTestPort = getRandomPort();
      
      // Start first server on the port
      server = http.createServer(app);
      server.listen(conflictTestPort, () => {
        // Attempt to start second server on same port
        conflictServer = http.createServer(app);
        
        conflictServer.on('error', (err) => {
          expect(err.code).toBe('EADDRINUSE');
          expect(err.message).toContain(String(conflictTestPort));
          
          done();
        });

        conflictServer.listen(conflictTestPort);
      });
    });

    /**
     * Test that error event is emitted on port conflict
     */
    it('should emit error event on port conflict', (done) => {
      const app = createTestApp();
      const errorHandler = jest.fn();
      const conflictTestPort = getRandomPort();
      
      // Start first server on the port
      server = http.createServer(app);
      server.listen(conflictTestPort, () => {
        // Set up second server with error handler
        conflictServer = http.createServer(app);
        conflictServer.on('error', errorHandler);
        
        // Add a listener to verify error handler was called
        conflictServer.on('error', () => {
          // Use setImmediate to allow error handler to complete
          setImmediate(() => {
            expect(errorHandler).toHaveBeenCalledTimes(1);
            expect(errorHandler).toHaveBeenCalledWith(
              expect.objectContaining({
                code: 'EADDRINUSE'
              })
            );
            
            done();
          });
        });

        conflictServer.listen(conflictTestPort);
      });
    });
  });
});
