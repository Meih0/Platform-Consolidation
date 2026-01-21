const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Sector = sequelize.define('Sector', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#2563eb'
  }
}, {
  timestamps: true,
  tableName: 'sectors'
});

module.exports = Sector;
