const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgresql://localhost:5432/gov_entity_tracker',
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DATABASE_URL?.includes('neon.tech')
        ? { require: true, rejectUnauthorized: false }
        : false
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
