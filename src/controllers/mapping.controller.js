const { PatientDoctorMapping, Patient, Doctor } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Assign a doctor to a patient
 * POST /api/mappings/
 */
const assignDoctor = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_date, notes } = req.body;

    // Check if patient exists
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return errorResponse(res, `Patient with ID ${patient_id} does not exist`, 404);
    }

    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return errorResponse(res, `Doctor with ID ${doctor_id} does not exist`, 404);
    }

    // Check if mapping already exists
    const existingMapping = await PatientDoctorMapping.findOne({
      where: {
        patient_id,
        doctor_id
      }
    });

    if (existingMapping) {
      return errorResponse(res, 'Doctor is already assigned to this patient', 400);
    }

    // Create mapping
    const mapping = await PatientDoctorMapping.create({
      patient_id,
      doctor_id,
      appointment_date: appointment_date || null,
      notes: notes || null,
      created_by: req.user.id
    });

    // Fetch full record with associated patient and doctor
    const fullMapping = await PatientDoctorMapping.findByPk(mapping.id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'age', 'gender', 'contact']
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name', 'specialization', 'email', 'phone']
        }
      ]
    });

    return successResponse(res, fullMapping, 'Doctor assigned to patient successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all patient-doctor mappings
 * GET /api/mappings/
 */
const getAllMappings = async (req, res, next) => {
  try {
    const mappings = await PatientDoctorMapping.findAll({
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'name', 'age', 'gender', 'contact']
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name', 'specialization', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, mappings, 'Patient-doctor mappings retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all doctors assigned to a specific patient
 * GET /api/mappings/<patient_id>/
 */
const getDoctorsByPatient = async (req, res, next) => {
  try {
    const { patient_id } = req.params;

    // Check if patient exists
    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return errorResponse(res, `Patient with ID ${patient_id} does not exist`, 404);
    }

    const mappings = await PatientDoctorMapping.findAll({
      where: { patient_id },
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name', 'specialization', 'email', 'phone', 'available_days']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, {
      patient: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        contact: patient.contact
      },
      assigned_doctors: mappings.map(m => ({
        mapping_id: m.id,
        appointment_date: m.appointment_date,
        notes: m.notes,
        doctor: m.doctor
      }))
    }, `Doctors assigned to patient #${patient_id} retrieved successfully`, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a doctor from a patient
 * DELETE /api/mappings/<id>/
 */
const removeMapping = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mapping = await PatientDoctorMapping.findByPk(id);

    if (!mapping) {
      return errorResponse(res, `Mapping with ID ${id} not found`, 404);
    }

    await mapping.destroy();

    return successResponse(res, null, 'Doctor removed from patient successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assignDoctor,
  getAllMappings,
  getDoctorsByPatient,
  removeMapping
};
