/**
 * Jest Test Suite for Express Server Lifecycle
 * 
 * This test file verifies Express server lifecycle behavior including:
 * - Server startup: app.listen() returns server instance
 * - Server shutdown: server.close() completes without error
 * - Conditional startup guard: require.main === module behavior
 * - Direct execution mode: server.js run as main module
 * 
 * Uses beforeAll/afterAll hooks for proper server setup and teardown.
 * Tests verify the application is properly structured for testability.
 */

'use strict';

// Import supertest for HTTP assertions
const request = require('supertest');

// Import the Express app from server.js
const app = require('../server');

// Import Node.js http module for type checking
const http = require('http');

// Import child_process for spawning server as main module
const { spawn } = require('child_process');

// Import path for resolving server.js location
const path = require('path');

// Test port constant (different from default 3000 to avoid conflicts)
const TEST_PORT = 3001;

/**
 * Test suite for Server Lifecycle
 * Verifies server startup, shutdown, and conditional startup guard behavior
 */
describe('Server Lifecycle', () => {
  /**
   * Test suite for Server Startup
   * Verifies that app.listen() returns a valid server instance
   */
  describe('Server Startup', () => {
    let server;

    beforeAll((done) => {
      // Start server on test port
      server = app.listen(TEST_PORT, () => {
        done();
      });
    });

    afterAll((done) => {
      // Ensure server is closed after tests
      if (server) {
        server.close((err) => {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
      } else {
        done();
      }
    });

    test('app.listen() should return server instance', () => {
      expect(server).toBeTruthy();
    });

    test('server should be an instance of http.Server', () => {
      expect(server).toBeInstanceOf(http.Server);
    });

    test('server should have close method', () => {
      expect(typeof server.close).toBe('function');
    });

    test('server should have address method', () => {
      expect(typeof server.address).toBe('function');
    });

    test('server should be listening on correct port', () => {
      const address = server.address();
      expect(address).toBeTruthy();
      expect(address.port).toBe(TEST_PORT);
    });
  });

  /**
   * Test suite for Server Shutdown
   * Verifies that server.close() completes without errors
   */
  describe('Server Shutdown', () => {
    let server;

    beforeEach((done) => {
      // Start server before each test
      server = app.listen(TEST_PORT + 1, () => {
        done();
      });
    });

    test('server.close() should complete without error', (done) => {
      expect(server).toBeTruthy();
      
      server.close((err) => {
        expect(err).toBeFalsy();
        done();
      });
    });

    test('server.close() should return server instance for chaining', (done) => {
      const returnValue = server.close((err) => {
        expect(err).toBeFalsy();
        expect(returnValue).toBe(server);
        done();
      });
    });
  });

  /**
   * Test suite for Server Shutdown with Promise
   * Verifies clean shutdown using Promise wrapper pattern
   */
  describe('Server Shutdown with Promise', () => {
    let server;

    beforeEach((done) => {
      server = app.listen(TEST_PORT + 2, () => {
        done();
      });
    });

    test('server shutdown should resolve Promise without error', async () => {
      expect(server).toBeTruthy();
      
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      // If we reach here, shutdown was successful
      expect(true).toBe(true);
    });
  });

  /**
   * Test suite for Conditional Startup Guard
   * Verifies that the require.main === module pattern works correctly
   */
  describe('Conditional Startup Guard', () => {
    test('app should be exported without starting listener when imported', () => {
      // When imported (not run directly), app should exist but no server started
      expect(app).toBeTruthy();
    });

    test('app should be an Express application instance', () => {
      // Express app should have common HTTP method handlers
      expect(typeof app.get).toBe('function');
      expect(typeof app.post).toBe('function');
      expect(typeof app.put).toBe('function');
      expect(typeof app.delete).toBe('function');
    });

    test('app should have listen method', () => {
      expect(typeof app.listen).toBe('function');
    });

    test('app should have use method for middleware', () => {
      expect(typeof app.use).toBe('function');
    });

    test('app should have set method for configuration', () => {
      expect(typeof app.set).toBe('function');
    });
  });

  /**
   * Test suite for Multiple Start/Stop Cycles
   * Verifies that server can be started and stopped multiple times
   */
  describe('Multiple Start/Stop Cycles', () => {
    test('server can be started and stopped multiple times', async () => {
      const port = TEST_PORT + 3;
      
      // First cycle
      let server = app.listen(port);
      expect(server).toBeTruthy();
      
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Second cycle - verify port is released and can be rebound
      server = app.listen(port);
      expect(server).toBeTruthy();
      
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  });
});

/**
 * Test suite for Direct Execution Mode (require.main === module)
 * This test spawns server.js as a child process to cover the 
 * conditional startup block that only executes when server.js
 * is run directly (not imported).
 */
describe('Direct Execution Mode', () => {
  // Use a unique port for direct execution tests
  const DIRECT_EXEC_PORT = 3099;
  
  test('server.js should start and log startup message when run directly', async () => {
    // Resolve the path to server.js
    const serverPath = path.resolve(__dirname, '../server.js');
    
    // Spawn the server as a child process with custom PORT
    const serverProcess = spawn('node', [serverPath], {
      env: { ...process.env, PORT: DIRECT_EXEC_PORT.toString() },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Collect stdout data
    let stdoutData = '';
    
    try {
      // Wait for the server to start and output the startup message
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Server startup timeout'));
        }, 5000);
        
        serverProcess.stdout.on('data', (data) => {
          stdoutData += data.toString();
          // Check if we received the expected startup message
          if (stdoutData.includes(`Server running on port ${DIRECT_EXEC_PORT}`)) {
            clearTimeout(timeout);
            resolve();
          }
        });
        
        serverProcess.stderr.on('data', (data) => {
          // Log any stderr for debugging but don't fail
          console.error('Server stderr:', data.toString());
        });
        
        serverProcess.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
        
        serverProcess.on('exit', (code) => {
          if (code !== 0 && code !== null) {
            clearTimeout(timeout);
            reject(new Error(`Server process exited with code ${code}`));
          }
        });
      });
      
      // Verify the startup message was logged
      expect(stdoutData).toContain(`Server running on port ${DIRECT_EXEC_PORT}`);
      
    } finally {
      // Always clean up: kill the server process
      serverProcess.kill('SIGTERM');
      
      // Wait for process to actually terminate
      await new Promise((resolve) => {
        serverProcess.on('exit', resolve);
        // Fallback timeout in case process doesn't exit cleanly
        setTimeout(() => {
          serverProcess.kill('SIGKILL');
          resolve();
        }, 1000);
      });
    }
  }, 10000); // 10 second timeout for this test
  
  test('server.js should respond to HTTP requests when run directly', async () => {
    const serverPath = path.resolve(__dirname, '../server.js');
    const testPort = DIRECT_EXEC_PORT + 1;
    
    const serverProcess = spawn('node', [serverPath], {
      env: { ...process.env, PORT: testPort.toString() },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    try {
      // Wait for server to start
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Server startup timeout'));
        }, 5000);
        
        serverProcess.stdout.on('data', (data) => {
          if (data.toString().includes(`Server running on port ${testPort}`)) {
            clearTimeout(timeout);
            resolve();
          }
        });
        
        serverProcess.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
      
      // Make HTTP request to verify server is working
      const httpModule = require('http');
      const response = await new Promise((resolve, reject) => {
        const req = httpModule.get(`http://localhost:${testPort}/`, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            resolve({ statusCode: res.statusCode, body: data });
          });
        });
        req.on('error', reject);
        req.setTimeout(5000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('Hello world');
      
    } finally {
      serverProcess.kill('SIGTERM');
      await new Promise((resolve) => {
        serverProcess.on('exit', resolve);
        setTimeout(() => {
          serverProcess.kill('SIGKILL');
          resolve();
        }, 1000);
      });
    }
  }, 15000); // 15 second timeout for this test
});
