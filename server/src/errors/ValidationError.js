import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/httpCodes.constant.js';

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = null) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
  }
}
