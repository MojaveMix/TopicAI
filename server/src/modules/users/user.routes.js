import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requirePermissions, isSelfOrHasPermission } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.constant.js';
import {
  listUsersSchema,
  userIdParamSchema,
  createUserSchema,
  updateUserSchema,
  assignRolesSchema
} from './user.validation.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// List users (requires users:read permission)
router.get(
  '/',
  requirePermissions(PERMISSIONS.USERS_READ),
  validate(listUsersSchema),
  UserController.listUsers
);

// Get single user (User can view themselves, or requires users:read)
router.get(
  '/:id',
  validate(userIdParamSchema),
  isSelfOrHasPermission('id', PERMISSIONS.USERS_READ),
  UserController.getUserById
);

// Create user (requires users:create permission)
router.post(
  '/',
  requirePermissions(PERMISSIONS.USERS_CREATE),
  validate(createUserSchema),
  UserController.createUser
);

// Update user (User can edit themselves or requires users:update)
router.put(
  '/:id',
  validate(updateUserSchema),
  isSelfOrHasPermission('id', PERMISSIONS.USERS_UPDATE),
  UserController.updateUser
);

// Assign roles to user (requires users:manage-roles permission)
router.patch(
  '/:id/roles',
  requirePermissions(PERMISSIONS.USERS_MANAGE_ROLES),
  validate(assignRolesSchema),
  UserController.assignRoles
);

// Delete user (requires users:delete permission)
router.delete(
  '/:id',
  validate(userIdParamSchema),
  requirePermissions(PERMISSIONS.USERS_DELETE),
  UserController.deleteUser
);

export default router;
