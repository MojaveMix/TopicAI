import { UserRepository } from './user.repository.js';
import { Role, User, sequelize } from '../../database/models/index.js';
import { PasswordUtil } from '../../utils/password.util.js';
import { getPagination, getPagingData } from '../../utils/pagination.util.js';
import { ROLES, DEFAULT_ROLE } from '../../constants/roles.constant.js';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError
} from '../../errors/index.js';

export class UserService {
  /**
   * Helper to format user output
   */
  static formatUser(user) {
    const roleNames = user.roles ? user.roles.map(r => r.name) : [];
    const permissionNames = user.roles
      ? [...new Set(user.roles.flatMap(r => (r.permissions ? r.permissions.map(p => p.name) : [])))]
      : [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
      roles: roleNames,
      roleDetails: user.roles || [],
      permissions: permissionNames,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Get paginated users
   */
  static async listUsers(query) {
    const { page, limit, offset } = getPagination(query);
    const { search, role, isActive } = query;

    const parsedIsActive = isActive !== undefined ? isActive === 'true' || isActive === true : undefined;

    const data = await UserRepository.findAndCountAll({
      limit,
      offset,
      search,
      role,
      isActive: parsedIsActive
    });

    const pagingResult = getPagingData(data, page, limit);
    pagingResult.items = pagingResult.items.map(user => this.formatUser(user));

    return pagingResult;
  }

  /**
   * Get single user by ID
   */
  static async getUserById(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found.`);
    }
    return this.formatUser(user);
  }

  /**
   * Create a new user (admin operation)
   */
  static async createUser({ name, email, password, roles = [DEFAULT_ROLE], isActive = true, avatar = null }) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists.');
    }

    // Validate roles exist
    const roleEntities = await Role.findAll({
      where: { name: roles.map(r => r.toUpperCase()) }
    });

    if (roleEntities.length === 0) {
      throw new BadRequestError('Specified role(s) do not exist.');
    }

    const hashedPassword = await PasswordUtil.hash(password);

    const transaction = await sequelize.transaction();
    try {
      const user = await UserRepository.create(
        {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          isActive,
          avatar
        },
        { transaction }
      );

      await user.setRoles(roleEntities, { transaction });
      await transaction.commit();

      const createdUser = await UserRepository.findById(user.id);
      return this.formatUser(createdUser);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update user details
   */
  static async updateUser(id, updateData) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found.`);
    }

    if (updateData.email && updateData.email.toLowerCase() !== user.email) {
      const existing = await UserRepository.findByEmail(updateData.email);
      if (existing && existing.id !== id) {
        throw new ConflictError('A user with this email address already exists.');
      }
      updateData.email = updateData.email.toLowerCase();
    }

    await UserRepository.update(id, updateData);
    const updatedUser = await UserRepository.findById(id);
    return this.formatUser(updatedUser);
  }

  /**
   * Assign roles to a user
   */
  static async assignRoles(id, roleNames) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found.`);
    }

    const uppercaseRoleNames = roleNames.map(r => r.toUpperCase());
    const rolesToAssign = await Role.findAll({
      where: { name: uppercaseRoleNames }
    });

    if (rolesToAssign.length !== uppercaseRoleNames.length) {
      throw new BadRequestError('One or more specified roles do not exist.');
    }

    // Safety check: Cannot remove SUPER_ADMIN if this is the only super admin
    const isCurrentlySuperAdmin = user.roles.some(r => r.name === ROLES.SUPER_ADMIN);
    const willBeSuperAdmin = uppercaseRoleNames.includes(ROLES.SUPER_ADMIN);

    if (isCurrentlySuperAdmin && !willBeSuperAdmin) {
      const superAdminCount = await User.count({
        include: [{ model: Role, as: 'roles', where: { name: ROLES.SUPER_ADMIN } }]
      });

      if (superAdminCount <= 1) {
        throw new ForbiddenError('Cannot remove SUPER_ADMIN role from the last Super Admin.');
      }
    }

    await user.setRoles(rolesToAssign);
    const updatedUser = await UserRepository.findById(id);
    return this.formatUser(updatedUser);
  }

  /**
   * Delete a user
   */
  static async deleteUser(id, currentUserId) {
    if (id === currentUserId) {
      throw new BadRequestError('You cannot delete your own account.');
    }

    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found.`);
    }

    // Safety check: Cannot delete the last SUPER_ADMIN
    const isSuperAdmin = user.roles.some(r => r.name === ROLES.SUPER_ADMIN);
    if (isSuperAdmin) {
      const superAdminCount = await User.count({
        include: [{ model: Role, as: 'roles', where: { name: ROLES.SUPER_ADMIN } }]
      });

      if (superAdminCount <= 1) {
        throw new ForbiddenError('Cannot delete the last Super Admin user.');
      }
    }

    await UserRepository.delete(id);
    return true;
  }
}
