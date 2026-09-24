import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/response.util.js';
import { HTTP_STATUS } from '../../constants/httpCodes.constant.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req, res) => {
    const { name, email, password, avatar } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await AuthService.register({
      name,
      email,
      password,
      avatar,
      ipAddress,
      userAgent
    });

    return ApiResponse.created(res, 'User registered successfully', result);
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await AuthService.login({
      email,
      password,
      ipAddress,
      userAgent
    });

    return ApiResponse.success(res, 'Login successful', result);
  });

  /**
   * Refresh access token
   */
  static refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await AuthService.refreshToken({
      refreshToken,
      ipAddress,
      userAgent
    });

    return ApiResponse.success(res, 'Token refreshed successfully', result);
  });

  /**
   * Logout user
   */
  static logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await AuthService.logout({ refreshToken });

    return ApiResponse.success(res, 'Logged out successfully');
  });

  /**
   * Get authenticated user profile
   */
  static getMe = asyncHandler(async (req, res) => {
    const user = await AuthService.getMe(req.user.id);
    return ApiResponse.success(res, 'Profile retrieved successfully', user);
  });

  /**
   * Change current user's password
   */
  static changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword({
      userId: req.user.id,
      currentPassword,
      newPassword
    });

    return ApiResponse.success(res, 'Password changed successfully');
  });
}
