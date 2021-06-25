process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testUser;
beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('sony', 'Sony', 'Maker of PlayStation') RETURNING code, name, description`
  );
  testUser = result.rows[0];
});

// Remove users
afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

// We need to end the connection because we are testing
// Normally in a express app we want a constant connection

afterAll(async () => {
  await db.end();
});

// Testing Read
describe('GET /companies', () => {
  test('Get a list all companies', async () => {
    const res = await request(app).get('/companies');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: [
        { code: 'sony', name: 'Sony', description: 'Maker of PlayStation' },
      ],
    });
  });
});

describe('GET /companies/:code', () => {
  test('Get a single company', async () => {
    const res = await request(app).get(`/companies/${testUser.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: 'sony',
        name: 'Sony',
        description: 'Maker of PlayStation',
      },
      invoices: [],
    });
  });
});

describe('POST /companies', () => {
  test('Create a single company', async () => {
    const res = await request(app).post('/companies').send({
      code: 'microsoft',
      name: 'Microsoft',
      description: 'Maker of Xbox',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: 'microsoft',
        name: 'Microsoft',
        description: 'Maker of Xbox',
      },
    });
  });
});

describe('PUT /companies/:id', () => {
  test('Updates a single company', async () => {
    const res = await request(app)
      .put(`/companies/${testUser.code}`)
      .send({ name: 'Sony', description: 'Maker of A6400' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: testUser.code,
        name: 'Sony',
        description: 'Maker of A6400',
      },
    });
  });
});

describe('DELETE /companies/:id', () => {
  test('Delete a single company', async () => {
    const res = await request(app).delete(`/companies/microsoft`);
    expect(res.statusCode).toBe(200);
  });
});
