import { HTTP_STATUS } from '../constants/httpCodes.constant.js';

export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
