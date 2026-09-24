import { Router } from 'express';
import { RoleController } from './role.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermissions } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.constant.js';
import {
  roleIdParamSchema,
  createRoleSchema,
  updateRoleSchema,
  assignPermissionsSchema
} from './role.validation.js';

const router = Router();

// All role routes require authentication
router.use(authenticate);

// List all permissions available in system
router.get(
  '/permissions',
  requirePermissions(PERMISSIONS.PERMISSIONS_READ),
  RoleController.listPermissions
);

// List all roles
router.get(
  '/',
  requirePermissions(PERMISSIONS.ROLES_READ),
  RoleController.listRoles
);

// Get role by ID
router.get(
  '/:id',
  validate(roleIdParamSchema),
  requirePermissions(PERMISSIONS.ROLES_READ),
  RoleController.getRoleById
);

// Create new role
router.post(
  '/',
  requirePermissions(PERMISSIONS.ROLES_CREATE),
  validate(createRoleSchema),
  RoleController.createRole
);

// Update role
router.put(
  '/:id',
  requirePermissions(PERMISSIONS.ROLES_UPDATE),
  validate(updateRoleSchema),
  RoleController.updateRole
);

// Assign permissions to role
router.patch(
  '/:id/permissions',
  requirePermissions(PERMISSIONS.ROLES_MANAGE_PERMISSIONS),
  validate(assignPermissionsSchema),
  RoleController.assignPermissions
);

// Delete role
router.delete(
  '/:id',
  validate(roleIdParamSchema),
  requirePermissions(PERMISSIONS.ROLES_DELETE),
  RoleController.deleteRole
);

export default router;
