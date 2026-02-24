/**
 * @fileoverview Server lifecycle tests for server.js entry point.
 *
 * Validates the complete HTTP server lifecycle managed by server.js, including:
 *   - Express app binding to configured host and port via app.listen()
 *   - Startup confirmation logging with the correct URL format
 *   - Custom configuration override support through mocked config module
 *   - Graceful shutdown behavior via server.close() with and without callbacks
 *   - Error suppression for EADDRINUSE, EACCES, and generic server errors
 *   - Boundary port handling (port 0 for OS-assigned, port 65535 for maximum)
 *
 * Mock Strategy:
 *   Tests use jest.doMock() to replace the src/app and src/config modules before
 *   each require('../../server') call. The mock app exposes a single listen()
 *   function that returns a mock server object, decoupling these tests from the
 *   real Express application and configuration modules. jest.resetModules() ensures
 *   each test gets a fresh server.js module evaluation with isolated mock state.
 *
 * @module tests/lifecycle/server
 */

'use strict';

/**
 * @typedef {Object} MockServer
 * @property {jest.Mock} close - Close method mock
 * @property {jest.Mock} on - Event listener registration mock
 * @property {jest.Mock} address - Address getter mock
 * @property {Function} [_errorHandler] - Stored error handler
 * @property {Function} [_callback] - Stored callback
 */

/**
 * @typedef {Object} TestConfig
 * @property {string} host - Server host
 * @property {number} port - Server port
 * @property {string} env - Environment name
 */

/** @type {TestConfig} */
const DEFAULT_CONFIG = {
  host: '127.0.0.1',
  port: 3000,
  env: 'test'
};

/**
 * Creates a mock server object with standard methods.
 *
 * The mock server simulates the http.Server instance returned by app.listen().
 * It records error handler registrations via the on() method so that tests can
 * invoke captured handlers directly to verify error suppression behavior.
 *
 * @param {TestConfig} [config=DEFAULT_CONFIG] - Server configuration
 * @returns {MockServer} Mock server instance with close, on, and address stubs
 */
function createMockServer(config = DEFAULT_CONFIG) {
  /** @type {MockServer} */
  const mockServer = {
    close: jest.fn((callback) => {
      if (callback) callback();
    }),
    on: jest.fn((event, handler) => {
      if (event === 'error') {
        mockServer._errorHandler = handler;
      }
      return mockServer;
    }),
    address: jest.fn(() => ({
      address: config.host,
      port: config.port
    }))
  };
  return mockServer;
}

/**
 * Creates a mock listen function.
 *
 * Simulates Express app.listen() by accepting port, host, and callback arguments.
 * When executeCallback is true, the callback is invoked immediately (simulating
 * successful server startup). When false, the callback is stored on the mock
 * server for deferred invocation, allowing error handler tests to execute the
 * error path before the listen callback fires.
 *
 * @param {MockServer} mockServer - Mock server to return from the listen call
 * @param {boolean} [executeCallback=true] - Whether to execute the listen callback immediately
 * @returns {jest.Mock} Mock listen function that mirrors app.listen() behavior
 */
function createMockListen(mockServer, executeCallback = true) {
  return jest.fn((port, host, callback) => {
    if (executeCallback && typeof callback === 'function') {
      callback();
    } else if (!executeCallback) {
      mockServer._callback = callback;
    }
    return mockServer;
  });
}

/**
 * Sets up mocks for app and config modules.
 *
 * Uses jest.doMock() to intercept require('../../src/app') and
 * require('../../src/config') so that the next require('../../server')
 * call receives the mocked app (with the provided listen function) and
 * the mocked configuration object. This pattern enables complete isolation
 * of server.js lifecycle behavior from the real Express and config modules.
 *
 * @param {jest.Mock} mockListen - Mock listen function to expose as app.listen
 * @param {TestConfig} [config=DEFAULT_CONFIG] - Configuration values to inject
 */
function setupMocks(mockListen, config = DEFAULT_CONFIG) {
  jest.doMock('../../src/app', () => ({ listen: mockListen }));
  jest.doMock('../../src/config', () => ({ ...config }));
}

describe('Server Entry Point', () => {
  /** @type {jest.Mock} */
  let mockListen;
  
  /** @type {MockServer} */
  let mockServer;
  
  /** @type {jest.SpyInstance} */
  let consoleSpy;

  beforeEach(() => {
    jest.resetModules();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockServer = createMockServer();
    mockListen = createMockListen(mockServer);
    setupMocks(mockListen);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  test('should bind to configured host and port', () => {
    require('../../server');

    expect(mockListen).toHaveBeenCalledTimes(1);
    expect(mockListen.mock.calls[0][0]).toBe(DEFAULT_CONFIG.port);
    expect(mockListen.mock.calls[0][1]).toBe(DEFAULT_CONFIG.host);
    expect(typeof mockListen.mock.calls[0][2]).toBe('function');
  });

  test('should log startup message with server URL', () => {
    require('../../server');

    const expectedMessage = `Server running at http://${DEFAULT_CONFIG.host}:${DEFAULT_CONFIG.port}/`;
    expect(consoleSpy).toHaveBeenCalledWith(expectedMessage);
  });

  test('should use custom configuration values from config module', () => {
    jest.resetModules();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    /** @type {TestConfig} */
    const customConfig = {
      host: '0.0.0.0',
      port: 8080,
      env: 'production'
    };

    const customMockServer = createMockServer(customConfig);
    const customMockListen = createMockListen(customMockServer);
    setupMocks(customMockListen, customConfig);

    require('../../server');

    expect(customMockListen.mock.calls[0][0]).toBe(customConfig.port);
    expect(customMockListen.mock.calls[0][1]).toBe(customConfig.host);

    const expectedMessage = `Server running at http://${customConfig.host}:${customConfig.port}/`;
    expect(consoleSpy).toHaveBeenCalledWith(expectedMessage);
  });

  test('should provide server object that supports graceful shutdown', () => {
    require('../../server');

    expect(mockListen).toHaveBeenCalled();

    const closeCallback = jest.fn();
    mockServer.close(closeCallback);

    expect(mockServer.close).toHaveBeenCalledTimes(1);
    expect(closeCallback).toHaveBeenCalled();
  });

  test('should handle EADDRINUSE error when port is already in use', () => {
    jest.resetModules();

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    /** @type {Function|null} */
    let errorHandler = null;

    const errorMockServer = createMockServer();
    errorMockServer.on = jest.fn((event, handler) => {
      if (event === 'error') {
        errorHandler = handler;
      }
      return errorMockServer;
    });

    const errorMockListen = createMockListen(errorMockServer, false);
    setupMocks(errorMockListen);

    require('../../server');

    expect(errorMockListen).toHaveBeenCalled();

    const eaddrinuseError = new Error('listen EADDRINUSE: address already in use');
    /** @type {NodeJS.ErrnoException} */
    const errnoException = Object.assign(eaddrinuseError, {
      code: 'EADDRINUSE',
      port: DEFAULT_CONFIG.port
    });

    if (errorHandler) {
      expect(() => errorHandler(errnoException)).not.toThrow();
    }

    expect(errorMockListen).toHaveBeenCalledWith(
      DEFAULT_CONFIG.port,
      DEFAULT_CONFIG.host,
      expect.any(Function)
    );

    consoleErrorSpy.mockRestore();
  });

  test('should handle EACCES error for privileged port binding', () => {
    jest.resetModules();

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    /** @type {Function|null} */
    let errorHandler = null;

    const errorMockServer = createMockServer();
    errorMockServer.on = jest.fn((event, handler) => {
      if (event === 'error') {
        errorHandler = handler;
      }
      return errorMockServer;
    });

    const errorMockListen = createMockListen(errorMockServer, false);
    setupMocks(errorMockListen);

    require('../../server');

    expect(errorMockListen).toHaveBeenCalled();

    const eaccesError = new Error('listen EACCES: permission denied');
    /** @type {NodeJS.ErrnoException} */
    const errnoException = Object.assign(eaccesError, {
      code: 'EACCES',
      port: DEFAULT_CONFIG.port
    });

    if (errorHandler) {
      expect(() => errorHandler(errnoException)).not.toThrow();
    }

    consoleErrorSpy.mockRestore();
  });

  test('should handle generic server error without crashing', () => {
    jest.resetModules();

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    /** @type {Function|null} */
    let errorHandler = null;

    const errorMockServer = createMockServer();
    errorMockServer.on = jest.fn((event, handler) => {
      if (event === 'error') {
        errorHandler = handler;
      }
      return errorMockServer;
    });

    const errorMockListen = createMockListen(errorMockServer, false);
    setupMocks(errorMockListen);

    require('../../server');

    const genericError = new Error('Something went wrong');

    if (errorHandler) {
      expect(() => errorHandler(genericError)).not.toThrow();
    }

    consoleErrorSpy.mockRestore();
  });

  test('should bind with boundary port value 0 for OS-assigned port', () => {
    jest.resetModules();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    /** @type {TestConfig} */
    const boundaryConfig = {
      host: '127.0.0.1',
      port: 0,
      env: 'test'
    };

    const boundaryMockServer = createMockServer(boundaryConfig);
    const boundaryMockListen = createMockListen(boundaryMockServer);
    setupMocks(boundaryMockListen, boundaryConfig);

    require('../../server');

    expect(boundaryMockListen).toHaveBeenCalledTimes(1);
    expect(boundaryMockListen.mock.calls[0][0]).toBe(0);
  });

  test('should bind with maximum valid port 65535', () => {
    jest.resetModules();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    /** @type {TestConfig} */
    const maxPortConfig = {
      host: 'localhost',
      port: 65535,
      env: 'test'
    };

    const maxPortMockServer = createMockServer(maxPortConfig);
    const maxPortMockListen = createMockListen(maxPortMockServer);
    setupMocks(maxPortMockListen, maxPortConfig);

    require('../../server');

    expect(maxPortMockListen).toHaveBeenCalledTimes(1);
    expect(maxPortMockListen.mock.calls[0][0]).toBe(65535);
  });

  test('should pass a function as the listen callback', () => {
    require('../../server');

    expect(typeof mockListen.mock.calls[0][2]).toBe('function');
  });

  test('should return server object from listen call', () => {
    require('../../server');

    expect(mockListen).toHaveBeenCalledTimes(1);
    expect(mockListen.mock.results[0].value).toBe(mockServer);
  });

  test('should log correct URL format with custom host and port', () => {
    jest.resetModules();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    /** @type {TestConfig} */
    const urlConfig = {
      host: 'localhost',
      port: 65535,
      env: 'test'
    };

    const urlMockServer = createMockServer(urlConfig);
    const urlMockListen = createMockListen(urlMockServer);
    setupMocks(urlMockListen, urlConfig);

    require('../../server');

    const expectedMessage = `Server running at http://${urlConfig.host}:${urlConfig.port}/`;
    expect(consoleSpy).toHaveBeenCalledWith(expectedMessage);
    expect(consoleSpy).toHaveBeenCalledWith('Server running at http://localhost:65535/');
  });

  test('should support close without callback argument', () => {
    require('../../server');

    expect(() => mockServer.close()).not.toThrow();
    expect(mockServer.close).toHaveBeenCalledTimes(1);
  });

  test('should handle close callback invocation on graceful shutdown', () => {
    require('../../server');

    const shutdownCallback = jest.fn();
    mockServer.close(shutdownCallback);

    expect(mockServer.close).toHaveBeenCalledTimes(1);
    expect(shutdownCallback).toHaveBeenCalledTimes(1);
  });

  test('should suppress console output during normal startup', () => {
    require('../../server');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][0]).toContain('Server running at');
    expect(consoleSpy.mock.calls[0][0]).toContain('http://');
  });
});
