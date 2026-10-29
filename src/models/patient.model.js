const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Patient = sequelize.define('Patient', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Patient name is required' },
        len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' }
      }
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'Age must be an integer' },
        min: { args: [0], msg: 'Age cannot be negative' },
        max: { args: [150], msg: 'Age cannot exceed 150' }
      }
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['Male', 'Female', 'Other', 'male', 'female', 'other']],
          msg: 'Gender must be Male, Female, or Other'
        }
      }
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Contact number is required' }
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    medical_history: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'patients',
    timestamps: true
  });

  return Patient;
};
