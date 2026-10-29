require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

const isTest = process.env.NODE_ENV === 'test';
const dbDialect = process.env.DB_DIALECT || (process.env.DATABASE_URL ? 'postgres' : 'sqlite');

let sequelize;

if (isTest) {
  // Use in-memory SQLite for automated tests for zero side effects & speed
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
} else if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else if (dbDialect === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'healthcare_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  // SQLite local development database
  const storagePath = path.resolve(__dirname, '../../healthcare.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connected successfully using dialect: ${sequelize.getDialect()}`);
    // Sync models to database (equivalent to Django migrate)
    await sequelize.sync({ alter: true });
    console.log('[Database] All models synchronized successfully');
  } catch (error) {
    if (dbDialect === 'postgres' && !isTest) {
      console.warn(`[Database] PostgreSQL connection failed (${error.message}). Falling back to SQLite local storage...`);
      // Fallback to SQLite so server continues running smoothly
      const fallbackPath = path.resolve(__dirname, '../../healthcare.sqlite');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: fallbackPath,
        logging: false
      });
      // Re-initialize models with fallback
      const initModels = require('../models');
      initModels(sequelize);
      await sequelize.sync({ alter: true });
      console.log('[Database] Models synchronized with SQLite fallback database');
    } else {
      console.error('[Database] Connection error:', error.message);
      throw error;
    }
  }
};

module.exports = {
  sequelize,
  connectDB
};
