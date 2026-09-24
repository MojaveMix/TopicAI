import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';

export class User extends Model {
  /**
   * Return a safe user representation without sensitive fields like password
   */
  toSafeObject() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }

  toJSON() {
    return this.toSafeObject();
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    indexes: [
      { unique: true, fields: ['email'] }
    ]
  }
);
