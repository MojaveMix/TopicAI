import { sequelize } from './models/index.js';
import { connectDatabase } from '../config/database.js';
import { seedDatabase } from './seeders/initialSeed.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const initializeDatabase = async () => {
  try {
    await connectDatabase();

    // Synchronize database tables (creates tables if not existing)
    await sequelize.sync();
    logger.info('Database models synchronized.');

    // Seed default roles, permissions, and admin user
    await seedDatabase();
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};
