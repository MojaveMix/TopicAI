import { RoleRepository } from './role.repository.js';
import { Permission, sequelize } from '../../database/models/index.js';
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from '../../errors/index.js';

export class RoleService {
  /**
   * Helper to format role output
   */
  static formatRole(role) {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions ? role.permissions.map(p => p.name) : [],
      permissionDetails: role.permissions || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };
  }

  /**
   * Get all roles
   */
  static async listRoles() {
    const roles = await RoleRepository.findAll();
    return roles.map(role => this.formatRole(role));
  }

  /**
   * Get role by ID
   */
  static async getRoleById(id) {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw new NotFoundError(`Role with ID '${id}' not found.`);
    }
    return this.formatRole(role);
  }

  /**
   * Create a new custom role
   */
  static async createRole({ name, description = null, permissions = [] }) {
    const normalizedName = name.toUpperCase().trim();
    const existingRole = await RoleRepository.findByName(normalizedName);
    if (existingRole) {
      throw new ConflictError(`Role '${normalizedName}' already exists.`);
    }

    const transaction = await sequelize.transaction();
    try {
      const role = await RoleRepository.create(
        {
          name: normalizedName,
          description,
          isSystem: false
        },
        { transaction }
      );

      if (permissions.length > 0) {
        const permissionEntities = await Permission.findAll({
          where: { name: permissions },
          transaction
        });
        await role.setPermissions(permissionEntities, { transaction });
      }

      await transaction.commit();
      const createdRole = await RoleRepository.findById(role.id);
      return this.formatRole(createdRole);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update role
   */
  static async updateRole(id, { name, description, permissions }) {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw new NotFoundError(`Role with ID '${id}' not found.`);
    }

    if (name && name.toUpperCase().trim() !== role.name) {
      if (role.isSystem) {
        throw new ForbiddenError('Cannot rename system built-in roles.');
      }
      const existing = await RoleRepository.findByName(name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Role name '${name.toUpperCase()}' is already in use.`);
      }
      role.name = name.toUpperCase().trim();
    }

    if (description !== undefined) {
      role.description = description;
    }

    const transaction = await sequelize.transaction();
    try {
      await role.save({ transaction });

      if (Array.isArray(permissions)) {
        const permissionEntities = await Permission.findAll({
          where: { name: permissions },
          transaction
        });
        await role.setPermissions(permissionEntities, { transaction });
      }

      await transaction.commit();
      const updatedRole = await RoleRepository.findById(id);
      return this.formatRole(updatedRole);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Assign permissions to a role
   */
  static async assignPermissions(id, permissionNames) {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw new NotFoundError(`Role with ID '${id}' not found.`);
    }

    const permissionEntities = await Permission.findAll({
      where: { name: permissionNames }
    });

    if (permissionEntities.length !== permissionNames.length) {
      throw new BadRequestError('One or more specified permissions do not exist in the system.');
    }

    await role.setPermissions(permissionEntities);
    const updatedRole = await RoleRepository.findById(id);
    return this.formatRole(updatedRole);
  }

  /**
   * Delete a custom role
   */
  static async deleteRole(id) {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw new NotFoundError(`Role with ID '${id}' not found.`);
    }

    if (role.isSystem) {
      throw new ForbiddenError('Built-in system roles cannot be deleted.');
    }

    await RoleRepository.delete(id);
    return true;
  }

  /**
   * List all system permissions
   */
  static async listPermissions() {
    return RoleRepository.findAllPermissions();
  }
}
