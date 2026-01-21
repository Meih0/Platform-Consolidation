// eslint-disable-next-line @typescript-eslint/no-var-requires
const models = require('../models');

export const {
  sequelize,
  Sector,
  Entity,
  Contact,
  Platform,
  Meeting,
  Reminder
}: any = models;

export async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    return true;
  } catch (error) {
    console.error('Unable to connect to database:', error);
    return false;
  }
}
