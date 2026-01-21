const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Entity = sequelize.define('Entity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sectorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'sectors',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('planning', 'in_progress', 'completed', 'delayed', 'cancelled'),
    defaultValue: 'planning'
  },
  description: {
    type: DataTypes.TEXT
  },
  website: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'entities'
});

module.exports = Entity;
