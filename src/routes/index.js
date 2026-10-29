const express = require('express');
const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const doctorRoutes = require('./doctor.routes');
const mappingRoutes = require('./mapping.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'online',
    name: 'Healthcare Management API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register/',
        login: 'POST /api/auth/login/',
        profile: 'GET /api/auth/me/'
      },
      patients: {
        create: 'POST /api/patients/',
        listUserPatients: 'GET /api/patients/',
        getDetails: 'GET /api/patients/<id>/',
        update: 'PUT /api/patients/<id>/',
        delete: 'DELETE /api/patients/<id>/'
      },
      doctors: {
        create: 'POST /api/doctors/',
        listAll: 'GET /api/doctors/',
        getDetails: 'GET /api/doctors/<id>/',
        update: 'PUT /api/doctors/<id>/',
        delete: 'DELETE /api/doctors/<id>/'
      },
      mappings: {
        assign: 'POST /api/mappings/',
        listAll: 'GET /api/mappings/',
        getDoctorsForPatient: 'GET /api/mappings/<patient_id>/',
        remove: 'DELETE /api/mappings/<id>/'
      }
    }
  });
});

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/mappings', mappingRoutes);

module.exports = router;
