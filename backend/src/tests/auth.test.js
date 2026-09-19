const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Auth Endpoints API Suite', () => {
  const testUser = {
    name: 'Test Engineer',
    email: `test_${Date.now()}@pulsespace.io`,
    password: 'password123'
  };

  let token = '';
  let refreshToken = '';

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toEqual(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();

    token = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('should fail registration with existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate existing user with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should return authenticated user profile on GET /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toEqual(testUser.email);
  });

  it('should fail GET /api/auth/me without Bearer token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toEqual(401);
  });
});
