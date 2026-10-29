const { Doctor, Patient, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Add a new doctor (Authenticated users only)
 * POST /api/doctors/
 */
const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization, email, phone, available_days } = req.body;

    const existingDoctor = await Doctor.findOne({ where: { email: email.toLowerCase() } });
    if (existingDoctor) {
      return errorResponse(res, 'A doctor with this email address already exists', 400);
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      email: email.toLowerCase(),
      phone,
      available_days: available_days || 'Monday to Friday',
      created_by: req.user.id
    });

    return successResponse(res, doctor, 'Doctor registered successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve all doctors
 * GET /api/doctors/
 */
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: Patient,
          as: 'patients',
          attributes: ['id', 'name', 'gender', 'age', 'contact'],
          through: { attributes: ['id', 'appointment_date', 'notes'] }
        }
      ],
      order: [['name', 'ASC']]
    });

    return successResponse(res, doctors, 'Doctors retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a specific doctor
 * GET /api/doctors/<id>/
 */
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patients',
          attributes: ['id', 'name', 'age', 'gender', 'contact'],
          through: { attributes: ['id', 'appointment_date', 'notes', 'createdAt'] }
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!doctor) {
      return errorResponse(res, `Doctor with ID ${id} not found`, 404);
    }

    return successResponse(res, doctor, 'Doctor details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor details
 * PUT /api/doctors/<id>/
 */
const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, specialization, email, phone, available_days } = req.body;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return errorResponse(res, `Doctor with ID ${id} not found`, 404);
    }

    if (email && email.toLowerCase() !== doctor.email) {
      const emailExists = await Doctor.findOne({ where: { email: email.toLowerCase() } });
      if (emailExists) {
        return errorResponse(res, 'Email already in use by another doctor', 400);
      }
    }

    await doctor.update({
      name: name !== undefined ? name : doctor.name,
      specialization: specialization !== undefined ? specialization : doctor.specialization,
      email: email !== undefined ? email.toLowerCase() : doctor.email,
      phone: phone !== undefined ? phone : doctor.phone,
      available_days: available_days !== undefined ? available_days : doctor.available_days
    });

    return successResponse(res, doctor, 'Doctor details updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a doctor record
 * DELETE /api/doctors/<id>/
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return errorResponse(res, `Doctor with ID ${id} not found`, 404);
    }

    await doctor.destroy();

    return successResponse(res, null, 'Doctor record deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
};
