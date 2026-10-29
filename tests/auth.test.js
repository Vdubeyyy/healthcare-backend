const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('1. Authentication APIs', () => {
  const testUser = {
    name: 'Dr. Gregory House',
    email: 'house@princeton.edu',
    password: 'DiagnosisPassword123'
  };

  test('POST /api/auth/register/ - Should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register/')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.password).toBeUndefined(); // Password must not be exposed
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/auth/register/ - Should fail if email already exists', async () => {
    const res = await request(app)
      .post('/api/auth/register/')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login/ - Should log in and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login/')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.name).toBe(testUser.name);
  });

  test('POST /api/auth/login/ - Should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login/')
      .send({
        email: testUser.email,
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me/ - Should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me/');
    expect(res.status).toBe(401);
  });
});
