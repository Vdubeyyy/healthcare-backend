const express = require('express');
const { body, param } = require('express-validator');
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
} = require('../controllers/patient.controller');
const authenticateJWT = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

// All patient endpoints require authentication
router.use(authenticateJWT);

// Validation rules
const patientValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Patient name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 0, max: 150 }).withMessage('Age must be an integer between 0 and 150'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other', 'male', 'female', 'other']).withMessage('Gender must be Male, Female, or Other'),
  body('contact')
    .trim()
    .notEmpty().withMessage('Contact is required')
];

const updatePatientValidation = [
  param('id').isInt({ min: 1 }).withMessage('Patient ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 }).withMessage('Age must be an integer between 0 and 150'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'male', 'female', 'other']).withMessage('Gender must be Male, Female, or Other'),
  body('contact')
    .optional()
    .trim()
    .notEmpty().withMessage('Contact cannot be empty')
];

const idParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Patient ID must be a positive integer')
];

// Routes supporting both trailing and non-trailing slash
router.post(['/', ''], validate(patientValidation), createPatient);
router.get(['/', ''], getPatients);
router.get(['/:id', '/:id/'], validate(idParamValidation), getPatientById);
router.put(['/:id', '/:id/'], validate(updatePatientValidation), updatePatient);
router.delete(['/:id', '/:id/'], validate(idParamValidation), deletePatient);

module.exports = router;
