const { sequelize, Sector, Entity, Contact, Platform, Meeting, Reminder } = require('../src/models');

async function migrate() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('Database models synced successfully.');

    console.log('\nDatabase schema ready!');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

migrate();
