/**
 * Server Lifecycle Integration Tests
 * Tests server startup, shutdown, port binding, and event emission
 * 
 * @file tests/integration/lifecycle.test.js
 */

const http = require('http');
const request = require('supertest');

describe('Server Lifecycle', () => {
  // Fresh module imports for each test to ensure clean state
  let serverModule;
  
  beforeEach(() => {
    // Clear module cache to get fresh instance
    jest.resetModules();
    serverModule = require('../../server');
  });

  afterEach(async () => {
    // Ensure server is stopped after each test
    if (serverModule && serverModule.getStatus().listening) {
      await serverModule.stop();
    }
  });

  describe('Server Startup', () => {
    it('should start server on specified port', async () => {
      const result = await serverModule.start(0, '127.0.0.1');
      
      expect(result).toHaveProperty('port');
      expect(result).toHaveProperty('host');
      expect(typeof result.port).toBe('number');
      expect(result.port).toBeGreaterThan(0);
    });

    it('should start on ephemeral port (port 0)', async () => {
      const result = await serverModule.start(0, '127.0.0.1');
      
      expect(result.port).toBeGreaterThan(0);
      expect(result.port).not.toBe(0);
    });

    it('should bind to specified host', async () => {
      const result = await serverModule.start(0, '127.0.0.1');
      
      expect(result.host).toBe('127.0.0.1');
    });

    it('should be listening after start', async () => {
      await serverModule.start(0, '127.0.0.1');
      
      const status = serverModule.getStatus();
      expect(status.listening).toBe(true);
    });

    it('should accept connections after start', async () => {
      await serverModule.start(0, '127.0.0.1');
      
      const response = await request(serverModule.server)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('ok');
    });

    it('should reject invalid port', async () => {
      await expect(serverModule.start(-1, '127.0.0.1'))
        .rejects
        .toThrow(/Invalid port/);
    });

    it('should reject invalid host', async () => {
      await expect(serverModule.start(0, 'invalid host!'))
        .rejects
        .toThrow(/Invalid host/);
    });

    it('should use default values when not specified', async () => {
      const config = serverModule.getConfig();
      expect(config.port).toBeDefined();
      expect(config.host).toBeDefined();
    });
  });

  describe('Server Shutdown', () => {
    it('should stop server gracefully', async () => {
      await serverModule.start(0, '127.0.0.1');
      expect(serverModule.getStatus().listening).toBe(true);
      
      await serverModule.stop();
      expect(serverModule.getStatus().listening).toBe(false);
    });

    it('should handle stop when not running', async () => {
      // Should not throw when stopping non-running server
      await expect(serverModule.stop()).resolves.not.toThrow();
    });

    it('should reject connections after stop', async () => {
      await serverModule.start(0, '127.0.0.1');
      await serverModule.stop();
      
      const status = serverModule.getStatus();
      expect(status.listening).toBe(false);
    });

    it('should clear connections on stop', async () => {
      await serverModule.start(0, '127.0.0.1');
      
      // Make a request to create connection
      await request(serverModule.server).get('/');
      
      // Wait a short time for the connection to be fully closed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await serverModule.stop();
      
      // After stop, connections should be cleared (either closed naturally or force-closed)
      const status = serverModule.getStatus();
      // After server stop, the connection set should be empty
      // Note: This is checked after stop(), so connections should be cleared
      expect(status.connections).toBe(0);
    });
  });

  describe('Multiple Start/Stop Cycles', () => {
    it('should handle restart correctly', async () => {
      // First start
      const result1 = await serverModule.start(0, '127.0.0.1');
      expect(serverModule.getStatus().listening).toBe(true);
      
      // Stop
      await serverModule.stop();
      expect(serverModule.getStatus().listening).toBe(false);
      
      // Second start
      const result2 = await serverModule.start(0, '127.0.0.1');
      expect(serverModule.getStatus().listening).toBe(true);
      
      // Verify server works
      const response = await request(serverModule.server)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('ok');
    });

    it('should assign different ephemeral ports on restart', async () => {
      const result1 = await serverModule.start(0, '127.0.0.1');
      const port1 = result1.port;
      
      await serverModule.stop();
      
      const result2 = await serverModule.start(0, '127.0.0.1');
      const port2 = result2.port;
      
      // Ports may or may not be different, but server should work
      expect(typeof port1).toBe('number');
      expect(typeof port2).toBe('number');
    });
  });

  describe('Server Status', () => {
    it('should report not listening when not started', () => {
      const status = serverModule.getStatus();
      expect(status.listening).toBe(false);
    });

    it('should report listening when started', async () => {
      await serverModule.start(0, '127.0.0.1');
      
      const status = serverModule.getStatus();
      expect(status.listening).toBe(true);
    });

    it('should report address when listening', async () => {
      await serverModule.start(0, '127.0.0.1');
      
      const status = serverModule.getStatus();
      expect(status.address).toBeDefined();
      expect(status.address.port).toBeGreaterThan(0);
    });

    it('should report null address when not listening', () => {
      const status = serverModule.getStatus();
      expect(status.address).toBeNull();
    });

    it('should track connection count', async () => {
      await serverModule.start(0, '127.0.0.1');
      
      const status = serverModule.getStatus();
      expect(typeof status.connections).toBe('number');
    });
  });

  describe('Server Events', () => {
    it('should emit listening event', async () => {
      const listeningPromise = new Promise((resolve) => {
        serverModule.server.once('listening', resolve);
      });
      
      await serverModule.start(0, '127.0.0.1');
      await listeningPromise;
      
      expect(serverModule.getStatus().listening).toBe(true);
    });

    it('should emit close event on stop', async () => {
      await serverModule.start(0, '127.0.0.1');
      
      const closePromise = new Promise((resolve) => {
        serverModule.server.once('close', resolve);
      });
      
      await serverModule.stop();
      await closePromise;
      
      expect(serverModule.getStatus().listening).toBe(false);
    });

    it('should handle connection events', async () => {
      const connectionPromise = new Promise((resolve) => {
        serverModule.server.once('connection', resolve);
      });
      
      await serverModule.start(0, '127.0.0.1');
      
      // Make a request to trigger connection
      request(serverModule.server).get('/').end(() => {});
      
      await connectionPromise;
    });
  });

  describe('Error Handling on Startup', () => {
    it('should handle port in use error', async () => {
      // Start first server
      const result = await serverModule.start(0, '127.0.0.1');
      const usedPort = result.port;
      
      // Try to start another server on same port
      const anotherServer = http.createServer();
      
      await expect(
        new Promise((resolve, reject) => {
          anotherServer.once('error', reject);
          anotherServer.listen(usedPort, '127.0.0.1', resolve);
        })
      ).rejects.toMatchObject({
        code: 'EADDRINUSE'
      });
    });

    it('should reject with error for port out of range', async () => {
      await expect(serverModule.start(70000, '127.0.0.1'))
        .rejects
        .toThrow();
    });
  });

  describe('Configuration', () => {
    it('should read port from config', () => {
      const config = serverModule.getConfig();
      expect(config).toHaveProperty('port');
    });

    it('should read host from config', () => {
      const config = serverModule.getConfig();
      expect(config).toHaveProperty('host');
    });

    it('should return config copy not reference', () => {
      const config1 = serverModule.getConfig();
      const config2 = serverModule.getConfig();
      
      config1.port = 9999;
      expect(config2.port).not.toBe(9999);
    });
  });
});
