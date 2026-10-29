const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

let authToken = '';
let doctorId = null;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const res = await request(app)
    .post('/api/auth/register/')
    .send({
      name: 'Dr. Cuddy',
      email: 'cuddy@princeton.edu',
      password: 'CuddyPass123'
    });
  authToken = res.body.data.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('3. Doctor Management APIs', () => {
  test('POST /api/doctors/ - Should add a new doctor when authenticated', async () => {
    const res = await request(app)
      .post('/api/doctors/')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Dr. Eric Foreman',
        specialization: 'Neurology',
        email: 'foreman@princeton.edu',
        phone: '+1-555-9876',
        available_days: 'Tuesday, Thursday'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Dr. Eric Foreman');
    expect(res.body.data.specialization).toBe('Neurology');
    doctorId = res.body.data.id;
  });

  test('GET /api/doctors/ - Should retrieve all doctors', async () => {
    const res = await request(app).get('/api/doctors/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/doctors/<id>/ - Should get details of a specific doctor', async () => {
    const res = await request(app).get(`/api/doctors/${doctorId}/`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(doctorId);
    expect(res.body.data.name).toBe('Dr. Eric Foreman');
  });

  test('PUT /api/doctors/<id>/ - Should update doctor details', async () => {
    const res = await request(app)
      .put(`/api/doctors/${doctorId}/`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        specialization: 'Chief of Neurology'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.specialization).toBe('Chief of Neurology');
  });

  test('DELETE /api/doctors/<id>/ - Should delete a doctor record', async () => {
    const res = await request(app)
      .delete(`/api/doctors/${doctorId}/`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const verifyRes = await request(app).get(`/api/doctors/${doctorId}/`);
    expect(verifyRes.status).toBe(404);
  });
});
