import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../config/database.js';

export class Role extends Model {}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      },
      set(value) {
        this.setDataValue('name', value.toUpperCase().trim());
      }
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'System roles cannot be deleted'
    }
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    indexes: [
      { unique: true, fields: ['name'] }
    ]
  }
);
