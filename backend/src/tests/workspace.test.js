const request = require('supertest');
const app = require('../app');

describe('Workspace & RBAC API Suite', () => {
  let token = '';
  let workspaceId = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Workspace Tester',
        email: `ws_test_${Date.now()}@pulsespace.io`,
        password: 'password123'
      });
    token = res.body.data.accessToken;
  });

  it('should create a new workspace', async () => {
    const res = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Acme Product Team', description: 'Core product team workspace' });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBeDefined();
    workspaceId = res.body.data._id;
  });

  it('should fetch user workspaces', async () => {
    const res = await request(app)
      .get('/api/workspaces')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should fetch workspace analytics via MongoDB Aggregation', async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}/analytics`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalMembers).toBeDefined();
  });
});
