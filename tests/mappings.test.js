const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

let authToken = '';
let patientId = null;
let doctorId = null;
let mappingId = null;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // 1. Register user
  const authRes = await request(app)
    .post('/api/auth/register/')
    .send({
      name: 'Dr. Robert Chase',
      email: 'chase@princeton.edu',
      password: 'ChasePass123'
    });
  authToken = authRes.body.data.token;

  // 2. Create patient
  const pRes = await request(app)
    .post('/api/patients/')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name: 'Patient Dave',
      age: 29,
      gender: 'Male',
      contact: '+1-555-4433'
    });
  patientId = pRes.body.data.id;

  // 3. Create doctor
  const dRes = await request(app)
    .post('/api/doctors/')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name: 'Dr. Allison Cameron',
      specialization: 'Immunology',
      email: 'cameron@princeton.edu',
      phone: '+1-555-7766'
    });
  doctorId = dRes.body.data.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('4. Patient-Doctor Mapping APIs', () => {
  test('POST /api/mappings/ - Should assign a doctor to a patient', async () => {
    const res = await request(app)
      .post('/api/mappings/')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_date: '2026-11-10T10:00:00Z',
        notes: 'Initial allergy testing'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patient_id).toBe(patientId);
    expect(res.body.data.doctor_id).toBe(doctorId);
    expect(res.body.data.patient).toBeDefined();
    expect(res.body.data.doctor).toBeDefined();
    mappingId = res.body.data.id;
  });

  test('POST /api/mappings/ - Should reject duplicate mapping', async () => {
    const res = await request(app)
      .post('/api/mappings/')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        patient_id: patientId,
        doctor_id: doctorId
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/mappings/ - Should retrieve all patient-doctor mappings', async () => {
    const res = await request(app)
      .get('/api/mappings/')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/mappings/<patient_id>/ - Should get all doctors assigned to a specific patient', async () => {
    const res = await request(app)
      .get(`/api/mappings/${patientId}/`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patient.id).toBe(patientId);
    expect(Array.isArray(res.body.data.assigned_doctors)).toBe(true);
    expect(res.body.data.assigned_doctors.length).toBe(1);
    expect(res.body.data.assigned_doctors[0].doctor.id).toBe(doctorId);
  });

  test('DELETE /api/mappings/<id>/ - Should remove a doctor from a patient', async () => {
    const res = await request(app)
      .delete(`/api/mappings/${mappingId}/`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify removal
    const verifyRes = await request(app)
      .get(`/api/mappings/${patientId}/`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(verifyRes.body.data.assigned_doctors.length).toBe(0);
  });
});
