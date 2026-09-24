import { UserService } from './user.service.js';
import { ApiResponse } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class UserController {
  /**
   * Get all users (paginated)
   */
  static listUsers = asyncHandler(async (req, res) => {
    const result = await UserService.listUsers(req.query);
    return ApiResponse.paginated(
      res,
      'Users retrieved successfully',
      result.items,
      result
    );
  });

  /**
   * Get user by ID
   */
  static getUserById = asyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    return ApiResponse.success(res, 'User retrieved successfully', user);
  });

  /**
   * Create new user (Admin)
   */
  static createUser = asyncHandler(async (req, res) => {
    const user = await UserService.createUser(req.body);
    return ApiResponse.created(res, 'User created successfully', user);
  });

  /**
   * Update user details
   */
  static updateUser = asyncHandler(async (req, res) => {
    const user = await UserService.updateUser(req.params.id, req.body);
    return ApiResponse.success(res, 'User updated successfully', user);
  });

  /**
   * Assign roles to user
   */
  static assignRoles = asyncHandler(async (req, res) => {
    const user = await UserService.assignRoles(req.params.id, req.body.roles);
    return ApiResponse.success(res, 'User roles updated successfully', user);
  });

  /**
   * Delete user
   */
  static deleteUser = asyncHandler(async (req, res) => {
    await UserService.deleteUser(req.params.id, req.user.id);
    return ApiResponse.success(res, 'User deleted successfully');
  });
}
