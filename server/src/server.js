import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initializeDatabase } from './database/init.js';
import { sequelize } from './config/database.js';

const startServer = async () => {
  try {
    // Initialize Database connection, synchronization, and seeding
    await initializeDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 ThreatSift Server is running on http://localhost:${env.PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`📡 Health check available at: http://localhost:${env.PORT}/api/v1/health`);
    });

    // Graceful Shutdown
    const handleShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await sequelize.close();
          logger.info('Database connection closed.');
          process.exit(0);
        } catch (err) {
          logger.error('Error closing database connection:', err);
          process.exit(1);
        }
      });

      // Force exit after 10s if hung
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection at Promise:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception thrown:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
