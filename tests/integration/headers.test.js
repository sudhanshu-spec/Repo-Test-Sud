/**
 * Headers Integration Tests
 * Tests response headers including Content-Type, Content-Length, and custom headers
 * 
 * @file tests/integration/headers.test.js
 */

const request = require('supertest');
const { server, start, stop, resetDataStore } = require('../../server');

describe('Headers', () => {
  let serverAddress;

  beforeAll(async () => {
    serverAddress = await start(0, '127.0.0.1');
  });

  afterAll(async () => {
    await stop();
  });

  beforeEach(() => {
    resetDataStore();
  });

  describe('Content-Type Header', () => {
    it('should set Content-Type: application/json for JSON responses', async () => {
      const response = await request(server)
        .get('/');
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should set Content-Type: text/plain for text responses', async () => {
      const response = await request(server)
        .get('/text');
      
      expect(response.headers['content-type']).toMatch(/text\/plain/);
    });

    it('should set Content-Type for error responses', async () => {
      const response = await request(server)
        .get('/nonexistent');
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should set Content-Type for POST responses', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: 'Test Item' });
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Content-Length Header', () => {
    it('should set Content-Length for GET responses', async () => {
      const response = await request(server)
        .get('/');
      
      expect(response.headers['content-length']).toBeDefined();
      const contentLength = parseInt(response.headers['content-length'], 10);
      expect(contentLength).toBeGreaterThan(0);
    });

    it('should set accurate Content-Length for JSON body', async () => {
      const response = await request(server)
        .get('/');
      
      const contentLength = parseInt(response.headers['content-length'], 10);
      const actualLength = Buffer.byteLength(JSON.stringify(response.body));
      expect(contentLength).toBe(actualLength);
    });

    it('should set accurate Content-Length for text body', async () => {
      const response = await request(server)
        .get('/text');
      
      const contentLength = parseInt(response.headers['content-length'], 10);
      const actualLength = Buffer.byteLength(response.text);
      expect(contentLength).toBe(actualLength);
    });

    it('should set Content-Length for HEAD requests', async () => {
      const response = await request(server)
        .head('/items');
      
      expect(response.headers['content-length']).toBeDefined();
    });
  });

  describe('Custom Headers', () => {
    it('should set X-Powered-By header', async () => {
      const response = await request(server)
        .get('/');
      
      expect(response.headers['x-powered-by']).toBe('Node.js HTTP Server');
    });

    it('should echo X-Request-Id header when provided', async () => {
      const requestId = 'test-request-id-12345';
      
      const response = await request(server)
        .get('/')
        .set('X-Request-Id', requestId);
      
      expect(response.headers['x-request-id']).toBe(requestId);
    });

    it('should set X-Created-Id header on POST success', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: 'New Item' });
      
      expect(response.headers['x-created-id']).toBeDefined();
      expect(response.headers['x-created-id']).toBe(String(response.body.item.id));
    });
  });

  describe('CORS Headers', () => {
    it('should set Access-Control-Allow-Origin for OPTIONS', async () => {
      const response = await request(server)
        .options('/items');
      
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });

    it('should set Access-Control-Allow-Methods for OPTIONS', async () => {
      const response = await request(server)
        .options('/items');
      
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });

    it('should set Access-Control-Allow-Headers for OPTIONS', async () => {
      const response = await request(server)
        .options('/items');
      
      expect(response.headers['access-control-allow-headers']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
    });
  });

  describe('Allow Header', () => {
    it('should set Allow header for OPTIONS requests', async () => {
      const response = await request(server)
        .options('/items');
      
      expect(response.headers['allow']).toBeDefined();
    });

    it('should set Allow header for 405 responses', async () => {
      const response = await request(server)
        .post('/');
      
      expect(response.status).toBe(405);
      expect(response.headers['allow']).toBeDefined();
    });

    it('should include allowed methods in Allow header', async () => {
      const response = await request(server)
        .options('/items');
      
      const allowedMethods = response.headers['allow'];
      expect(allowedMethods).toContain('GET');
    });
  });

  describe('HEAD Requests', () => {
    it('should return headers without body', async () => {
      const response = await request(server)
        .head('/items');
      
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBeDefined();
      expect(response.headers['content-length']).toBeDefined();
      // HEAD requests should not have a body - text is empty or undefined
      expect(response.text === '' || response.text === undefined).toBe(true);
    });

    it('should return same Content-Length as GET request', async () => {
      const getResponse = await request(server)
        .get('/items');
      
      const headResponse = await request(server)
        .head('/items');
      
      expect(headResponse.headers['content-length']).toBe(getResponse.headers['content-length']);
    });

    it('should return same Content-Type as GET request', async () => {
      const getResponse = await request(server)
        .get('/items');
      
      const headResponse = await request(server)
        .head('/items');
      
      expect(headResponse.headers['content-type']).toBe(getResponse.headers['content-type']);
    });
  });

  describe('Header Case Sensitivity', () => {
    it('should handle case-insensitive header matching', async () => {
      const requestId = 'case-test-id';
      
      const response = await request(server)
        .get('/')
        .set('x-request-id', requestId);  // lowercase
      
      // Headers should be accessible
      expect(response.headers['x-request-id']).toBe(requestId);
    });
  });

  describe('Header Presence', () => {
    it('should always include essential headers', async () => {
      const response = await request(server)
        .get('/');
      
      expect(response.headers['content-type']).toBeDefined();
      expect(response.headers['content-length']).toBeDefined();
    });

    it('should include headers on error responses', async () => {
      const response = await request(server)
        .get('/nonexistent');
      
      expect(response.headers['content-type']).toBeDefined();
      expect(response.headers['x-powered-by']).toBeDefined();
    });
  });
});
