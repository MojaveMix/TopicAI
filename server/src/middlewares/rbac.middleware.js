import { ForbiddenError, UnauthorizedError } from '../errors/index.js';
import { ROLES } from '../constants/roles.constant.js';

/**
 * Middleware to restrict access based on user Roles
 * @param  {...string} allowedRoles - e.g. 'ADMIN', 'SUPER_ADMIN', 'MANAGER'
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated.'));
    }

    // SUPER_ADMIN has superuser privileges across all role gates
    if (req.user.roles.includes(ROLES.SUPER_ADMIN)) {
      return next();
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      return next(
        new ForbiddenError(
          `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};

/**
 * Middleware to restrict access based on granular user Permissions (ALL required)
 * @param  {...string} requiredPermissions - e.g. 'users:read', 'users:create'
 */
export const requirePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated.'));
    }

    // SUPER_ADMIN has all permissions
    if (req.user.roles.includes(ROLES.SUPER_ADMIN)) {
      return next();
    }

    const hasAll = requiredPermissions.every(perm => req.user.permissions.includes(perm));
    if (!hasAll) {
      return next(
        new ForbiddenError(
          `Access denied. Missing required permission(s): [${requiredPermissions.join(', ')}]`
        )
      );
    }

    next();
  };
};

/**
 * Middleware to restrict access based on granular user Permissions (ANY required)
 * @param  {...string} permissions - e.g. 'users:read', 'threats:read'
 */
export const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated.'));
    }

    if (req.user.roles.includes(ROLES.SUPER_ADMIN)) {
      return next();
    }

    const hasAny = permissions.some(perm => req.user.permissions.includes(perm));
    if (!hasAny) {
      return next(
        new ForbiddenError(
          `Access denied. Requires at least one permission: [${permissions.join(', ')}]`
        )
      );
    }

    next();
  };
};

/**
 * Middleware to allow a user to manage their own resource (e.g. /users/:id) OR requires an admin permission
 * @param {string} paramKey - URL param name containing the target user ID (default: 'id')
 * @param {string} overridePermission - Permission that bypasses the self-check (e.g. 'users:update')
 */
export const isSelfOrHasPermission = (paramKey = 'id', overridePermission = null) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User is not authenticated.'));
    }

    const targetId = req.params[paramKey];
    const isSelf = req.user.id === targetId;

    if (isSelf) {
      return next();
    }

    if (req.user.roles.includes(ROLES.SUPER_ADMIN)) {
      return next();
    }

    if (overridePermission && req.user.permissions.includes(overridePermission)) {
      return next();
    }

    return next(new ForbiddenError('You can only perform this action on your own account.'));
  };
};
