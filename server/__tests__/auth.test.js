const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');

describe('Auth routes', () => {
  afterAll(async () => {
    try {
      await mongoose.connection.close();
    } catch {
      // already closed
    }
  });

  test('GET /api/auth/verify-email returns 405', async () => {
    const response = await request(app).get('/api/auth/verify-email');
    expect(response.status).toBe(405);
    expect(response.body.message).toMatch(/POST/i);
  });

  test('POST /api/auth/verify-email without token returns 400', async () => {
    const response = await request(app)
      .post('/api/auth/verify-email')
      .send({});
    expect(response.status).toBe(400);
  });
});
