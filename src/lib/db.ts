// Lazy load models to prevent build-time execution
let modelsCache: any = null;

function getModels() {
  if (!modelsCache) {
    modelsCache = require('../models');
  }
  return modelsCache;
}

export const sequelize = new Proxy({} as any, {
  get(target, prop) {
    return getModels().sequelize[prop];
  }
});

export const Sector = new Proxy({} as any, {
  get(target, prop) {
    return getModels().Sector[prop];
  }
});

export const Entity = new Proxy({} as any, {
  get(target, prop) {
    return getModels().Entity[prop];
  }
});

export const Contact = new Proxy({} as any, {
  get(target, prop) {
    return getModels().Contact[prop];
  }
});

export const Platform = new Proxy({} as any, {
  get(target, prop) {
    return getModels().Platform[prop];
  }
});

export const Meeting = new Proxy({} as any, {
  get(target, prop) {
    return getModels().Meeting[prop];
  }
});

export const Reminder = new Proxy({} as any, {
  get(target, prop) {
    return getModels().Reminder[prop];
  }
});

export async function initDB() {
  try {
    const models = getModels();
    await models.sequelize.authenticate();
    console.log('Database connection established.');
    return true;
  } catch (error) {
    console.error('Unable to connect to database:', error);
    return false;
  }
}
