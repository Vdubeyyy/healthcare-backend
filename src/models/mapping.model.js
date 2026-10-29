const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PatientDoctorMapping = sequelize.define('PatientDoctorMapping', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'patient_doctor_mappings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['patient_id', 'doctor_id']
      }
    ]
  });

  return PatientDoctorMapping;
};
