const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');

describe('Health Check', () => {
  // Close database connection after all tests
  afterAll(async () => {
    try {
      await mongoose.connection.close();
    } catch (error) {
      console.log('MongoDB connection already closed');
    }
  });

  test('GET /api/health should return 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message', 'Gifted givings API is running');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/health should include database status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body).toHaveProperty('database');
    expect(['connected', 'disconnected']).toContain(response.body.database);
  });
}); 