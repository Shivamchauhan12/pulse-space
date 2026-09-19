const request = require('supertest');
const app = require('../app');

describe('Kanban Board API Suite', () => {
  let token = '';
  let workspaceId = '';
  let boardId = '';
  let listId = '';

  beforeAll(async () => {
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Board Tester',
        email: `board_test_${Date.now()}@pulsespace.io`,
        password: 'password123'
      });
    token = userRes.body.data.accessToken;

    const wsRes = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sprint Workspace' });
    workspaceId = wsRes.body.data._id;
  });

  it('should create a new Kanban Board', async () => {
    const res = await request(app)
      .post('/api/boards')
      .set('Authorization', `Bearer ${token}`)
      .send({ workspaceId, title: 'Q4 Product Roadmap' });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lists.length).toEqual(4);

    boardId = res.body.data._id;
    listId = res.body.data.lists[0]._id;
  });

  it('should add a new card to list', async () => {
    const res = await request(app)
      .post(`/api/boards/${boardId}/lists/${listId}/cards`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Implement Auth Refresh Rotation', priority: 'HIGH', storyPoints: 3 });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
  });
});
