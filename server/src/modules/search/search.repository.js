import { Op } from 'sequelize';
import { Search } from '../../database/models/index.js';

export class SearchRepository {
  /**
   * Find paginated searches with optional query search
   */
  static async findAndCountAll({ limit = 10, offset = 0, search = '' } = {}) {
    const where = {};

    if (search && search.trim() !== '') {
      where[Op.or] = [
        { search: { [Op.like]: `%${search.trim()}%` } },
        { result: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    return Search.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * Find a search entry by ID
   */
  static async findById(id) {
    return Search.findByPk(id);
  }

  /**
   * Create a new search record
   */
  static async create({ search, result }, options = {}) {
    return Search.create({ search, result }, options);
  }

  /**
   * Delete a search record by ID
   */
  static async delete(id, options = {}) {
    const record = await Search.findByPk(id, options);
    if (!record) return false;
    await record.destroy(options);
    return true;
  }

  /**
   * Clear all search history
   */
  static async clearAll(options = {}) {
    return Search.destroy({ where: {}, truncate: true, ...options });
  }

  /**
   * Get most recent searches
   */
  static async getRecent(limit = 10) {
    return Search.findAll({
      limit,
      order: [['created_at', 'DESC']]
    });
  }
}
