const sequelize = require('../../config/database');
const Sector = require('./Sector');
const Entity = require('./Entity');
const Contact = require('./Contact');
const Platform = require('./Platform');
const Meeting = require('./Meeting');
const Reminder = require('./Reminder');

// Define relationships
Sector.hasMany(Entity, { foreignKey: 'sectorId', as: 'entities' });
Entity.belongsTo(Sector, { foreignKey: 'sectorId', as: 'sector' });

Entity.hasMany(Contact, { foreignKey: 'entityId', as: 'contacts' });
Contact.belongsTo(Entity, { foreignKey: 'entityId', as: 'entity' });

Entity.hasMany(Platform, { foreignKey: 'entityId', as: 'platforms' });
Platform.belongsTo(Entity, { foreignKey: 'entityId', as: 'entity' });

Entity.hasMany(Meeting, { foreignKey: 'entityId', as: 'meetings' });
Meeting.belongsTo(Entity, { foreignKey: 'entityId', as: 'entity' });

Contact.hasMany(Meeting, { foreignKey: 'contactId', as: 'meetings' });
Meeting.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });

Meeting.hasMany(Reminder, { foreignKey: 'meetingId', as: 'reminders' });
Reminder.belongsTo(Meeting, { foreignKey: 'meetingId', as: 'meeting' });

module.exports = {
  sequelize,
  Sector,
  Entity,
  Contact,
  Platform,
  Meeting,
  Reminder
};
