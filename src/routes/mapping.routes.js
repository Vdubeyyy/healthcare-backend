const express = require('express');
const { body, param } = require('express-validator');
const {
  assignDoctor,
  getAllMappings,
  getDoctorsByPatient,
  removeMapping
} = require('../controllers/mapping.controller');
const authenticateJWT = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

// Require authentication for mapping management
router.use(authenticateJWT);

// Validation rules
const mappingValidation = [
  body('patient_id')
    .notEmpty().withMessage('patient_id is required')
    .isInt({ min: 1 }).withMessage('patient_id must be a positive integer'),
  body('doctor_id')
    .notEmpty().withMessage('doctor_id is required')
    .isInt({ min: 1 }).withMessage('doctor_id must be a positive integer')
];

const patientIdValidation = [
  param('patient_id').isInt({ min: 1 }).withMessage('patient_id must be a positive integer')
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Mapping ID must be a positive integer')
];

// Routes
router.post(['/', ''], validate(mappingValidation), assignDoctor);
router.get(['/', ''], getAllMappings);
router.get(['/:patient_id', '/:patient_id/'], validate(patientIdValidation), getDoctorsByPatient);
router.delete(['/:id', '/:id/'], validate(idValidation), removeMapping);

module.exports = router;
