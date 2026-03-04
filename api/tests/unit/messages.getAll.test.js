const request = require('supertest');
const { Message } = require('../../models');
const { createTestApp } = require('./testApp');

jest.mock('../../models');

const app = createTestApp();

describe('GET /messages (unit)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array when no messages', async () => {
    Message.findAll.mockResolvedValue([]);

    const res = await request(app).get('/messages');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
    expect(Message.findAll).toHaveBeenCalled();
  });

  it('should return messages with reply_count as number', async () => {
    Message.findAll.mockResolvedValue([
      {
        get: () => ({
          id: 1,
          title: 'Test',
          body: 'Body',
          author_name: 'Nathan',
          created_at: new Date(),
          reply_count: '2'
        })
      }
    ]);

    const res = await request(app).get('/messages');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(1);
    expect(res.body[0].reply_count).toBe(2);
    expect(res.body[0]).toMatchObject({
      title: 'Test',
      body: 'Body',
      author_name: 'Nathan',
    });
    expect(Message.findAll).toHaveBeenCalled();
  });

  it('should surface metadata even when Sequelize returns strings', async () => {
    const timestamp = new Date().toISOString();
    Message.findAll.mockResolvedValue([
      {
        get: () => ({
          id: 2,
          title: 'Another',
          body: 'Payload',
          author_name: 'Dev',
          created_at: timestamp,
          reply_count: '0'
        })
      }
    ]);

    const res = await request(app).get('/messages');

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toMatchObject({
      id: 2,
      title: 'Another',
      body: 'Payload',
      author_name: 'Dev',
      created_at: timestamp,
      reply_count: 0,
    });
  });

  it('should return 500 when findAll fails', async () => {
    Message.findAll.mockRejectedValue(new Error('db failure'));

    const res = await request(app).get('/messages');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('db failure');
  });

});
