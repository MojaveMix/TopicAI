import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/httpCodes.constant.js';

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access. Please authenticate.') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}
