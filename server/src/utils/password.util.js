import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export class PasswordUtil {
  /**
   * Hash plain text password
   * @param {string} password 
   * @returns {Promise<string>}
   */
  static async hash(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare plain text password with hashed password
   * @param {string} plainPassword 
   * @param {string} hashedPassword 
   * @returns {Promise<boolean>}
   */
  static async compare(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) {
      return false;
    }
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
