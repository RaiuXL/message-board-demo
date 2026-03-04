const request = require('supertest');
const { createTestApp } = require('./testApp');

const app = createTestApp();

describe('router.param invalid ID handling (unit)', () => {

  it('should return 400 for non-numeric id', async () => {
    const res = await request(app).get('/messages/abc');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Invalid message id');
  });

  it('should return 400 for zero id', async () => {
    const res = await request(app).get('/messages/0');
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 for negative id', async () => {
    const res = await request(app).get('/messages/-1');
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 for decimal id', async () => {
    const res = await request(app).get('/messages/1.5');
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 for replies sub-route when id invalid', async () => {
    const res = await request(app).get('/messages/abc/replies');
    expect(res.statusCode).toBe(400);
  });

});
