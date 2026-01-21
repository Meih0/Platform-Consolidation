const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Reminder = sequelize.define('Reminder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  meetingId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'meetings',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('pre_meeting', 'post_meeting', 'deadline', 'follow_up'),
    allowNull: false
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT
  },
  sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sentAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  tableName: 'reminders'
});

module.exports = Reminder;
