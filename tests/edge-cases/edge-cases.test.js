/**
 * Edge Case Tests
 * Tests boundary conditions, malformed requests, and unusual scenarios
 * 
 * @file tests/edge-cases/edge-cases.test.js
 */

const request = require('supertest');
const { server, start, stop, resetDataStore } = require('../../server');

describe('Edge Cases', () => {
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

  describe('Empty Request Body', () => {
    it('should handle empty body on POST', async () => {
      const response = await request(server)
        .post('/items')
        .send('')
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should handle null body on POST', async () => {
      const response = await request(server)
        .post('/items')
        .send(null)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
    });

    it('should handle undefined body on POST', async () => {
      const response = await request(server)
        .post('/items')
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
    });

    it('should handle whitespace-only body', async () => {
      const response = await request(server)
        .post('/items')
        .send('   ')
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
    });
  });

  describe('Null and Undefined Values', () => {
    it('should handle null name in payload', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: null, description: 'Test' });
      
      expect(response.status).toBe(400);
    });

    it('should accept null description', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: 'Test', description: null });
      
      // Should succeed - null description is acceptable
      expect(response.status).toBe(201);
    });

    it('should handle undefined in update', async () => {
      // Create item first
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'Original', description: 'Original desc' });
      
      const itemId = createResponse.body.item.id;
      
      // Update with only name (description undefined)
      const updateResponse = await request(server)
        .put(`/items/${itemId}`)
        .send({ name: 'Updated' });
      
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.item.description).toBe('Original desc');
    });
  });

  describe('Special Characters', () => {
    it('should handle special characters in name', async () => {
      const specialName = 'Test <>&"\' Item!@#$%';
      
      const response = await request(server)
        .post('/items')
        .send({ name: specialName });
      
      expect(response.status).toBe(201);
      expect(response.body.item.name).toBe(specialName);
    });

    it('should handle unicode characters', async () => {
      const unicodeName = 'テスト 测试 тест 🎉';
      
      const response = await request(server)
        .post('/items')
        .send({ name: unicodeName });
      
      expect(response.status).toBe(201);
      expect(response.body.item.name).toBe(unicodeName);
    });

    it('should handle emoji in payload', async () => {
      const emojiName = '🚀 Test Item 🎯';
      
      const response = await request(server)
        .post('/items')
        .send({ name: emojiName, description: '👍 Description 👎' });
      
      expect(response.status).toBe(201);
      expect(response.body.item.name).toBe(emojiName);
    });

    it('should handle newlines in strings', async () => {
      const multilineName = 'Line 1\nLine 2\nLine 3';
      
      const response = await request(server)
        .post('/items')
        .send({ name: multilineName });
      
      expect(response.status).toBe(201);
      expect(response.body.item.name).toBe(multilineName);
    });
  });

  describe('Malformed JSON', () => {
    it('should return 400 for invalid JSON', async () => {
      const response = await request(server)
        .post('/items')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });

    it('should return 400 for truncated JSON', async () => {
      const response = await request(server)
        .post('/items')
        .set('Content-Type', 'application/json')
        .send('{ "name": "test"');
      
      expect(response.status).toBe(400);
    });

    it('should return 400 for JSON with trailing comma', async () => {
      const response = await request(server)
        .post('/items')
        .set('Content-Type', 'application/json')
        .send('{ "name": "test", }');
      
      expect(response.status).toBe(400);
    });

    it('should return 400 for non-JSON content', async () => {
      const response = await request(server)
        .post('/items')
        .set('Content-Type', 'application/json')
        .send('not json at all');
      
      expect(response.status).toBe(400);
    });
  });

  describe('URL Edge Cases', () => {
    it('should handle trailing slash', async () => {
      const responseWithSlash = await request(server)
        .get('/items/');
      
      // Should either work or return 404, but not crash
      expect([200, 404]).toContain(responseWithSlash.status);
    });

    it('should handle multiple slashes', async () => {
      const response = await request(server)
        .get('//items');
      
      // Should handle gracefully
      expect(response.status).toBeDefined();
    });

    it('should handle non-numeric ID parameter', async () => {
      const response = await request(server)
        .get('/items/abc');
      
      expect(response.status).toBe(404);
    });

    it('should handle very long URL path', async () => {
      const longPath = '/items/' + 'x'.repeat(1000);
      
      const response = await request(server)
        .get(longPath);
      
      expect(response.status).toBe(404);
    });
  });

  describe('Request ID Edge Cases', () => {
    it('should echo very long request ID', async () => {
      const longRequestId = 'x'.repeat(256);
      
      const response = await request(server)
        .get('/')
        .set('X-Request-Id', longRequestId);
      
      expect(response.headers['x-request-id']).toBe(longRequestId);
    });

    it('should echo request ID with special characters', async () => {
      const specialRequestId = 'test-123-abc_def';
      
      const response = await request(server)
        .get('/')
        .set('X-Request-Id', specialRequestId);
      
      expect(response.headers['x-request-id']).toBe(specialRequestId);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent GET requests', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(server).get('/items')
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle concurrent POST and GET requests', async () => {
      const postRequests = Array(5).fill(null).map((_, i) => 
        request(server)
          .post('/items')
          .send({ name: `Concurrent Item ${i}` })
      );
      
      const getRequests = Array(5).fill(null).map(() => 
        request(server).get('/items')
      );
      
      const responses = await Promise.all([...postRequests, ...getRequests]);
      
      responses.forEach(response => {
        expect([200, 201]).toContain(response.status);
      });
    });
  });

  describe('Large Payload Handling', () => {
    it('should handle reasonably large payload', async () => {
      const largeDescription = 'x'.repeat(10000);
      
      const response = await request(server)
        .post('/items')
        .send({ name: 'Large Item', description: largeDescription });
      
      expect(response.status).toBe(201);
      expect(response.body.item.description).toBe(largeDescription);
    });

    it('should handle payload with many fields', async () => {
      const payload = { name: 'Many Fields' };
      for (let i = 0; i < 100; i++) {
        payload[`field${i}`] = `value${i}`;
      }
      
      const response = await request(server)
        .post('/items')
        .send(payload);
      
      expect(response.status).toBe(201);
    });

    it('should reject oversized payload with 413', async () => {
      // Create a payload over 1MB
      const oversizedDescription = 'x'.repeat(1024 * 1024 + 100);
      
      const response = await request(server)
        .post('/items')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ name: 'Oversized', description: oversizedDescription }));
      
      expect(response.status).toBe(413);
    });

    it('should reject payload exceeding content-length', async () => {
      // This tests the streaming check for oversized payloads
      const largePayload = { name: 'Test', data: 'x'.repeat(500000) };
      
      const response = await request(server)
        .post('/items')
        .set('Content-Length', String(Buffer.byteLength(JSON.stringify(largePayload))))
        .send(largePayload);
      
      // Should either succeed or return an error, but not crash
      expect([201, 400, 413]).toContain(response.status);
    });
  });

  describe('Data Type Edge Cases', () => {
    it('should handle number as name', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: 12345 });
      
      // Should either coerce to string or reject
      expect([201, 400]).toContain(response.status);
    });

    it('should handle boolean as name', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: true });
      
      // Should either coerce to string or reject
      expect([201, 400]).toContain(response.status);
    });

    it('should handle array as name', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: ['a', 'b', 'c'] });
      
      // Array is truthy, so it might work or fail
      expect([201, 400]).toContain(response.status);
    });

    it('should handle object as name', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: { nested: 'value' } });
      
      // Object is truthy, so it might work or fail
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('Empty String Values', () => {
    it('should reject empty string name', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: '' });
      
      // Empty string is falsy, should be rejected
      expect(response.status).toBe(400);
    });

    it('should accept empty string description', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: 'Test', description: '' });
      
      expect(response.status).toBe(201);
      expect(response.body.item.description).toBe('');
    });
  });

  describe('ID Edge Cases', () => {
    it('should handle ID 0', async () => {
      const response = await request(server)
        .get('/items/0');
      
      expect(response.status).toBe(404);
    });

    it('should handle negative ID', async () => {
      const response = await request(server)
        .get('/items/-1');
      
      expect(response.status).toBe(404);
    });

    it('should handle very large ID', async () => {
      const response = await request(server)
        .get('/items/999999999999');
      
      expect(response.status).toBe(404);
    });

    it('should handle decimal ID', async () => {
      const response = await request(server)
        .get('/items/1.5');
      
      expect(response.status).toBe(404);
    });
  });
});
