import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/httpCodes.constant.js';

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}
