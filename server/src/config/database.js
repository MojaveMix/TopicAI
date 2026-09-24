import { Sequelize } from 'sequelize';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { env } from './env.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;

if (env.DB_DIALECT === 'sqlite') {
  const storagePath = path.isAbsolute(env.DB_STORAGE)
    ? env.DB_STORAGE
    : path.resolve(__dirname, '../../', env.DB_STORAGE);

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: env.DB_LOGGING ? (msg) => logger.debug(msg) : false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
} else {
  // MySQL (phpMyAdmin) or other SQL dialects
  sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: env.DB_DIALECT,
    logging: env.DB_LOGGING ? (msg) => logger.debug(msg) : false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

/**
 * Ensures the MySQL database exists before Sequelize connects.
 * Automatically runs CREATE DATABASE IF NOT EXISTS if using MySQL/phpMyAdmin.
 */
const ensureMySQLDatabaseExists = async () => {
  if (env.DB_DIALECT !== 'mysql') return;

  try {
    const connection = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.end();
    logger.info(`MySQL database '${env.DB_NAME}' verified/created successfully.`);
  } catch (error) {
    logger.warn(`Could not auto-create MySQL database (will try direct connection): ${error.message}`);
  }
};

export const connectDatabase = async () => {
  try {
    if (env.DB_DIALECT === 'mysql') {
      await ensureMySQLDatabaseExists();
    }

    await sequelize.authenticate();
    logger.info(`Database connected successfully using ${env.DB_DIALECT.toUpperCase()} (${env.DB_NAME})`);
  } catch (error) {
    logger.error(`Unable to connect to the ${env.DB_DIALECT.toUpperCase()} database:`, error.message);
    throw error;
  }
};

export { sequelize };
