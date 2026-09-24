import { connectDatabase, sequelize } from '../../config/database.js';
import { seedDatabase } from './initialSeed.js';
import { logger } from '../../config/logger.js';

const run = async () => {
  try {
    await connectDatabase();
    await sequelize.sync();
    await seedDatabase();
    logger.info('Standalone seed script finished successfully.');
    process.exit(0);
  } catch (error) {
    logger.error('Failed to run seed script:', error);
    process.exit(1);
  }
};

run();
