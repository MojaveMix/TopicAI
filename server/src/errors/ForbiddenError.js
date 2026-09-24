import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/httpCodes.constant.js';

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden. You do not have sufficient permissions.') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}
