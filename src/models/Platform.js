const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Platform = sequelize.define('Platform', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'entities',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING
  },
  action: {
    type: DataTypes.ENUM('merge', 'delete', 'migrate', 'consolidate'),
    allowNull: false
  },
  targetPlatform: {
    type: DataTypes.STRING,
    comment: 'Where this platform is merging to'
  },
  deadline: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('planned', 'in_progress', 'completed', 'blocked', 'delayed'),
    defaultValue: 'planned'
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  tableName: 'platforms'
});

module.exports = Platform;
