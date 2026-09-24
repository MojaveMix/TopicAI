import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';

export class RolePermission extends Model {}

RolePermission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  },
  {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'role_permissions',
    indexes: [
      {
        unique: true,
        fields: ['role_id', 'permission_id']
      }
    ]
  }
);
