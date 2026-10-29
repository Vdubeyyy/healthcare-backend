const express = require('express');
const { body, param } = require('express-validator');
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctor.controller');
const authenticateJWT = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

// Validation rules
const doctorValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Doctor name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('specialization')
    .trim()
    .notEmpty().withMessage('Specialization is required'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
];

const updateDoctorValidation = [
  param('id').isInt({ min: 1 }).withMessage('Doctor ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('specialization')
    .optional()
    .trim()
    .notEmpty().withMessage('Specialization cannot be empty'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .notEmpty().withMessage('Phone cannot be empty')
];

const idParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Doctor ID must be a positive integer')
];

// Routes
router.post(['/', ''], authenticateJWT, validate(doctorValidation), createDoctor);
router.get(['/', ''], getDoctors);
router.get(['/:id', '/:id/'], validate(idParamValidation), getDoctorById);
router.put(['/:id', '/:id/'], authenticateJWT, validate(updateDoctorValidation), updateDoctor);
router.delete(['/:id', '/:id/'], authenticateJWT, validate(idParamValidation), deleteDoctor);

module.exports = router;
