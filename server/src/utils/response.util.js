import { HTTP_STATUS } from '../constants/httpCodes.constant.js';

export class ApiResponse {
  /**
   * Send a successful JSON response
   */
  static success(res, message = 'Success', data = null, statusCode = HTTP_STATUS.OK, meta = null) {
    const payload = {
      success: true,
      message,
      data
    };

    if (meta) {
      payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
  }

  /**
   * Send a created resource JSON response
   */
  static created(res, message = 'Resource created successfully', data = null) {
    return this.success(res, message, data, HTTP_STATUS.CREATED);
  }

  /**
   * Send a paginated JSON response
   */
  static paginated(res, message = 'Data retrieved successfully', data = [], pagination = {}) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data,
      pagination: {
        totalItems: pagination.totalItems || data.length,
        totalPages: pagination.totalPages || 1,
        currentPage: pagination.currentPage || 1,
        limit: pagination.limit || data.length,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false
      }
    });
  }

  /**
   * Send an error JSON response
   */
  static error(res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    const payload = {
      success: false,
      message,
      errors: errors || undefined
    };

    return res.status(statusCode).json(payload);
  }
}
