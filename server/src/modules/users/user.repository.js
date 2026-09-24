import { Op } from 'sequelize';
import { User, Role, Permission } from '../../database/models/index.js';

export class UserRepository {
  /**
   * Find paginated users with filtering & search
   */
  static async findAndCountAll({ limit, offset, search, role, isActive }) {
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const roleInclude = {
      model: Role,
      as: 'roles',
      attributes: ['id', 'name', 'description'],
      through: { attributes: [] },
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['id', 'name', 'module'],
          through: { attributes: [] }
        }
      ]
    };

    if (role) {
      roleInclude.where = { name: role.toUpperCase() };
    }

    return User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
      include: [roleInclude]
    });
  }

  /**
   * Find user by primary key with roles & permissions
   */
  static async findById(id) {
    return User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'description'],
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
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return User.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [
        {
          model: Role,
          as: 'roles',
          include: [{ model: Permission, as: 'permissions' }]
        }
      ]
    });
  }

  /**
   * Create a new user record
   */
  static async create(userData, options = {}) {
    return User.create(userData, options);
  }

  /**
   * Update user record
   */
  static async update(id, updateData, options = {}) {
    const user = await User.findByPk(id, options);
    if (!user) return null;
    return user.update(updateData, options);
  }

  /**
   * Delete user by ID
   */
  static async delete(id, options = {}) {
    const user = await User.findByPk(id, options);
    if (!user) return false;
    await user.destroy(options);
    return true;
  }
}
