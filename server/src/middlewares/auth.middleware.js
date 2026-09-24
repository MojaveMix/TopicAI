import { JwtUtil } from '../utils/jwt.util.js';
import { User, Role, Permission } from '../database/models/index.js';
import { UnauthorizedError } from '../errors/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Authentication middleware that verifies JWT Access Token
 * and loads user data with assigned roles and permissions.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token is missing or malformed');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new UnauthorizedError('Access token is missing');
  }

  // Verify and decode token
  const decoded = JwtUtil.verifyAccessToken(token);

  // Fetch user from DB along with their roles and permissions to ensure active status & fresh permissions
  const user = await User.findByPk(decoded.id, {
    attributes: ['id', 'name', 'email', 'isActive', 'avatar'],
    include: [
      {
        model: Role,
        as: 'roles',
        attributes: ['id', 'name'],
        through: { attributes: [] },
        include: [
          {
            model: Permission,
            as: 'permissions',
            attributes: ['id', 'name', 'module'],
            through: { attributes: [] }
          }
        ]
      }
    ]
  });

  if (!user) {
    throw new UnauthorizedError('The user belonging to this token no longer exists.');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('User account is deactivated. Please contact an administrator.');
  }

  // Extract flat list of role names and permission names
  const roleNames = user.roles.map(r => r.name);
  const permissionNames = [
    ...new Set(user.roles.flatMap(r => r.permissions.map(p => p.name)))
  ];

  // Attach enriched user object to req
  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: roleNames,
    permissions: permissionNames,
    rawUser: user
  };

  next();
});

/**
 * Optional authentication: if token is present, populate req.user, otherwise continue
 */
export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = JwtUtil.verifyAccessToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'isActive'],
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              attributes: ['id', 'name'],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map(r => r.name),
        permissions: [...new Set(user.roles.flatMap(r => r.permissions.map(p => p.name)))],
        rawUser: user
      };
    }
  } catch {
    // Ignore error for optional auth
  }

  next();
});
