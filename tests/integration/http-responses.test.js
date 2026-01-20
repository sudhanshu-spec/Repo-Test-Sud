/**
 * HTTP Responses Integration Tests
 * Tests HTTP response body content, JSON parsing, and content formatting
 * 
 * @file tests/integration/http-responses.test.js
 */

const request = require('supertest');
const { server, start, stop, resetDataStore } = require('../../server');
const validPayload = require('../fixtures/requests/valid-payload.json');
const successResponse = require('../fixtures/responses/success.json');

describe('HTTP Responses', () => {
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

  describe('GET Requests', () => {
    it('should return JSON response body for root endpoint', async () => {
      const response = await request(server)
        .get('/')
        .expect('Content-Type', /json/);
      
      expect(response.body).toEqual(successResponse);
    });

    it('should return JSON response body for health endpoint', async () => {
      const response = await request(server)
        .get('/health')
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return items array from /items endpoint', async () => {
      const response = await request(server)
        .get('/items')
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should return plain text for text endpoint', async () => {
      const response = await request(server)
        .get('/text')
        .expect('Content-Type', /text\/plain/);
      
      expect(response.text).toBe('Hello, World!');
    });
  });

  describe('POST Requests', () => {
    it('should return created item in response body', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: validPayload.name, description: validPayload.description })
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('item');
      expect(response.body.item).toHaveProperty('id');
      expect(response.body.item).toHaveProperty('name', validPayload.name);
      expect(response.body.item).toHaveProperty('description', validPayload.description);
      expect(response.body.item).toHaveProperty('createdAt');
    });

    it('should parse JSON body correctly', async () => {
      const payload = { name: 'Parsed Item', description: 'Testing JSON parsing' };
      
      const response = await request(server)
        .post('/items')
        .send(payload)
        .expect('Content-Type', /json/);
      
      expect(response.body.item.name).toBe(payload.name);
      expect(response.body.item.description).toBe(payload.description);
    });

    it('should handle item creation with only name', async () => {
      const payload = { name: 'Name Only Item' };
      
      const response = await request(server)
        .post('/items')
        .send(payload)
        .expect('Content-Type', /json/);
      
      expect(response.body.item.name).toBe(payload.name);
      expect(response.body.item.description).toBe('');
    });
  });

  describe('PUT Requests', () => {
    it('should return updated item in response body', async () => {
      // First create an item
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'Original Name', description: 'Original description' });
      
      const itemId = createResponse.body.item.id;
      
      // Then update it
      const updateResponse = await request(server)
        .put(`/items/${itemId}`)
        .send({ name: 'Updated Name', description: 'Updated description' })
        .expect('Content-Type', /json/);
      
      expect(updateResponse.body.item.name).toBe('Updated Name');
      expect(updateResponse.body.item.description).toBe('Updated description');
      expect(updateResponse.body.item).toHaveProperty('updatedAt');
    });
  });

  describe('PATCH Requests', () => {
    it('should return partially updated item', async () => {
      // First create an item
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'Original Name', description: 'Original description' });
      
      const itemId = createResponse.body.item.id;
      
      // Partial update - only name
      const patchResponse = await request(server)
        .patch(`/items/${itemId}`)
        .send({ name: 'Patched Name' })
        .expect('Content-Type', /json/);
      
      expect(patchResponse.body.item.name).toBe('Patched Name');
      expect(patchResponse.body.item.description).toBe('Original description');
    });
  });

  describe('DELETE Requests', () => {
    it('should return empty body on successful delete', async () => {
      // First create an item
      const createResponse = await request(server)
        .post('/items')
        .send({ name: 'To Be Deleted' });
      
      const itemId = createResponse.body.item.id;
      
      // Delete it
      const deleteResponse = await request(server)
        .delete(`/items/${itemId}`)
        .expect(204);
      
      expect(deleteResponse.body).toEqual({});
    });
  });

  describe('Response Body Validation', () => {
    it('should return consistent error response format', async () => {
      const response = await request(server)
        .get('/nonexistent')
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return item object in success responses', async () => {
      const response = await request(server)
        .post('/items')
        .send({ name: 'Response Format Test' });
      
      expect(response.body).toHaveProperty('item');
      expect(typeof response.body.item).toBe('object');
    });

    it('should return timestamp in ISO format', async () => {
      const response = await request(server)
        .get('/health');
      
      const timestamp = response.body.timestamp;
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('Response Content Types', () => {
    it('should return application/json for JSON endpoints', async () => {
      await request(server)
        .get('/')
        .expect('Content-Type', /application\/json/);
    });

    it('should return text/plain for text endpoints', async () => {
      await request(server)
        .get('/text')
        .expect('Content-Type', /text\/plain/);
    });

    it('should set Content-Type based on response type', async () => {
      const jsonResponse = await request(server).get('/items');
      expect(jsonResponse.headers['content-type']).toMatch(/json/);
      
      const textResponse = await request(server).get('/text');
      expect(textResponse.headers['content-type']).toMatch(/text\/plain/);
    });
  });
});
