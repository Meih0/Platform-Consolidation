const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Meeting = sequelize.define('Meeting', {
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
  contactId: {
    type: DataTypes.UUID,
    references: {
      model: 'contacts',
      key: 'id'
    }
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: 'Duration in minutes'
  },
  type: {
    type: DataTypes.ENUM('check_in', 'planning', 'review', 'emergency', 'follow_up'),
    defaultValue: 'check_in'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'rescheduled'),
    defaultValue: 'scheduled'
  },
  agenda: {
    type: DataTypes.TEXT
  },
  notes: {
    type: DataTypes.TEXT,
    comment: 'Notes taken during/after meeting'
  },
  outcomes: {
    type: DataTypes.TEXT,
    comment: 'Key decisions and action items'
  },
  nextSteps: {
    type: DataTypes.TEXT
  },
  updatesEntered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether post-meeting updates have been entered'
  }
}, {
  timestamps: true,
  tableName: 'meetings'
});

module.exports = Meeting;
