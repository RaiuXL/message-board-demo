process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

const request = require('supertest');
const { createApp } = require('../../app');
const { sequelize } = require('../../models');

const app = createApp();

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  await sequelize.truncate({ cascade: true });
});

afterAll(async () => {
  await sequelize.close();
});

test('full message and reply CRUD with real database', async () => {
  const messagePayload = {
    title: 'Integration Message',
    body: 'This message is part of the integration test.',
    author_name: 'Integrator',
  };

  const { body: createdMessage } = await request(app)
    .post('/messages')
    .send(messagePayload)
    .expect(201);

  const listResponse = await request(app).get('/messages').expect(200);
  expect(listResponse.body).toHaveLength(1);
  expect(listResponse.body[0]).toMatchObject({
    title: messagePayload.title,
    body: messagePayload.body,
    author_name: messagePayload.author_name,
    reply_count: 0,
  });

  const replyPayload = {
    body: 'Integration reply body',
    author_name: 'Responder',
  };

  await request(app)
    .post(`/messages/${createdMessage.id}/replies`)
    .send(replyPayload)
    .expect(201);

  const repliesResponse = await request(app)
    .get(`/messages/${createdMessage.id}/replies`)
    .expect(200);

  expect(repliesResponse.body).toHaveLength(1);
  expect(repliesResponse.body[0]).toMatchObject({
    body: replyPayload.body,
    author_name: replyPayload.author_name,
  });

  const refreshedList = await request(app).get('/messages').expect(200);
  expect(refreshedList.body[0].reply_count).toBe(1);

  await request(app).delete(`/messages/${createdMessage.id}`).expect(204);

  await request(app).get('/messages').expect(200, []);
  await request(app).get(`/messages/${createdMessage.id}`).expect(404);
  await request(app).get(`/messages/${createdMessage.id}/replies`).expect(404);
});
