import { RoleService } from './role.service.js';
import { ApiResponse } from '../../utils/response.util.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class RoleController {
  /**
   * List all roles
   */
  static listRoles = asyncHandler(async (req, res) => {
    const roles = await RoleService.listRoles();
    return ApiResponse.success(res, 'Roles retrieved successfully', roles);
  });

  /**
   * Get role by ID
   */
  static getRoleById = asyncHandler(async (req, res) => {
    const role = await RoleService.getRoleById(req.params.id);
    return ApiResponse.success(res, 'Role retrieved successfully', role);
  });

  /**
   * Create new role
   */
  static createRole = asyncHandler(async (req, res) => {
    const role = await RoleService.createRole(req.body);
    return ApiResponse.created(res, 'Role created successfully', role);
  });

  /**
   * Update role
   */
  static updateRole = asyncHandler(async (req, res) => {
    const role = await RoleService.updateRole(req.params.id, req.body);
    return ApiResponse.success(res, 'Role updated successfully', role);
  });

  /**
   * Assign permissions to role
   */
  static assignPermissions = asyncHandler(async (req, res) => {
    const role = await RoleService.assignPermissions(req.params.id, req.body.permissions);
    return ApiResponse.success(res, 'Role permissions updated successfully', role);
  });

  /**
   * Delete role
   */
  static deleteRole = asyncHandler(async (req, res) => {
    await RoleService.deleteRole(req.params.id);
    return ApiResponse.success(res, 'Role deleted successfully');
  });

  /**
   * List all permissions
   */
  static listPermissions = asyncHandler(async (req, res) => {
    const permissions = await RoleService.listPermissions();
    return ApiResponse.success(res, 'Permissions retrieved successfully', permissions);
  });
}
