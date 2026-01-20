const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Contact = sequelize.define('Contact', {
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
  role: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  personality: {
    type: DataTypes.TEXT,
    comment: 'Notes about communication style, preferences, key points'
  },
  preferredContactMethod: {
    type: DataTypes.ENUM('email', 'phone', 'teams', 'in_person'),
    defaultValue: 'email'
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'contacts'
});

module.exports = Contact;
