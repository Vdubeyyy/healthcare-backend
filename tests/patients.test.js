const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

let authToken = '';
let patientId = null;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Register and login a user to get token
  const res = await request(app)
    .post('/api/auth/register/')
    .send({
      name: 'Dr. James Wilson',
      email: 'wilson@princeton.edu',
      password: 'WilsonPass123'
    });
  authToken = res.body.data.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('2. Patient Management APIs', () => {
  test('POST /api/patients/ - Should fail without authentication token', async () => {
    const res = await request(app)
      .post('/api/patients/')
      .send({
        name: 'John Doe',
        age: 40,
        gender: 'Male',
        contact: '+1-555-1234'
      });

    expect(res.status).toBe(401);
  });

  test('POST /api/patients/ - Should add a new patient when authenticated', async () => {
    const res = await request(app)
      .post('/api/patients/')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'John Doe',
        age: 40,
        gender: 'Male',
        contact: '+1-555-1234',
        address: '123 Baker Street',
        medical_history: 'None'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('John Doe');
    expect(res.body.data.id).toBeDefined();
    patientId = res.body.data.id;
  });

  test('GET /api/patients/ - Should retrieve all patients created by the authenticated user', async () => {
    const res = await request(app)
      .get('/api/patients/')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/patients/<id>/ - Should get details of a specific patient', async () => {
    const res = await request(app)
      .get(`/api/patients/${patientId}/`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(patientId);
    expect(res.body.data.name).toBe('John Doe');
  });

  test('PUT /api/patients/<id>/ - Should update patient details', async () => {
    const res = await request(app)
      .put(`/api/patients/${patientId}/`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'John Doe Updated',
        age: 41
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('John Doe Updated');
    expect(res.body.data.age).toBe(41);
  });

  test('DELETE /api/patients/<id>/ - Should delete a patient record', async () => {
    const res = await request(app)
      .delete(`/api/patients/${patientId}/`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deletion
    const verifyRes = await request(app)
      .get(`/api/patients/${patientId}/`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(verifyRes.status).toBe(404);
  });
});
