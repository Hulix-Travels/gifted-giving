const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../index');
const User = require('../models/User');
const NewsletterSubscription = require('../models/NewsletterSubscription');
const { generateAccessToken } = require('../utils/jwtTokens');
const { getJwtSecret } = require('../utils/jwtSecret');

const SUBSCRIBE_MESSAGE =
  'Thank you! If this email is eligible, you will receive our newsletter.';

describe('Token revocation', () => {
  let testUser;
  let sessionToken;

  beforeAll(async () => {
    testUser = await User.create({
      firstName: 'Revoke',
      lastName: 'Test',
      email: `revoke-${Date.now()}@example.com`,
      password: 'TestPass1',
      role: 'donor',
      isEmailVerified: true,
      tokenVersion: 0
    });
    sessionToken = generateAccessToken(testUser);
  });

  afterAll(async () => {
    if (testUser?._id) {
      await User.deleteOne({ _id: testUser._id });
    }
  });

  test('active session token can access /api/auth/me', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${sessionToken}`);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(testUser.email);
  });

  test('incrementing tokenVersion invalidates existing session', async () => {
    await User.findByIdAndUpdate(testUser._id, { $inc: { tokenVersion: 1 } });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${sessionToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/Session expired/i);
  });

  test('password reset increments tokenVersion and revokes sessions', async () => {
    const resetUser = await User.create({
      firstName: 'Reset',
      lastName: 'Test',
      email: `reset-${Date.now()}@example.com`,
      password: 'OldPass1',
      role: 'donor',
      isEmailVerified: true,
      tokenVersion: 0
    });

    const oldSession = generateAccessToken(resetUser);
    const resetToken = jwt.sign({ userId: resetUser._id }, getJwtSecret(), { expiresIn: '1h' });

    await User.findByIdAndUpdate(resetUser._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: Date.now() + 3600000
    });

    const resetResponse = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: resetToken, password: 'NewPass2' });

    expect(resetResponse.status).toBe(200);

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${oldSession}`);

    expect(meResponse.status).toBe(401);

    await User.deleteOne({ _id: resetUser._id });
  });
});

describe('Newsletter anti-enumeration', () => {
  const testEmail = `newsletter-${Date.now()}@example.com`;

  afterAll(async () => {
    await NewsletterSubscription.deleteOne({ email: testEmail });
  });

  test('subscribe returns the same generic message for new and repeat requests', async () => {
    const first = await request(app)
      .post('/api/newsletter/subscribe')
      .send({ email: testEmail });

    expect(first.status).toBe(201);
    expect(first.body.message).toBe(SUBSCRIBE_MESSAGE);

    const second = await request(app)
      .post('/api/newsletter/subscribe')
      .send({ email: testEmail });

    expect(second.status).toBe(200);
    expect(second.body.message).toBe(SUBSCRIBE_MESSAGE);
  });

  test('unsubscribe returns generic message even for unknown email', async () => {
    const response = await request(app)
      .post('/api/newsletter/unsubscribe')
      .send({ email: 'not-on-list@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/If this email was on our list/i);
  });
});
