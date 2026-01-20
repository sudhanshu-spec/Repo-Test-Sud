/**
 * HTTP Server Module
 * A production-ready HTTP server with comprehensive request handling,
 * lifecycle management, and error handling capabilities.
 * 
 * @module server
 */

const http = require('http');
const url = require('url');

/**
 * Server configuration from environment or defaults
 */
const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || process.env.Host || '127.0.0.1'
};

/**
 * Validates port number
 * @param {number} port - Port number to validate
 * @returns {boolean} - True if valid
 */
function isValidPort(port) {
  return Number.isInteger(port) && port >= 0 && port <= 65535;
}

/**
 * Validates host address
 * @param {string} host - Host address to validate
 * @returns {boolean} - True if valid
 */
function isValidHost(host) {
  if (!host || typeof host !== 'string') return false;
  // Basic validation - allows localhost, IP addresses, and hostnames
  const hostRegex = /^(localhost|(\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)*)$/;
  return hostRegex.test(host);
}

/**
 * Parses JSON body from request
 * @param {http.IncomingMessage} req - Request object
 * @returns {Promise<object|null>} - Parsed JSON body or null
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    const contentLength = parseInt(req.headers['content-length'], 10) || 0;
    
    // Check for oversized payload (limit: 1MB)
    const MAX_BODY_SIZE = 1024 * 1024;
    if (contentLength > MAX_BODY_SIZE) {
      reject({ status: 413, message: 'Payload Too Large' });
      return;
    }

    req.on('data', (chunk) => {
      body += chunk.toString();
      // Additional check during streaming
      if (body.length > MAX_BODY_SIZE) {
        reject({ status: 413, message: 'Payload Too Large' });
      }
    });

    req.on('end', () => {
      if (!body || body.trim() === '') {
        resolve(null);
        return;
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (e) {
        reject({ status: 400, message: 'Invalid JSON', error: e.message });
      }
    });

    req.on('error', (err) => {
      reject({ status: 500, message: 'Request Error', error: err.message });
    });
  });
}

/**
 * Sends JSON response
 * @param {http.ServerResponse} res - Response object
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Response data
 * @param {object} [customHeaders={}] - Additional headers
 */
function sendJson(res, statusCode, data, customHeaders = {}) {
  const body = JSON.stringify(data);
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    ...customHeaders
  };
  
  res.writeHead(statusCode, headers);
  res.end(body);
}

/**
 * Sends text response
 * @param {http.ServerResponse} res - Response object
 * @param {number} statusCode - HTTP status code
 * @param {string} text - Response text
 * @param {object} [customHeaders={}] - Additional headers
 */
function sendText(res, statusCode, text, customHeaders = {}) {
  const headers = {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(text),
    ...customHeaders
  };
  
  res.writeHead(statusCode, headers);
  res.end(text);
}

/**
 * Sends error response
 * @param {http.ServerResponse} res - Response object
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {string} message - Error message
 */
function sendError(res, statusCode, code, message) {
  sendJson(res, statusCode, {
    error: {
      code,
      message
    }
  });
}

/**
 * In-memory data store for demonstration
 */
const dataStore = {
  items: []
};

/**
 * Resets the data store (used for testing)
 */
function resetDataStore() {
  dataStore.items = [];
}

/**
 * Route handlers
 */
const routes = {
  /**
   * Health check endpoint
   */
  'GET /health': (req, res) => {
    sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
  },

  /**
   * Root endpoint
   */
  'GET /': (req, res) => {
    sendJson(res, 200, { message: 'Welcome to the HTTP Server', version: '1.0.0' });
  },

  /**
   * Get all items
   */
  'GET /items': (req, res) => {
    sendJson(res, 200, { items: dataStore.items });
  },

  /**
   * Get item by ID
   */
  'GET /items/:id': (req, res, params) => {
    const id = parseInt(params.id, 10);
    const item = dataStore.items.find(i => i.id === id);
    
    if (!item) {
      sendError(res, 404, 'NOT_FOUND', `Item with id ${id} not found`);
      return;
    }
    
    sendJson(res, 200, { item });
  },

  /**
   * Create new item
   */
  'POST /items': async (req, res) => {
    try {
      const body = await parseJsonBody(req);
      
      if (!body) {
        sendError(res, 400, 'BAD_REQUEST', 'Request body is required');
        return;
      }
      
      if (!body.name) {
        sendError(res, 400, 'BAD_REQUEST', 'Name field is required');
        return;
      }
      
      const newItem = {
        id: dataStore.items.length + 1,
        name: body.name,
        description: body.description || '',
        createdAt: new Date().toISOString()
      };
      
      dataStore.items.push(newItem);
      sendJson(res, 201, { item: newItem }, { 'X-Created-Id': String(newItem.id) });
    } catch (err) {
      if (err.status) {
        sendError(res, err.status, err.status === 400 ? 'BAD_REQUEST' : 'SERVER_ERROR', err.message);
      } else {
        sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
      }
    }
  },

  /**
   * Update item
   */
  'PUT /items/:id': async (req, res, params) => {
    try {
      const id = parseInt(params.id, 10);
      const itemIndex = dataStore.items.findIndex(i => i.id === id);
      
      if (itemIndex === -1) {
        sendError(res, 404, 'NOT_FOUND', `Item with id ${id} not found`);
        return;
      }
      
      const body = await parseJsonBody(req);
      
      if (!body) {
        sendError(res, 400, 'BAD_REQUEST', 'Request body is required');
        return;
      }
      
      // Check if body is empty object
      if (Object.keys(body).length === 0) {
        sendError(res, 400, 'BAD_REQUEST', 'Request body cannot be empty');
        return;
      }
      
      dataStore.items[itemIndex] = {
        ...dataStore.items[itemIndex],
        name: body.name || dataStore.items[itemIndex].name,
        description: body.description !== undefined ? body.description : dataStore.items[itemIndex].description,
        updatedAt: new Date().toISOString()
      };
      
      sendJson(res, 200, { item: dataStore.items[itemIndex] });
    } catch (err) {
      if (err.status) {
        sendError(res, err.status, err.status === 400 ? 'BAD_REQUEST' : 'SERVER_ERROR', err.message);
      } else {
        sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
      }
    }
  },

  /**
   * Partial update item
   */
  'PATCH /items/:id': async (req, res, params) => {
    try {
      const id = parseInt(params.id, 10);
      const itemIndex = dataStore.items.findIndex(i => i.id === id);
      
      if (itemIndex === -1) {
        sendError(res, 404, 'NOT_FOUND', `Item with id ${id} not found`);
        return;
      }
      
      const body = await parseJsonBody(req);
      
      if (!body) {
        sendError(res, 400, 'BAD_REQUEST', 'Request body is required');
        return;
      }
      
      // Check if body is empty object
      if (Object.keys(body).length === 0) {
        sendError(res, 400, 'BAD_REQUEST', 'Request body cannot be empty');
        return;
      }
      
      if (body.name !== undefined) {
        dataStore.items[itemIndex].name = body.name;
      }
      if (body.description !== undefined) {
        dataStore.items[itemIndex].description = body.description;
      }
      dataStore.items[itemIndex].updatedAt = new Date().toISOString();
      
      sendJson(res, 200, { item: dataStore.items[itemIndex] });
    } catch (err) {
      if (err.status) {
        sendError(res, err.status, err.status === 400 ? 'BAD_REQUEST' : 'SERVER_ERROR', err.message);
      } else {
        sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
      }
    }
  },

  /**
   * Delete item
   */
  'DELETE /items/:id': (req, res, params) => {
    const id = parseInt(params.id, 10);
    const itemIndex = dataStore.items.findIndex(i => i.id === id);
    
    if (itemIndex === -1) {
      sendError(res, 404, 'NOT_FOUND', `Item with id ${id} not found`);
      return;
    }
    
    dataStore.items.splice(itemIndex, 1);
    res.writeHead(204);
    res.end();
  },

  /**
   * OPTIONS for items - CORS preflight
   */
  'OPTIONS /items': (req, res) => {
    res.writeHead(204, {
      'Allow': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id'
    });
    res.end();
  },

  /**
   * HEAD request for items
   */
  'HEAD /items': (req, res) => {
    const body = JSON.stringify({ items: dataStore.items });
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    });
    res.end();
  },

  /**
   * Text response endpoint
   */
  'GET /text': (req, res) => {
    sendText(res, 200, 'Hello, World!');
  },

  /**
   * Error simulation endpoint (for testing)
   */
  'GET /error': (req, res) => {
    sendError(res, 500, 'INTERNAL_ERROR', 'Simulated server error');
  },

  /**
   * Async error endpoint (for testing)
   */
  'GET /async-error': async (req, res) => {
    throw new Error('Simulated async error');
  }
};

/**
 * Matches URL path against route pattern and extracts parameters
 * @param {string} routePath - Route pattern (e.g., '/items/:id')
 * @param {string} urlPath - Actual URL path
 * @returns {object|null} - Extracted parameters or null if no match
 */
function matchRoute(routePath, urlPath) {
  const routeParts = routePath.split('/');
  const urlParts = urlPath.split('/');
  
  if (routeParts.length !== urlParts.length) {
    return null;
  }
  
  const params = {};
  
  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(':')) {
      params[routeParts[i].slice(1)] = urlParts[i];
    } else if (routeParts[i] !== urlParts[i]) {
      return null;
    }
  }
  
  return params;
}

/**
 * Finds matching route handler
 * @param {string} method - HTTP method
 * @param {string} pathname - URL pathname
 * @returns {object|null} - Handler and params or null
 */
function findRoute(method, pathname) {
  // First try exact match
  const exactKey = `${method} ${pathname}`;
  if (routes[exactKey]) {
    return { handler: routes[exactKey], params: {} };
  }
  
  // Try pattern matching
  for (const routeKey of Object.keys(routes)) {
    const [routeMethod, routePath] = routeKey.split(' ');
    if (routeMethod !== method) continue;
    
    const params = matchRoute(routePath, pathname);
    if (params) {
      return { handler: routes[routeKey], params };
    }
  }
  
  return null;
}

/**
 * Request handler
 * @param {http.IncomingMessage} req - Request object
 * @param {http.ServerResponse} res - Response object
 */
async function requestHandler(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  // Add X-Request-Id header if provided in request
  const requestId = req.headers['x-request-id'];
  if (requestId) {
    res.setHeader('X-Request-Id', requestId);
  }
  
  // Set common headers
  res.setHeader('X-Powered-By', 'Node.js HTTP Server');
  
  try {
    const route = findRoute(method, pathname);
    
    if (route) {
      await route.handler(req, res, route.params);
    } else {
      // Check if path exists but method is not allowed
      const methodsForPath = Object.keys(routes)
        .filter(key => key.endsWith(` ${pathname}`))
        .map(key => key.split(' ')[0]);
      
      if (methodsForPath.length > 0) {
        res.writeHead(405, {
          'Allow': methodsForPath.join(', '),
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: `Method ${method} is not allowed for ${pathname}`
          }
        }));
      } else {
        sendError(res, 404, 'NOT_FOUND', `Route ${pathname} not found`);
      }
    }
  } catch (err) {
    console.error('Request handler error:', err);
    if (!res.headersSent) {
      sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
    }
  }
}

/**
 * Create HTTP server instance
 */
const server = http.createServer(requestHandler);

/**
 * Active connections tracking for graceful shutdown
 */
let connections = new Set();

server.on('connection', (socket) => {
  connections.add(socket);
  socket.on('close', () => {
    connections.delete(socket);
  });
});

/**
 * Starts the HTTP server
 * @param {number} [port] - Port to listen on (defaults to config.port)
 * @param {string} [host] - Host to bind to (defaults to config.host)
 * @returns {Promise<{port: number, host: string}>} - Server address
 */
function start(port, host) {
  const listenPort = port !== undefined ? port : config.port;
  const listenHost = host !== undefined ? host : config.host;
  
  if (!isValidPort(listenPort)) {
    return Promise.reject(new Error(`Invalid port: ${listenPort}`));
  }
  
  if (!isValidHost(listenHost)) {
    return Promise.reject(new Error(`Invalid host: ${listenHost}`));
  }
  
  return new Promise((resolve, reject) => {
    const errorHandler = (err) => {
      reject(err);
    };
    
    server.once('error', errorHandler);
    
    server.listen(listenPort, listenHost, () => {
      server.removeListener('error', errorHandler);
      const address = server.address();
      console.log(`Server listening on http://${address.address}:${address.port}`);
      resolve({ port: address.port, host: address.address });
    });
  });
}

/**
 * Stops the HTTP server gracefully
 * @param {number} [timeout=5000] - Maximum time to wait for connections to close
 * @returns {Promise<void>}
 */
function stop(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }
    
    // Set a timeout for forceful shutdown
    const timeoutId = setTimeout(() => {
      console.log('Force closing remaining connections...');
      for (const socket of connections) {
        socket.destroy();
      }
      connections.clear();
    }, timeout);
    
    server.close((err) => {
      clearTimeout(timeoutId);
      // Force destroy any remaining connections
      for (const socket of connections) {
        socket.destroy();
      }
      connections.clear();
      if (err) {
        reject(err);
      } else {
        console.log('Server stopped');
        resolve();
      }
    });
  });
}

/**
 * Gets the current server status
 * @returns {object} - Server status
 */
function getStatus() {
  return {
    listening: server.listening,
    address: server.address(),
    connections: connections.size
  };
}

/**
 * Gets the configuration
 * @returns {object} - Configuration
 */
function getConfig() {
  return { ...config };
}

// Export functions and server instance for testing
module.exports = {
  server,
  start,
  stop,
  getStatus,
  getConfig,
  resetDataStore,
  isValidPort,
  isValidHost,
  config
};

// Auto-start if running directly (not being required)
if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await stop();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await stop();
    process.exit(0);
  });
}
