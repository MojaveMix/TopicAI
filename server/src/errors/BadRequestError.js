import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/httpCodes.constant.js';

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors);
  }
}
