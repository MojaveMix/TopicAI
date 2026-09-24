import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';

export class UserRole extends Model {}

UserRole.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    modelName: 'UserRole',
    tableName: 'user_roles',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'role_id']
      }
    ]
  }
);
