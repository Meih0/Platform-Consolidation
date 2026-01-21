const { Sequelize } = require('sequelize');

// Use a dummy connection during build to prevent connection errors
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/gov_entity_tracker';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: DATABASE_URL.includes('neon.tech')
      ? { require: true, rejectUnauthorized: false }
      : false
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  // Prevent connection during build
  define: {
    timestamps: true
  }
});

module.exports = sequelize;
