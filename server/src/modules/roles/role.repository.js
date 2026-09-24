import { Role, Permission, User } from '../../database/models/index.js';

export class RoleRepository {
  /**
   * Find all roles with permissions and user count
   */
  static async findAll() {
    return Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'description', 'module'],
          through: { attributes: [] }
        }
      ],
      order: [['name', 'ASC']]
    });
  }

  /**
   * Find role by ID with permissions
   */
  static async findById(id) {
    return Role.findByPk(id, {
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'description', 'module'],
          through: { attributes: [] }
        }
      ]
    });
  }

  /**
   * Find role by name
   */
  static async findByName(name) {
    return Role.findOne({
      where: { name: name.toUpperCase().trim() },
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });
  }

  /**
   * Create a new role
   */
  static async create(roleData, options = {}) {
    return Role.create(roleData, options);
  }

  /**
   * Update role
   */
  static async update(id, updateData, options = {}) {
    const role = await Role.findByPk(id, options);
    if (!role) return null;
    return role.update(updateData, options);
  }

  /**
   * Delete role
   */
  static async delete(id, options = {}) {
    const role = await Role.findByPk(id, options);
    if (!role) return false;
    await role.destroy(options);
    return true;
  }

  /**
   * Find all available system permissions
   */
  static async findAllPermissions() {
    return Permission.findAll({
      order: [
        ['module', 'ASC'],
        ['name', 'ASC']
      ]
    });
  }
}
