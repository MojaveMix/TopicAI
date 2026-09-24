import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  APP_NAME: process.env.APP_NAME || "ThreatSift_API",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",

  // Database (MySQL / phpMyAdmin default)
  DB_DIALECT: process.env.DB_DIALECT || "mysql",
  // DB_STORAGE: process.env.DB_STORAGE || './database.sqlite',
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "3306", 10),
  DB_NAME: process.env.DB_NAME || "threatsift_db",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD:
    process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
  DB_LOGGING: process.env.DB_LOGGING === "true",

  // JWT
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET ||
    "fallback_jwt_access_secret_threatsift_2026",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ||
    "fallback_jwt_refresh_secret_threatsift_2026",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Seed Super Admin
  SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME || "Super Admin",
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || "admin@threatsift.com",
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || "Admin@123456",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000",
    10,
  ),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10,
  ),

  // Ollama Local AI Configuration
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "Qwen3:8b",
  OLLAMA_TIMEOUT_MS: parseInt(process.env.OLLAMA_TIMEOUT_MS || "180000", 10),
};
