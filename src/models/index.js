const { sequelize } = require('../config/database');

// Import model factories
const defineUser = require('./user.model');
const definePatient = require('./patient.model');
const defineDoctor = require('./doctor.model');
const defineMapping = require('./mapping.model');

const initModels = (seqInstance = sequelize) => {
  const User = defineUser(seqInstance);
  const Patient = definePatient(seqInstance);
  const Doctor = defineDoctor(seqInstance);
  const PatientDoctorMapping = defineMapping(seqInstance);

  // User <-> Patient associations
  User.hasMany(Patient, {
    foreignKey: 'created_by',
    as: 'patients',
    onDelete: 'CASCADE'
  });
  Patient.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  // User <-> Doctor associations
  User.hasMany(Doctor, {
    foreignKey: 'created_by',
    as: 'doctors',
    onDelete: 'SET NULL'
  });
  Doctor.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  // Patient <-> Doctor Many-to-Many associations through PatientDoctorMapping
  Patient.belongsToMany(Doctor, {
    through: PatientDoctorMapping,
    foreignKey: 'patient_id',
    otherKey: 'doctor_id',
    as: 'doctors'
  });

  Doctor.belongsToMany(Patient, {
    through: PatientDoctorMapping,
    foreignKey: 'doctor_id',
    otherKey: 'patient_id',
    as: 'patients'
  });

  // Direct associations for mapping table
  PatientDoctorMapping.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient'
  });
  PatientDoctorMapping.belongsTo(Doctor, {
    foreignKey: 'doctor_id',
    as: 'doctor'
  });
  Patient.hasMany(PatientDoctorMapping, {
    foreignKey: 'patient_id',
    as: 'mappings',
    onDelete: 'CASCADE'
  });
  Doctor.hasMany(PatientDoctorMapping, {
    foreignKey: 'doctor_id',
    as: 'mappings',
    onDelete: 'CASCADE'
  });

  return {
    sequelize: seqInstance,
    User,
    Patient,
    Doctor,
    PatientDoctorMapping
  };
};

const models = initModels(sequelize);

module.exports = {
  ...models,
  initModels
};
