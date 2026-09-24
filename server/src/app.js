import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import apiRoutes from './routes/index.js';

const app = express();

// Security HTTP Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Global Rate Limiting
app.use(globalRateLimiter);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Search Backend API',
    version: '1.0.0',
    documentation: '/api/v1/health',
    status: 'online'
  });
});

// Mount Main API Router
app.use('/api/v1', apiRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Centralized Error Handler
app.use(errorHandler);

export default app;
