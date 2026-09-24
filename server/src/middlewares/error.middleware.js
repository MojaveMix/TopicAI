import { AppError } from '../errors/AppError.js';
import { HTTP_STATUS } from '../constants/httpCodes.constant.js';
import { ApiResponse } from '../utils/response.util.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Global centralized error-handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Sequelize Unique Constraint Error (e.g., duplicate email)
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Resource with provided unique field already exists';
    errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`,
      value: e.value
    }));
  }

  // Handle Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Database validation error';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Sequelize Foreign Key Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Referenced entity does not exist';
  }

  // Handle JSON parsing error from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Malformed JSON in request body';
  }

  // Log error (debug for operational errors, error for unexpected server bugs)
  if (statusCode >= 500) {
    logger.error(`[500 Server Error] ${req.method} ${req.originalUrl}:`, err);
  } else {
    logger.warn(`[${statusCode} Client Error] ${req.method} ${req.originalUrl} - ${message}`);
  }

  const responsePayload = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack })
  };

  return res.status(statusCode).json(responsePayload);
};
