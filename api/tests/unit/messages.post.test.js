const request = require('supertest');
const { Message } = require('../../models');
const { createTestApp } = require('./testApp');

jest.mock('../../models');

const app = createTestApp();

describe('POST /messages (unit)', () => {

  it('should return 400 if required fields missing', async () => {
    const res = await request(app)
      .post('/messages')
      .send({ title: 'Test' });

    expect(res.statusCode).toBe(400);
  });

  it('should create message when valid', async () => {
    Message.create.mockResolvedValue({
      id: 1,
      title: 'Test',
      body: 'Body',
      author_name: 'Nathan'
    });

    const payload = {
      title: 'Test',
      body: 'Body',
      author_name: 'Nathan'
    };

    const res = await request(app)
      .post('/messages')
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(Message.create).toHaveBeenCalledWith(payload);
    expect(res.body).toMatchObject(payload);
  });

  it('should return 500 when creation fails', async () => {
    const payload = {
      title: 'Test',
      body: 'Body',
      author_name: 'Nathan'
    };

    Message.create.mockRejectedValue(new Error('write error'));

    const res = await request(app)
      .post('/messages')
      .send(payload);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('write error');
  });

});
