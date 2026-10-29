const { Patient, Doctor, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Add a new patient (Authenticated users only)
 * POST /api/patients/
 */
const createPatient = async (req, res, next) => {
  try {
    const { name, age, gender, contact, address, medical_history } = req.body;

    const patient = await Patient.create({
      name,
      age,
      gender,
      contact,
      address,
      medical_history,
      created_by: req.user.id
    });

    return successResponse(res, patient, 'Patient created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all patients created by the authenticated user
 * GET /api/patients/
 */
const getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.findAll({
      where: { created_by: req.user.id },
      include: [
        {
          model: Doctor,
          as: 'doctors',
          attributes: ['id', 'name', 'specialization', 'email', 'phone'],
          through: { attributes: ['id', 'appointment_date', 'notes'] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, patients, 'Patients retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a specific patient
 * GET /api/patients/<id>/
 */
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        {
          model: Doctor,
          as: 'doctors',
          attributes: ['id', 'name', 'specialization', 'email', 'phone', 'available_days'],
          through: { attributes: ['id', 'appointment_date', 'notes', 'createdAt'] }
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!patient) {
      return errorResponse(res, `Patient with ID ${id} not found`, 404);
    }

    return successResponse(res, patient, 'Patient details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient details
 * PUT /api/patients/<id>/
 */
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, age, gender, contact, address, medical_history } = req.body;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return errorResponse(res, `Patient with ID ${id} not found`, 404);
    }

    // Ensure only the creator can update the patient
    if (patient.created_by !== req.user.id) {
      return errorResponse(res, 'You do not have permission to update this patient record', 403);
    }

    await patient.update({
      name: name !== undefined ? name : patient.name,
      age: age !== undefined ? age : patient.age,
      gender: gender !== undefined ? gender : patient.gender,
      contact: contact !== undefined ? contact : patient.contact,
      address: address !== undefined ? address : patient.address,
      medical_history: medical_history !== undefined ? medical_history : patient.medical_history
    });

    return successResponse(res, patient, 'Patient updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a patient record
 * DELETE /api/patients/<id>/
 */
const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return errorResponse(res, `Patient with ID ${id} not found`, 404);
    }

    // Ensure only the creator can delete the patient
    if (patient.created_by !== req.user.id) {
      return errorResponse(res, 'You do not have permission to delete this patient record', 403);
    }

    await patient.destroy();

    return successResponse(res, null, 'Patient record deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
};
